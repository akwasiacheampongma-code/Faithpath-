# Dein erster Samen: product and safety design

## Authorized outcome

Implement the user's complete UX/UI-upgrade on a new feature branch from verified
7d4441c. People currently understand personal paths only after explanation. The
first real experience must connect a life concern, unchanged offline Scripture,
their own words/prayer, a concrete step and a saved personal path. Visual quality
and understanding are equal requirements. No production deploy/merge.

## Selected approach

Use the existing Vanilla PWA and Verbunden design. Extend the neutral welcome
with a prominent optional first-seed action, preserving both current shortcuts.
A dedicated first-seed route is a real resumable editor, not a disposable slide
tour. Seven scenes: welcome, concern/topic, Scripture, own words/prayer, next
step, review/create, planted confirmation. Back, pause, Bible skip and help stay
available. Existing-user onboarding markers prevent unsolicited repetition.

Alternatives rejected: mandatory tour (blocks experienced readers); external
prototype or new storage subsystem (does not integrate real personal records).
The user's explicit implementation request authorizes this already discussed
direction. Routine details do not require another approval of the same work.

## Persistence boundary

Reuse KEYS.draft and its existing {type,args,values,saved} envelope with type
first-seed. Never overwrite another draft; offer its existing resume/export flow.
Stable IDs/timestamp are allocated before saving and retained in draft args.
Compose one deterministic mutation for existing journalTransaction: path, journal,
reflection mirror, Scripture link, thought link and step. No milestone, confirmed
development, reading event or quiz state is awarded. One atomic transaction clears
only the exact owned draft. Double tap/duplicate completion must not create rows.
Failures retain text, block unsafe navigation and show recovery/export actions.
No new LocalStorage key, schema migration, content ID or backup format.

## Scripture

Use existing TOPICS reference/context/question mappings, normalize via validRef,
load exact original verses through the Bible loader. Both translations selectable.
For a freely entered concern the person chooses a topic; do not pretend arbitrary
text has been semantically interpreted. Missing resource: honest retry and read
later, never invented text. Sensitive words stay local and never enter logs.

## Tree and motion

Create original local SVG illustrations for all seven existing zero-based levels;
retain the seven names/thresholds, original photos and all branch targets. Share
one rendering module between Today, paths and tree. Layer trunk, foliage, fruit,
ground and light; avoid raster stretching. Larger Today scene, immediate personal
action, generous but bounded mobile height. Explain personal paths at creation
and in contextual help; example content is visibly illustrative, never auto-saved.

Plant/keim is a finite symbolic confirmation after successful persistence, not a
change in the selected actual tree stage. Growth transitions occur only when the
unchanged domain selects a different documented stage. Ambient leaf/light cycles
are finite, user-replayable, paused offscreen/hidden and eliminated by reduced
motion. No permanent JS animation loop, external assets, trackers or sound.

## Acceptance and evidence

Baseline220 units; preserve all content hashes, domain/Store/draft/transaction
authorities. Replace visual-only frozen checks with explicit allowed presentation
files; retain every data contract and selector source. Unit RED/GREEN before new
logic. Browser complete flow/reload/races/quota/other drafts, both translations,
all seven stages/four themes/320,375,390,430,tablet/200%/keyboard/axe/reduced motion.
Real baseline->candidate worker update with synthetic state, offline reload and
failed update rollback. Two byte-identical builds and deterministic deploy ZIP.
Capture actual before/after screenshots, animations and repeatable browser-frame,
idle and payload measurements. Attempt Firefox/WebKit where available and report
any unavailable environment accurately. Physical iPhone/Safari/VoiceOver OPEN.

UX01/02/04 targets8/10 and UX05 mean4/5 require ten actual humans. Provide scripts,
individual blank sheets and aggregate scoring; never populate invented outcomes.
Final decision: CONDITIONAL GO only if technical gates pass and human/device
gates remain open; any critical data defect is NO-GO.
