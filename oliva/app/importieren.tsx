import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button, Field, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { prepareImport, type ImportPlan } from "../src/features/imports/model";
import {
  MAX_SOURCE_BYTES,
  type RecoveryCopy,
} from "../src/features/imports/schema";
import { readRecovery, exportData } from "../src/services/storage";
import { pickBackup } from "../src/services/pick-backup";
import { utf8Length } from "../src/lib/hash";

const statusLabels = {
  add: "Wird ergänzt",
  kept: "Bleibt bestehen",
  archive: "Im Originalarchiv",
  conflict: "Konflikt · Bestand geschützt",
  mirror: "Einmaliger Gedanke",
};
export default function FaithpathImport() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    busy = useApp((s) => s.busy);
  const [text, setText] = useState(""),
    [paste, setPaste] = useState(false),
    [plan, setPlan] = useState<ImportPlan | null>(null),
    [message, setMessage] = useState(""),
    [working, setWorking] = useState(false),
    [limit, setLimit] = useState(20),
    [recovery, setRecovery] = useState<RecoveryCopy | null>(null),
    [rollbackRevision, setRollbackRevision] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    void readRecovery()
      .then((x) => {
        if (active) setRecovery(x);
      })
      .catch((e) => {
        if (active) setMessage((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, [data.imports.length]);
  async function inspect(value = text) {
    setWorking(true);
    setPlan(null);
    setRollbackRevision(null);
    setMessage("");
    try {
      const current = await useApp.getState().refresh();
      if (!current) return;
      const candidate = prepareImport(value, current);
      setPlan(candidate);
      setLimit(20);
      setMessage(
        candidate.alreadyImported
          ? "Diese Sicherung wurde bereits übernommen. Es werden keine weiteren Einträge angelegt."
          : "Die Vorschau ist bereit. Es wurden noch keine Inhalte übernommen.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  async function choose() {
    setWorking(true);
    try {
      const value = await pickBackup();
      if (value !== null) {
        setText(value);
        await inspect(value);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  async function apply() {
    if (plan && (await useApp.getState().importFaithpath(plan))) {
      setPlan(null);
      setText("");
      setMessage(
        "Import abgeschlossen. Deine Originaldatei ist im Importarchiv erhalten. Der Stand vor dem Import liegt als lokale Rückkehrsicherung bereit.",
      );
    }
  }
  async function checkRollback() {
    setWorking(true);
    try {
      const current = await useApp.getState().refresh(),
        copy = await readRecovery();
      setRecovery(copy);
      setPlan(null);
      if (current && copy) setRollbackRevision(current.revision);
      else setMessage("Es ist keine lokale Rückkehrsicherung vorhanden.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  const locked = busy || working,
    stale = !!plan && plan.baseRevision !== data.revision;
  return (
    <Shell>
      <Tag icon="bookmark">Deine Worte dürfen mitkommen</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 12 }}
      >
        Von FaithPath zu OLIVA.
      </T>
      <T style={{ color: t.muted, maxWidth: 660, marginBottom: 26 }}>
        Übernimm deine persönliche V5-Sicherung. Alles wird auf diesem Gerät
        geprüft. Du entscheidest nach der Vorschau.
      </T>
      <View style={{ maxWidth: 780, gap: 20 }}>
        <Card style={{ gap: 14 }}>
          <T variant="heading">Zuerst in Ruhe ansehen.</T>
          <T style={{ fontSize: 13 }}>
            Deine bisherigen OLIVA-Einträge bleiben bestehen. Vor der
            bestätigten Übernahme wird der aktuelle Stand lokal gesichert. Die
            nächste Übernahme ersetzt diese Rückkehrsicherung; externe Exporte
            bleiben davon unabhängig.
          </T>
          <T variant="small" style={{ color: t.muted }}>
            FaithPath-Export mit Datenschema 5, auch wenn außen App-Version 4
            steht. Maximal 10 MB. Wiederherstellungs- und Entwurfsdateien sind
            andere Formate.
          </T>
          <Button
            icon="download"
            disabled={locked}
            onPress={() => void choose()}
          >
            FaithPath-Datei auswählen
          </Button>
          <Button
            kind="ghost"
            icon={null}
            disabled={locked}
            onPress={() => setPaste(!paste)}
          >
            {paste ? "Texteingabe schließen" : "JSON stattdessen einfügen"}
          </Button>
          {paste && (
            <View style={{ gap: 12 }}>
              <Field
                label="Inhalt deiner FaithPath-V5-Sicherung"
                multiline
                value={text}
                maxLength={MAX_SOURCE_BYTES}
                onChangeText={(value) => {
                  setText(value);
                  setPlan(null);
                }}
                placeholder={'{"app":"FaithPath", "schemaVersion":5, …}'}
              />
              <Button
                kind="secondary"
                icon="check"
                disabled={locked || !text.trim()}
                onPress={() => void inspect()}
              >
                Importvorschau prüfen
              </Button>
            </View>
          )}
          {working && (
            <T accessibilityLiveRegion="polite">
              Die lokale Sicherung wird geprüft …
            </T>
          )}
        </Card>
        {!!message && (
          <T accessibilityRole="alert" style={{ fontSize: 13 }}>
            {message}
          </T>
        )}
        {plan && !plan.alreadyImported && (
          <Card style={{ gap: 16, borderColor: t.gold }}>
            <Tag icon="info">Vorschau · noch nichts übernommen</Tag>
            <T variant="heading">Das kommt mit.</T>
            <T>
              {plan.receipt.counts.paths} Vorhaben · {plan.receipt.counts.notes}{" "}
              Gedanken · {plan.receipt.counts.highlights} Versmarkierungen ·{" "}
              {plan.receipt.counts.chapters} Kapitel ·{" "}
              {plan.ntCompletions.length} historische NT-Fragenabschlüsse
            </T>
            <T variant="small">
              Ein historischer NT-Abschluss bedeutet: Die fünf Fragen des
              Kapitels wurden in FaithPath angesehen. Einzelne Antworten sind
              nicht überliefert. Diese Abschlüsse bleiben als Herkunftshinweis
              sichtbar und erzeugen keinen Lese- oder Baumfortschritt.
            </T>
            <T variant="small">
              {plan.receipt.counts.mirrors} eindeutige Reflexionsspiegel
              zusammengeführt. {plan.receipt.counts.conflicts} Konflikte bleiben
              unverändert. Alle Originalfelder einschließlich nicht zuordenbarer
              Inhalte bleiben im einsehbaren Originalarchiv erhalten.
            </T>
            <T variant="small" style={{ color: t.muted }}>
              OTB-Stellen werden nicht als Lutherbibel ausgegeben. Frühere
              Rückblicke bleiben historische Quellen; sie erzeugen keine neue
              Baumstufe und bestätigen keine Anwendung in OLIVA.
            </T>
            {plan.rows.slice(0, limit).map((r, i) => (
              <View
                key={i}
                style={{
                  borderTopWidth: 1,
                  borderColor: t.line,
                  paddingTop: 12,
                  gap: 5,
                }}
              >
                <T
                  variant="label"
                  style={{
                    color: r.status === "conflict" ? t.danger : t.gold,
                    fontSize: 9,
                  }}
                >
                  {r.kind} · {statusLabels[r.status]}
                </T>
                <T
                  numberOfLines={2}
                  style={{ fontSize: 13, fontWeight: "600" }}
                >
                  {r.title}
                </T>
                <T variant="small" style={{ color: t.muted }}>
                  {r.detail}
                </T>
              </View>
            ))}
            {plan.rows.length > limit && (
              <Button
                kind="ghost"
                icon={null}
                onPress={() => setLimit(limit + 20)}
              >
                Weitere {Math.min(20, plan.rows.length - limit)} Prüfpunkte
                ansehen
              </Button>
            )}
            {stale && (
              <T accessibilityRole="alert">
                Der lokale Stand hat sich verändert. Prüfe die Datei erneut,
                bevor du sie übernimmst.
              </T>
            )}
            <Button
              disabled={locked}
              kind="secondary"
              icon="check"
              onPress={() => void inspect()}
            >
              Vorschau erneut prüfen
            </Button>
            <Button
              disabled={locked || stale}
              icon="check"
              onPress={() => void apply()}
            >
              Jetzt sichern und Import übernehmen
            </Button>
            <Button
              disabled={locked}
              kind="ghost"
              icon="close"
              onPress={() => {
                setPlan(null);
                setMessage("Vorschau geschlossen. Es wurde nichts übernommen.");
              }}
            >
              Vorschau schließen
            </Button>
          </Card>
        )}
        {recovery && (
          <Card style={{ gap: 14 }}>
            <T variant="heading">Zum Stand davor zurück.</T>
            <T variant="small">
              Lokale Sicherung vor dem letzten Import vom{" "}
              {new Date(recovery.createdAt).toLocaleString("de-DE")}. Sie bleibt
              auf diesem Gerät und wird beim Löschen der App-Daten ebenfalls
              gelöscht.
            </T>
            <Button
              kind="secondary"
              icon="back"
              disabled={locked}
              onPress={() => void checkRollback()}
            >
              Rückkehr prüfen
            </Button>
            {rollbackRevision !== null && (
              <View style={{ gap: 12 }}>
                <T style={{ fontWeight: "600" }}>
                  Alle Änderungen seit diesem Sicherungsstand werden ersetzt.
                </T>
                <T variant="small">
                  Zurückkehren bedeutet: {recovery.data.notes.length} Gedanken,{" "}
                  {recovery.data.goals.length} Vorhaben und{" "}
                  {recovery.data.drafts.length} Entwürfe aus der lokalen
                  Rückkehrsicherung. Auch später neu geschriebene Texte gehen
                  dabei aus dem aktiven Stand verloren. Exportiere sie vorher,
                  wenn du sie behalten möchtest. Die Rückkehrsicherung wird
                  danach verbraucht.
                </T>
                <Button
                  kind="secondary"
                  icon="download"
                  disabled={locked}
                  onPress={() =>
                    void useApp
                      .getState()
                      .waitForWrites()
                      .then(exportData)
                      .then(() =>
                        setMessage("Aktueller Stand zum Speichern übergeben."),
                      )
                      .catch((e) => setMessage((e as Error).message))
                  }
                >
                  Aktuellen Stand exportieren
                </Button>
                <Button
                  disabled={locked || rollbackRevision !== data.revision}
                  icon="back"
                  onPress={() =>
                    void useApp
                      .getState()
                      .rollbackImport(recovery.token, rollbackRevision)
                      .then((ok) => {
                        if (ok) {
                          setRecovery(null);
                          setRollbackRevision(null);
                          setMessage(
                            "Der Stand vor dem Import wurde wiederhergestellt.",
                          );
                        }
                      })
                  }
                >
                  Stand vor dem Import jetzt wiederherstellen
                </Button>
                <Button
                  kind="ghost"
                  icon="close"
                  onPress={() => setRollbackRevision(null)}
                >
                  Aktuellen Stand behalten
                </Button>
                {rollbackRevision !== data.revision && (
                  <T accessibilityRole="alert">
                    Der Stand hat sich verändert. Bitte prüfe die Rückkehr
                    erneut.
                  </T>
                )}
              </View>
            )}
          </Card>
        )}
        <View style={{ gap: 12 }}>
          <T variant="heading">Dein Importarchiv</T>
          <T variant="small" style={{ color: t.muted }}>
            Originaldateien enthalten persönliche Texte. Sie sind lokal
            gespeichert und Teil deiner OLIVA-Sicherung.
          </T>
          {data.imports.map((r) => (
            <Card key={r.id} style={{ gap: 12 }}>
              <T style={{ fontSize: 13, fontWeight: "600" }}>
                FaithPath · {new Date(r.importedAt).toLocaleString("de-DE")}
              </T>
              <T variant="small">
                {r.counts.paths} Vorhaben und {r.counts.notes} Gedanken ergänzt.
                Originalquelle {Math.ceil(utf8Length(r.sourceText) / 1024)} KB.
              </T>
              <Button
                kind="secondary"
                icon="book"
                onPress={() =>
                  router.push({
                    pathname: "/importarchiv/[id]",
                    params: { id: r.id },
                  })
                }
              >
                Originalarchiv öffnen
              </Button>
            </Card>
          ))}
          {!data.imports.length && (
            <T variant="small">
              Hier erscheint nach einer Übernahme die vollständige
              Originalquelle.
            </T>
          )}
        </View>
      </View>
    </Shell>
  );
}
