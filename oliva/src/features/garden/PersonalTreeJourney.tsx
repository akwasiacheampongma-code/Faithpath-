import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import { personalTreeLinks, type personalTreeHistory, type TreeMoment } from "./personal-history";

type Model = ReturnType<typeof personalTreeHistory>;
type Links = ReturnType<typeof personalTreeLinks>;
const openGoal = (id: string) => router.push({ pathname: "/vorhaben/[id]", params: { id } });
export function PersonalTreePins({ links }: { links: Links }) {
  const t = useTheme();
  return <View pointerEvents="box-none" style={{ position: "absolute", inset: 0 }}>
    {links.map(({ branch, slot, number }) => <Pressable key={branch.goalId}
      testID={`tree-goal-link-${branch.goalId}`} accessibilityRole="button"
      accessibilityLabel={`${branch.title}${branch.archived ? ", ruhendes Vorhaben" : ""}: zugehöriges Vorhaben öffnen`}
      onPress={() => openGoal(branch.goalId)}
      style={({ pressed }) => ({ position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, width: 44, height: 44,
        marginLeft: -22, marginTop: -22, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
      <View style={{ width: 29, height: 29, borderRadius: 16, borderWidth: 1.5, borderColor: t.gold,
        backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
        <T style={{ fontSize: 12, color: t.text }}>{number}</T>
      </View>
    </Pressable>)}
  </View>;
}

export function PersonalTreeJourney({ model, links }: { model: Model; links: Links }) {
  const t = useTheme(), [branchLimit, setBranchLimit] = useState(6), [momentLimit, setMomentLimit] = useState(10),
    [unplacedLimit, setUnplacedLimit] = useState(6);
  return <View style={{ marginTop: 24, gap: 12 }} testID="personal-tree-journey">
    <T variant="heading" accessibilityRole="header" style={{ fontSize: 27, lineHeight: 33 }}>Deine Geschichte im Baum</T>
    {model.branches.length > 0 && <View style={{ gap: 12 }}>
      {model.branches.slice(0, branchLimit).map((branch) => {
        const pin = links.find((link) => link.branch.goalId === branch.goalId);
        return <Pressable key={branch.goalId} accessibilityRole="button"
          accessibilityLabel={`${branch.title}${branch.archived ? ", ruhendes Vorhaben" : ""}: zugehöriges Vorhaben öffnen`}
          onPress={() => openGoal(branch.goalId)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <View style={{ paddingVertical: 12, gap: 5, borderBottomWidth: 1, borderColor: t.line }}>
            <T variant="small" style={{ color: t.gold }}>{pin ? `Zweig ${pin.number} · ` : ""}{branch.archived ? "Ruhendes Vorhaben" : "Persönliches Vorhaben"}{branch.imported ? " · aus FaithPath" : ""}</T>
            <T variant="heading" style={{ fontSize: 26, lineHeight: 31 }}>{branch.title}</T>
            <T variant="small" numberOfLines={2} style={{ color: t.muted }}>{branch.moments[0]?.text}</T>
            <T variant="small" style={{ color: t.primary }}>Zum Vorhaben →</T>
          </View>
        </Pressable>;
      })}
      {branchLimit < model.branches.length && <Button kind="ghost" onPress={() => setBranchLimit((n) => n + 6)}>Weitere Vorhaben anzeigen</Button>}
    </View>}
    {model.unplaced.length > 0 && <Card style={{ gap: 12 }}>
      <T variant="heading" style={{ fontSize: 26 }}>Raum für nächste Schritte</T>
      <T variant="small" style={{ color: t.muted }}>Diese Vorhaben haben bisher keine verknüpften Aufzeichnungen. Du kannst sie jederzeit öffnen.</T>
      {model.unplaced.slice(0, unplacedLimit).map((goal) => <Button key={goal.goalId} kind="ghost" onPress={() => openGoal(goal.goalId)}>{goal.title}{goal.archived ? " · ruht" : ""}</Button>)}
      {unplacedLimit < model.unplaced.length && <Button kind="secondary" onPress={() => setUnplacedLimit((n) => n + 6)}>Weitere Vorhaben ohne Aufzeichnungen</Button>}
    </Card>}
    {model.timeline.length > 0 ? <View style={{ gap: 12 }}>
      <T variant="heading" style={{ fontSize: 24, lineHeight: 30 }}>Momente auf deinem Weg</T>
      {model.timeline.slice(0, momentLimit).map((moment) => <Moment key={moment.key} moment={moment} />)}
      {momentLimit < model.timeline.length && <Button kind="ghost" onPress={() => setMomentLimit((n) => n + 10)}>Weitere Momente anzeigen</Button>}
    </View> : <T variant="small" style={{ color: t.muted }}>Hier findest du Gedanken, Schritte und Rückblicke wieder, sobald du sie festhältst.</T>}
  </View>;
}

function Moment({ moment }: { moment: TreeMoment }) {
  const t = useTheme(), label = moment.kind === "thought" ? "Dein Gedanke" : moment.kind === "review" ? "Dein Rückblick" : moment.completed ? "Dein abgeschlossener Schritt" : "Dein offener Schritt";
  const displayDate = moment.imported ? "Aus FaithPath übernommen · Datum nicht eindeutig zugeordnet"
    : moment.dateContext === "imported-goal" ? "In einem übernommenen Vorhaben · Datum nicht eindeutig zugeordnet"
    : moment.date ? new Date(moment.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "Datum nicht überliefert";
  return <View testID={`tree-moment-${moment.key}`} style={{ gap: 8, paddingTop: 16, borderTopWidth: 1, borderColor: t.line }}>
    <T variant="small" style={{ color: t.gold }}>{label} · {displayDate}</T>
    {moment.kind !== "thought" || moment.title !== "Dein Gedanke" ? <T style={{ fontSize: 13, color: t.muted }}>{moment.kind === "review" ? "Damals: " : ""}{moment.title}</T> : null}
    <T numberOfLines={4} style={{ fontSize: 14, lineHeight: 24 }}>{moment.text}</T>
    <Button kind="ghost" icon={moment.target.type === "note" ? "pen" : "leaf"}
      onPress={() => moment.target.type === "note" ? router.push({ pathname: "/sammlung", params: { note: moment.target.id, view: "read" } }) : openGoal(moment.target.id)}>
      {moment.target.type === "note" ? "Gedanken in der Sammlung öffnen" : "Zum zugehörigen Vorhaben"}
    </Button>
  </View>;
}
