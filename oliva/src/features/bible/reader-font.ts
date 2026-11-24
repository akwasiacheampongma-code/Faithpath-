import { useEffect } from "react";
import { create } from "zustand";
import { readFont, saveFont } from "./font-storage";

export type ReaderFont = "Cormorant" | "DMSans";

const useFont = create<{ font: ReaderFont }>(() => ({ font: "Cormorant" }));
let loaded = false;
let chosen = false;

export function useReaderFont() {
  const font = useFont((state) => state.font);
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    void readFont().then((value) => {
      if (!chosen && (value === "Cormorant" || value === "DMSans")) useFont.setState({ font: value });
    }).catch(() => {});
  }, []);
  return font;
}

export function chooseReaderFont(font: ReaderFont) {
  chosen = true;
  useFont.setState({ font });
  void saveFont(font).catch(() => {});
}
