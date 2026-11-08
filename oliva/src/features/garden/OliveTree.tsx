import { useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, Image, PixelRatio, View } from "react-native";
import { Button, T } from "../../components/ui";
import { useNativeVisibility } from "../../components/viewport";
import { useTheme } from "../../design-system/theme";
import { a51Stage, treeLayout } from "./a51/stages";
import { NATIVE_GROUPS, nativeSource } from "./a51/native-assets";
import { windPose } from "./a51/engine/motion-model";
import { useTreeMotion } from "./a51/useTreeMotion";
import type { OliveTreeProps } from "./a51/types";

type NativeGroup = (typeof NATIVE_GROUPS)[number];
type LayerSession = {
  active: boolean;
  generation: number;
  files: string[];
  failed: boolean;
};
function layersLoaded(session: LayerSession, group: NativeGroup) {
  return (
    session.active &&
    !session.failed &&
    group.layers.length > 0 &&
    group.layers.every((p) => session.files.includes(p.file))
  );
}

/** PNG anatomy cutouts, animated by the native compositor; no JS frame loop. */
export function OliveTree({
  stage: value,
  size = 280,
  animate = true,
}: OliveTreeProps) {
  const stage = a51Stage(value),
    layout = treeLayout(stage, size);
  const { moving } = useTreeMotion(animate),
    view = useRef<React.ComponentRef<typeof View>>(null);
  const { visible, check } = useNativeVisibility(view, moving);
  const resolution = layout.artWidth * PixelRatio.get() <= 640 ? 640 : 1024;
  const group = NATIVE_GROUPS.find(
    (g) => g.stage === stage.index && g.resolution === resolution,
  )!;
  const [attempt, setAttempt] = useState(0);
  return (
    <View
      style={{
        alignSelf: "center",
        alignItems: "center",
        maxWidth: "100%",
        gap: 8,
      }}
    >
      <NativeTreeArtwork
        key={`${stage.index}:${resolution}:${attempt}`}
        group={group}
        layout={layout}
        eligible={moving && visible && stage.index > 0}
        retry={() => setAttempt((n) => n + 1)}
        viewRef={view}
        onLayout={check}
      />
    </View>
  );
}

/** A keyed instance owns one stage/resolution/retry. Old image callbacks cannot
 * mark a newer attempt ready; animation layers have their own load generation. */
