import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { Button, Card, Progress, T, Tag } from "../../src/components/ui";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { referenceLabel } from "../../src/features/bible/repository";
import { ntChapter, type NtChapter } from "../../src/features/quiz/catalog";
import { NT_BOOKS } from "../../src/features/quiz/index";
import {
  answerKey,
  chapterSetHash,
  chapterStudyProgress,
  completionStamp,
} from "../../src/features/quiz/model";
import { StudyQuestion } from "../../src/features/quiz/components/StudyQuestion";

export default function UnderstandChapter() {
  const params = useLocalSearchParams<{ book: string; chapter?: string }>();
  const book = typeof params.book === "string" ? params.book : "";
  const chapterNumber =
    params.chapter === undefined
      ? 1
      : typeof params.chapter === "string"
        ? Number(params.chapter)
        : NaN;
  const chapter = useMemo(
    () => ntChapter(book, chapterNumber),
    [book, chapterNumber],
  );
  if (!chapter)
    return (
      <Shell>
        <Card style={{ gap: 16 }}>
          <Tag icon="book">Fragen zum Neuen Testament</Tag>
          <T variant="heading" accessibilityRole="header">
            Dieses NT-Kapitel ist nicht vorhanden.
          </T>
          <T>Wähle ein Buch und ein Kapitel aus der Übersicht.</T>
          <Button onPress={() => router.replace("/verstehen")}>
            Zur Fragenübersicht
          </Button>
        </Card>
      </Shell>
    );
  return <ChapterStudy key={chapter.key} chapter={chapter} />;
}

