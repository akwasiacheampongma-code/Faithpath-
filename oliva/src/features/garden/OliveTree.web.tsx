import { useEffect, useRef, useState } from "react";
import { View, Image } from "react-native";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { useTreeMotion } from "./a51/useTreeMotion";
import { a51Stage, treeLayout, stageVariant } from "./a51/stages";
import { sourceFor, uriFor } from "./a51/assets";
import { createTreeScene, type TreeScene } from "./a51/engine/tree-scene";
import type { OliveTreeProps } from "./a51/types";
import "./a51/tree.css";
type SceneHost = HTMLDivElement & { olivaTree?: () => TreeScene["metrics"] };
export function OliveTree({ stage: value, size = 280, animate = true }: OliveTreeProps) {
  const stage = a51Stage(value), layout = treeLayout(stage, size), t = useTheme();
  const { moving, focused } = useTreeMotion(animate), host = useRef<SceneHost>(null), scene = useRef<TreeScene | null>(null);
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false);
  const requested = useRef(stage.index); requested.current = stage.index;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let alive = true;
    const instance = createTreeScene(element, {
      stage: stage.index, autoplay: false, resolveSource: uriFor,
      onStage: index => { if (alive) { setLoaded(true); setFailed(index !== requested.current); } },
      onStatus: text => { if (alive && text.includes("nicht geladen")) setFailed(true); },
    });
    scene.current = instance;
    element.olivaTree = () => instance.metrics;
    return () => { alive = false; delete element.olivaTree; instance.dispose(); scene.current = null; };
  }, []);
  useEffect(() => { void scene.current?.setStage(stage.index); }, [stage.index]);
  useEffect(() => { scene.current?.setEnabled(focused); }, [focused]);
  useEffect(() => { scene.current?.setReducedMotion(!moving); if (moving) scene.current?.play(); else scene.current?.pause(); }, [moving]);
  return <View style={{ alignSelf: "center", alignItems: "center", maxWidth: "100%", gap: 8 }}>
    <View style={{ width: layout.width, height: Math.max(120, layout.height), justifyContent: "flex-end" }}>
      <View pointerEvents="none" style={{ position: "absolute", width: Math.min(layout.width * .86, Math.max(120,layout.height)), height: Math.min(layout.width * .86, Math.max(120,layout.height)), borderRadius: layout.width, backgroundColor: t.goldSoft, opacity: .4, bottom: 2, alignSelf: "center" }} />
      <View style={{ width: layout.width, height: layout.height }}>
        {!loaded && <Image accessible={false} source={sourceFor(stageVariant(stage, size, 1.5))} resizeMode="contain" style={{ position: "absolute", width: layout.artWidth, height: layout.artWidth, left: layout.left, bottom: layout.bottom }} />}
        <div ref={host} className="oliva-a51" data-testid="olive-tree" data-a51-stage={stage.index} style={{ position: "absolute", inset: 0, width: "100%" }} />
      </View>
    </View>
    {failed && <View style={{ gap: 4, maxWidth: layout.width }}>
      <T accessibilityRole="alert" style={{ fontSize: 12, color: t.muted }}>Dieses Stadium konnte nicht geladen werden. Ein bereits geladenes Baumbild bleibt erhalten.</T>
      <Button kind="ghost" onPress={() => { setFailed(false); void (async () => { await scene.current?.retry(); await scene.current?.setStage(requested.current); })(); }}>Baumbild erneut laden</Button>
    </View>}
  </View>;
}
