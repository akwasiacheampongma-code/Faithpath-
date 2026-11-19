import { MAX_BACKUP_BYTES } from "../imports/schema";
import { utf8Length } from "../../lib/hash";
import { decryptBytes, derivePasswordKey, encryptBytes, randomBytes } from "./crypto";
import { KDF_ITERATIONS, type Bytes } from "./crypto-contract";

const magic = new TextEncoder().encode("OLIVAENC");
const saltOffset = 14;
const nonceOffset = 30;
const headerSize = 42;
const tagSize = 16;
export const MAX_PASSWORD_BACKUP_BYTES = MAX_BACKUP_BYTES + headerSize + tagSize;

function encryptedHeader(bytes: Bytes) {
  if (!magic.every((value, index) => bytes[index] === value) ||
      bytes.length <= headerSize + tagSize || bytes.length > MAX_PASSWORD_BACKUP_BYTES)
    throw new Error("Die verschlüsselte Sicherung ist beschädigt oder zu groß.");
  const header = bytes.subarray(0, headerSize);
  if (header[8] !== 1 || header[9] !== 1 ||
      new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(10) !== KDF_ITERATIONS)
    throw new Error("Diese Fassung von OLIVA unterstützt das Verschlüsselungsformat der Datei nicht.");
  return header;
}

export function inspectBackupFile(bytes: Bytes) {
  if (magic.every((value, index) => bytes[index] === value)) {
    encryptedHeader(bytes);
    return { kind: "encrypted" as const, bytes };
  }
  if (bytes.length > MAX_BACKUP_BYTES)
    throw new Error("Die Sicherung ist zu groß (maximal 64 MB).");
  try {
    return { kind: "plain" as const, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    throw new Error("Diese Datei ist keine gültige OLIVA-Sicherung.");
  }
}

export async function protectBackup(json: string, password: string): Promise<Bytes> {
  if (!json.length || json.length > MAX_BACKUP_BYTES || utf8Length(json) > MAX_BACKUP_BYTES)
    throw new Error("Die Sicherung ist leer oder zu groß (maximal 64 MB).");
  const header = new Uint8Array(headerSize);
  header.set(magic);
  header[8] = 1;
  header[9] = 1;
  new DataView(header.buffer).setUint32(10, KDF_ITERATIONS);
  header.set(await randomBytes(headerSize - saltOffset), saltOffset);
  const plain = new TextEncoder().encode(json);
  try {
    const key = await derivePasswordKey(password, header.subarray(saltOffset, nonceOffset));
    try {
      const cipher = await encryptBytes(plain, key, header.subarray(nonceOffset), header);
      const output = new Uint8Array(headerSize + cipher.length);
      output.set(header);
      output.set(cipher, headerSize);
      return output;
    } finally {
      key.fill(0);
    }
  } finally {
    plain.fill(0);
  }
}

export async function openProtectedBackup(bytes: Bytes, password: string): Promise<string> {
  const header = encryptedHeader(bytes);
  const key = await derivePasswordKey(password, header.subarray(saltOffset, nonceOffset));
  let plain: Bytes;
  try {
    plain = await decryptBytes(bytes.subarray(headerSize), key, header.subarray(nonceOffset), header);
  } catch {
    throw new Error("Das Passwort stimmt nicht oder die Sicherung ist beschädigt.");
  } finally {
    key.fill(0);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(plain);
  } catch {
    throw new Error("Diese Datei ist keine gültige OLIVA-Sicherung.");
  } finally {
    plain.fill(0);
  }
}
