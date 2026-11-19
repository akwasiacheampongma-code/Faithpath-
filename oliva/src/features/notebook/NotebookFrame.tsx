import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, T } from "../../components/ui";
import { useTheme } from "../../design-system/theme";

export function NotebookFrame({ title, back, backLabel, action, children }: {
  title: string; back: () => void; backLabel: string; action?: ReactNode; children: ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.bg }}>
    <View style={{ paddingTop: insets.top, borderBottomWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
      <View style={{ width: "100%", maxWidth: 704, alignSelf: "center", paddingHorizontal: 18, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Button kind="ghost" icon="back" style={{ minHeight: 48, paddingHorizontal: 4 }} onPress={back}>{backLabel}</Button>
        {action}
      </View>
    </View>
    <ScrollView role="main" keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24 + insets.bottom }}>
      <View style={{ width: "100%", maxWidth: 660, alignSelf: "center", gap: 16 }}>
        <T variant="title" accessibilityRole="header" style={{ fontSize: 40, lineHeight: 46 }}>{title}</T>
        {children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
