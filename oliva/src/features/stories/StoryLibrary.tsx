import { useMemo, useState, type ReactNode } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Shell } from "../../components/Shell";
import { Button, Field, T } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useTheme } from "../../design-system/theme";
import { useApp } from "../../state/store";
import { BOOKS } from "../bible/repository";
import { BibleScopeSelect } from "../bible/BibleScopeSelect";
import type { BibleScope } from "../bible/book-search";
import { filterStories, storyById, type StoryUnit } from "./index";
import { storyProgress } from "./model";
import { StoryThumbnail } from "./StoryArt";

const storyKinds = [
  ["Alle", "Alle Abschnitte"],
  ["Bilder", "Mit Bild"],
  ["Texte", "Psalmen & Briefe"],
] as const;

export function StoryLibrary({ sectionHeader }: { sectionHeader?: ReactNode } = {}) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const data = useApp((state) => state.data);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<BibleScope>("Alle");
  const [kind, setKind] = useState<(typeof storyKinds)[number][0]>("Alle");
  const [book, setBook] = useState("Alle");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const activeFilters = Number(scope !== "Alle") + Number(kind !== "Alle") + Number(book !== "Alle");
  const filtered = useMemo(() => filterStories(query, scope, kind, book), [query, scope, kind, book]);
  const featured = !query.trim() && activeFilters === 0 ? storyById("NS-0241") : null;
  const rows = featured ? [featured, ...filtered.filter((story) => story.id !== featured.id)] : filtered;
  const position = data.storyStudy.position;
  const resume = position ? storyById(position.unitId) : null;

  function clearFilters() {
    setScope("Alle");
    setKind("Alle");
    setBook("Alle");
    setBooksOpen(false);
  }

  function row(unit: StoryUnit) {
    const progress = storyProgress(data, unit);
    const recommended = unit.id === featured?.id;
    return (
      <Pressable accessibilityRole="button"
        accessibilityLabel={unit.title + ", " + unit.referenceLabel + (recommended ? ", Empfehlung" : "")}
        onPress={() => router.push({ pathname: "/geschichte/[id]", params: { id: unit.id } })}
        testID={"story-row-" + unit.id}
        style={({ pressed }) => ({
          flexDirection: "row", gap: 12, paddingVertical: 10, minHeight: 94,
          borderBottomWidth: 1, borderColor: t.line, alignItems: "center", opacity: pressed ? 0.7 : 1,
        })}
      >
        <StoryThumbnail unit={unit} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <T variant="label" style={{ fontSize: 8, color: t.gold }}>{recommended ? "Empfehlung" : unit.kind}</T>
          <T style={{ fontFamily: "Cormorant", fontSize: 25, lineHeight: 29 }}>{unit.title}</T>
          <T variant="small" style={{ fontSize: 11, color: t.muted }}>{unit.referenceLabel} · {unit.questions.length} Fragen</T>
          {(progress.read || progress.seen > 0) && <T variant="small" style={{ fontSize: 10, color: t.primary }}>
            {progress.read ? "Abschnitt gelesen · " : ""}{progress.seen} von {progress.total} Fragen angesehen
          </T>}
        </View>
        <Icon name="chevron" color={t.muted} size={16} />
      </Pressable>
    );
  }

  const header = <View>
    {sectionHeader ?? <T variant="title" accessibilityRole="header" aria-level={1} style={{ marginBottom: 14 }}>Geschichten</T>}
    {resume && position && position.setHash === resume.questionSetHash && (
      <View style={{ alignItems: "flex-start", marginBottom: 6 }}>
        <Button kind="ghost" icon="bookmark" style={{ paddingHorizontal: 0 }}
          onPress={() => router.push({ pathname: "/geschichte/[id]", params: { id: resume.id, stage: position.stage, index: position.index } })}>
          Abschnitt fortsetzen
        </Button>
        <T variant="small" style={{ color: t.muted, marginBottom: 8 }}>{resume.title}</T>
      </View>
    )}
    <Field label="Titel oder Bibelstelle" placeholder="Geschichte suchen" value={query} onChangeText={setQuery} />
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: 10 }}>
      <T accessibilityLiveRegion="polite" variant="small" style={{ color: t.muted }}>
        {filtered.length} {filtered.length === 1 ? "Abschnitt" : "Abschnitte"}
      </T>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }}
        aria-controls={filtersOpen ? "story-filters" : undefined} onPress={() => setFiltersOpen(!filtersOpen)}
        style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, maxWidth: "100%" }}>
        <T style={{ color: t.primary, fontSize: 14 }}>{activeFilters ? "Filter (" + activeFilters + ")" : "Filter"}</T>
        <View style={{ transform: [{ rotate: filtersOpen ? "-90deg" : "90deg" }] }}>
          <Icon name="chevron" size={14} color={t.primary} />
        </View>
      </Pressable>
    </View>
    {filtersOpen && (
      <View nativeID="story-filters" role="group" accessibilityLabel="Geschichten filtern"
        style={{ gap: 8, marginVertical: 6, padding: 12, backgroundColor: t.soft, borderRadius: 14 }}>
        <BibleScopeSelect value={scope} onChange={(value) => { setScope(value); setBook("Alle"); }} />
        <View role="group" accessibilityLabel="Abschnitte filtern" style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {storyKinds.map(([value, label]) => (
            <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: kind === value }}
              aria-pressed={kind === value} onPress={() => setKind(value)}
              style={{ minHeight: 44, paddingHorizontal: 10, paddingVertical: 10, justifyContent: "center",
                borderRadius: 12, borderWidth: 1, borderColor: t.line, backgroundColor: kind === value ? t.primary : t.surface }}>
              <T style={{ fontSize: 13, color: kind === value ? t.onPrimary : t.text }}>{label}</T>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: booksOpen }} onPress={() => setBooksOpen(!booksOpen)}
          style={{ minHeight: 44, alignSelf: "flex-start", justifyContent: "center" }}>
          <T style={{ color: t.primary, fontSize: 14 }}>
            {booksOpen ? "Buchfilter schließen" : BOOKS.find((entry) => entry.code === book)?.name ?? "Nach Bibelbuch filtern"}
          </T>
        </Pressable>
        {booksOpen && (
          <View role="group" accessibilityLabel="Bibelbuch filtern" style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {[{ code: "Alle", name: "Alle Bücher" }, ...BOOKS.filter((entry) => scope === "Alle" || entry.testament === scope)].map((entry) => (
              <Pressable key={entry.code} accessibilityRole="button" accessibilityState={{ selected: book === entry.code }}
                aria-pressed={book === entry.code} onPress={() => { setBook(entry.code); setBooksOpen(false); }}
                style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 12,
                  backgroundColor: book === entry.code ? t.goldSoft : t.surface }}>
                <T style={{ fontSize: 13 }}>{entry.name}</T>
              </Pressable>
            ))}
          </View>
        )}
        {activeFilters > 0 && (
          <Button kind="ghost" icon={null} onPress={clearFilters} style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}>
            Filter zurücksetzen
          </Button>
        )}
      </View>
    )}
    {filtered.length === 0 && (
      <View style={{ paddingVertical: 20, gap: 10 }}>
        <T style={{ color: t.muted }}>Dazu haben wir gerade keinen Abschnitt gefunden.</T>
        <Button kind="secondary" onPress={() => { setQuery(""); clearFilters(); setFiltersOpen(false); }}>
          Alle 436 Abschnitte ansehen
        </Button>
      </View>
    )}
  </View>;

  return (
    <Shell scrollable={false} header="compact">
      <FlatList testID="story-library-list" data={rows} keyExtractor={(unit) => unit.id} renderItem={({ item }) => row(item)}
        initialNumToRender={8} maxToRenderPerBatch={8} windowSize={7} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListFooterComponent={<View style={{ gap: 15, paddingTop: 26 }}>
          <T variant="small" style={{ fontSize: 11, lineHeight: 19, color: t.muted }}>
            436 Originaleinheiten · 2.479 Fragen · 436 freiwillige Reflexionsimpulse.
          </T>
          <Button kind="ghost" icon="leaf" onPress={() => router.push("/garten")}>Deinen Garten ansehen</Button>
          <Button kind="ghost" icon="book" onPress={() => router.push("/bibel")}>Zur Bibelnavigation</Button>
        </View>}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: width < 350 ? 18 : 22, paddingTop: 18, paddingBottom: 35,
          maxWidth: 780, width: "100%", alignSelf: "center" }}
      />
    </Shell>
  );
}
