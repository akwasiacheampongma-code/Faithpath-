import { z } from "zod";
import { sha256 } from "../../lib/hash";
import { derivePasswordKey, randomBytes } from "./crypto";
import { checkNewPassword, type Bytes } from "./crypto-contract";

export const idleMinutesChoices = [1, 5, 15, 30] as const;
const hex16 = z.string().regex(/^[0-9a-f]{32}$/);
const hex32 = z.string().regex(/^[0-9a-f]{64}$/);
const idleMinutesSchema = z.literal(idleMinutesChoices);
export type IdleMinutes = z.infer<typeof idleMinutesSchema>;
const accessSchema = z.object({
  version: z.literal(1),
  id: hex16,
  passwordSalt: hex16,
  passwordProof: hex32,
  recoveryProof: hex32,
  idleMinutes: idleMinutesSchema,
}).strict();
export type AccessRecord = z.infer<typeof accessSchema>;
export type PreparedAccess = { record: AccessRecord; recoveryCode: string };

export function decodeAccessRecord(value: unknown): AccessRecord | null {
  return value === undefined ? null : accessSchema.parse(value);
}

function hex(bytes: Bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(text: string): Bytes {
  const bytes = new Uint8Array(text.length / 2);
  for (let index = 0; index < bytes.length; index++)
    bytes[index] = Number.parseInt(text.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

function matchesProof(expected: string, actual: string) {
  let difference = 0;
  for (let index = 0; index < expected.length; index++)
    difference |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  return difference === 0;
}

function normalizedCode(code: string) {
  return code.replace(/[\s-]/g, "").toLowerCase();
}

function recoveryProof(code: string) {
  return sha256("OLIVA access recovery v1:" + code);
}

async function passwordProof(password: string, salt: Bytes) {
  const key = await derivePasswordKey(password, salt);
  try {
    return sha256("OLIVA access password v1:" + hex(key));
  } finally {
    key.fill(0);
  }
}

export async function verifyAppPassword(record: AccessRecord, password: string) {
  return matchesProof(record.passwordProof, await passwordProof(password, fromHex(record.passwordSalt)));
}

export function verifyRecoveryCode(record: AccessRecord, input: string) {
  if (input.length > 96) return false;
  const code = normalizedCode(input);
  return hex16.safeParse(code).success && matchesProof(record.recoveryProof, recoveryProof(code));
}

export async function rotateAccessId(record: AccessRecord, idleMinutes = record.idleMinutes): Promise<AccessRecord> {
  return { ...record, id: hex(await randomBytes(16)), idleMinutes };
}

export async function changeRecordPassword(record: AccessRecord, password: string): Promise<AccessRecord> {
  checkNewPassword(password, password);
  const salt = await randomBytes(16);
  return {
    ...await rotateAccessId(record),
    passwordSalt: hex(salt),
    passwordProof: await passwordProof(password, salt),
  };
}

export async function prepareAccess(password: string, idleMinutes: IdleMinutes = 5): Promise<PreparedAccess> {
  checkNewPassword(password, password);
  const code = hex(await randomBytes(16));
  const salt = await randomBytes(16);
  return {
    record: {
      version: 1,
      id: hex(await randomBytes(16)),
      passwordSalt: hex(salt),
      passwordProof: await passwordProof(password, salt),
      recoveryProof: recoveryProof(code),
      idleMinutes,
    },
    recoveryCode: code.toUpperCase().match(/.{4}/g)!.join("-"),
  };
}