function NativeTreeArtwork({
  group,
  layout,
  eligible,
  retry,
  viewRef,
  onLayout,
}: {
  group: NativeGroup;
  layout: ReturnType<typeof treeLayout>;
  eligible: boolean;
  retry: () => void;
  viewRef: React.RefObject<React.ComponentRef<typeof View> | null>;
  onLayout: () => void;
}) {
  const t = useTheme(),
    alive = useRef(true);
  const candidates = [
    group,
    NATIVE_GROUPS.find(
      (g) => g.stage === group.stage && g.resolution !== group.resolution,
    )!,
  ];
  const [full, setFull] = useState({ candidate: 0, loaded: false });
  const [session, setSession] = useState<LayerSession>({
    active: false,
    generation: 0,
    files: [],
    failed: false,
  });
  const offsets = useRef(
    Array.from({ length: 6 }, () => new Animated.ValueXY()),
  ).current;
  const fullFailed = full.candidate >= candidates.length,
    ready = layersLoaded(session, group);
  // Keep already loaded image parts only if they are the sole complete fallback.
  // A reduced-motion or offscreen visit never initiates loading these parts.
  const mountLayers = session.active && (eligible || (fullFailed && ready));
  const showLayers = mountLayers && ready,
    playing = showLayers && eligible;
  const current = useRef({
    candidate: full.candidate,
    generation: session.generation,
    active: mountLayers,
  });
  current.current = {
    candidate: full.candidate,
    generation: session.generation,
    active: mountLayers,
  };
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    setSession((previous) => {
      if (eligible && !previous.active)
        return {
          active: true,
          generation: previous.generation + 1,
          files: [],
          failed: false,
        };
      if (
        !eligible &&
        previous.active &&
        !(fullFailed && layersLoaded(previous, group))
      )
        return {
          active: false,
          generation: previous.generation + 1,
          files: [],
          failed: false,
        };
      return previous;
    });
  }, [eligible, fullFailed, group]);
  useLayoutEffect(() => {
    let cancelled = false,
      animation: Animated.CompositeAnimation | null = null,
      elapsed = 0;
    offsets.forEach((p) => p.setValue({ x: 0, y: 0 }));
    if (!playing) return;
    const gain = Math.min(1, layout.width / 200);
    function run() {
      if (cancelled) return;
      animation = Animated.parallel(
        offsets.map((position, i) =>
          Animated.sequence(
            Array.from({ length: 24 }, (_, step) => {
              const pose = windPose(elapsed + (step + 1) * 1500, group.stage);
              return Animated.timing(position, {
                toValue: { x: pose.x[i]! * gain, y: pose.y[i]! * gain },
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              });
            }),
          ),
        ),
      );
      elapsed += 36000;
      animation.start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    }
    run();
    return () => {
      cancelled = true;
      animation?.stop();
      offsets.forEach((p) => p.stopAnimation());
    };
  }, [playing, group.stage, layout.width, offsets]);
  const frame = (part: NativeGroup["full"], resolution: number) => ({
    position: "absolute" as const,
    left: (part.x / resolution) * layout.artWidth,
    top: (part.y / resolution) * layout.artWidth,
    width: (part.width / resolution) * layout.artWidth,
    height: (part.height / resolution) * layout.artWidth,
  });
  const fullGroup = candidates[full.candidate],
    generation = session.generation;
  const acceptsLayer = () =>
    alive.current &&
    current.current.active &&
    current.current.generation === generation;
  return (
    <>
      <View
        ref={viewRef}
        onLayout={onLayout}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Olivenbaum: ${a51Stage(group.stage).name}. Bild deiner Lerngeschichte, keine Glaubensbewertung.`}
        style={{
          width: layout.width,
          height: Math.max(120, layout.height),
          justifyContent: "flex-end",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: Math.min(layout.width * 0.86, Math.max(120, layout.height)),
            height: Math.min(layout.width * 0.86, Math.max(120, layout.height)),
            borderRadius: layout.width,
            backgroundColor: t.goldSoft,
            opacity: 0.4,
            bottom: 2,
            alignSelf: "center",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            height: layout.height,
            width: layout.width,
            overflow: "visible",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: layout.left,
              bottom: layout.bottom,
              width: layout.artWidth,
              height: layout.artWidth,
            }}
          >
            {fullGroup && (
              <Image
                key={fullGroup.resolution}
                accessible={false}
                source={nativeSource(fullGroup.full.file)}
                fadeDuration={0}
                resizeMode="stretch"
                style={[
                  frame(fullGroup.full, fullGroup.resolution),
                  { opacity: showLayers ? 0 : 1 },
                ]}
                onLoad={() => {
                  if (
                    alive.current &&
                    current.current.candidate === full.candidate
                  )
                    setFull((previous) =>
                      previous.candidate === full.candidate
                        ? { ...previous, loaded: true }
                        : previous,
                    );
                }}
                onError={() => {
                  if (
                    alive.current &&
                    current.current.candidate === full.candidate
                  )
                    setFull((previous) =>
                      previous.candidate === full.candidate
                        ? { candidate: full.candidate + 1, loaded: false }
                        : previous,
                    );
                }}
              />
            )}
            {mountLayers && (
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: showLayers ? 1 : 0,
                }}
              >
                {group.layers.map((part, i) => (
                  <Animated.Image
                    key={`${generation}:${part.file}`}
                    accessible={false}
                    source={nativeSource(part.file)}
                    fadeDuration={0}
                    resizeMode="stretch"
                    style={[
                      frame(part, group.resolution),
                      i > 0
                        ? { transform: offsets[i - 1]!.getTranslateTransform() }
                        : null,
                    ]}
                    onError={() => {
                      if (acceptsLayer())
                        setSession((previous) =>
                          previous.generation === generation
                            ? { ...previous, failed: true }
                            : previous,
                        );
                    }}
                    onLoad={() => {
                      if (acceptsLayer())
                        setSession((previous) =>
                          previous.generation === generation
                            ? {
                                ...previous,
                                files: previous.files.includes(part.file)
                                  ? previous.files
                                  : [...previous.files, part.file],
                              }
                            : previous,
                        );
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      {(session.failed || (fullFailed && !ready && !mountLayers)) && (
        <View style={{ maxWidth: layout.width, gap: 4 }}>
          <T accessibilityRole="alert" style={{ fontSize: 12, color: t.muted }}>
            {fullFailed && !ready
              ? "Das Baumbild konnte nicht geladen werden."
              : full.loaded
                ? "Die bewegte Ansicht ist gerade nicht verfügbar. Das ruhende Baumbild bleibt erhalten."
                : "Die bewegte Ansicht ist gerade nicht verfügbar."}
          </T>
          <Button kind="ghost" onPress={retry}>
            Baumbild erneut laden
          </Button>
        </View>
      )}
    </>
  );
}
