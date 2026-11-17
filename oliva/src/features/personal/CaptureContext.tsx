import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { T, Tag, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { CaptureSource } from "./capture-schema-current";
import { captureBibleContextLabel } from "./capture-presentation";
import { referenceLabel } from "../bible/repository";
export function CaptureContext({ source }: { source: CaptureSource }) {
  const t = useTheme(),
    [open, setOpen] = useState(false);
  if (source.type === "story") return (
    <View style={{ gap: 9 }}>
      <Tag icon="book">{source.title}</Tag>
      <T variant="small" style={{ color: t.muted }}>Original-Reflexionsimpuls: {source.question}</T>
      {source.references.map((ref, index) => <T key={index} variant="small" style={{ color: t.muted }}>{referenceLabel(ref)}</T>)}
      <Button kind="ghost" icon="book" onPress={() => router.push({ pathname: "/geschichte/[id]", params: { id: source.unitId, stage: "gedanken" } })}>Zum zugehörigen Abschnitt</Button>
    </View>
  );
  if (source.type === "verse") return null;
  if (source.type === "passage") {
    const label = captureBibleContextLabel(source);
    return (
      <T
        variant="small"
        accessibilityLabel={label}
        style={{ color: t.muted }}
      >
        {label}
      </T>
    );
  }
  return (
    <View style={{ gap: 9 }}>
      <Tag icon="info">
        {source.type === "daily"
          ? `Tagesreflexion vom ${source.date}`
          : source.type === "experience"
            ? "Von dir festgehaltene Erfahrung"
            : "Frage beim Beginn deiner Reflexion"}
      </Tag>
      <T variant="small" style={{ color: t.muted }}>
        {source.type === "guided" ? source.snapshot.question : source.question}
      </T>
      {source.type === "guided" && (
        <>
          <Button kind="ghost" icon="info" onPress={() => setOpen(!open)}>
            {open
              ? "Damalige Einordnung schließen"
              : "Damals gezeigte Einordnung ansehen"}
          </Button>
          {open && (
            <View
              style={{
                gap: 8,
                padding: 15,
                borderRadius: 12,
                backgroundColor: t.soft,
              }}
            >
              <T variant="label" style={{ fontSize: 9 }}>
                BEWAHRTER ENTWURF · KEIN BIBELTEXT
              </T>
              <T style={{ fontWeight: "600", fontSize: 13 }}>
                {source.snapshot.title}
              </T>
              <T variant="small">{source.snapshot.explanation}</T>
            </View>
          )}
          <Button
            kind="ghost"
            icon="path"
            onPress={() =>
              router.push({
                pathname: "/weg/[id]",
                params: { id: source.pathId, step: source.step },
              })
            }
          >
            Zum zugehörigen Lernschritt
          </Button>
        </>
      )}
    </View>
  );
}
