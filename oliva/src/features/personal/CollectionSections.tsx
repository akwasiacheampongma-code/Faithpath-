import { Pressable, View, useWindowDimensions } from "react-native";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import type { CollectionSection } from "./collection-model";

export type { CollectionSection } from "./collection-model";
export type CollectionSectionsProps = {
  sections: readonly CollectionSection[];
  current: CollectionSection;
  onChange: (section: CollectionSection) => void;
};

export function CollectionSections({ sections, current, onChange }: CollectionSectionsProps) {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const twoColumns = Math.min(width - 44, 600) >= 264 * fontScale + 8;

  return (
    <View testID="collection-tabs" style={{ width: "100%", maxWidth: 600, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {sections.map((section) => (
        <Pressable
          key={section}
          accessibilityRole="button"
          accessibilityState={{ selected: current === section }}
          onPress={() => onChange(section)}
          style={({ pressed }) => ({
            flexBasis: twoColumns ? "47%" : "100%", flexGrow: 1, minHeight: 44,
            paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10,
            justifyContent: "center", alignItems: "center", opacity: pressed ? 0.8 : 1,
            backgroundColor: current === section ? theme.soft : "transparent",
            borderWidth: 1, borderColor: current === section ? theme.primary : theme.line,
          })}
        >
          <T style={{ fontSize: 14, lineHeight: 21, textAlign: "center", color: current === section ? theme.primary : theme.text,
            fontWeight: current === section ? "700" : "400" }}>
            {section}
          </T>
        </Pressable>
      ))}
    </View>
  );
}
