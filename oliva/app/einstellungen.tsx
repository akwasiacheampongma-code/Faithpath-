import { useState } from "react";
import { View, Switch } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { parseBackup, type AppData } from "../src/state/model";
import { exportData } from "../src/services/storage";
import { MAX_BACKUP_BYTES } from "../src/features/imports/schema";
import { pickBackup } from "../src/services/pick-backup";
export default function Settings() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    restore = useApp((s) => s.restore),
    busy = useApp((s) => s.busy),
    [name, setName] = useState(data.name),
    [backup, setBackup] = useState(""),
    [candidate, setCandidate] = useState<AppData | null>(null),
    [message, setMessage] = useState(""),
    [showImport, setShowImport] = useState(false);
  function check() {
    try {
      setCandidate(parseBackup(backup));
      setMessage(
        "Die Sicherung ist formal gültig. Bitte prüfe die Übersicht vor der Wiederherstellung.",
      );
    } catch (error) {
      setCandidate(null);
      setMessage((error as Error).message);
    }
  }
  async function apply() {
    if (candidate && (await restore(candidate))) {
      setCandidate(null);
      setBackup("");
      setMessage("Die Sicherung wurde wiederhergestellt.");
    }
  }
  return (
    <Shell>
      <Tag icon="settings">Dein persönlicher Raum</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 26 }}
      >
        So, wie es zu dir passt.
      </T>
      <View style={{ maxWidth: 760, gap: 22 }}>
        <Card style={{ gap: 16 }}>
          <T variant="heading">Wie dürfen wir dich begrüßen?</T>
          <Field
            label="Dein Vorname (freiwillig)"
            maxLength={60}
            value={name}
            onChangeText={setName}
            placeholder="Du darfst auch ohne Namen bleiben"
          />
          <Button
            disabled={busy || name === data.name}
            icon="check"
            onPress={() =>
              void mutate((d) => {
                d.name = name.trim();
              })
            }
          >
            Namen speichern
          </Button>
          <T style={{ fontSize: 11, color: t.muted }}>
            Du nutzt OLIVA ohne Konto. Es gibt keine Registrierung und keinen
            Cloud-Sync.
          </T>
        </Card>
        <Card style={{ gap: 17 }}>
          <T variant="heading">Deine Atmosphäre</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
            {[
              ["light", "Hell"],
              ["dark", "Dunkel"],
              ["system", "Wie das Gerät"],
            ].map(([id, label]) => (
              <Button
                key={id}
                kind={data.settings.theme === id ? "primary" : "secondary"}
                icon={null}
                disabled={busy}
                onPress={() =>
                  void mutate((d) => {
                    d.settings.theme = id as "light";
                  })
                }
              >
                {label}
              </Button>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={{ flex: 1, gap: 5 }}>
              <T style={{ fontSize: 13 }}>Animationen reduzieren</T>
              <T style={{ fontSize: 11, color: t.muted }}>
                Auch die Systemeinstellung wird berücksichtigt. Die Entwicklung
                bleibt als ruhiges Bild sichtbar.
              </T>
            </View>
            <Switch
              accessibilityLabel="Animationen reduzieren"
              value={data.settings.reducedMotion}
              disabled={busy}
              onValueChange={(value) =>
                void mutate((d) => {
                  d.settings.reducedMotion = value;
                })
              }
              trackColor={{ false: t.line, true: t.primary }}
            />
          </View>
          <T style={{ fontSize: 11, color: t.muted }}>
            Schriftgröße und Zeilenabstand findest du direkt in den
            Leseeinstellungen des Readers.
          </T>
        </Card>
        <Card style={{ gap: 15 }}>
          <T variant="heading">Deine Daten gehören dir.</T>
          <T style={{ fontSize: 13, color: t.muted }}>
            Gedanken, Markierungen und Fortschritt bleiben lokal. Sie sind in
            der App-Datenbank nicht zusätzlich verschlüsselt. Bei Geräteverlust
            oder Löschen der App-/Browserdaten können sie verloren gehen.
          </T>
          <T style={{ fontSize: 12 }}>
            Sichere deine Daten regelmäßig an einem Ort, dem du vertraust. Eine
            Sicherung enthält auch deine persönlichen Texte.
          </T>
          <Button
            icon="download"
            onPress={() =>
              void useApp
                .getState()
                .waitForWrites()
                .then(exportData)
                .then(() =>
                  setMessage("Sicherung zum Speichern oder Teilen übergeben."),
                )
                .catch(() =>
                  setMessage(
                    "Die Sicherung konnte nicht übergeben werden. Bitte versuche es erneut.",
                  ),
                )
            }
          >
            Sicherung exportieren
          </Button>
          <Button
            kind="secondary"
            icon="back"
            onPress={() => {
              setShowImport(!showImport);
              setCandidate(null);
            }}
          >
            Sicherung wiederherstellen
          </Button>
          <Button
            kind="secondary"
            icon="bookmark"
            onPress={() => router.push("/importieren")}
          >
            FaithPath-Daten mitnehmen
          </Button>
          {showImport && (
            <View style={{ gap: 14 }}>
              <T style={{ fontSize: 11, color: t.muted }}>
                Wähle eine OLIVA-JSON-Sicherung oder füge ihren Inhalt ein
                (maximal 64 MB). Für FaithPath nutze „FaithPath-Daten
                mitnehmen“.
              </T>
              <Button
                kind="secondary"
                icon="download"
                disabled={busy}
                onPress={() =>
                  void pickBackup(MAX_BACKUP_BYTES)
                    .then((value) => {
                      if (value !== null) {
                        setBackup(value);
                        setCandidate(parseBackup(value));
                        setMessage(
                          "Sicherung geprüft. Bitte prüfe die Übersicht vor der Wiederherstellung.",
                        );
                      }
                    })
                    .catch((e) => {
                      setCandidate(null);
                      setMessage((e as Error).message);
                    })
                }
              >
                OLIVA-Sicherungsdatei auswählen
              </Button>
              <Field
                label="Inhalt deiner OLIVA-Sicherung"
                multiline
                value={backup}
                maxLength={MAX_BACKUP_BYTES}
                onChangeText={(value) => {
                  setBackup(value);
                  setCandidate(null);
                }}
                placeholder={'{"version":3, …}'}
              />
              <Button
                kind="secondary"
                disabled={!backup.trim() || busy}
                icon="check"
                onPress={check}
              >
                Sicherung prüfen
              </Button>
              {candidate && (
                <Card style={{ backgroundColor: t.goldSoft, gap: 12 }}>
                  <T style={{ fontSize: 13, fontWeight: "600" }}>
                    Vorhandene lokale Daten werden ersetzt.
                  </T>
                  <T style={{ fontSize: 12 }}>
                    Diese Sicherung enthält {candidate.notes.length} Einträge,{" "}
                    {candidate.readChapters.length} gelesene Kapitel und{" "}
                    {candidate.bookmarks.length} Lesezeichen,{" "}
                    {candidate.goals.length} Vorhaben und{" "}
                    {candidate.drafts.length} Entwürfe. Exportiere den aktuellen
                    Stand vor der Wiederherstellung.
                  </T>
                  <Button
                    disabled={busy}
                    icon="check"
                    onPress={() => void apply()}
                  >
                    Daten durch diese Sicherung ersetzen
                  </Button>
                  <Button
                    kind="ghost"
                    icon="close"
                    onPress={() => setCandidate(null)}
                  >
                    Abbrechen
                  </Button>
                </Card>
              )}
            </View>
          )}
          {message && (
            <T accessibilityRole="alert" style={{ fontSize: 12 }}>
              {message}
            </T>
          )}
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Einordnungen und KI</T>
          <T style={{ fontSize: 13, color: t.muted }}>
            Diese Ausgabe verwendet lokale, klar gekennzeichnete
            Erklärungstexte. Es werden keine Fragen oder persönlichen Texte an
            einen KI-Dienst übertragen.
          </T>
          <T style={{ fontSize: 12 }}>
            Ein optionaler KI-Begleiter ist für einen späteren Ausbau vorgesehen
            und hier nicht angeschlossen.
          </T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Transparent von Anfang an</T>
          <Button
            kind="secondary"
            icon="info"
            onPress={() => router.push("/quellen")}
          >
            Bibeltexte, Bilder & Quellen
          </Button>
          <Button
            kind="ghost"
            icon="leaf"
            onPress={() => router.push("/start")}
          >
            Den Einstieg noch einmal ansehen
          </Button>
          <T style={{ fontSize: 10, color: t.muted }}>
            OLIVA · lokale Entwicklungsausgabe 0.3.0
          </T>
        </Card>
      </View>
    </Shell>
  );
}
