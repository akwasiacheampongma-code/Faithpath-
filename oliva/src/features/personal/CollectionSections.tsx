import { Pressable, View, useWindowDimensions } from "react-native";
import { T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";

export type CollectionSection = "Gedanken" | "Entwürfe" | "Lesezeichen" | "Markierungen";
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
      {sections.map(section => (
        <Pressable
          key={section}
          accessibilityRole="button"
          accessibilityState={{ selected: current === section }}
          onPress={() => onChange(section)}
          style={({ pressed }) => ({
            flexBasis: twoColumns ? "47%" : "100%", flexGrow: 1, minHeight: 48,
            paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12,
            justifyContent: "center", alignItems: "center", opacity: pressed ? 0.8 : 1,
            backgroundColor: current === section ? theme.primary : theme.soft,
          })}
        >
          <T style={{ fontSize: 14, lineHeight: 21, textAlign: "center", color: current === section ? theme.onPrimary : theme.text }}>
            {section}
          </T>
        </Pressable>
      ))}
    </View>
  );
}
