import { createCipheriv, createDecipheriv, pbkdf2Sync } from "node:crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { expect, it, vi } from "vitest";
import { initialData, parseBackup } from "../src/state/model";
import { prepareImport, applyImport } from "../src/features/imports/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";
import { inspectBackupFile, openProtectedBackup, protectBackup } from "../src/features/security/backup";
import { KDF_ITERATIONS } from "../src/features/security/crypto-contract";
import { changeRecordPassword, decodeAccessRecord, prepareAccess, verifyAppPassword, verifyRecoveryCode } from "../src/features/security/access-record";
import { derivePasswordKey } from "../src/features/security/crypto";

vi.mock("../src/features/security/crypto", async () => {
  const web = await import("../src/features/security/crypto.web");
  return { ...web, derivePasswordKey: vi.fn(web.derivePasswordKey) };
});

const password = "Interoperable öffentliche Prüfdaten 🌿";

it("uses an interoperable binary format including a unique salt, nonce and authenticated header", async () => {
  const plain = JSON.stringify({ ...initialData(), name: "Äda 🌿" });
  const encrypted = await protectBackup(plain, password);
  const another = await protectBackup(plain, password);
  expect(encrypted.length).toBe(new TextEncoder().encode(plain).length + 58);
  expect(Buffer.from(encrypted.subarray(0, 8)).toString()).toBe("OLIVAENC");
  expect(encrypted.subarray(14, 30)).not.toEqual(another.subarray(14, 30));
  expect(encrypted.subarray(30, 42)).not.toEqual(another.subarray(30, 42));
  expect(inspectBackupFile(encrypted).kind).toBe("encrypted");
  const header = encrypted.subarray(0, 42), salt = header.subarray(14, 30), nonce = header.subarray(30);
  const key = pbkdf2Sync(password, salt, KDF_ITERATIONS, 32, "sha256");
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAAD(header);
  decipher.setAuthTag(encrypted.subarray(-16));
  expect(Buffer.concat([decipher.update(encrypted.subarray(42, -16)), decipher.final()]).toString("utf8")).toBe(plain);
  const nativeDerivation = await pbkdf2Async(sha256, new TextEncoder().encode(password), salt, { c: KDF_ITERATIONS, dkLen: 32, asyncTick: 8 });
  expect(Buffer.from(nativeDerivation)).toEqual(key);

  const independentHeader = another.subarray(0, 42);
  const independentKey = pbkdf2Sync(password, independentHeader.subarray(14, 30), KDF_ITERATIONS, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", independentKey, independentHeader.subarray(30));
  cipher.setAAD(independentHeader);
  const independent = Buffer.concat([independentHeader, cipher.update(plain, "utf8"), cipher.final(), cipher.getAuthTag()]);
  await expect(openProtectedBackup(new Uint8Array(independent), password)).resolves.toBe(plain);
}, 20_000);

it("rejects wrong passwords, altered data and excessive work factors before opening a backup", async () => {
  const encrypted = await protectBackup("{}", password);
  await expect(openProtectedBackup(encrypted, "Synthetisches falsches Passwort")).rejects.toThrow(/Passwort stimmt nicht/);
  const altered = encrypted.slice();
  altered[altered.length - 1] = altered[altered.length - 1]! ^ 1;
  await expect(openProtectedBackup(altered, password)).rejects.toThrow(/Passwort stimmt nicht/);
  const invalidHeader = encrypted.slice();
  invalidHeader[10] = 255;
  vi.mocked(derivePasswordKey).mockClear();
  await expect(openProtectedBackup(invalidHeader, password)).rejects.toThrow(/Verschlüsselungsformat/);
  expect(derivePasswordKey).not.toHaveBeenCalled();
  expect(() => inspectBackupFile(encrypted.subarray(0, 55))).toThrow(/beschädigt/);
});

it("preserves a large exact FaithPath original and parses legacy unencrypted UTF-8", async () => {
  const data = initialData();
  const source = JSON.stringify({ ...faithpathFixture(), supplementary: "x".repeat(8 * 1024 * 1024) }, null, 2);
  applyImport(data, prepareImport(source, data));
  const original = JSON.stringify(data, null, 2);
  const encoded = await protectBackup(original, password);
  const recovered = parseBackup(await openProtectedBackup(encoded, password));
  expect(recovered).toEqual(data);
  expect(recovered.imports[0]?.sourceText).toBe(source);
  const legacy = { ...initialData(), version: 1, name: "Mara" } as Record<string, unknown>;
  for (const key of ["imports", "goals", "drafts", "readingPosition", "retainedReviewGrowth", "storyStudy", "ntStudy", "invitations"])
    delete legacy[key];
  const file = inspectBackupFile(new TextEncoder().encode("\uFEFF" + JSON.stringify(legacy)));
  if (file.kind !== "plain") throw new Error("Expected old JSON backup");
  expect(parseBackup(file.text)).toMatchObject({ name: "Mara", version: 11 });
}, 40_000);

it("stores access verifiers separately and preserves the recovery code during an ordinary password change", async () => {
  const prepared = await prepareAccess(password, 1);
  expect(decodeAccessRecord(prepared.record)).toEqual(prepared.record);
  expect(() => decodeAccessRecord(null)).toThrow();
  const saved = JSON.stringify(prepared.record);
  expect(saved).not.toContain(password);
  expect(saved).not.toContain(prepared.recoveryCode.replace(/-/g, "").toLowerCase());
  expect(verifyRecoveryCode(prepared.record, prepared.recoveryCode.toLowerCase().replace(/-/g, " "))).toBe(true);
  expect(verifyRecoveryCode(prepared.record, "00000000000000000000000000000000")).toBe(false);
  const next = await changeRecordPassword(prepared.record, "Ersatz für das öffentliche Testpasswort 🌱");
  expect(next.id).not.toBe(prepared.record.id);
  expect(next.idleMinutes).toBe(1);
  expect(verifyRecoveryCode(next, prepared.recoveryCode)).toBe(true);
  await expect(verifyAppPassword(next, password)).resolves.toBe(false);
  const recovered = await prepareAccess(password, next.idleMinutes);
  expect(verifyRecoveryCode(recovered.record, prepared.recoveryCode)).toBe(false);
}, 20_000);
