import { useCallback, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../../state/store";
import { selectInvitations } from "./model";

/** Only a focused, active screen checks elapsed time. No background task,
 * notification permission, network request or storage write is involved. */
export function useInvitations() {
  const goals = useApp((s) => s.data.goals),
    notes = useApp((s) => s.data.notes),
    controls = useApp((s) => s.data.invitations),
    [now, setNow] = useState(Date.now);
  const needsClock =
    controls.enabled || Object.keys(controls.snoozed).length > 0;
  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setInterval> | undefined;
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = undefined;
      };
      const refresh = () => setNow(Date.now());
      const update = () => {
        stop();
        if (AppState.currentState === "active") {
          refresh();
          if (needsClock) timer = setInterval(refresh, 60000);
        }
      };
      update();
      const subscription = AppState.addEventListener("change", update);
      return () => {
        stop();
        subscription.remove();
      };
    }, [needsClock]),
  );
  return useMemo(
    () => selectInvitations({ goals, notes }, controls, now),
    [goals, notes, controls, now],
  );
}
