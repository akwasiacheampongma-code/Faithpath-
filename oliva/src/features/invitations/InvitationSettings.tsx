import { Switch, View } from "react-native";
import { router } from "expo-router";
import { T, Card, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";

export function InvitationSettings({ link = true }: { link?: boolean }) {
  const t = useTheme(),
    enabled = useApp((s) => s.data.invitations.enabled),
    busy = useApp((s) => s.busy),
    setEnabled = useApp((s) => s.setInvitationsEnabled);
  return (
    <Card style={{ gap: 16 }} testID="invitation-settings">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <T variant="heading">Gedanken wiederbegegnen.</T>
          <T variant="small" style={{ color: t.muted }}>
            Freiwillige Einladungen in OLIVA
          </T>
        </View>
        <Switch
          accessibilityLabel="Einladungen in der App erlauben"
          value={enabled}
          disabled={busy}
          onValueChange={(value) => void setEnabled(value, enabled)}
          trackColor={{ false: t.line, true: t.primary }}
        />
      </View>
      <T variant="small" style={{ color: t.muted }}>
        Wenn du möchtest, begegnen dir ältere Vorhaben und Gedanken wieder,
        während du OLIVA nutzt. Du kannst sie für 14 Tage zurückstellen oder
        ausblenden.
      </T>
      <T variant="small" style={{ color: t.muted }}>
        Du erhältst keine Push-Nachrichten oder E-Mails. Eine Pause sagt nichts
        über deinen Glauben aus. Deine gespeicherten Entscheidungen bleiben beim
        Ausschalten erhalten.
      </T>
      {link && (
        <Button
          kind="secondary"
          icon="leaf"
          onPress={() => router.push("/einladungen")}
        >
          Deine Einladungen ansehen
        </Button>
      )}
    </Card>
  );
}
