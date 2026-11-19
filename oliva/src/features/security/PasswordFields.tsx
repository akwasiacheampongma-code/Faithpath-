import { Field, T } from "../../components/ui";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./crypto-contract";

export function SecretField({ label, value, onChange, onSubmit, autoFocus, maxLength = PASSWORD_MAX_LENGTH }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
}) {
  return <Field label={label} value={value} onChangeText={onChange}
    secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="off"
    maxLength={maxLength} autoFocus={autoFocus} onSubmitEditing={onSubmit} />;
}

export function PasswordPair({ password, confirmation, setPassword, setConfirmation }: {
  password: string;
  confirmation: string;
  setPassword: (value: string) => void;
  setConfirmation: (value: string) => void;
}) {
  return <>
    <SecretField label="Neues Passwort" value={password} onChange={setPassword} />
    <SecretField label="Neues Passwort bestätigen" value={confirmation} onChange={setConfirmation} />
    <T variant="small">Wähle mindestens {PASSWORD_MIN_LENGTH} Zeichen.</T>
  </>;
}
