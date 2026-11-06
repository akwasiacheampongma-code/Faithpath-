import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
export function DraftStatus({
  status,
}: {
  status: "saved" | "saving" | "error";
}) {
  const t = useTheme();
  return (
    <T
      accessibilityLiveRegion="polite"
      style={{ fontSize: 11, color: status === "error" ? t.danger : t.muted }}
    >
      {status === "saved"
        ? "Entwurf auf diesem Gerät gesichert."
        : status === "saving"
          ? "Entwurf wird gesichert …"
          : "Entwurf konnte nicht gesichert werden. Deine Eingabe bleibt hier sichtbar. Bitte sichere deine Worte, bevor du die App schließt."}
    </T>
  );
}
