import { useMemo, useRef, useState, type ReactNode } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../../components/Shell";
import { T, Field, Button } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { BOOKS } from "../bible/repository";
import { BibleScopeSelect } from "../bible/BibleScopeSelect";
import type { BibleScope } from "../bible/book-search";
import { filterStories, storyById, type StoryUnit } from "./index";
import { storyProgress } from "./model";
import { StoryHero, StoryThumbnail } from "./StoryArt";

export function StoryLibrary({ sectionHeader }: { sectionHeader?: ReactNode } = {}) {
  const t = useTheme(), { width } = useWindowDimensions(), data = useApp((s) => s.data);
  const [query, setQuery] = useState(""), [scope, setScope] = useState<BibleScope>("Alle"),
    [kind, setKind] = useState("Alle"), [book, setBook] = useState("Alle"), [booksOpen, setBooksOpen] = useState(false);
  const list = useRef<FlatList<StoryUnit>>(null);
  const filtered = useMemo(() => filterStories(query, scope, kind, book), [query, scope, kind, book]);
  const featured = storyById("NS-0241")!, showHero = !query.trim() && scope === "Alle" && kind === "Alle" && book === "Alle";
  const rows = showHero ? filtered.filter((s) => s.id !== featured.id) : filtered;
  const position = data.storyStudy.position, resume = position ? storyById(position.unitId) : null;
  const open = (unit: StoryUnit) => router.push({ pathname: "/geschichte/[id]", params: { id: unit.id } });
  const maxWidth = 780, pad = width < 350 ? 18 : 22;
  function row(unit: StoryUnit) {
    const progress = storyProgress(data, unit);
    return <Pressable accessibilityRole="button" accessibilityLabel={unit.title + ", " + unit.referenceLabel}
      onPress={() => open(unit)} testID={"story-row-" + unit.id}
      style={({ pressed }) => ({ flexDirection: "row", gap: 14, paddingVertical: 18, minHeight: 104, borderBottomWidth: 1, borderColor: t.line, alignItems: "center", opacity: pressed ? 0.7 : 1 })}>
      <StoryThumbnail unit={unit} />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <T variant="label" style={{ fontSize: 8, color: t.gold }}>{unit.kind}</T>
        <T style={{ fontFamily: "Cormorant", fontSize: 25, lineHeight: 29 }}>{unit.title}</T>
        <T variant="small" style={{ fontSize: 11, color: t.muted }}>{unit.referenceLabel} · {unit.questions.length} Fragen</T>
        {(progress.read || progress.seen > 0) && <T variant="small" style={{ fontSize: 10, color: t.primary }}>
          {progress.read ? "Abschnitt gelesen · " : ""}{progress.seen} von {progress.total} Fragen angesehen
        </T>}
      </View>
      <Icon name="chevron" color={t.muted} size={16} />
    </Pressable>;
  }
  const search = <View style={{ flexDirection: "row", gap: 10, marginTop: 27, alignItems: "flex-end" }}>
      <View style={{ flex: 1, minWidth: 0 }}><Field label="Titel oder Bibelstelle" placeholder="Was möchtest du entdecken?" value={query} onChangeText={setQuery} /></View>
      <View style={{ width: width < 350 ? 135 : 150 }}><BibleScopeSelect compact value={scope} onChange={(v) => { setScope(v); setBook("Alle"); }} /></View>
    </View>;
  const header = <View style={{ gap: 0 }}>
    {sectionHeader ?? <>
    <T variant="label" style={{ color: t.gold, fontSize: 10, marginBottom: 12 }}>BIBEL ENTDECKEN</T>
    <T variant="title" accessibilityRole="header" aria-level={1} style={{ fontSize: width < 350 ? 40 : 44, lineHeight: 46 }}>Ein Text.{"\n"}Ein neuer Blick.</T>
    <T style={{ color: t.muted, fontSize: 14, lineHeight: 24, marginTop: 14 }}>Geschichten, Gebete und Gedanken der Bibel. Du brauchst kein Vorwissen.</T></>}
    {resume && position && position.setHash === resume.questionSetHash && <View style={{ borderWidth: 1, borderColor: t.line, borderRadius: 18, padding: 16, gap: 8, marginTop: 22 }}>
      <T variant="small" style={{ color: t.muted }}>Hier weitermachen</T>
      <T style={{ fontFamily: "Cormorant", fontSize: 26 }}>{resume.title}</T>
      <Button kind="secondary" icon="bookmark" onPress={() => router.push({ pathname: "/geschichte/[id]", params: { id: resume.id, stage: position.stage, index: position.index } })}>Abschnitt fortsetzen</Button>
    </View>}
    {sectionHeader && search}
    {showHero && <View style={{ marginTop: 24, gap: 0, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: 26, overflow: "hidden" }}>
      <StoryHero unit={featured} />
      <View style={{ padding: 21, gap: 10 }}>
        <T variant="label" style={{ fontSize: 9, color: t.gold }}>EINE BEGEGNUNG ZUM ANFANG</T>
        <T variant="heading" style={{ fontSize: 34 }}>{featured.title}</T>
        <T variant="small" style={{ color: t.muted }}>{featured.referenceLabel}</T>
        <T style={{ fontSize: 13, lineHeight: 23, color: t.muted }}>Gott begegnet Menschen mitten im Alltag.</T>
        <Button kind="ghost" icon="arrow" onPress={() => open(featured)}>Geschichte entdecken</Button>
      </View>
    </View>}
    {!sectionHeader && search}
    <View role="group" accessibilityLabel="Abschnitte filtern" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
      {[["Alle", "Alle Abschnitte"], ["Bilder", "Mit Bild"], ["Texte", "Psalmen & Briefe"]].map(([value, label]) =>
        <Pressable key={value} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: kind === value }}
          onPress={() => setKind(value!)} style={{ minHeight: 44, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 30, borderWidth: 1, borderColor: t.line, backgroundColor: kind === value ? t.primary : t.surface }}>
          <T style={{ fontSize: 11, color: kind === value ? t.onPrimary : t.text }}>{label}</T>
        </Pressable>)}
    </View>
    <View style={{ marginTop: 10, alignItems: "flex-start" }}>
      <Button kind="ghost" icon="book" onPress={() => setBooksOpen(!booksOpen)}>{booksOpen ? "Buchfilter schließen" : book === "Alle" ? "Nach Bibelbuch filtern" : BOOKS.find((b) => b.code === book)!.name}</Button>
    </View>
    {booksOpen && <View role="group" accessibilityLabel="Bibelbuch filtern" style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {[{ code: "Alle", name: "Alle Bücher" }, ...BOOKS.filter((b) => scope === "Alle" || b.testament === scope)].map((b) =>
        <Pressable key={b.code} accessibilityRole="button" accessibilityState={{ selected: book === b.code }} onPress={() => { setBook(b.code); setBooksOpen(false); }}
          style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 12, backgroundColor: book === b.code ? t.goldSoft : t.soft }}>
          <T style={{ fontSize: 12 }}>{b.name}</T>
        </Pressable>)}
    </View>}
    <View style={{ marginTop: 24, marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <T variant="heading">Durch die Bibel</T>
      <T accessibilityLiveRegion="polite" variant="small" style={{ color: t.muted }}>{filtered.length} {filtered.length === 1 ? "Abschnitt" : "Abschnitte"}</T>
    </View>
    {filtered.length === 0 && <View style={{ paddingVertical: 24, gap: 14 }}>
      <T style={{ color: t.muted }}>Dazu haben wir gerade keinen Abschnitt gefunden.</T>
      <Button kind="secondary" onPress={() => { setQuery(""); setKind("Alle"); setScope("Alle"); setBook("Alle"); }}>Alle 436 Abschnitte ansehen</Button>
    </View>}
  </View>;
  return <Shell scrollable={false}>
    <FlatList testID="story-library-list" ref={list} data={rows} keyExtractor={(unit) => unit.id} renderItem={({ item }) => row(item)}
      initialNumToRender={8} maxToRenderPerBatch={8} windowSize={7} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListFooterComponent={<View style={{ gap: 15, paddingTop: 26 }}>
        <T variant="small" style={{ fontSize: 11, lineHeight: 19, color: t.muted }}>436 Originaleinheiten · 2.479 Fragen · 436 freiwillige Reflexionsimpulse. In Bibelreihenfolge, ohne Rangliste.</T>
        <Button kind="ghost" icon="leaf" onPress={() => router.push("/garten")}>Deinen Garten ansehen</Button>
        <Button kind="ghost" icon="book" onPress={() => router.push("/bibel")}>Zur Bibelnavigation</Button>
      </View>}
      style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 26, paddingBottom: 35, maxWidth, width: "100%", alignSelf: "center" }}
    />
  </Shell>;
}
