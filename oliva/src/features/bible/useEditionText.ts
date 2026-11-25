import { useEffect, useReducer, useState } from "react";
import { type BibleEdition } from "./editions";
import { isEditionLoaded, loadEdition } from "./repository";

export function useEditionText(edition: BibleEdition) {
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const [failed, setFailed] = useState<BibleEdition>();
  useEffect(() => {
    if (isEditionLoaded(edition)) return;
    let active = true;
    void loadEdition(edition).then(() => {
      if (active) refresh();
    }).catch(() => {
      if (active) setFailed(edition);
    });
    return () => { active = false; };
  }, [edition]);
  return isEditionLoaded(edition) ? "ready" : failed === edition ? "error" : "loading";
}
