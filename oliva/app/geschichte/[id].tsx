import { useLocalSearchParams } from "expo-router";
import { StoryDetail } from "../../src/features/stories/StoryDetail";
export default function StoryRoute() {
  const params = useLocalSearchParams<{ id: string; stage?: string; index?: string; draft?: string }>();
  return <StoryDetail key={params.id} params={params} />;
}
