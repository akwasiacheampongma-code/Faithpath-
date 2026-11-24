import { useEffect } from "react";
import { create } from "zustand";
import { readDevicePreference, writeDevicePreference } from "../../services/device-preferences";

export type ReaderFont = "Cormorant" | "DMSans";

const fontKey = "oliva.reader-font";
const useFont = create<{ font: ReaderFont }>(() => ({ font: "Cormorant" }));
let loaded = false;
let chosen = false;

export function useReaderFont() {
  const font = useFont((state) => state.font);
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    void readDevicePreference(fontKey).then((value) => {
      if (!chosen && (value === "Cormorant" || value === "DMSans")) useFont.setState({ font: value });
    }).catch(() => {});
  }, []);
  return font;
}

export function chooseReaderFont(font: ReaderFont) {
  chosen = true;
  useFont.setState({ font });
  void writeDevicePreference(fontKey, font).catch(() => {});
}
