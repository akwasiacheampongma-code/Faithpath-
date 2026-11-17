// Exact shipped OLIVA 0.14 initial payload, from b3760844. Never derive this from future initialData.
import type { AppDataV10 } from "../../src/state/model";
import { emptyStoryStudy } from "../../src/features/stories/state-schema";
import { emptyNtStudy } from "../../src/features/quiz/state-schema";
import { emptyInvitationControls } from "../../src/features/invitations/model";
export const initialV10Data = (): AppDataV10 => ({
  version: 10, storyStudy: emptyStoryStudy(),
  ntStudy: emptyNtStudy(),
  invitations: emptyInvitationControls(),
  retainedReviewGrowth: { reflections: 0, actions: 0 },
  readingPosition: null,
  imports: [],
  goals: [],
  drafts: [],
  revision: 0,
  name: "",
  onboarded: false,
  reading: { book: "MRK", chapter: 4 },
  readChapters: [],
  readPassages: [],
  readSteps: [],
  completedSteps: [],
  activePath: null,
  bookmarks: [],
  highlights: {},
  notes: [],
  growthStage: 0,
  settings: {
    theme: "light",
    fontSize: 20,
    lineHeight: 1.8,
    reducedMotion: false,
  },
});
