import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../../state/store";
import type { Draft, DraftOf } from "./schema";

export function useDraft<T extends Draft["type"]>(initial: DraftOf<T>) {
  const initialValues = initial.values as DraftOf<T>["values"];
  const [values, setValues] = useState<DraftOf<T>["values"]>(
      () => initialValues,
    ),
    [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const current = useRef<DraftOf<T>>(initial),
    latest = useRef<DraftOf<T>["values"]>(initialValues),
    savedBytes = useRef(JSON.stringify(initial.values)),
    mounted = useRef(true),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pending = useRef<Promise<DraftOf<T> | null> | null>(null),
    closed = useRef(false);
  function stopTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  async function flush(): Promise<DraftOf<T> | null> {
    stopTimer();
    if (closed.current) return null;
    if (pending.current) {
      const prior = await pending.current;
      if (!prior) return null;
      return flush();
    }
    if (JSON.stringify(latest.current) === savedBytes.current)
      return current.current;
    const attempted = {
      ...current.current,
      values: latest.current,
      updatedAt: new Date().toISOString(),
    } as DraftOf<T>;
    if (mounted.current) setStatus("saving");
    const task = useApp
      .getState()
      .saveEditorDraft(attempted, {
        id: current.current.id,
        revision: current.current.revision,
      })
      .then((result) => {
        if (!result) {
          if (mounted.current) setStatus("error");
          return null;
        }
        current.current = result as DraftOf<T>;
        savedBytes.current = JSON.stringify(attempted.values);
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
      return flush();
    return result;
  }
  const flushRef = useRef(flush);
  flushRef.current = flush;
  function change(next: DraftOf<T>["values"]) {
    latest.current = next;
    setValues(() => next);
    setStatus("saving");
    stopTimer();
    timer.current = setTimeout(() => void flushRef.current(), 300);
  }
  function close() {
    closed.current = true;
    stopTimer();
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
    const app = AppState.addEventListener("change", (state) => {
      if (state !== "active") void flushRef.current();
    });
    const before = (event: BeforeUnloadEvent) => {
      if (
        !closed.current &&
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
  return { values, change, status, flush, close };
}
