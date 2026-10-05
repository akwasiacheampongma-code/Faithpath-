# FaithPath final experience design

Authorized user specification: Bible Journey + Path Branches + Multi-Theme System, 2026-10-05. Implementation is on feature/final-experience-v1 from verified develop/v4 f02106e / CHAPTER1. No Production, main merge, or rollback to older source. The user supplied the architecture, feature intent and execution authorization; no redundant approval handoff is required.

## Existing architecture and isolation

Vanilla JS renderer, canonical runtime-model JSON sources, v5 transactional local store at faithpath.v1.rebuild, optional settings and events already retained by migrations and backups. Existing SW precaches legitimate build assets and upgrades on explicit activation. Existing primary navigation, question flows, deletion semantics, seven tree assets and treeLevel are authoritative.

## A: factual reading

A new chapter-explored event in the existing events array records normalized book/chapter and timestamp exactly once, across translations. Old reading/open/quiz events never count. No schema version change or migration. Invalid or duplicate imported events are ignored/deduplicated by read-only selectors. Counts use valid canonical Bible metadata.

Reader uses a small sentinel immediately after the final verse. Completion requires that sentinel is visible inside the unobscured reading viewport, document visible, no dialog/selection/menu overlay, and the route/render token still current. IntersectionObserver plus scroll/resize/visibility checks; clean up before route replacement. Header and bottom-nav bounds measured dynamically. No quiz dependency. Very short chapters can legitimately reach their end in the initial viewport; reaching the end is a factual viewport event, not proof of comprehension. A storage failure displays an error and never announces success. Existing reader/chapter quiz remains after the acknowledgement.

Bibel → Deine Bibelreise → book. Existing reading is only a continuation hint. Hub has factual chapter/book counts and Testament lists. Chapter rows explicitly label explored/current/not explored. No synthetic history or faith percentages. A small line sword refers only to Scripture.

## B: canonical personal paths

Read-only branch selector accepts nonblank recorded steps, milestones, reviews, journal/reflection items explicitly linked by path IDs or existing link IDs. Guided-start/title/category/opening alone is insufficient. Exact journal/reflection mirrors are counted once. Order: active before archived, most recent documented timestamp descending, started timestamp descending, lexical canonical ID tie-break. Missing timestamps never fabricate recency. Cap: seed/sprout 0; young tree 1; growing tree 3; strong/fruit stages 5. All remaining documented paths stay in Weitere Wege, and ordinary path navigation retains every path.

Original photos inspected: stage 3 has a narrow central sapling, so one safe central marker; later trees have wider canopy zones. Existing image uses natural full aspect ratio. Fixed normalized SVG connection slots per stage, quiet numbered HTML links with ≥44px hit targets; matching labelled list below. No text over image. SVG is decorative; links announce the exact path and factual review/milestone state. No random anchors, generated raster assets, stored branch state or spiritual score. Existing treeLevel unchanged. Path detail adds factual counts only for real linked records.

## C: one app, four atmospheres

settings.theme = light/atmospheric/paper/night, unknown/missing → light without rewriting old state. Live apply to html data-theme, semantic --fp-* tokens alias existing tokens. Light values and existing layout retained. Shared components, content, data namespace, manifest and navigation. Local/system fonts only; no atmospheric binary reference found, so no missing imagery fabricated. Themes use semantic tokens; fixed highlight swatches retain their identity and dark-theme marked text has an explicit legible ink token. Focus, success/error and overlay contrast are validated in all themes.

## Test and handoff

Pure selector RED→GREEN tests; existing store/backup tests; browser factual completion/negative cases, branch fixtures 1/3/5/8, all four themes and all requested surfaces, 320/390/768/1440 plus 200%, axe, keyboard, reduced motion, safe-area simulation. Inspect actual screenshots. Real CHAPTER1→new SW upgrade with seeded personal data/draft; add future setting/journey to old store to prove optional-field retention. Full existing relevant regressions. Five requested reports and machine gate; commit only feature branch. No Production deployment. Real iPhone/Safari/VoiceOver remain explicit next gate.
