export type Bytes = Uint8Array<ArrayBuffer>;
export const KDF_ITERATIONS = 600_000;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_LENGTH = 12;

export function checkNewPassword(password: string, confirmation: string) {
  if (password.length > PASSWORD_MAX_LENGTH || [...password].length < PASSWORD_MIN_LENGTH || !password.trim())
    throw new Error(`Wähle ein Passwort mit ${PASSWORD_MIN_LENGTH} bis ${PASSWORD_MAX_LENGTH} Zeichen.`);
  if (password !== confirmation)
    throw new Error("Die beiden Passwörter stimmen nicht überein.");
}

export function passwordBytes(password: string): Bytes {
  if (!password.length || password.length > PASSWORD_MAX_LENGTH)
    throw new Error("Gib dein vollständiges Passwort ein.");
  return new TextEncoder().encode(password);
}
