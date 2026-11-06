import { router } from "expo-router";
import { Shell } from "../src/components/Shell";
import { Card, T, Button } from "../src/components/ui";
export default function NotFound() {
  return (
    <Shell>
      <Card style={{ gap: 18 }}>
        <T variant="title">Dieser Weg führt gerade ins Leere.</T>
        <T>
          Die Seite ist nicht vorhanden. Von Heute aus findest du einen neuen
          Anfang.
        </T>
        <Button onPress={() => router.replace("/")}>Zurück zu Heute</Button>
      </Card>
    </Shell>
  );
}
