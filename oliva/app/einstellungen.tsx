import { useState } from "react";
import appConfig from "../app.json";
import { View, Switch } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Button, Card, Field, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";
import { InvitationSettings } from "../src/features/invitations/InvitationSettings";
import { BackupExport } from "../src/features/security/BackupExport";
import { BackupRestore } from "../src/features/security/BackupRestore";
import { AccessSettings } from "../src/features/security/AccessSettings";
export default function Settings() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    pending = useVolatileDrafts((s) => Object.keys(s.items).length),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy),
    [name, setName] = useState(data.name);
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
          <BackupExport disabled={busy} />
          {pending > 0 && (
            <Button
              kind="secondary"
              icon="pen"
              onPress={() => router.push("/sammlung?tab=Entwürfe")}
            >
              Ungesicherte Entwürfe bewahren
            </Button>
          )}
          <BackupRestore />
          <Button
            kind="secondary"
            icon="bookmark"
            onPress={() => router.push("/importieren")}
          >
            FaithPath-Daten mitnehmen
          </Button>
        </Card>
        <AccessSettings />
        <InvitationSettings />
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
            OLIVA · lokale Entwicklungsausgabe {appConfig.expo.version}
          </T>
        </Card>
      </View>
    </Shell>
  );
}
