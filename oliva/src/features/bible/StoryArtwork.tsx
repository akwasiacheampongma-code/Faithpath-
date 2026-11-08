import { useLayoutEffect, useRef, useState } from "react";
import {
  Image,
  PixelRatio,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { Icon } from "../../components/Icon";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { Scene } from "./scenes";

type ArtWidth = 640 | 1024 | 1280;

// Only delivery variants enter Metro's static asset graph. Prompts, original
// masters and review records remain outside the runtime bundle.
const sources: Record<Scene["id"], Record<ArtWidth, ImageSourcePropType>> = {
  noah: {
    640: require("../../../assets/images/noah-640.webp"),
    1024: require("../../../assets/images/noah-1024.webp"),
    1280: require("../../../assets/images/noah-1280.webp"),
  },
  abraham: {
    640: require("../../../assets/images/abraham-640.webp"),
    1024: require("../../../assets/images/abraham-1024.webp"),
    1280: require("../../../assets/images/abraham-1280.webp"),
  },
  nativity: {
    640: require("../../../assets/images/nativity-640.webp"),
    1024: require("../../../assets/images/nativity-1024.webp"),
    1280: require("../../../assets/images/nativity-1280.webp"),
  },
  "easter-dawn": {
    640: require("../../../assets/images/easter-dawn-640.webp"),
    1024: require("../../../assets/images/easter-dawn-1024.webp"),
    1280: require("../../../assets/images/easter-dawn-1280.webp"),
  },
  "david-before-goliath": {
    640: require("../../../assets/images/david-before-goliath-640.webp"),
    1024: require("../../../assets/images/david-before-goliath-1024.webp"),
    1280: require("../../../assets/images/david-before-goliath-1280.webp"),
  },
};

function preferredWidth(width: number, density: number): ArtWidth {
  const pixels = width * Math.max(1, density);
  return pixels <= 640 ? 640 : pixels <= 1024 ? 1024 : 1280;
}

function candidates(preferred: ArtWidth): readonly ArtWidth[] {
  switch (preferred) {
    case 640:
      return [640, 1024, 1280];
    case 1024:
      return [1024, 1280, 640];
    case 1280:
      return [1280, 1024, 640];
  }
}

export function StoryArtwork({
  scene,
  context = false,
}: {
  scene: Scene;
  context?: boolean;
}) {
  const t = useTheme();
  // Subscribe to display changes, but choose the source from the measured
  // artwork frame rather than the window or an initial guessed width.
  useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const preferred = preferredWidth(width, PixelRatio.get());
  const label =
    "Künstlerische Interpretation: " +
    (scene.imageDescription ?? scene.title) +
    " " +
    scene.interpretation;

  return (
    <View
      onLayout={({ nativeEvent }) => {
        const next = nativeEvent.layout.width;
        if (Number.isFinite(next) && next > 0) {
          setWidth((previous) => (previous === next ? previous : next));
        }
      }}
      style={{
        width: "100%",
        // Keep people and narrative context visible on wide cards as well as
        // phones. A fixed-height banner cropped the David pilot's head.
        aspectRatio: context ? 3 / 2 : 8 / 5,
        overflow: "hidden",
        backgroundColor: t.soft,
      }}
    >
      {width > 0 ? (
        <ArtworkInstance
          // Reuse the same decoded asset for resizes within its resolution;
          // a new scene, source preference or retry gets an isolated lifecycle.
          key={`${scene.id}:${preferred}:${attempt}`}
          scene={scene}
          preferred={preferred}
          label={label}
          retry={() => setAttempt((previous) => previous + 1)}
        />
      ) : (
        <View
          testID={`story-artwork-${scene.id}`}
          accessible
          accessibilityRole="image"
          accessibilityLabel={label}
          accessibilityState={{ busy: true }}
          aria-busy={true}
          style={styles.fill}
        >
          <ArtworkPlaceholder sceneId={scene.id} />
        </View>
      )}
    </View>
  );
}

/** Each keyed instance owns one candidate sequence. Incrementing the generation
 * before scheduling state prevents duplicate or late callbacks from an earlier
 * candidate from completing a newer request, including a queued decoder. */
function ArtworkInstance({
  scene,
  preferred,
  label,
  retry,
}: {
  scene: Scene;
  preferred: ArtWidth;
  label: string;
  retry: () => void;
}) {
  const t = useTheme();
  const alive = useRef(true);
  const candidateGeneration = useRef(0);
  const [image, setImage] = useState({ candidate: 0, loaded: false });
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const candidate = candidates(preferred)[image.candidate];
  const generation = image.candidate;
  const failed = candidate === undefined;
  const busy = !failed && !image.loaded;

  return (
    <View
      testID={`story-artwork-${scene.id}`}
      accessible={!failed}
      role={failed ? undefined : "img"}
      accessibilityLabel={failed ? undefined : label}
      accessibilityState={{ busy }}
      // RNW 0.21 does not map accessibilityState.busy to this DOM attribute.
      aria-busy={busy}
      style={styles.fill}
    >
      {failed ? (
        <View
          testID={`story-error-${scene.id}`}
          role="group"
          accessibilityLabel={`Illustration zu: ${scene.title}`}
          style={styles.centered}
        >
          <View accessible={false} aria-hidden={true}>
            <Icon name="info" color={t.muted} size={24} />
          </View>
          <T
            testID={`story-error-status-${scene.id}`}
            role="status"
            accessibilityLiveRegion="polite"
            style={{
              fontSize: 12,
              lineHeight: 18,
              textAlign: "center",
              color: t.muted,
            }}
          >
            Die Illustration konnte nicht geladen werden.
          </T>
          <Button
            kind="secondary"
            icon="download"
            testID={`story-retry-${scene.id}`}
            onPress={retry}
          >
            Bild erneut laden
          </Button>
        </View>
      ) : (
        <>
          {!image.loaded && <ArtworkPlaceholder sceneId={scene.id} />}
          <Image
            key={candidate}
            testID={`story-image-${scene.id}`}
            source={sources[scene.id][candidate]}
            resizeMode="cover"
            fadeDuration={0}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden={true}
            style={[styles.fill, { opacity: image.loaded ? 1 : 0 }]}
            // RN's onLoad follows image decoding; RNW's loader also waits for
            // decode(). onLoadEnd includes failures and must never reveal it.
            onLoad={() => {
              if (alive.current && candidateGeneration.current === generation) {
                candidateGeneration.current += 1;
                setImage((previous) =>
                  previous.candidate === generation
                    ? { ...previous, loaded: true }
                    : previous,
                );
              }
            }}
            onError={() => {
              if (alive.current && candidateGeneration.current === generation) {
                candidateGeneration.current += 1;
                setImage({ candidate: generation + 1, loaded: false });
              }
            }}
          />
        </>
      )}
    </View>
  );
}

function ArtworkPlaceholder({ sceneId }: { sceneId: Scene["id"] }) {
  const t = useTheme();
  return (
    <View
      testID={`story-placeholder-${sceneId}`}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden={true}
      style={[styles.centered, styles.fill]}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.surface,
        }}
      >
        <Icon name="leaf" size={27} color={t.primary} />
      </View>
      <T variant="small" style={{ color: t.muted, textAlign: "center" }}>
        Illustration wird geladen
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  centered: {
    flex: 1,
    padding: 16,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
