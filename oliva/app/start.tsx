import { router } from "expo-router";
import { JourneyIntro } from "../src/features/journey/JourneyIntro";

export default function Start() {
  return <JourneyIntro onClose={() => router.dismissTo("/")} />;
}
