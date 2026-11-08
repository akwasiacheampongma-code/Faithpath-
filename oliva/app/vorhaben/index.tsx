import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Shell } from "../../src/components/Shell";
import { T, Tag, Button, Card, Field } from "../../src/components/ui";
import { Icon } from "../../src/components/Icon";
import { useTheme } from "../../src/design-system/theme";
import { useApp } from "../../src/state/store";
import { newId, type DraftOf } from "../../src/features/personal/schema";
import { GoalEditor } from "../../src/features/personal/Editors";
import {
  validReference,
  referenceLabel,
} from "../../src/features/bible/repository";

export default function Goals() {
  const t = useTheme(),
    data = useApp((s) => s.data),
    busy = useApp((s) => s.busy),
    params = useLocalSearchParams<{
      start?: string;
      book?: string;
      chapter?: string;
      from?: string;
      to?: string;
    }>();
  const [archived, setArchived] = useState(false),
    [query, setQuery] = useState(""),
    [show, setShow] = useState(false);
  const pending = data.drafts.find((d) => d.key === "goal:new"),
    draft = pending?.type === "goal" ? pending : undefined;
  async function begin() {
    if (draft) {
      setShow(true);
      return;
    }
    const ref = {
      book: params.book ?? "",
      chapter: Number(params.chapter),
      ...(params.from ? { from: Number(params.from) } : {}),
      ...(params.to ? { to: Number(params.to) } : {}),
    };
    const seed: DraftOf<"goal"> = {
      id: newId("draft"),
      key: "goal:new",
      type: "goal",
      revision: 0,
      updatedAt: new Date().toISOString(),
      values: {
        entityId: newId("goal"),
        targetId: null,
        baseRevision: null,
        title: "",
        why: "",
        initialStep: "",
        ...(validReference(ref) ? { ref } : {}),
      },
    };
    if (await useApp.getState().saveEditorDraft(seed, null)) setShow(true);
  }
  useEffect(() => {
    if (params.start === "1") void begin();
  }, [params.start, params.book, params.chapter, params.from, params.to]);
  const goals = data.goals.filter(
    (g) =>
      !!g.archivedAt === archived &&
      `${g.title} ${g.why}`
        .toLocaleLowerCase("de")
        .includes(query.toLocaleLowerCase("de")),
  );
  return (
    <Shell>
      <View
        style={{ gap: 22, maxWidth: 820, width: "100%", alignSelf: "center" }}
      >
        <Tag icon="leaf">Dein Glaube im Alltag</Tag>
        <T variant="title" accessibilityRole="header" style={{ fontSize: 42 }}>
          Ein kleiner Versuch ist genug.
        </T>
        <T style={{ color: t.muted, fontSize: 13 }}>
          Ein persönliches Vorhaben begleitet etwas, das dir im Alltag wichtig
          ist. Du wählst deine Schritte selbst und kannst später festhalten, was
          du erlebt hast. Es gibt keine Fristen oder Bewertung.
        </T>
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          <Button
            icon="pen"
            disabled={busy}
            onPress={() => (show ? setShow(false) : void begin())}
          >
            {show
              ? "Editor schließen"
              : draft
                ? "Vorhaben-Entwurf fortsetzen"
                : "Ein Vorhaben anlegen"}
          </Button>
          <Button
            kind="ghost"
            icon="path"
            onPress={() => router.replace("/wege")}
          >
            Zu den geführten Wegen
          </Button>
        </View>
        {!show && draft && (
          <Card style={{ gap: 8 }}>
            <T>Ein Vorhaben-Entwurf wartet auf dich.</T>
            <T style={{ fontSize: 11, color: t.muted }}>
              Deine bisherigen Worte bleiben auf diesem Gerät.
            </T>
          </Card>
        )}
        {show && draft && (
          <GoalEditor
            key={draft.id}
            draft={draft}
            onDone={(id) => {
              setShow(false);
              if (id)
                router.push({ pathname: "/vorhaben/[id]", params: { id } });
            }}
          />
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            [false, "Aktive Vorhaben"],
            [true, "Archiv"],
          ].map(([value, label]) => (
            <Pressable
              key={String(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: archived === value }}
              aria-pressed={archived === value}
              onPress={() => setArchived(Boolean(value))}
              style={{
                padding: 13,
                minHeight: 44,
                borderBottomWidth: 2,
                borderColor: archived === value ? t.gold : "transparent",
              }}
            >
              <T style={{ fontSize: 12, color: t.text }}>{label as string}</T>
            </Pressable>
          ))}
        </View>
        <Field
          label="Deine Vorhaben durchsuchen"
          placeholder="Titel oder Anliegen …"
          value={query}
          onChangeText={setQuery}
        />
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            accessibilityRole="button"
            accessibilityLabel={`Vorhaben öffnen: ${goal.title}`}
            onPress={() =>
              router.push({
                pathname: "/vorhaben/[id]",
                params: { id: goal.id },
              })
            }
          >
            <Card style={{ gap: 11 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Icon name="leaf" color={t.gold} />
                <T variant="heading" style={{ flex: 1 }}>
                  {goal.title}
                </T>
                <Icon name="chevron" color={t.muted} size={17} />
              </View>
              {goal.why && (
                <T style={{ fontSize: 12, color: t.muted }}>{goal.why}</T>
              )}
              <T style={{ fontSize: 11, color: t.muted }}>
                {goal.steps.filter((s) => s.done).length} von{" "}
                {goal.steps.length} eigenen Schritten ausprobiert ·{" "}
                {goal.reviews.length} Rückblicke
                {goal.archivedAt ? " · archiviert" : ""}
              </T>
              {goal.ref && <Tag icon="book">{referenceLabel(goal.ref)}</Tag>}
            </Card>
          </Pressable>
        ))}
        {!goals.length && (
          <Card style={{ gap: 10, alignItems: "center", padding: 30 }}>
            <Icon name="leaf" size={25} color={t.gold} />
            <T style={{ textAlign: "center", fontSize: 13 }}>
              {query
                ? "Kein passendes Vorhaben gefunden."
                : archived
                  ? "Dein Archiv ist noch leer. Archivierte Vorhaben bleiben mit allen Schritten und Rückblicken erhalten."
                  : "Hier darf dein erstes Vorhaben entstehen. Du brauchst nur einen kurzen Namen; alles Weitere ist freiwillig."}
            </T>
          </Card>
        )}
      </View>
    </Shell>
  );
}
