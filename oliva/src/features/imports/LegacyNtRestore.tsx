import { useMemo, useState } from "react";
import { View } from "react-native";
import { T, Tag, Card, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { referenceLabel } from "../bible/repository";
import { extractLegacyNtCompletions } from "../quiz/model";
import type { ImportReceipt } from "./schema";

/** Archive inspection is read-only. Only the explicit action activates proven facts. */
export function LegacyNtRestore({
  receipt,
  quiz,
}: {
  receipt: ImportReceipt;
  quiz: unknown;
}) {
  const t = useTheme();
  const revision = useApp((s) => s.data.revision);
  const active = useApp((s) => s.data.ntStudy.legacyCompletions);
  const busy = useApp((s) => s.busy);
  const [expectedRevision, setExpectedRevision] = useState(revision);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [limit, setLimit] = useState(5);
  const extracted = useMemo(() => {
    try {
      return extractLegacyNtCompletions(
        quiz ?? {},
        receipt.id,
        receipt.sourceHash,
      );
    } catch {
      return null;
    }
  }, [quiz, receipt.id, receipt.sourceHash]);
  if (!extracted) {
    return (
      <Card style={{ gap: 12 }}>
        <T variant="heading">NT-Status konnte nicht zugeordnet werden.</T>
        <T variant="small">
          Die Originalquelle bleibt erhalten. Es wurden keine NT-Abschlüsse
          übernommen.
        </T>
      </Card>
    );
  }
  const activated = extracted.completions.filter((completion) =>
    active.some(
      (existing) =>
        existing.importId === completion.importId &&
        existing.sourceHash === completion.sourceHash &&
        existing.sourceUnitId === completion.sourceUnitId &&
        existing.completedAt === completion.completedAt,
    ),
  ).length;
  const pending = extracted.completions.length - activated;
  const ignored =
    extracted.ignored.unknownUnitKeys +
    extracted.ignored.invalidEntries +
    extracted.ignored.invalidDone;
  const stale = revision !== expectedRevision;

  async function inspectAgain() {
    if (working || busy) return;
    setWorking(true);
    setMessage("");
    try {
      const current = await useApp.getState().refresh();
      if (current) {
        setExpectedRevision(current.revision);
        setMessage(
          "Vorschau mit dem aktuellen lokalen Stand geprüft. Es wurde nichts übernommen.",
        );
      } else {
        setMessage(
          useApp.getState().error ??
            "Der aktuelle Stand konnte nicht gelesen werden.",
        );
      }
    } finally {
      setWorking(false);
    }
  }

  async function activate() {
    if (working || busy || stale) return;
    setWorking(true);
    setMessage("");
    try {
      const saved = await useApp
        .getState()
        .activateArchivedNtProgress(
          receipt.id,
          receipt.sourceHash,
          expectedRevision,
        );
      if (saved) {
        setExpectedRevision(useApp.getState().data.revision);
        setMessage(
          "Die belegten NT-Abschlüsse sind jetzt als historische Herkunftshinweise sichtbar. Deine Originaldatei und deine Antworten bleiben erhalten.",
        );
      } else {
        setMessage(
          useApp.getState().error ??
            "Die Übernahme wurde nicht gespeichert. Prüfe den aktuellen Stand erneut.",
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Übernahme wurde nicht gespeichert. Prüfe den aktuellen Stand erneut.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <Card style={{ gap: 14 }}>
      <Tag icon="book">Historische NT-Verständnisfragen</Tag>
      <T variant="heading" accessibilityRole="header">
        Dein früherer Kapitelabschluss.
      </T>
      <T variant="small" accessibilityLiveRegion="polite">
        {extracted.completions.length} eindeutig belegte Abschlüsse in diesem
        Archiv · {activated} bereits sichtbar · {pending} noch übernehmbar.
      </T>
      <T variant="small" style={{ color: t.muted }}>
        FaithPath speicherte den Zeitpunkt, an dem alle fünf Fragen eines
        Kapitels angesehen waren. Einzelne Antworten und ihre Richtigkeit sind
        nicht überliefert. Die Übernahme ergänzt nur diesen historischen
        Hinweis. Sie ändert keine Antworten, Lesefortschritte oder Baumstufe.
      </T>
      {extracted.completions.slice(0, limit).map((completion) => (
        <View
          key={completion.sourceUnitId}
          style={{
            borderTopWidth: 1,
            borderColor: t.line,
            paddingTop: 10,
            gap: 3,
          }}
        >
          <T style={{ fontSize: 13 }}>{referenceLabel(completion)}</T>
          <T variant="small" style={{ color: t.muted }}>
            Fragen angesehen am{" "}
            {new Date(completion.completedAt).toLocaleString("de-DE")}
          </T>
          <T variant="small" style={{ color: t.muted }}>
            Originaleinheit {completion.sourceUnitId} · UTC{" "}
            {completion.completedAt}
          </T>
        </View>
      ))}
      {extracted.completions.length > limit && (
        <Button kind="ghost" icon={null} onPress={() => setLimit(limit + 10)}>
          Weitere historische NT-Abschlüsse ansehen
        </Button>
      )}
      {(ignored > 0 || extracted.ignored.extraFields > 0) && (
        <T variant="small" style={{ color: t.muted }}>
          {ignored} nicht eindeutig zuordenbare Quiz-Einträge und{" "}
          {extracted.ignored.extraFields} zusätzliche Felder bleiben im
          Originalarchiv. Daraus entstehen keine Antworten oder Erfolge.
        </T>
      )}
      {pending > 0 && (
        <>
          <T variant="small">
            Das Ansehen dieser Vorschau speichert nichts. Die Originaldatei und
            die vorhandene Rückkehrsicherung bleiben bei der Übernahme erhalten.
          </T>
          {stale && (
            <T accessibilityRole="alert">
              Der lokale Stand hat sich verändert. Prüfe die Vorschau erneut.
            </T>
          )}
          <Button
            kind="secondary"
            icon="check"
            disabled={busy || working}
            onPress={() => void inspectAgain()}
          >
            NT-Archivvorschau erneut prüfen
          </Button>
          <Button
            disabled={busy || working || stale}
            icon="check"
            onPress={() => void activate()}
          >
            NT-Abschlüsse aus diesem Archiv übernehmen
          </Button>
        </>
      )}
      {working && (
        <T accessibilityLiveRegion="polite">
          Historische NT-Abschlüsse werden lokal gespeichert …
        </T>
      )}
      {!!message && (
        <T accessibilityRole="alert" style={{ fontSize: 13 }}>
          {message}
        </T>
      )}
    </Card>
  );
}
