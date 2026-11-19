import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync, getRandomBytesAsync } from "expo-crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { KDF_ITERATIONS, passwordBytes, type Bytes } from "./crypto-contract";

export async function randomBytes(length: number): Promise<Bytes> {
  return new Uint8Array(await getRandomBytesAsync(length));
}

export async function derivePasswordKey(password: string, salt: Bytes): Promise<Bytes> {
  const secret = passwordBytes(password);
  try {
    return await pbkdf2Async(sha256, secret, salt, { c: KDF_ITERATIONS, dkLen: 32, asyncTick: 8 });
  } finally {
    secret.fill(0);
  }
}

export async function encryptBytes(plain: Bytes, key: Bytes, nonce: Bytes, header: Bytes): Promise<Bytes> {
  const imported = await AESEncryptionKey.import(key);
  const result = await aesEncryptAsync(plain, imported, {
    nonce: { bytes: nonce }, tagLength: 16, additionalData: header,
  });
  // Expo allocates these byte arrays in the current JS runtime.
  return (await result.ciphertext({ includeTag: true })) as Bytes;
}

export async function decryptBytes(cipher: Bytes, key: Bytes, nonce: Bytes, header: Bytes): Promise<Bytes> {
  const imported = await AESEncryptionKey.import(key);
  const sealed = AESSealedData.fromParts(nonce, cipher, 16);
  return (await aesDecryptAsync(sealed, imported, { additionalData: header })) as Bytes;
}
