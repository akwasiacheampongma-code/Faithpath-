import { View } from "react-native";
import { T, Button, Card } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";

export function ReaderPreferences({
  flow,
  unavailable,
  onFlowChange,
  onClose,
}: {
  flow: boolean;
  unavailable: boolean;
  onFlowChange: (flow: boolean) => void;
  onClose: () => void;
}) {
  const t = useTheme(),
    settings = useApp((s) => s.data.settings),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);

  return (
    <Card style={{ gap: 16 }}>
      <T variant="heading">Dein Lesemodus</T>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          flexWrap: "wrap",
        }}
      >
        <T style={{ fontSize: 12 }}>Schriftgröße: {settings.fontSize}</T>
        <Button
          icon={null}
          kind="secondary"
          disabled={settings.fontSize <= 18 || busy}
          onPress={() =>
            void mutate((d) => {
              d.settings.fontSize -= 2;
            })
          }
        >
          Kleiner
        </Button>
        <Button
          icon={null}
          kind="secondary"
          disabled={settings.fontSize >= 30 || busy}
          onPress={() =>
            void mutate((d) => {
              d.settings.fontSize += 2;
            })
          }
        >
          Größer
        </Button>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <T style={{ fontSize: 12 }}>Zeilenabstand</T>
        {[1.5, 1.8, 2.1].map((n) => (
          <Button
            key={n}
            icon={null}
            kind={
              Math.abs(settings.lineHeight - n) < 0.05 ? "primary" : "secondary"
            }
            disabled={busy}
            onPress={() =>
              void mutate((d) => {
                d.settings.lineHeight = n;
              })
            }
          >
            {String(n).replace(".", ",")}
          </Button>
        ))}
      </View>
      <T variant="small">Textdarstellung</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          kind={flow ? "primary" : "secondary"}
          icon={null}
          onPress={() => onFlowChange(true)}
        >
          Fließtext
        </Button>
        <Button
          kind={flow ? "secondary" : "primary"}
          icon={null}
          onPress={() => onFlowChange(false)}
        >
          Einzelverse
        </Button>
      </View>
      {unavailable && (
        <T variant="small" style={{ color: t.muted }}>
          Der Fließtext konnte auf diesem Gerät nicht zuverlässig dargestellt
          werden. Die Einzelverse bleiben vollständig lesbar.
        </T>
      )}
      <Button kind="ghost" icon="check" onPress={onClose}>
        Leseeinstellungen schließen
      </Button>
    </Card>
  );
}
