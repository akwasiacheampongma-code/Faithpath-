import { useEffect, useRef, useState } from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import {
  T,
  Button,
  Card,
  Field,
  IconButton,
  Tag,
} from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { SwordArt } from "../../src/components/Artwork";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import {
  getChapter,
  getPassage,
  bookByCode,
  referenceLabel,
  validReference,
  adjacentChapter,
} from "../../src/features/bible/repository";
import { PATHS, pathById } from "../../src/features/paths/catalog";
import { markRead, chapterId, countBookRead } from "../../src/state/model";
export default function Reader() {
  const params = useLocalSearchParams<{
      book: string;
      chapter: string;
      from?: string;
      to?: string;
      path?: string;
      step?: string;
      mode?: string;
      verse?: string;
    }>(),
    t = useTheme(),
    { width } = useWindowDimensions(),
    data = useApp((s) => s.data),
    mutate = useApp((s) => s.mutate),
    busy = useApp((s) => s.busy);
  const ref = {
      book: params.book ?? "",
      chapter: Number(params.chapter ?? 1),
      ...(params.from ? { from: Number(params.from) } : {}),
      ...(params.to ? { to: Number(params.to) } : {}),
    },
    book = bookByCode(ref.book),
    valid = validReference(ref),
    verses = getPassage(ref),
    stepKey =
      params.path && params.step !== undefined
        ? `${params.path}:${params.step}`
        : undefined;
  const path = params.path ? pathById(params.path) : null,
    step = path?.steps[Number(params.step)],
    context =
      step ??
      PATHS.flatMap((p) => p.steps).find(
        (s) => s.ref.book === ref.book && s.ref.chapter === ref.chapter,
      ),
    related = PATHS.filter((p) =>
      p.steps.some(
        (s) => s.ref.book === ref.book && s.ref.chapter === ref.chapter,
      ),
    );
  const [mode, setMode] = useState<"read" | "deep">(
      params.mode === "deep" ? "deep" : "read",
    ),
    [tools, setTools] = useState(false),
    [selected, setSelected] = useState<number | null>(
      params.verse ? Number(params.verse) : null,
    ),
    [note, setNote] = useState(""),
    [saved, setSaved] = useState(false),
    [ack, setAck] = useState(false);
  const lastOpened = useRef("");
  const openKey = JSON.stringify(ref);
  useEffect(() => {
    setAck(false);
    setSelected(params.verse ? Number(params.verse) : null);
    setSaved(false);
    setNote("");
    setMode(params.mode === "deep" ? "deep" : "read");
    if (valid && lastOpened.current !== openKey) {
      lastOpened.current = openKey;
      void mutate((d) => {
        d.reading = ref;
      });
    }
  }, [openKey]);
  const back = () => {
    if (stepKey && path)
      router.dismissTo({ pathname: "/weg/[id]", params: { id: path.id } });
    else if (router.canGoBack()) router.back();
    else router.replace("/bibel");
  };
  async function complete() {
    if (!valid) return;
    if (
      await mutate((d) => {
        markRead(d, ref, stepKey);
      })
    )
      setAck(true);
  }
  async function saveNote() {
    if (!note.trim() || selected === null) return;
    const now = new Date().toISOString(),
      id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (
      await mutate((d) => {
        d.notes.unshift({
          id,
          text: note.trim(),
          kind: "note",
          ref: {
            book: ref.book,
            chapter: ref.chapter,
            from: selected,
            to: selected,
          },
          createdAt: now,
          updatedAt: now,
        });
      })
    ) {
      setNote("");
      setSaved(true);
    }
  }
  const verseId =
      selected !== null ? `${ref.book}:${ref.chapter}:${selected}` : "",
    read = data.readChapters.includes(chapterId(ref)),
    passage = !!(ref.from || ref.to),
    done =
      ack ||
      (stepKey
        ? data.readSteps.includes(stepKey)
        : passage
          ? data.readPassages.includes(
              `${ref.book}:${ref.chapter}:${ref.from ?? getChapter(ref.book, ref.chapter)[0]?.n}:${ref.to ?? getChapter(ref.book, ref.chapter).at(-1)?.n}`,
            )
          : read);
  function navigate(delta: -1 | 1) {
    const next = adjacentChapter(ref.book, ref.chapter, delta);
    if (next)
      router.replace({
        pathname: "/lesen/[book]",
        params: { book: next.book, chapter: next.chapter },
      });
  }
  return (
    <Shell reader>
      <View
        style={{ maxWidth: 860, width: "100%", alignSelf: "center", gap: 22 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <IconButton
              name="back"
              label={path ? "Zurück zum Weg" : "Zurück"}
              onPress={back}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/bibel")}
              style={{ minHeight: 44, justifyContent: "center", flexShrink: 1 }}
            >
              <T style={{ fontSize: 14 }}>{referenceLabel(ref)}⌄</T>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 3 }}>
            {width >= 600 && <Tag>Luther 1912</Tag>}
            <IconButton
              name="settings"
              label="Leseeinstellungen"
              selected={tools}
              onPress={() => setTools(!tools)}
            />
            <IconButton
              name={t.dark ? "sun" : "moon"}
              label={
                t.dark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"
              }
              onPress={() =>
                void mutate((d) => {
                  d.settings.theme = t.dark ? "light" : "dark";
                })
              }
            />
          </View>
        </View>
        {!valid ? (
          <Card>
            <T variant="heading">Diese Bibelstelle gibt es nicht.</T>
            <T style={{ marginVertical: 15 }}>
              Wähle ein vorhandenes Buch und Kapitel.
            </T>
            <Button onPress={() => router.replace("/bibel")}>
              Zur Buchauswahl
            </Button>
          </Card>
        ) : (
          <>
            {tools && (
              <Card style={{ gap: 16 }}>
                <T variant="heading">Dein Lesemodus</T>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 13,
                    flexWrap: "wrap",
                  }}
                >
                  <T style={{ fontSize: 12 }}>
                    Schriftgröße: {data.settings.fontSize}
                  </T>
                  <Button
                    icon={null}
                    kind="secondary"
                    disabled={data.settings.fontSize <= 18 || busy}
                    onPress={() =>
                      void mutate((d) => {
                        d.settings.fontSize -= 2;
                      })
                    }
                  >
                    Kleiner
                  </Button>
                  <Button
                    icon={null}
                    kind="secondary"
                    disabled={data.settings.fontSize >= 30 || busy}
                    onPress={() =>
                      void mutate((d) => {
                        d.settings.fontSize += 2;
                      })
                    }
                  >
                    Größer
                  </Button>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <T style={{ fontSize: 12 }}>Zeilenabstand</T>
                  {[1.5, 1.8, 2.1].map((n) => (
                    <Button
                      key={n}
                      icon={null}
                      kind={
                        Math.abs(data.settings.lineHeight - n) < 0.05
                          ? "primary"
                          : "secondary"
                      }
                      disabled={busy}
                      onPress={() =>
                        void mutate((d) => {
                          d.settings.lineHeight = n;
                        })
                      }
                    >
                      {String(n).replace(".", ",")}
                    </Button>
                  ))}
                </View>
              </Card>
            )}
            <View style={{ alignItems: "center", gap: 14, marginTop: 12 }}>
              {path && (
                <Tag icon="path">
                  {path.title} · Schritt {Number(params.step) + 1}
                </Tag>
              )}
              <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                {book?.testament === "NT"
                  ? "NEUES TESTAMENT"
                  : "ALTES TESTAMENT"}
              </T>
              <T
                variant="hero"
                accessibilityRole="header"
                style={{ fontSize: width < 500 ? 40 : 51, textAlign: "center" }}
              >
                {step?.title ?? book?.name}
              </T>
              <T style={{ color: t.muted, fontSize: 12 }}>
                {referenceLabel(ref)} · Bibeltext
              </T>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: t.soft,
                  padding: 4,
                  borderRadius: 30,
                  marginTop: 7,
                }}
              >
                {[
                  ["read", "Einfach lesen"],
                  ["deep", "Tiefer verstehen"],
                ].map(([id, label]) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mode === id }}
                    onPress={() => setMode(id as "read")}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      minHeight: 44,
                      borderRadius: 25,
                      backgroundColor: mode === id ? t.surface : "transparent",
                    }}
                  >
                    <T
                      style={{
                        fontSize: 11,
                        color: mode === id ? t.text : t.muted,
                      }}
                    >
                      {label}
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>
            {mode === "deep" && (
              <Card
                style={{ gap: 12, backgroundColor: t.soft, borderWidth: 0 }}
              >
                <T variant="label" style={{ color: t.gold, fontSize: 9 }}>
                  KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
                </T>
                <T variant="heading">
                  {context
                    ? "Was du zum Abschnitt wissen solltest"
                    : "Das Buch im Überblick"}
                </T>
                <T style={{ fontSize: 13, lineHeight: 23 }}>
                  {context?.explanation ?? book?.description}
                </T>
                {context && (
                  <T style={{ fontSize: 10, color: t.muted }}>
                    Diese Einordnung bezieht sich auf{" "}
                    {referenceLabel(context.ref)}.
                  </T>
                )}
                {context?.word && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderColor: t.line,
                      paddingTop: 13,
                      gap: 4,
                    }}
                  >
                    <T style={{ fontSize: 12, fontWeight: "600" }}>
                      {context.word[0]} – einfach erklärt
                    </T>
                    <T style={{ fontSize: 12, color: t.muted }}>
                      {context.word[1]}
                    </T>
                  </View>
                )}
                {!context && (
                  <T style={{ fontSize: 11, color: t.muted }}>
                    Für dieses Kapitel liegt noch keine geprüfte Zusammenfassung
                    vor. Der Bibeltext ist vollständig lesbar.
                  </T>
                )}
              </Card>
            )}
            <View
              style={{
                maxWidth: 660,
                width: "100%",
                alignSelf: "center",
                gap: 5,
                marginTop: 12,
              }}
            >
              <T
                variant="small"
                style={{ fontSize: 10, color: t.muted, marginBottom: 15 }}
              >
                Tippe auf einen Vers, um ihn zu markieren, zu merken oder eine
                Notiz zu schreiben.
              </T>
              {verses.map((v) => {
                const key = `${ref.book}:${ref.chapter}:${v.n}`,
                  color = data.highlights[key];
                return (
                  <View key={v.n}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Vers ${v.n}: ${v.text}`}
                      accessibilityState={{ selected: selected === v.n }}
                      onPress={() => {
                        setSelected(selected === v.n ? null : v.n);
                        setNote("");
                        setSaved(false);
                      }}
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        marginHorizontal: -8,
                        borderRadius: 8,
                        backgroundColor:
                          selected === v.n
                            ? t.soft
                            : color === "gold"
                              ? t.goldSoft
                              : color === "olive"
                                ? t.highlight
                                : "transparent",
                      }}
                    >
                      <T
                        style={{
                          fontFamily: "Cormorant",
                          fontSize: data.settings.fontSize + 3,
                          lineHeight:
                            (data.settings.fontSize + 3) *
                            data.settings.lineHeight,
                        }}
                      >
                        <T
                          style={{
                            fontFamily: "DMSans",
                            color: t.gold,
                            fontSize: 10,
                            lineHeight: 20,
                          }}
                        >
                          {v.n}　
                        </T>
                        {v.text}
                        {data.bookmarks.includes(key) ? " ◇" : ""}
                      </T>
                    </Pressable>
                    {selected === v.n && (
                      <Card
                        style={{ marginVertical: 12, padding: 17, gap: 14 }}
                      >
                        <T variant="label" style={{ fontSize: 9 }}>
                          DEIN MOMENT MIT VERS {v.n}
                        </T>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <Button
                            icon="bookmark"
                            kind={
                              data.bookmarks.includes(key)
                                ? "primary"
                                : "secondary"
                            }
                            disabled={busy}
                            onPress={() =>
                              void mutate((d) => {
                                d.bookmarks = d.bookmarks.includes(key)
                                  ? d.bookmarks.filter((k) => k !== key)
                                  : [...d.bookmarks, key];
                              })
                            }
                          >
                            {data.bookmarks.includes(key)
                              ? "Gemerkt"
                              : "Merken"}
                          </Button>
                          <Button
                            icon={null}
                            kind="secondary"
                            disabled={busy}
                            onPress={() =>
                              void mutate((d) => {
                                d.highlights[key] = "olive";
                              })
                            }
                          >
                            Oliv markieren
                          </Button>
                          <Button
                            icon={null}
                            kind="secondary"
                            disabled={busy}
                            onPress={() =>
                              void mutate((d) => {
                                d.highlights[key] = "gold";
                              })
                            }
                          >
                            Gold markieren
                          </Button>
                          {color && (
                            <Button
                              icon="close"
                              kind="ghost"
                              disabled={busy}
                              onPress={() =>
                                void mutate((d) => {
                                  delete d.highlights[key];
                                })
                              }
                            >
                              Markierung entfernen
                            </Button>
                          )}
                        </View>
                        <Button
                          kind="secondary"
                          icon="leaf"
                          onPress={() =>
                            router.push({
                              pathname: "/vorhaben",
                              params: {
                                start: "1",
                                book: ref.book,
                                chapter: ref.chapter,
                                from: v.n,
                                to: v.n,
                              },
                            })
                          }
                        >
                          Mit einem Vorhaben verbinden
                        </Button>
                        <Field
                          label={`Notiz zu Vers ${v.n}`}
                          value={note}
                          onChangeText={setNote}
                          multiline
                          maxLength={10000}
                          placeholder="Was möchtest du festhalten?"
                        />
                        <Button
                          icon="check"
                          disabled={!note.trim() || busy}
                          onPress={() => void saveNote()}
                        >
                          Notiz speichern
                        </Button>
                        {saved && (
                          <T accessibilityRole="alert" style={{ fontSize: 11 }}>
                            Deine Notiz wurde auf diesem Gerät gespeichert.
                          </T>
                        )}
                      </Card>
                    )}
                  </View>
                );
              })}
            </View>
            <View
              style={{ height: 1, backgroundColor: t.line, marginTop: 20 }}
            />
            <View style={{ alignItems: "center", gap: 15 }}>
              <T
                style={{
                  fontFamily: "Cormorant",
                  fontSize: 27,
                  textAlign: "center",
                }}
              >
                {done
                  ? "Ein guter Moment zum Innehalten."
                  : passage
                    ? "Ein kleiner Abschnitt. Ein neuer Gedanke."
                    : "Du bist am Ende dieses Kapitels."}
              </T>
              <Button
                disabled={done || busy}
                icon={done ? "check" : "leaf"}
                onPress={() => void complete()}
              >
                {done
                  ? "Als gelesen festgehalten"
                  : passage
                    ? "Abschnitt als gelesen bestätigen"
                    : "Kapitel als gelesen bestätigen"}
              </Button>
              {done && path ? (
                <Button
                  kind="secondary"
                  onPress={() =>
                    router.dismissTo({
                      pathname: "/weg/[id]",
                      params: { id: path.id },
                    })
                  }
                >
                  Weiter zum Verstehen
                </Button>
              ) : passage ? (
                <Button
                  kind="ghost"
                  onPress={() =>
                    router.replace({
                      pathname: "/lesen/[book]",
                      params: { book: ref.book, chapter: ref.chapter, mode },
                    })
                  }
                >
                  Das ganze Kapitel lesen
                </Button>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    kind="secondary"
                    icon="back"
                    disabled={!adjacentChapter(ref.book, ref.chapter, -1)}
                    onPress={() => navigate(-1)}
                  >
                    Vorheriges Kapitel
                  </Button>
                  <Button
                    kind="secondary"
                    disabled={!adjacentChapter(ref.book, ref.chapter, 1)}
                    onPress={() => navigate(1)}
                  >
                    Nächstes Kapitel
                  </Button>
                </View>
              )}
              <T style={{ fontSize: 10, color: t.muted, textAlign: "center" }}>
                Lesefortschritt ist eine Erinnerung – keine Bewertung deines
                Glaubens.
              </T>
            </View>
            {done && !passage && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  paddingVertical: 10,
                }}
              >
                <SwordArt
                  book={ref.book}
                  size={70}
                  progress={
                    countBookRead(data, ref.book) / (book?.chapters ?? 1)
                  }
                />
                <View style={{ maxWidth: 230 }}>
                  <T variant="heading" style={{ fontSize: 24 }}>
                    {book?.sword}
                  </T>
                  <T style={{ fontSize: 11, color: t.muted }}>
                    {countBookRead(data, ref.book)} von {book?.chapters}{" "}
                    Kapiteln gelesen. Die Lichtlinie erinnert daran.
                  </T>
                </View>
              </View>
            )}
            {mode === "deep" && context && (
              <Card style={{ gap: 14 }}>
                <T variant="heading">Ein Gedanke für dich</T>
                <T style={{ fontSize: 13 }}>{context.question}</T>
                <T style={{ fontSize: 11, color: t.muted }}>
                  Du musst jetzt keine Antwort haben.
                </T>
              </Card>
            )}
            {!path && related.length > 0 && (
              <Card style={{ gap: 13 }}>
                <T variant="heading">Gemeinsam weiterdenken</T>
                <T style={{ fontSize: 12, color: t.muted }}>
                  Dieser Abschnitt begegnet dir auch im geführten Weg „
                  {related[0]?.title}“.
                </T>
                <Button
                  kind="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/weg/[id]",
                      params: { id: related[0]!.id },
                    })
                  }
                >
                  Passenden Weg ansehen
                </Button>
              </Card>
            )}
            <T
              style={{
                fontSize: 9,
                color: t.muted,
                textAlign: "center",
                lineHeight: 17,
              }}
            >
              Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org
              {mode === "deep"
                ? "\nEinordnungen: OLIVA-Entwürfe; theologische Freigabe vor Veröffentlichung offen."
                : ""}
            </T>
          </>
        )}
      </View>
    </Shell>
  );
}
