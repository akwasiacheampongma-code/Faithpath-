import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../state/store";
import { useTheme } from "../design-system/theme";
import { T, Card, Button, Tag } from "./ui";
import { exportRawData, exportText } from "../services/storage";
import {
  useVolatileDrafts,
  volatileExport,
} from "../features/personal/volatile-drafts";
export function RecoveryScreen() {
  const t = useTheme(),
    error = useApp((s) => s.error),
    pending = useVolatileDrafts((s) => Object.keys(s.items).length),
    [working, setWorking] = useState(false),
    [message, setMessage] = useState("");
  async function rescue() {
    setWorking(true);
    try {
      await exportRawData();
      setMessage(
        "Die Reparatursicherung wurde zum Speichern oder Teilen übergeben. Bewahre sie an einem privaten Ort auf.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: 54,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 640, gap: 22 }}>
          <Tag icon="bookmark">Deine Worte bewahren</Tag>
          <T accessibilityRole="header" variant="title">
            Dein Speicher braucht Aufmerksamkeit.
          </T>
          <T>
            Die vorhandenen Daten konnten nicht sicher gelesen werden. Sie
            wurden nicht durch einen leeren Stand ersetzt.
          </T>
          <Card style={{ gap: 16 }}>
            <T variant="heading">Sichere zuerst, was da ist.</T>
            <T variant="small" style={{ color: t.muted }}>
              Die Reparatursicherung enthält den gespeicherten Bestand
              einschließlich persönlicher Texte und möglicher beschädigter
              Einträge. Sie dient der Wiederherstellung mit technischer Hilfe
              und ist keine normale OLIVA-Sicherung. Die Übergabe an den
              Dateidialog bestätigt noch keine gespeicherte externe Datei.
            </T>
            <Button
              disabled={working}
              icon="download"
              onPress={() => void rescue()}
            >
              Unveränderten Speicher sichern
            </Button>
            <Button
              disabled={working}
              kind="secondary"
              icon="back"
              onPress={() => {
                setWorking(true);
                void useApp
                  .getState()
                  .hydrate()
                  .finally(() => setWorking(false));
              }}
            >
              Lokalen Speicher erneut lesen
            </Button>
          </Card>
          {pending > 0 && (
            <Card style={{ gap: 12 }}>
              <T variant="heading">Auch deine letzten Eingaben bewahren.</T>
              <T variant="small">
                {pending} Entwürfe sind noch nicht dauerhaft gespeichert.
                Sichere sie zusätzlich, bevor du dieses Fenster schließt.
              </T>
              <Button
                disabled={working}
                icon="download"
                onPress={() => {
                  setWorking(true);
                  void exportText(
                    JSON.stringify(volatileExport(), null, 2),
                    `oliva-ungesicherte-entwuerfe-${Date.now()}.json`,
                  )
                    .then(() =>
                      setMessage(
                        "Ungesicherte Entwürfe zum Speichern übergeben.",
                      ),
                    )
                    .catch((e) => setMessage((e as Error).message))
                    .finally(() => setWorking(false));
                }}
              >
                Ungesicherte Entwürfe exportieren
              </Button>
            </Card>
          )}
          {error && (
            <T
              accessibilityRole="alert"
              style={{ fontSize: 12, color: t.danger }}
            >
              {error}
            </T>
          )}
          {message && (
            <T accessibilityRole="alert" style={{ fontSize: 12 }}>
              {message}
            </T>
          )}
          <T variant="small" style={{ color: t.muted }}>
            Bis der Bestand wieder lesbar ist, werden keine neuen Einträge
            gespeichert. Eine Reparatur sollte immer an einer Kopie erfolgen.
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
