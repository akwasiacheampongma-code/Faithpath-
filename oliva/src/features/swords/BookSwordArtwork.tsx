import { useLayoutEffect, useRef, useState } from "react";
import { Image, PixelRatio, View } from "react-native";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { bookByCode } from "../bible/repository";
import { normalizeSwordProgress } from "./model";
import { swordSize } from "./layout";
import { VectorSwordDrawing } from "./VectorSwordDrawing";
import { SwordPulse } from "./SwordPulse";
import { BookLightTrack } from "./BookLightTrack";
import { swordIllustration, type IllustratedBook } from "./illustrations";
import { pilotSource, pilotVariants } from "./pilot-assets";

export function BookSwordArtwork({
  book,
  progress,
  size = 220,
  celebrate = false,
  compact = false,
}: {
  book: string;
  progress: number;
  size?: number;
  celebrate?: boolean;
  compact?: boolean;
}) {
  const width = swordSize(size, 220),
    value = normalizeSwordProgress(progress),
    identity = bookByCode(book),
    illustration = swordIllustration(book);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${book}:${width}:${PixelRatio.get()}:${attempt}`;
  const currentRequest = useRef(requestKey);
  currentRequest.current = requestKey;
  const [decoded, setDecoded] = useState({ key: "", ready: false });
  const illustrated = decoded.key === requestKey && decoded.ready;
  const label = `${identity?.sword ?? "Buchschwert"} · ${Math.round(value * 100)} Prozent gelesen`;
  return illustration ? (
    <View style={{ alignSelf: "center", width, maxWidth: "100%" }}>
      <IllustratedArtwork
        key={requestKey}
        book={illustration.book}
        compact={compact}
        width={width}
        progress={value}
        label={label}
        retry={() => setAttempt((n) => n + 1)}
        onDecoded={(ready) => {
          if (currentRequest.current === requestKey)
            setDecoded((previous) =>
              previous.key === requestKey && previous.ready === ready
                ? previous
                : { key: requestKey, ready },
            );
        }}
      />
      <SwordPulse
        active={celebrate}
        book={book}
        progress={value}
        illustrated={illustrated}
        frameSize={width}
      />
    </View>
  ) : (
    <View
      testID="book-sword-artwork"
      accessibilityRole="image"
      accessibilityLabel={label}
      accessibilityState={{ busy: false }}
      aria-busy={false}
      style={{ width, height: width * 1.5, alignSelf: "center" }}
    >
      <View
        testID="book-sword-vector"
        style={{ position: "absolute", inset: 0 }}
      >
        <VectorSwordDrawing book={book} progress={value} />
      </View>
      <SwordPulse
        active={celebrate}
        book={book}
        progress={value}
        frameSize={width}
      />
    </View>
  );
}

/** Keyed per book/size/density/retry. Late decoder callbacks can only affect
 * their original keyed instance; candidates also have an inner generation. */
function IllustratedArtwork({
  book,
  compact,
  width,
  progress,
  label,
  retry,
  onDecoded,
}: {
  book: IllustratedBook;
  compact: boolean;
  width: number;
  progress: number;
  label: string;
  retry: () => void;
  onDecoded: (ready: boolean) => void;
}) {
  const t = useTheme(),
    variants = pilotVariants(width, PixelRatio.get()),
    alive = useRef(true);
  const [image, setImage] = useState({ candidate: 0, loaded: false });
  const candidateGeneration = useRef(0);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const candidate = variants[image.candidate],
    generation = image.candidate,
    failed = !candidate;
  return (
    <View
      style={{
        alignSelf: "center",
        alignItems: "center",
        maxWidth: "100%",
        gap: 10,
      }}
    >
      <View
        testID="book-sword-artwork"
        accessibilityRole="image"
        accessibilityLabel={label}
        accessibilityState={{ busy: !image.loaded && !failed }}
        aria-busy={!image.loaded && !failed}
        style={{ width, height: width * 1.5 }}
      >
        {!image.loaded && (
          <View
            testID="book-sword-vector"
            style={{ position: "absolute", inset: 0 }}
          >
            <VectorSwordDrawing book={book} progress={progress} />
          </View>
        )}
        {candidate && (
          <Image
            key={candidate.width}
            testID="book-sword-image"
            accessible={false}
            aria-hidden={true}
            source={pilotSource(candidate.width, book)}
            resizeMode="contain"
            fadeDuration={0}
            style={{
              position: "absolute",
              inset: 0,
              width,
              height: width * 1.5,
              opacity: image.loaded ? 1 : 0,
            }}
            onLoad={() => {
              if (alive.current && candidateGeneration.current === generation) {
                candidateGeneration.current += 1;
                setImage((previous) =>
                  previous.candidate === generation
                    ? { ...previous, loaded: true }
                    : previous,
                );
                onDecoded(true);
              }
            }}
            onError={() => {
              if (alive.current && candidateGeneration.current === generation) {
                candidateGeneration.current += 1;
                setImage((previous) =>
                  previous.candidate === generation
                    ? { candidate: previous.candidate + 1, loaded: false }
                    : previous,
                );
                onDecoded(false);
              }
            }}
          />
        )}
        {image.loaded && <BookLightTrack book={book} progress={progress} />}
      </View>
      {failed && (
        <View style={{ maxWidth: width, gap: 4 }}>
          <T
            accessibilityRole="status"
            style={[
              { fontSize: 12, color: t.muted },
              compact && {
                fontSize: 11,
                lineHeight: 17,
                textAlign: "center",
              },
            ]}
          >
            {compact
              ? "Bild nicht verfügbar."
              : "Die Bildansicht ist gerade nicht verfügbar. Dein Buchsymbol bleibt sichtbar."}
          </T>
          <Button
            kind="ghost"
            onPress={retry}
            icon={compact ? null : "arrow"}
            style={
              compact
                ? { paddingHorizontal: 4, paddingVertical: 7, minHeight: 44 }
                : undefined
            }
          >
            {compact ? "Erneut laden" : "Bild erneut laden"}
          </Button>
        </View>
      )}
    </View>
  );
}
