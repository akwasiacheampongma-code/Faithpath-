import { useTheme } from "../../design-system/theme";
import type { CollectionSectionsProps } from "./CollectionSections";

export function CollectionSections({ sections, current, onChange }: CollectionSectionsProps) {
  const theme = useTheme();
  return (
    <div data-testid="collection-tabs" role="group" aria-label="Bereiche deiner Sammlung"
      style={{
        display: "grid", width: "100%", maxWidth: 600, gap: 8, fontSize: 14,
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, max(47%, 9.25em)), 1fr))",
      }}
    >
      {sections.map((section) => (
        <button key={section} type="button" aria-pressed={current === section} onClick={() => onChange(section)}
          style={{
            font: "inherit", fontFamily: "DMSans, sans-serif", lineHeight: 1.5,
            minHeight: 44, padding: "8px", borderRadius: 10,
            border: `1px solid ${current === section ? theme.primary : theme.line}`,
            color: current === section ? theme.primary : theme.text,
            fontWeight: current === section ? 700 : 400,
            backgroundColor: current === section ? theme.soft : "transparent",
            overflowWrap: "anywhere", cursor: "pointer", outlineOffset: 2,
          }}
        >
          {section}
        </button>
      ))}
    </div>
  );
}
