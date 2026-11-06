import { useState, useId } from "react";
import { View } from "react-native";
import { T, Button } from "../../components/ui";
import { useTheme } from "../../design-system/theme";
import {
  getPassage,
  referenceLabel,
  type Reference,
} from "../bible/repository";
import { checkFor, type TextCheck as Question } from "./checks";
import { Choice } from "../../components/Choice";
export function TextCheck({ reference }: { reference: Reference }) {
  const q = checkFor(reference);
  return q ? <QuestionCard key={q.id} question={q} /> : null;
}
function QuestionCard({ question: q }: { question: Question }) {
  const groupId = useId();
  const t = useTheme(),
    [open, setOpen] = useState(false),
    [answer, setAnswer] = useState<string | null>(null);
  // Rotate where the correct choice appears; never display a fixed first option.
  const shift = q.id.length % q.choices.length,
    choices = [...q.choices.slice(shift), ...q.choices.slice(0, shift)];
  return (
    <View
      style={{
        gap: 12,
        borderTopWidth: 1,
        borderColor: t.line,
        paddingTop: 14,
      }}
    >
      <Button kind="ghost" icon="info" onPress={() => setOpen(!open)}>
        {open ? "Textfrage schließen" : "Eine kleine Frage zum Text"}
      </Button>
      {open && (
        <>
          <T variant="small" style={{ color: t.muted }}>
            Eine freiwillige Lesehilfe zu {referenceLabel(q.ref)}. Dein Weg geht
            auch ohne Antwort weiter.
          </T>
          <T style={{ fontSize: 14, fontWeight: "600" }}>{q.question}</T>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={q.question}
            style={{ gap: 8 }}
          >
            {choices.map((choice) => (
              <Choice
                key={choice.id}
                name={groupId}
                label={choice.text}
                checked={answer === choice.id}
                onChange={() => setAnswer(choice.id)}
              />
            ))}
          </View>
          {answer && (
            <View
              accessibilityLiveRegion="polite"
              style={{
                gap: 10,
                padding: 16,
                borderRadius: 12,
                backgroundColor: t.soft,
              }}
            >
              <T style={{ fontSize: 13, fontWeight: "600" }}>
                {answer === q.correct
                  ? "Das passt zu diesem Abschnitt."
                  : "Schau noch einmal in den Text."}
              </T>
              <T variant="small">{q.explanation}</T>
              <T variant="label" style={{ fontSize: 9 }}>
                BIBELTEXT · LUTHER 1912 · {referenceLabel(q.evidence)}
              </T>
              <T
                style={{
                  fontFamily: "Cormorant",
                  fontSize: 23,
                  lineHeight: 31,
                }}
              >
                {getPassage(q.evidence)
                  .map((v) => v.text)
                  .join(" ")}
              </T>
              <T variant="small" style={{ color: t.muted }}>
                Frage und Einordnung: redaktioneller Entwurf von OLIVA. Deine
                Antwort wird nicht bewertet oder als Glaubensfortschritt
                gespeichert.
              </T>
            </View>
          )}
        </>
      )}
    </View>
  );
}
