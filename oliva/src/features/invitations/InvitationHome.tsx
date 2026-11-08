import { router } from "expo-router";
import { T, Card, Button, Tag } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useInvitations } from "./useInvitations";

export function InvitationHome() {
  const t = useTheme(),
    { due } = useInvitations(),
    invitation = due[0];
  if (!invitation) return null;
  return (
    <Card
      testID="home-invitation"
      style={{ gap: 12, backgroundColor: t.goldSoft }}
    >
      <Tag icon="leaf">Wenn es gerade passt</Tag>
      <T variant="heading">Ein Gedanke von damals.</T>
      <T style={{ fontSize: 14 }}>{invitation.title}</T>
      <T variant="small" style={{ color: t.muted }}>
        Vielleicht möchtest du ihm wieder Raum geben. Du entscheidest.
      </T>
      <Button kind="secondary" onPress={() => router.push("/einladungen")}>
        In Ruhe ansehen
      </Button>
    </Card>
  );
}