function ChapterStudy({ chapter }: { chapter: NtChapter }) {
  const t = useTheme(),
    study = useApp((s) => s.data.ntStudy),
    busy = useApp((s) => s.busy);
  const [index, setIndex] = useState(() => {
    const position = useApp.getState().data.ntStudy.position;
    if (position?.book === chapter.book && position.chapter === chapter.chapter)
      return position.index;
    const first = chapter.questions.findIndex(
      (question) =>
        !useApp.getState().data.ntStudy.answers[answerKey(question)],
    );
    return first < 0 ? 0 : first;
  });
  const [error, setError] = useState<string | null>(null),
    [finished, setFinished] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null),
    heading = useRef<React.ComponentRef<typeof Text>>(null);
  const focused = useRef(false),
    generation = useRef(0),
    moved = useRef(false),
    mounted = useRef(true),
    indexRef = useRef(index),
    interactionRevision = useRef(0),
    moveInFlight = useRef(false),
    ownMove = useRef<{
      from: number;
      to: number;
      interactionRevision: number;
    } | null>(null);
  indexRef.current = index;
  const reconcileOwnMove = useCallback(() => {
    const own = ownMove.current;
    if (!mounted.current || !focused.current || !own) return;
    const position = useApp.getState().data.ntStudy.position;
    ownMove.current = null;
    if (
      indexRef.current !== own.from ||
      interactionRevision.current !== own.interactionRevision ||
      position?.book !== chapter.book ||
      position.chapter !== chapter.chapter ||
      position.index !== own.to
    )
      return;
    moved.current = true;
    indexRef.current = own.to;
    setIndex(own.to);
    setFinished(false);
    setError(null);
  }, [chapter.book, chapter.chapter]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ownMove.current = null;
    };
  }, []);
  const progress = useMemo(
    () => chapterStudyProgress(study, chapter),
    [study, chapter],
  );
  const question = chapter.questions[index]!,
    saved = study.answers[answerKey(question)] ?? null;
  const title = referenceLabel(chapter),
    setHash = useMemo(() => chapterSetHash(chapter), [chapter]);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      generation.current++;
      reconcileOwnMove();
      return () => {
        focused.current = false;
        generation.current++;
      };
    }, [reconcileOwnMove]),
  );
  useEffect(() => {
    if (!moved.current || !focused.current) return;
    moved.current = false;
    const turn = generation.current;
    const frame = requestAnimationFrame(() => {
      if (!focused.current || generation.current !== turn) return;
      scroll.current?.scrollTo({ y: 0, animated: false });
      if (Platform.OS === "web" && heading.current instanceof HTMLElement)
        heading.current.focus({ preventScroll: true });
      else
        AccessibilityInfo.announceForAccessibility(
          `Frage ${index + 1} von 5. ${question.prompt}`,
        );
    });
    return () => cancelAnimationFrame(frame);
  }, [index, question.prompt]);
  async function move(next: number) {
    if (
      !focused.current ||
      busy ||
      moveInFlight.current ||
      next < 0 ||
      next > 4
    )
      return;
    const turn = generation.current;
    const from = indexRef.current,
      revision = interactionRevision.current;
    moveInFlight.current = true;
    ownMove.current = null;
    const ok = await useApp.getState().rememberNtStudyPosition({
      book: chapter.book,
      chapter: chapter.chapter,
      index: next,
    });
    moveInFlight.current = false;
    if (!mounted.current) return;
    if (ok) {
      ownMove.current = { from, to: next, interactionRevision: revision };
      reconcileOwnMove();
    } else if (focused.current && generation.current === turn)
      setError(
        useApp.getState().error ??
          "Der Fragenstand konnte nicht sicher gespeichert werden. Bitte versuche es erneut.",
      );
  }
  async function finish() {
    if (!focused.current || busy) return;
    const turn = generation.current;
    const ok = await useApp
      .getState()
      .completeNtStudy(
        chapter.book,
        chapter.chapter,
        setHash,
        completionStamp(progress.completion),
      );
    if (!focused.current || generation.current !== turn) return;
    if (ok) {
      setFinished(true);
      setError(null);
    } else
      setError(
        useApp.getState().error ??
          "Der Abschluss konnte noch nicht gespeichert werden.",
      );
  }
  const nextBook = NT_BOOKS.find((book) => book.code === chapter.book);
  const nextChapter =
    nextBook && chapter.chapter < nextBook.chapters
      ? chapter.chapter + 1
      : null;
  return (
    <Shell scrollRef={scroll}>
      <View style={{ maxWidth: 720, gap: 24 }}>
        <View style={{ alignItems: "flex-start", gap: 14 }}>
          <Button
            kind="ghost"
            icon="back"
            onPress={() => router.replace("/verstehen")}
          >
            Zur Fragenübersicht
          </Button>
          <Tag icon="book">{title} · Fünf Fragen zum Text</Tag>
        </View>
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <T variant="label" style={{ color: t.muted }}>
              FRAGE {index + 1} VON 5
            </T>
            <T variant="small" style={{ color: t.muted }}>
              {progress.answered} von 5 angesehen
            </T>
          </View>
          <Progress
            value={progress.answered / 5}
            label={`${progress.answered} von 5 Fragen angesehen`}
          />
        </View>
        <T
          ref={heading}
          tabIndex={-1}
          variant="title"
          accessibilityRole="header"
          testID="nt-question-heading"
          style={{ fontSize: 34, lineHeight: 40 }}
        >
          {question.prompt}
        </T>
        <StudyQuestion
          key={`${question.id}:${question.hash}`}
          question={question}
          saved={saved}
          onLocalEdit={() => {
            interactionRevision.current++;
            ownMove.current = null;
          }}
        />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <Button
            kind="secondary"
            icon="back"
            disabled={busy || index === 0}
            onPress={() => void move(index - 1)}
          >
            Vorige Frage
          </Button>
          {index < 4 && (
            <Button
              kind="secondary"
              disabled={busy}
              onPress={() => void move(index + 1)}
            >
              Nächste Frage
            </Button>
          )}
        </View>
        {index === 4 && (
          <View style={{ gap: 12 }}>
            <Button
              icon="check"
              disabled={busy || progress.answered < 5}
              onPress={() => void finish()}
            >
              Fragen abschließen
            </Button>
            {progress.answered < 5 && (
              <T variant="small" style={{ color: t.muted }}>
                Zum Abschließen sieh dir jede der fünf Fragen mit ihrer
                Erklärung an. Du kannst ausgelassene Fragen jederzeit nachholen.
              </T>
            )}
          </View>
        )}
        {error && (
          <T
            accessibilityRole="alert"
            style={{ backgroundColor: t.soft, padding: 16, borderRadius: 12 }}
          >
            {error}
          </T>
        )}
        {(finished || progress.completion) && (
          <Card style={{ gap: 13, backgroundColor: t.soft, borderWidth: 0 }}>
            <Tag icon="leaf">Ein Moment zum Innehalten</Tag>
            <T variant="heading" accessibilityLiveRegion="polite">
              Alle fünf Fragen angesehen.
            </T>
            <T style={{ fontSize: 13 }}>
              Vielleicht ist ein Gedanke bei dir geblieben. Dieser Abschluss
              erinnert an deinen Lernmoment. Richtige Antworten sind keine
              Voraussetzung.
            </T>
            {progress.completion && (
              <T variant="small" style={{ color: t.muted }}>
                Festgehalten am{" "}
                {new Date(progress.completion.completedAt).toLocaleString(
                  "de-DE",
                )}
              </T>
            )}
            {nextChapter && (
              <Button
                kind="secondary"
                onPress={() =>
                  router.replace({
                    pathname: "/verstehen/[book]",
                    params: { book: chapter.book, chapter: nextChapter },
                  })
                }
              >
                Fragen zu{" "}
                {referenceLabel({ book: chapter.book, chapter: nextChapter })}{" "}
                entdecken
              </Button>
            )}
          </Card>
        )}
        <View style={{ height: 1, backgroundColor: t.line }} />
        <View style={{ gap: 12 }}>
          <T variant="heading">Der Text bleibt dein Ausgangspunkt.</T>
          <Button
            kind="secondary"
            icon="book"
            onPress={() =>
              router.push({
                pathname: "/lesen/[book]",
                params: {
                  book: chapter.book,
                  chapter: chapter.chapter,
                  mode: "read",
                },
              })
            }
          >
            Das ganze Kapitel lesen
          </Button>
          <T variant="small" style={{ color: t.muted }}>
            Du kannst pausieren und später hier weitermachen. Antworten und
            Abschlüsse verändern weder deinen Lesefortschritt noch deinen
            Olivenbaum.
          </T>
        </View>
        {progress.legacyCompletions.length > 0 && (
          <Card style={{ gap: 13 }}>
            <T variant="heading">Aus deiner FaithPath-Geschichte</T>
            <T style={{ fontSize: 13 }}>
              Diese früheren Abschlüsse wurden mit ihrer Originalquelle
              übernommen. FaithPath hielt fest, dass die fünf Fragen angesehen
              wurden; einzelne Antworten wurden dort nicht gespeichert.
            </T>
            {progress.legacyCompletions.map((item) => (
              <View
                key={`${item.importId}:${item.sourceUnitId}`}
                style={{ gap: 5 }}
              >
                <T variant="small" style={{ color: t.muted }}>
                  {new Date(item.completedAt).toLocaleString("de-DE")}
                </T>
                <Button
                  kind="ghost"
                  icon="info"
                  onPress={() =>
                    router.push({
                      pathname: "/importarchiv/[id]",
                      params: { id: item.importId },
                    })
                  }
                >
                  Originalquelle ansehen
                </Button>
              </View>
            ))}
          </Card>
        )}
        <T variant="small" style={{ color: t.muted }}>
          Originalfragen und Erklärungen: FaithPath · Bibelstellen öffnen die
          gemeinfreie Lutherbibel 1912. Die Originalformulierungen bleiben
          erhalten.
        </T>
      </View>
    </Shell>
  );
}
