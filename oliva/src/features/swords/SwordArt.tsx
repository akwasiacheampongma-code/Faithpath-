import { View } from "react-native";
import { bookByCode } from "../bible/repository";
import { normalizeSwordProgress } from "./model";
import { swordSize } from "./layout";
import { VectorSwordDrawing } from "./VectorSwordDrawing";
import { SwordPulse } from "./SwordPulse";

/** The established compact vector family stays available for all 66 books. */
export function SwordArt({
  book = "MRK",
  progress = 0,
  size = 140,
  celebrate = false,
}: {
  book?: string;
  progress?: number;
  size?: number;
  celebrate?: boolean;
}) {
  const width = swordSize(size),
    value = normalizeSwordProgress(progress),
    identity = bookByCode(book);
  return (
    <View
      testID="sword-art"
      accessibilityRole="image"
      accessibilityLabel={`${identity?.sword ?? "Buchschwert"} · ${Math.round(value * 100)} Prozent gelesen`}
      style={{ width, height: width * 1.5, alignSelf: "center" }}
    >
      <VectorSwordDrawing book={book} progress={value} />
      <SwordPulse
        active={celebrate}
        book={book}
        progress={value}
        frameSize={width}
      />
    </View>
  );
}
