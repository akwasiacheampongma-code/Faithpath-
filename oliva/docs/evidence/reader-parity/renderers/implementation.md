# Renderer range selection and passage focus

Implemented on `feature/oliva-reader-parity-20261110`, starting from the immutable `a6f8250` baseline. This note covers source and unit verification only; it assigns no new app version or overall reader acceptance.

`FlowTextProps` and the legacy adapter accept optional `selectedVerses?: readonly number[]` and `focusRange?: Readonly<{ from: number; to: number }>`. Supplying `selectedVerses`, including an empty array, controls selected backgrounds and accessibility state. The existing `selected: number | null` remains the sole inline action anchor. The integrated multi-verse mode supplies `selected=null` and owns its single action surface outside the paragraphs.

All three adapters preserve verse strings, numbers, spacing, bookmark glyphs, and paragraph projection. Focus adds no text or glyph. A focus background uses `#e8edf0` in light mode and `#293b43` in dark mode; selected state and saved highlight colors take precedence. Focus, highlights, and bookmarks remain named in accessibility labels. Text outside focus retains its normal color. Numeric contrast checks and unchanged contract-source hashes are recorded in [source-checks.json](source-checks.json).

Web verse actions use a React `useId` prefix per renderer instance for both the actual wrapper `id` and matching `aria-controls`. Existing test IDs, Enter/Space activation, per-verse tab stops, and `focusVerse` remain. Range selection and focus only change presentation, so they do not invalidate text geometry. Changing the existing inline single-verse action anchor requests real geometry again. The native adapter still relies on `onTextLayout`, measured paragraph origins, and its original unavailable fallback; there is no character-width estimate.

Checks performed:

- `npm test -- --run tests/reader-flow.test.ts`: passed, 11/11. This existing suite verifies all 31,102 canonical verse strings and exact offset ranges, plus real-line mapping and failure behavior.
- `git diff --check`: passed.
- First shared `npm run typecheck`: no renderer errors; concurrent work reported `personal/model.ts` passage-union handling and the V8/V9 invitation fixture.
- Second shared `npm run typecheck`, after adding the footer: no renderer/footer errors; concurrent work reported the pending `clipboard/CopyPassage` module, required `CaptureContext.label` in `SelectionTools`, and the V8/V9 invitation fixture.

No implementation-mirroring unit test was added for background/ARIA prop projection. Real browser interaction and retained-reader ID checks belong to the integrated acceptance run. No native device, simulator, or screen-reader run is claimed.

## Footer extraction

The new `src/features/bible/ReaderFooter.tsx` exports `ReaderFooter` and `ReaderFooterProps`. It takes `reference`, `done`, `busy`, `onComplete`, optional `pathId`, optional `question`, optional `relatedPath: { id; title }`, `mode`, and `celebrate`. The caller retains the read-confirmation operation and controls whether reading focus hides the footer.

The extracted JSX returns a fragment and retains the existing footer texts, element order, styles, path return, progress art, deep-mode question, NT chapter prompt, and related-path CTA. Copyright stays in the screen. Book progress and catalog/adjacent-chapter lookups are local to the footer. The NT prompt imports the lightweight chapter index, not the question bank. Opening a full chapter drops passage/path parameters; full-chapter and adjacent-chapter navigation preserve the current reading mode. This extraction changes no confirmation scope or persistence behavior.
