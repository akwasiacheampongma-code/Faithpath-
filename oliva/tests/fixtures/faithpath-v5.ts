// Synthetic records derived from the V5 export contract. No user data.
export const sourceDate = "2026-11-01T10:00:00.000Z";
export function faithpathFixture() {
  const ref = {
    book: "mar",
    chapter: "4",
    from: "35",
    to: "41",
    translation: "l1912" as const,
  };
  return {
    app: "FaithPath",
    version: 4,
    schemaVersion: 5,
    exported: "2026-11-05T10:00:00.000Z",
    data: {
      version: 5,
      translation: "otb",
      paths: [
        {
          id: "p1",
          title: "In Ruhe zuhören",
          why: "Raum für andere schaffen.",
          category: "Alltag",
          started: sourceDate,
          archived: false,
          steps: [
            {
              id: "s1",
              text: "Vor der Antwort warten.",
              done: true,
              createdAt: sourceDate,
              completedAt: "2026-11-02T10:00:00.000Z",
            },
          ],
          links: [
            { id: "l1", kind: "verse", ref },
            { id: "l2", kind: "reflection", reflectionId: "r1" },
          ],
          reviews: [
            {
              id: "review1",
              date: "2026-11-03T10:00:00.000Z",
              text: "Damals hat mich diese Frage bewegt.",
              status: "thought",
              confirmedDevelopment: false,
              sourceKey: "path:p1",
              sourceSnapshot: {
                key: "path:p1",
                title: "Mein damaliger Titel",
                text: "Der damalige Gedanke.",
                at: sourceDate,
              },
            },
          ],
          milestones: [
            { id: "m1", text: "Ein kleiner Anfang.", date: sourceDate },
          ],
        },
      ],
      journal: [
        {
          id: "j1",
          type: "Bibel",
          subtype: "Reflexion",
          text: "Ich darf mit meinen Fragen kommen.",
          date: sourceDate,
          ref,
          pathIds: ["p1"],
          reflectionId: "r1",
        },
        {
          id: "j2",
          type: "Journal",
          text: "Ein Bezug aus OTB bleibt als OTB erkennbar.",
          date: sourceDate,
          ref: {
            book: "joh",
            chapter: 14,
            from: 27,
            to: 27,
            translation: "otb" as const,
          },
          pathIds: [],
        },
      ],
      reflections: [
        {
          id: "r1",
          text: "Ich darf mit meinen Fragen kommen.",
          date: sourceDate,
          ref,
          pathIds: ["p1"],
        },
      ],
      highlights: [
        {
          id: "h1",
          book: "mar",
          chapter: 4,
          from: 35,
          to: 36,
          translation: "l1912" as const,
          color: "sage",
        },
        {
          id: "h2",
          book: "joh",
          chapter: 14,
          from: 27,
          to: 27,
          translation: "otb" as const,
          color: "terra",
        },
      ],
      events: [
        {
          id: "e1",
          kind: "chapter-explored",
          at: sourceDate,
          ref: { book: "mar", chapter: 4, translation: "l1912" as const },
        },
        {
          id: "e2",
          kind: "reading",
          at: sourceDate,
          ref: { book: "joh", chapter: 14, translation: "l1912" as const },
        },
      ],
      reviews: [],
      quiz: { faith: { done: sourceDate } },
      guidedPlans: { old: { step: 2 } },
      settings: { theme: "dark" },
      reading: { book: "joh", chapter: 14, translation: "otb" },
      unknownFutureField: { keep: "Unverändert erhalten." },
    },
    guidedPlans: { old: { step: 2 } },
    unknownEnvelopeField: "Auch erhalten.",
  };
}
