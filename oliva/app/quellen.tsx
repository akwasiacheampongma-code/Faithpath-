import { View, Linking } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
export default function Sources() {
  const t = useTheme();
  return (
    <Shell>
      <View style={{ maxWidth: 760, gap: 23 }}>
        <Tag icon="info">Quellen & Verantwortung</Tag>
        <T variant="title" accessibilityRole="header">
          Wissen, woher Worte kommen.
        </T>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Der Bibeltext</T>
          <T>
            Lutherbibel 1912 · eBible.org · als Public Domain ausgewiesen. Die
            App enthält 66 Bücher, 1.189 Kapitel und 31.102 Verse des
            protestantischen Kanons.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Die historischen Formulierungen wurden nicht modernisiert.
            Technische Strong-Markierungen wurden beim Import entfernt; die
            Wörter des Bibeltextes bleiben erhalten.
          </T>
          <Button
            kind="secondary"
            icon="info"
            onPress={() =>
              void Linking.openURL("https://ebible.org/deu1912/copyright.htm")
            }
          >
            Rechteangabe der Textquelle öffnen
          </Button>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Erklärungen und Gebete</T>
          <T>
            OLIVA-Einordnungen sind neue redaktionelle Entwürfe, die in dieser
            Entwicklung mit KI-Unterstützung erstellt wurden. Sie sind weder
            Bibeltext noch eine verbindliche geistliche Autorität. Eine
            unabhängige theologische Prüfung steht aus.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Bei strittigen Fragen sind unterschiedliche christliche Traditionen
            zu berücksichtigen. Für öffentliche Veröffentlichung sind
            Fachredaktion und Quellenprüfung erforderlich.
          </T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Fragen zum Neuen Testament</T>
          <T>
            Die 1.300 Verständnisfragen für alle 260 Kapitel des Neuen
            Testaments stammen unverändert aus der FaithPath-Vorarbeit. Fragen,
            vier Antwortmöglichkeiten, Lösungsschlüssel und Erklärungen wurden
            mit dem dortigen Finalmaster abgeglichen. Diese Texte sind
            redaktionelle Inhalte und vom Bibeltext getrennt.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Die ursprüngliche redaktionelle Freigabe ist dokumentiert. Eine
            unabhängige theologische Prüfung und eine allgemeine Lizenz zur
            öffentlichen Weiterverwendung werden daraus nicht abgeleitet.
            Unterschiedliche christliche Auslegungen können Fragen aufwerfen.
          </T>
          <Button kind="secondary" onPress={() => router.push("/verstehen")}>
            NT-Fragen entdecken
          </Button>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Die Bildwelt</T>
          <T>
            Die Pilotbilder wurden mit OpenAI-Bildgenerierung für dieses Projekt
            erstellt. Es sind künstlerische Interpretationen, keine Fotografien
            historischer Ereignisse und kein Nachweis exakter Kleidung, Orte
            oder Personen.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Landschaft von Galiläa · Boot nach dem Sturm (Markus 4,35–41) · ein
            Garten als Deutung zu Genesis · Noah · Abraham · David vor Goliath ·
            Jesu Geburt nach Lukas · Ostermorgen nach Markus. Visuelle
            Pilotprüfung erfolgt; historische und theologische
            Veröffentlichungsgates sind offen.
          </T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Die Buchschwerter</T>
          <T>
            Eigenständige Vektorgrafiken. Die 66 Buchschwerter bilden eine
            parametrisierte Illustrationsfamilie mit individuellen Themen,
            Ornamenten und Kapitelanzeigen. Sie sind keine historische
            Waffenrekonstruktion.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Für Johannes und Römer gibt es zusätzlich zwei große, mit
            OpenAI-Bildgenerierung erstellte Buchillustrationen. Der
            Johannes-Trieb deutet das Bild vom Weinstock in Johannes 15. Bei
            Römer sind der Bogen als Brücke und der Olivenzweig freie
            künstlerische Deutungen von Verbindung und Frieden; die verlinkten
            Verse beschreiben diese Gegenstände nicht. Die kompakte
            Vektorfamilie bleibt erhalten. Goldene Materialeinlagen und Pflanzen
            sind Gestaltung; Lesespuren werden getrennt aus bestätigten Kapiteln
            berechnet. Unabhängige Fachfreigaben stehen aus.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Epheser 6,17 ist die biblische Anregung für das Schwert als Symbol
            des Wortes Gottes. Der Baum stellt Lernmomente dar – keinen
            geistlichen Rang.
          </T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Der lebendige Olivenbaum</T>
          <T>
            Die sieben A51-Illustrationen stammen aus der eigenen
            FaithPath-Vorarbeit „Final Living Tree“. Sie wurden auf
            ausdrücklichen Projektauftrag übernommen. Die Originale bleiben
            erhalten; WebP- und PNG-Dateien ermöglichen die Darstellung auf den
            verschiedenen Plattformen.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Der Baum zeigt deine OLIVA-Lerngeschichte. Eine Bildvorschau
            verändert keinen Fortschritt. Die Rechtekette der übernommenen
            Bildgenerierung ist vor einer öffentlichen Veröffentlichung
            gesondert zu prüfen.
          </T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Schriften und Datenschutz</T>
          <T>
            DM Sans und Cormorant Garamond werden lokal unter der SIL Open Font
            License eingebunden. Keine Schriftanfragen an Google, keine Werbe-
            oder Analytik-SDKs, keine verpflichtende Registrierung.
          </T>
          <T style={{ fontSize: 12, color: t.muted }}>
            Der Kern benötigt nach Installation keine Online-Verbindung. Externe
            Quellenlinks öffnen erst durch deine Auswahl.
            Cloud-Synchronisierung, Audio und KI sind nicht aktiviert.
          </T>
        </Card>
        <Button
          kind="secondary"
          icon="back"
          onPress={() => router.replace("/einstellungen")}
        >
          Zurück zu den Einstellungen
        </Button>
      </View>
    </Shell>
  );
}
