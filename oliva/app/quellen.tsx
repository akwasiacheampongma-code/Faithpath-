import { View, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { OTB_CREDIT, OTB_LICENCE, OTB_SOURCE, OTB_TERMS } from "../src/features/bible/open-bible";

function OpenBibleRights() {
  return <Card style={{ gap: 12 }}>
    <T variant="heading">Open Translation Bible · Deutsch</T>
    <T>{OTB_CREDIT}</T>
    <T variant="small">66 Bücher und 1.189 Kapitel in der Nummerierung des Herausgebers. Die Worte der Verse bleiben erhalten. OLIVA hat Formatierung und Trennzeichen für die Darstellung angepasst und führt die Textanmerkungen separat.</T>
    <T variant="small">Der Text darf mit Namensnennung und Lizenzverweis geteilt werden. Änderungen sind anzugeben. Veröffentlichte Bearbeitungen stehen unter denselben Bedingungen. Der Herausgeber stellt den Text ohne Gewähr bereit.</T>
    <View style={{ gap: 4 }}>
      <Button kind="ghost" icon="info" onPress={() => void Linking.openURL(OTB_SOURCE)}>Vollständige Originaldateien öffnen</Button>
      <Button kind="ghost" icon="info" onPress={() => void Linking.openURL(OTB_LICENCE)}>Lizenz CC BY-SA 4.0 lesen</Button>
      <Button kind="ghost" icon="info" onPress={() => void Linking.openURL(OTB_TERMS)}>Bedingungen des Herausgebers lesen</Button>
    </View>
  </Card>;
}

export default function Sources() {
  const chosenOtb = useLocalSearchParams<{ ausgabe?: string }>().ausgabe === "otb";
  const t = useTheme();
  return (
    <Shell>
      <View style={{ maxWidth: 760, gap: 23 }}>
        <Tag icon="info">Quellen & Verantwortung</Tag>
        <T variant="title" accessibilityRole="header">
          Wissen, woher Worte kommen.
        </T>
        {chosenOtb && <OpenBibleRights />}
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
        {!chosenOtb && <OpenBibleRights />}
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
          <T variant="heading">Geschichten und Abschnitte</T>
          <T>436 Originaleinheiten mit 2.479 Fragen und 436 freiwilligen Reflexionsimpulsen stammen aus dem geprüften FaithPath-/Nachlese-Bestand. Titel, Stellen, Fragen, Antwortreihenfolge, Lösungsschlüssel und vorhandene Hinweise bleiben bewahrt. Die Sammlung enthält auch Psalmen und Briefe.</T>
          <T style={{ fontSize: 12, color: t.muted }}>95 ursprüngliche Fragevarianten bleiben als Quellenvarianten dokumentiert. Ihre Antwortindizes werden nicht vermischt. Nicht jede Frage hat einen zusätzlichen Hinweis. Die Übernahme ist für dieses Projekt beauftragt; eine allgemeine öffentliche Inhaltslizenz und unabhängige theologische Freigabe werden daraus nicht abgeleitet.</T>
          <Button kind="secondary" onPress={() => router.push("/geschichten")}>Originalabschnitte entdecken</Button>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Lebensthemen aus FaithPath</T>
          <T>18 Originalthemen verbinden 45 Bibelstellen mit unveränderten kurzen Einordnungen und freiwilligen Reflexionsfragen. Die vorhandenen neun OLIVA-Wege bleiben eigenständig erhalten.</T>
          <T style={{ fontSize: 12, color: t.muted }}>Die alten Quelltexte werden beim Import nur als Daten gelesen. Ergänzende OLIVA-Hinweise, etwa zum historischen Hintergrund, stehen getrennt von Originaleinordnung und Bibeltext. Eine allgemeine Inhaltslizenz oder unabhängige Fachfreigabe folgt nicht aus der Projektübernahme. Die Originale enthalten keine Dauern oder Gebete; solche Angaben werden nicht als Originale ergänzt.</T>
          <Button kind="secondary" onPress={() => router.push("/themen")}>Lebensthemen entdecken</Button>
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
          <T variant="heading">Das Schwert als Symbol</T>
          <T>Ein einzelnes, ruhiges Schwert im Bibelbereich erinnert an Gottes Wort. Es zeigt weder Lesefortschritt noch eine Belohnung. Die Illustration mit Holzgriff und jungem Trieb wurde für OLIVA erzeugt und wird unverändert verwendet.</T>
          <T style={{ fontSize: 12, color: t.muted }}>Epheser 6,17 ist die Quelle des Symbols. Der gekennzeichnete Auszug stammt wörtlich aus der integrierten Lutherbibel 1912. Im Zusammenhang 6,10–18 geht es um Wahrheit, Frieden, Glauben und Gebet; Vers 12 richtet die Bildsprache ausdrücklich nicht gegen Menschen.</T>
          <T style={{ fontSize: 12, color: t.muted }}>Dies ist eine künstlerische Deutung. Originalbild, Prompt und Herkunft bleiben dokumentiert. Unabhängige Fach- und öffentliche Rechtefreigaben stehen aus.</T>
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
