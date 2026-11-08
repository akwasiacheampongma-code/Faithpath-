import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { T, Card, Button, Tag } from "../src/components/ui";
import { useTheme } from "../src/design-system/theme";
import { useApp } from "../src/state/store";
import { InvitationSettings } from "../src/features/invitations/InvitationSettings";
import { useInvitations } from "../src/features/invitations/useInvitations";
import type {
  Invitation,
  DeferredInvitation,
} from "../src/features/invitations/model";
import { referenceLabel } from "../src/features/bible/repository";

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function Invitations() {
  const t = useTheme(),
    { enabled, due, deferred } = useInvitations(),
    [dueLimit, setDueLimit] = useState(5),
    [deferredLimit, setDeferredLimit] = useState(5),
    [message, setMessage] = useState("");
  async function choose(
    invitation: Invitation,
    action: "snooze" | "dismiss" | "resume",
  ) {
    setMessage("");
    if (await useApp.getState().chooseInvitation(invitation, action))
      setMessage(
        action === "snooze"
          ? "Für 14 Tage zurückgestellt. Dein Eintrag bleibt erhalten."
          : action === "dismiss"
            ? "Einladung ausgeblendet. Dein Eintrag bleibt erhalten."
            : enabled
              ? "Die Einladung ist wieder zugelassen. Sie erscheint, wenn ihr Zeitraum erreicht ist."
              : "Wieder zugelassen. Einladungen bleiben insgesamt ausgeschaltet.",
      );
  }
  return (
    <Shell>
      <View style={{ gap: 22, maxWidth: 760 }}>
        <View style={{ alignItems: "flex-start" }}>
          <Button
            kind="ghost"
            icon="back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            Zurück
          </Button>
        </View>
        <Tag icon="leaf">In deinem eigenen Rhythmus</Tag>
        <T
          variant="title"
          accessibilityRole="header"
          style={{ fontSize: 42, lineHeight: 46 }}
        >
          Was dir wichtig bleibt.
        </T>
        <T style={{ color: t.muted }}>
          Manche Gedanken dürfen eine Weile ruhen. Hier kannst du ihnen
          wiederbegegnen – ohne etwas nachholen zu müssen.
        </T>
        <InvitationSettings link={false} />
        {message ? (
          <T accessibilityRole="status" style={{ fontSize: 13 }}>
            {message}
          </T>
        ) : null}
        {enabled && (
          <View testID="due-invitations" style={{ gap: 16 }}>
            <T variant="heading" accessibilityRole="header">
              Raum zum Wiederentdecken
            </T>
            {due.length ? (
              due
                .slice(0, dueLimit)
                .map((invitation) => (
                  <InvitationCard
                    key={invitation.key}
                    invitation={invitation}
                    onChoose={choose}
                  />
                ))
            ) : (
              <Card style={{ gap: 10 }}>
                <T>Gerade ist Raum für Neues.</T>
                <T variant="small" style={{ color: t.muted }}>
                  Hier erscheint ein aktives Vorhaben frühestens nach 21 Tagen,
                  ein eigenständiger Gedanke nach 35 Tagen. Du musst nichts
                  dafür tun.
                </T>
              </Card>
            )}
            {due.length > dueLimit && (
              <Button
                kind="secondary"
                onPress={() => setDueLimit((limit) => limit + 5)}
              >
                Weitere Einladungen ansehen
              </Button>
            )}
          </View>
        )}
        {deferred.length > 0 && (
          <View testID="deferred-invitations" style={{ gap: 16 }}>
            <T variant="heading" accessibilityRole="header">
              Für später oder ausgeblendet
            </T>
            <T variant="small" style={{ color: t.muted }}>
              Du kannst jede Einladung wieder zulassen. Dein ursprünglicher
              Eintrag bleibt immer in deiner Sammlung oder deinen Vorhaben.
            </T>
            {deferred.slice(0, deferredLimit).map((invitation) => (
              <InvitationCard
                key={invitation.key}
                invitation={invitation}
                onChoose={choose}
              />
            ))}
            {deferred.length > deferredLimit && (
              <Button
                kind="secondary"
                onPress={() => setDeferredLimit((limit) => limit + 5)}
              >
                Weitere Entscheidungen ansehen
              </Button>
            )}
          </View>
        )}
        <Card style={{ gap: 10 }}>
          <T variant="heading">Ein wenig Abstand. Kein Maßstab.</T>
          <T variant="small" style={{ color: t.muted }}>
            Der Zeitraum beginnt bei deinem letzten gespeicherten Schritt,
            Rückblick oder verknüpften Gedanken. Eine reine Textkorrektur am
            Vorhaben oder Rückblick zählt nicht als neue Erfahrung. Archivierte
            Vorhaben erscheinen hier nicht.
          </T>
          <T variant="small" style={{ color: t.muted }}>
            Öffnen, Zurückstellen und Ausblenden verändern weder deinen
            Olivenbaum noch deinen Lesefortschritt. Markierungen ohne
            gespeichertes Datum erhalten keine erfundene Erinnerung.
          </T>
        </Card>
      </View>
    </Shell>
  );
}

function InvitationCard({
  invitation,
  onChoose,
}: {
  invitation: Invitation | DeferredInvitation;
  onChoose: (
    invitation: Invitation,
    action: "snooze" | "dismiss" | "resume",
  ) => Promise<void>;
}) {
  const t = useTheme(),
    busy = useApp((s) => s.busy),
    deferred = "mode" in invitation ? invitation : null;
  function open() {
    if (invitation.kind === "goal")
      router.push({
        pathname: "/vorhaben/[id]",
        params: { id: invitation.id },
      });
    else
      router.push({
        pathname: "/sammlung",
        params: { note: invitation.id, view: "read" },
      });
  }
  return (
    <Card testID={`invitation-${invitation.key}`} style={{ gap: 14 }}>
      <Tag icon={invitation.kind === "goal" ? "path" : "pen"}>
        {invitation.kind === "goal" ? "Dein Vorhaben" : "Dein Gedanke"}
      </Tag>
      <T variant="heading" accessibilityRole="header">
        {invitation.title}
      </T>
      <T numberOfLines={4} style={{ fontSize: 14 }}>
        {invitation.detail}
      </T>
      {invitation.ref && (
        <T variant="small" style={{ color: t.muted }}>
          {referenceLabel(invitation.ref)}
        </T>
      )}
      <T variant="small" style={{ color: t.muted }}>
        Zuletzt festgehalten am {dateLabel(invitation.at)}
      </T>
      {deferred && (
        <T variant="small" style={{ color: t.muted }}>
          {deferred.mode === "dismissed"
            ? "Von dir ausgeblendet"
            : `Zurückgestellt bis ${dateLabel(deferred.until!)}`}
        </T>
      )}
      <Button kind="secondary" disabled={busy} onPress={open}>
        {invitation.kind === "goal" ? "Zum Vorhaben" : "Gedanken öffnen"}
      </Button>
      {deferred ? (
        <Button
          kind="ghost"
          icon="back"
          disabled={busy}
          onPress={() => void onChoose(invitation, "resume")}
        >
          Wieder zulassen
        </Button>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button
            kind="ghost"
            icon="clock"
            disabled={busy}
            onPress={() => void onChoose(invitation, "snooze")}
          >
            Für 14 Tage zurückstellen
          </Button>
          <Button
            kind="ghost"
            icon="close"
            disabled={busy}
            onPress={() => void onChoose(invitation, "dismiss")}
          >
            Einladung ausblenden
          </Button>
        </View>
      )}
    </Card>
  );
}
