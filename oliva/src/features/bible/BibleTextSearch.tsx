import { useEffect, useMemo, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Button, Field, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { BOOKS, referenceLabel, searchBible } from "./repository";
import { OTB_BOOKS, OTB_NAME } from "./open-bible";
import { BibleScopeSelect } from "./BibleScopeSelect";
import type { BibleScope } from "./book-search";
import { verseHighlightPattern, verseSearchParts, type SearchHit } from "./verse-search";

const PAGE_SIZE = 30;

export function BibleTextSearch({ otb, openHit }: { otb: boolean; openHit: (hit: SearchHit) => void }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [testament, setTestament] = useState<BibleScope>("Alle");
  const [book, setBook] = useState<string>();
  const [loaded, setLoaded] = useState<{ key: string; limit: number }>();
  const [alternate, setAlternate] = useState<{ key: string; hits: SearchHit[]; failed?: boolean }>();
  const key = JSON.stringify([otb, debounced, testament, book]);
  const visible = loaded?.key === key ? loaded.limit : PAGE_SIZE;

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const lutherHits = useMemo(() => otb ? [] : searchBible(debounced, Infinity, { testament, book }),
    [otb, debounced, testament, book]);

  useEffect(() => {
    if (!otb || !debounced) return;
    let current = true;
    void import("./open-bible-content").then(({ searchOtb }) => {
      if (current) setAlternate({ key, hits: searchOtb(debounced, Infinity, { testament, book }) });
    }).catch(() => {
      if (current) setAlternate({ key, hits: [], failed: true });
    });
    return () => { current = false; };
  }, [otb, key, debounced, testament, book]);

  const edition = otb ? OTB_NAME : "Luther 1912";
  const otbResult = alternate?.key === key ? alternate : undefined;
  const hits = otb ? otbResult?.hits ?? [] : lutherHits;
  const pending = query.trim() !== debounced || (otb && !!debounced && !otbResult);
  const pattern = useMemo(() => verseHighlightPattern(debounced), [debounced]);

  return <View style={{ gap: 13, width: "100%" }}>
    <T variant="small" style={{ color: t.muted }}>Alle eingegebenen Wörter müssen im selben Vers vorkommen.</T>
    <View style={{ flexDirection: width >= 650 ? "row" : "column", gap: 10, alignItems: width >= 650 ? "flex-end" : "stretch" }}>
      <View style={{ flex: width >= 650 ? 1 : undefined, minWidth: 0 }}>
        <Field label="Wörter im Bibeltext suchen" value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setDebounced(query.trim())}
          placeholder="Zum Beispiel Friede" returnKeyType="search" autoCorrect={false} autoCapitalize="none" />
      </View>
      <BibleScopeSelect value={testament} compact
        onChange={(value) => { setTestament(value); setBook(undefined); }}
        bookFilter={{
          value: book,
          books: otb ? OTB_BOOKS : BOOKS,
          onChange: (code) => { setTestament("Alle"); setBook(code); },
        }}
      />
    </View>
    {pending ? <T variant="small" accessibilityLiveRegion="polite">Der Bibeltext wird durchsucht …</T>
      : !debounced ? <T variant="small" style={{ color: t.muted }}>Gesucht wird in {edition}.</T>
      : otb && otbResult?.failed ? <T accessibilityRole="alert">Die Suche ist gerade nicht verfügbar. Die Kapitel bleiben über „Bücher“ erreichbar.</T>
      : <View style={{ gap: 4 }}>
        <T testID="bible-search-count" variant="small" accessibilityLiveRegion="polite" style={{ color: t.muted }}>
          {hits.length === 1 ? "1 Vers gefunden" : `${hits.length} Verse gefunden`} · {edition}
        </T>
        {hits.length === 0 && <T style={{ paddingTop: 5 }}>Keine passenden Verse gefunden.</T>}
        {hits.slice(0, visible).map((hit) => {
          const label = referenceLabel({ ...hit, from: hit.verse });
          return <Pressable key={`${hit.book}:${hit.chapter}:${hit.verse}`} testID="bible-verse-result"
            accessibilityRole="button" accessibilityLabel={`${label}. ${hit.text}`}
            accessibilityHint="Öffnet den Vers im Kapitel" onPress={() => openHit(hit)}
            style={({ pressed }) => ({
              paddingVertical: 13, paddingHorizontal: 4, gap: 4, borderBottomWidth: 1,
              borderBottomColor: t.line, backgroundColor: pressed ? t.soft : undefined,
            })}>
            <T variant="label" style={{ color: t.primary }}>{label}</T>
            <T variant="heading" style={{ fontSize: 22, lineHeight: 28 }}>
              {verseSearchParts(hit.text, pattern).map((part, index) => part.highlighted
                ? <T key={index} testID="bible-search-highlight"
                    style={{ fontFamily: "Cormorant", fontSize: 22, lineHeight: 28, backgroundColor: t.highlight, fontWeight: "600" }}>
                    {part.text}
                  </T>
                : part.text)}
            </T>
          </Pressable>;
        })}
        {visible < hits.length && <View style={{ gap: 5, alignItems: "center", marginTop: 13 }}>
          <Button kind="secondary" icon={null} onPress={() => setLoaded((current) => ({
            key, limit: (current?.key === key ? current.limit : PAGE_SIZE) + PAGE_SIZE,
          }))}>Weitere Verse anzeigen</Button>
          <T variant="small" style={{ color: t.muted }}>{visible} von {hits.length} Versen angezeigt</T>
        </View>}
      </View>}
  </View>;
}
