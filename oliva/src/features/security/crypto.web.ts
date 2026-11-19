import { KDF_ITERATIONS, passwordBytes, type Bytes } from "./crypto-contract";

function webCrypto() {
  if (!globalThis.crypto?.subtle)
    throw new Error("Der Passwortschutz ist in diesem Browser nur über eine sichere Verbindung verfügbar.");
  return globalThis.crypto;
}

export async function randomBytes(length: number): Promise<Bytes> {
  return webCrypto().getRandomValues(new Uint8Array(length));
}

export async function derivePasswordKey(password: string, salt: Bytes): Promise<Bytes> {
  const subtle = webCrypto().subtle;
  const secret = passwordBytes(password);
  try {
    const key = await subtle.importKey("raw", secret, "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await subtle.deriveBits({ name: "PBKDF2", salt, hash: "SHA-256", iterations: KDF_ITERATIONS }, key, 256));
  } finally {
    secret.fill(0);
  }
}

export async function encryptBytes(plain: Bytes, key: Bytes, nonce: Bytes, header: Bytes): Promise<Bytes> {
  const subtle = webCrypto().subtle;
  const imported = await subtle.importKey("raw", key, "AES-GCM", false, ["encrypt"]);
  return new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv: nonce, additionalData: header, tagLength: 128 }, imported, plain));
}

export async function decryptBytes(cipher: Bytes, key: Bytes, nonce: Bytes, header: Bytes): Promise<Bytes> {
  const subtle = webCrypto().subtle;
  const imported = await subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
  return new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: nonce, additionalData: header, tagLength: 128 }, imported, cipher));
}
