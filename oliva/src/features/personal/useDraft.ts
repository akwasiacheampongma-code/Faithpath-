import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../../state/store";
import type { Draft, DraftOf } from "./schema";
import { newId } from "./schema";
import {
  useVolatileDrafts,
  holdDraft,
  releaseDraft,
  settleDraft,
} from "./volatile-drafts";

export function useDraft<T extends Draft["type"]>(initial: DraftOf<T>) {
  const [seed] = useState(() => {
    const held = useVolatileDrafts.getState().items[initial.key];
    return held?.draft.type === initial.type
      ? held
      : {
          draft: initial,
          savedBytes: JSON.stringify(initial.values),
          reason: "pending" as const,
          owner: "",
        };
  });
  const owner = useRef(newId("editor"));
  const initialValues = seed.draft.values as DraftOf<T>["values"];
  const [values, setValues] = useState<DraftOf<T>["values"]>(
      () => initialValues,
    ),
    [status, setStatus] = useState<"saved" | "saving" | "error">(
      seed.reason === "error"
        ? "error"
        : JSON.stringify(initialValues) === seed.savedBytes
          ? "saved"
          : "saving",
    );
  const current = useRef<DraftOf<T>>(seed.draft as DraftOf<T>),
    latest = useRef<DraftOf<T>["values"]>(initialValues),
    savedBytes = useRef(seed.savedBytes),
    mounted = useRef(true),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pending = useRef<Promise<DraftOf<T> | null> | null>(null),
    closed = useRef(false);
  const obsolete = useVolatileDrafts((s) => !!s.settled[current.current.id]);
  function hold(reason: "pending" | "error", claim = false) {
    holdDraft(
      {
        draft: {
          ...current.current,
          values: latest.current,
          updatedAt: new Date().toISOString(),
        } as Draft,
        savedBytes: savedBytes.current,
        owner: owner.current,
        reason,
      },
      claim,
    );
  }
  function stopTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  async function flush(ensure = false): Promise<DraftOf<T> | null> {
    stopTimer();
    if (
      closed.current ||
      useVolatileDrafts.getState().settled[current.current.id]
    )
      return null;
    if (pending.current) {
      const prior = await pending.current;
      if (!prior) return null;
      return flush(ensure);
    }
    if (
      JSON.stringify(latest.current) === savedBytes.current &&
      (!ensure || current.current.revision > 0)
    ) {
      releaseDraft(current.current.key, owner.current);
      if (mounted.current) setStatus("saved");
      return current.current;
    }
    const attempted = {
      ...current.current,
      values: latest.current,
      updatedAt: new Date().toISOString(),
    } as DraftOf<T>;
    if (mounted.current) setStatus("saving");
    hold("pending");
    const task = useApp
      .getState()
      .saveEditorDraft(
        attempted,
        current.current.revision === 0
          ? null
          : {
              id: current.current.id,
              revision: current.current.revision,
            },
      )
      .then((result) => {
        if (!result) {
          hold("error");
          if (mounted.current) setStatus("error");
          return null;
        }
        current.current = result as DraftOf<T>;
        savedBytes.current = JSON.stringify(attempted.values);
        if (JSON.stringify(latest.current) === savedBytes.current)
          releaseDraft(current.current.key, owner.current);
        else hold("pending");
        if (mounted.current)
          setStatus(
            JSON.stringify(latest.current) === savedBytes.current
              ? "saved"
              : "saving",
          );
        return current.current;
      });
    pending.current = task;
    const result = await task;
    pending.current = null;
    if (
      result &&
      JSON.stringify(latest.current) !== savedBytes.current &&
      !closed.current
    )
      return flush(ensure);
    return result;
  }
  const flushRef = useRef(flush);
  flushRef.current = flush;
  function change(next: DraftOf<T>["values"]) {
    latest.current = next;
    if (JSON.stringify(next) === savedBytes.current) {
      stopTimer();
      releaseDraft(current.current.key, owner.current);
      setValues(() => next);
      setStatus("saved");
      return;
    }
    hold("pending", true);
    setValues(() => next);
    setStatus("saving");
    stopTimer();
    timer.current = setTimeout(() => void flushRef.current(), 300);
  }
  function close() {
    if (closed.current) return;
    closed.current = true;
    stopTimer();
    releaseDraft(current.current.key, owner.current);
    settleDraft(current.current.id);
  }
  useFocusEffect(
    useCallback(
      () => () => {
        if (!closed.current) void flushRef.current();
      },
      [],
    ),
  );
  useEffect(() => {
    mounted.current = true;
    if (JSON.stringify(latest.current) !== savedBytes.current) {
      hold(seed.reason, true);
      void flushRef.current();
    } else if (seed.owner) releaseDraft(current.current.key, seed.owner);
    const app = AppState.addEventListener("change", (state) => {
      if (state !== "active") void flushRef.current();
    });
    const before = (event: BeforeUnloadEvent) => {
      if (
        !closed.current &&
        !useVolatileDrafts.getState().settled[current.current.id] &&
        JSON.stringify(latest.current) !== savedBytes.current
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    if (Platform.OS === "web") window.addEventListener("beforeunload", before);
    return () => {
      mounted.current = false;
      stopTimer();
      app.remove();
      if (Platform.OS === "web")
        window.removeEventListener("beforeunload", before);
      if (!closed.current) void flushRef.current();
    };
  }, []);
  return { values, change, status, flush, close, obsolete };
}
