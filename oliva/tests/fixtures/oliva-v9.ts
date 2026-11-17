// Frozen default factory copied from the actually delivered 0.13.1 commit.
import type { AppDataV9 } from "../../src/state/model";
import { emptyNtStudy } from "../../src/features/quiz/model";
import { emptyInvitationControls } from "../../src/features/invitations/model";
export const initialV9Data = (): AppDataV9 => ({
  version: 9,
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
