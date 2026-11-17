import { useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Tag, Card, Button } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { archiveData } from "../../src/features/imports/model";
import { exportText } from "../../src/services/storage";
import { LegacyNtRestore } from "../../src/features/imports/LegacyNtRestore";
import { resolveArchiveFocus, type ArchiveFocusParams } from "../../src/features/imports/archive-focus";
import { ArchiveHistory } from "../../src/features/imports/ArchiveHistory";
const categories = [
  ["paths", "Wege"],
  ["journal", "Journal"],
  ["reflections", "Reflexionen"],
  ["highlights", "Markierungen"],
  ["reviews", "Rückblicke"],
  ["events", "Ereignisse"],
  ["other", "Weitere Originalfelder"],
] as const;
export default function ImportArchive() {
  const { id, view, historyTab, historyPath, category: focusCategory, entry, section, record, source: sourceHash } = useLocalSearchParams<{ id: string; view?: string; historyTab?: string; historyPath?: string } & ArchiveFocusParams>(),
    historyView = view === "history",
    t = useTheme(),
    receipt = useApp((s) => s.data.imports.find((r) => r.id === id));
  const [category, setCategory] = useState<string>("paths"),
    [limit, setLimit] = useState(10),
    [selected, setSelected] = useState<number | null>(null),
    [message, setMessage] = useState("");
  const source = useMemo(() => {
    if (!receipt || historyView) return null;
    try {
      return archiveData(receipt);
    } catch {
      return null;
    }
  }, [receipt, historyView]);
  const focus = useMemo(() => receipt ? resolveArchiveFocus(receipt, {
    category: focusCategory, entry, section, record, source: sourceHash,
  }) : { status: "none" as const }, [receipt, focusCategory, entry, section, record, sourceHash]);
  if (!receipt || !historyView && !source)
    return (
      <Shell>
        <Card style={{ gap: 14 }}>
          <T variant="heading">Diese Importquelle ist nicht verfügbar.</T>
          <Button onPress={() => router.dismissTo("/importieren")}>
            Zum Importbereich
          </Button>
        </Card>
      </Shell>
    );
  const original = (historyView ? {} : JSON.parse(receipt.sourceText)) as Record<string, unknown>;
  const all = (
    original.app === "FaithPath" ? original.data : original
  ) as Record<string, unknown>;
  const envelope =
    original.app === "FaithPath"
      ? Object.fromEntries(
          Object.entries(original).filter(([key]) => key !== "data"),
        )
      : undefined;
  const entries: unknown[] =
    category === "other"
      ? [
          {
            dataFields: Object.fromEntries(
              Object.entries(all).filter(
                ([key]) => !categories.some((c) => c[0] === key),
              ),
            ),
            ...(envelope ? { envelopeFields: envelope } : {}),
          },
        ]
      : Array.isArray(all[category])
        ? (all[category] as unknown[])
        : [];
  return (
    <Shell>
      <Tag icon="bookmark">{historyView ? "Original aus FaithPath" : "Unveränderte Originalquelle"}</Tag>
      <T
        variant="title"
        accessibilityRole="header"
        style={{ fontSize: 44, marginTop: 14, marginBottom: 12 }}
      >
        {historyView ? "Deine früheren Momente." : "Was du mitgebracht hast."}
      </T>
      <View style={{ maxWidth: 780, gap: 18 }}>
        <T style={{ fontSize: 13, color: t.muted }}>
          {historyView ? <>Aus FaithPath übernommen am {new Date(receipt.importedAt).toLocaleString("de-DE")}. Deine damaligen Worte im Original.</> : <>
          FaithPath-Datenschema 5 · übernommen am {new Date(receipt.importedAt).toLocaleString("de-DE")}. Dies sind
          historische Originaldatensätze. Alte Bewertungen, Übersetzungen und
          Quellenangaben sind keine neuen OLIVA-Bestätigungen.</>}
        </T>
        {historyView ? <>
          <ArchiveHistory key={receipt.id} receipt={receipt} tab={historyTab} pathId={historyPath}
            onPath={(pathId) => router.replace({ pathname: "/importarchiv/[id]", params: { id, view: "history", historyTab: "path", historyPath: pathId } })}
            onUnassigned={() => router.replace({ pathname: "/importarchiv/[id]", params: { id, view: "history", historyTab: "unassigned" } })} />
          <Button kind="ghost" icon="book" onPress={() => router.push({ pathname: "/importarchiv/[id]", params: { id } })}>Alle Originalfelder und Dateiexport</Button>
          <Button kind="ghost" icon="back" onPress={() => router.dismissTo("/garten")}>Zurück zu deinem Garten</Button>
        </> : <>
        <Card style={{ gap: 12 }}>
          <T variant="small">Datei-Fingerabdruck (SHA-256):</T>
          <T selectable style={{ fontSize: 10 }}>
            {receipt.sourceHash}
          </T>
          <Button
            icon="download"
            onPress={() =>
              void exportText(
                receipt.sourceText,
                `faithpath-original-${receipt.fingerprint.slice(0, 12)}.json`,
              )
                .then(() =>
                  setMessage(
                    "Originaldatei zum Speichern oder Teilen übergeben.",
                  ),
                )
                .catch((e) => setMessage((e as Error).message))
            }
          >
            Originaldatei exportieren
          </Button>
          <Button
            kind="ghost"
            icon="back"
            onPress={() => router.dismissTo("/importieren")}
          >
            Zum Importbereich
          </Button>
        </Card>
        {!!message && <T accessibilityRole="alert">{message}</T>}
        {focus.status !== "none" && <Card style={{ gap: 12 }} testID="archive-focused-record">
          <Tag icon="bookmark">Direkt geöffnete Originalstelle</Tag>
          {focus.status === "ok" ? <>
            <T variant="heading" accessibilityRole="header">Diese ursprüngliche Stelle.</T>
            <T variant="small" style={{ color: t.muted }}>Der genaue Datensatz aus der gespeicherten FaithPath-Datei. Seine Felder bleiben unverändert.</T>
            <T variant="small" selectable style={{ color: t.muted }}>{focus.pointer}</T>
            <T selectable testID="archive-focused-json" style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 19 }}>{JSON.stringify(focus.value, null, 2)}</T>
          </> : <T variant="small">{focus.reason}</T>}
          <Button kind="ghost" icon="back" onPress={() => router.replace({ pathname: "/importarchiv/[id]", params: { id } })}>Zur Übersicht dieser Quelle</Button>
        </Card>}
        <LegacyNtRestore
          key={receipt.id + ":" + receipt.sourceHash}
          receipt={receipt}
          quiz={source?.quiz}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {categories.map(([key, label]) => (
            <Button
              key={key}
              kind={category === key ? "primary" : "secondary"}
              icon={null}
              onPress={() => {
                setCategory(key);
                setLimit(10);
                setSelected(null);
              }}
            >
              {label}
            </Button>
          ))}
        </View>
        <T variant="heading">
          {categories.find((c) => c[0] === category)?.[1]} · {entries.length}
        </T>
        {entries.slice(0, limit).map((item, index) => {
          const obj =
            item && typeof item === "object"
              ? (item as Record<string, unknown>)
              : {};
          return (
            <Card key={category + index} style={{ gap: 10 }}>
              <T style={{ fontSize: 13, fontWeight: "600" }}>
                {String(obj.title ?? obj.label ?? obj.id ?? "Originalfelder")}
              </T>
              {typeof obj.text === "string" && (
                <T
                  style={{ fontSize: 14 }}
                  numberOfLines={selected === index ? undefined : 4}
                >
                  {obj.text}
                </T>
              )}
              <Button
                kind="ghost"
                icon="info"
                onPress={() => setSelected(selected === index ? null : index)}
              >
                {selected === index
                  ? "Originaldatensatz schließen"
                  : "Originaldatensatz ansehen"}
              </Button>
              {selected === index && (
                <T
                  selectable
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    lineHeight: 19,
                  }}
                >
                  {JSON.stringify(item, null, 2)}
                </T>
              )}
            </Card>
          );
        })}
        {!entries.length && (
          <T variant="small">Keine Originaldatensätze in diesem Bereich.</T>
        )}
        {entries.length > limit && (
          <Button
            kind="secondary"
            icon={null}
            onPress={() => setLimit(limit + 10)}
          >
            Weitere Originaldatensätze anzeigen
          </Button>
        )}
        </>}
      </View>
    </Shell>
  );
}
