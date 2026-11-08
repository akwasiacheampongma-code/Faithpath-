import {
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import { useTheme } from "../design-system/theme";
import { Icon, type IconName } from "./Icon";
export function T({
  children,
  variant = "body",
  style,
  ...rest
}: {
  children?: React.ReactNode;
  variant?: "body" | "small" | "label" | "title" | "hero" | "heading";
  style?: StyleProp<TextStyle>;
} & React.ComponentProps<typeof Text>) {
  const t = useTheme();
  const styles: Record<string, TextStyle> = {
    body: { fontSize: 15, lineHeight: 24 },
    small: { fontSize: 12, lineHeight: 19 },
    label: {
      fontSize: 10,
      letterSpacing: 1.8,
      lineHeight: 18,
      fontWeight: "600",
    },
    title: { fontFamily: "Cormorant", fontSize: 36, lineHeight: 40 },
    hero: { fontFamily: "Cormorant", fontSize: 52, lineHeight: 54 },
    heading: { fontFamily: "Cormorant", fontSize: 28, lineHeight: 33 },
  };
  return (
    <Text
      {...rest}
      style={[{ fontFamily: "DMSans", color: t.text }, styles[variant], style]}
    >
      {children}
    </Text>
  );
}
export function Button({
  children,
  onPress,
  kind = "primary",
  icon = "arrow",
  disabled = false,
  testID,
  style,
  foregroundColor,
}: {
  children: React.ReactNode;
  onPress: () => void;
  kind?: "primary" | "secondary" | "ghost";
  icon?: IconName | null;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  foregroundColor?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 20,
          paddingVertical: 13,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          backgroundColor:
            kind === "primary"
              ? t.primary
              : kind === "secondary"
                ? t.soft
                : "transparent",
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
          borderWidth: kind === "secondary" ? 1 : 0,
          borderColor: t.line,
        },
        style,
      ]}
    >
      <T
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: foregroundColor ?? (kind === "primary" ? t.onPrimary : t.text),
          flexShrink: 1,
        }}
      >
        {children}
      </T>
      {icon && (
        <Icon
          name={icon}
          size={17}
          color={foregroundColor ?? (kind === "primary" ? t.onPrimary : t.text)}
        />
      )}
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  selected = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        backgroundColor: selected ? t.soft : "transparent",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={name} color={t.text} size={21} />
    </Pressable>
  );
}
export function Card({
  children,
  style,
  testID,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const t = useTheme();
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: t.line,
          padding: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <T variant="small" style={{ fontWeight: "600" }}>
        {label}
      </T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.muted}
        {...props}
        style={[
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: t.line,
            borderRadius: 12,
            padding: 14,
            fontFamily: "DMSans",
            fontSize: 15,
            color: t.text,
            backgroundColor: t.surface,
            textAlignVertical: "top",
          },
          props.multiline && { minHeight: 120 },
          props.style,
        ]}
      />
    </View>
  );
}
export function Tag({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: IconName;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: t.soft,
        alignSelf: "flex-start",
      }}
    >
      {icon && <Icon name={icon} size={12} color={t.primary} />}
      <T variant="small" style={{ fontSize: 10, color: t.text }}>
        {children}
      </T>
    </View>
  );
}
export function Progress({ value, label }: { value: number; label: string }) {
  const t = useTheme(),
    ratio = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0,
    percent = Math.round(ratio * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{
        height: 4,
        backgroundColor: t.line,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: 4,
          backgroundColor: t.gold,
          borderRadius: 4,
        }}
      />
    </View>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 18,
      }}
    >
      <T variant="heading" accessibilityRole="header" style={{ flexShrink: 1 }}>
        {title}
      </T>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <T variant="small" style={{ color: t.primary }}>
            {action} →
          </T>
        </Pressable>
      )}
    </View>
  );
}
export const common = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  gap: { gap: 16 },
});
