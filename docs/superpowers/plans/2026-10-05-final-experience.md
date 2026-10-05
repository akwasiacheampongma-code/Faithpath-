# Final experience implementation plan

Spec: ../specs/2026-10-05-final-experience-design.md. Execute the authorized user request, no Production or main/develop merge.

1. Verify actual Production/develop HEAD; isolated feature branch; snapshot current CHAPTER1 artifact; inspect store/domain/renderer/SW/assets/tokens. DONE.
2. Write pure selector tests RED first. New src/bible-journey.js exports exploredChapters, journeySummary, recordExploredChapter, observeChapterEnd; uses existing events. src/tree-branches.js exports pathEvidence, treeBranches and fixed branchSlots, original paths only. src/themes.js exports THEMES, themeId, applyTheme; settings only. No content/store/domain edits.
3. Implement selectors GREEN; src/experience-view.js renders safe escaped journey hub/book, acknowledgement, tree overlay/list, path facts, theme picker using shared components/tokens.
4. Integrate src/app.js at Bible quiet link, reader final sentinel/acknowledgement and observer cleanup, journey route, existing tree view, path facts, settings picker. Preserve Today, CHAPTER1 and all existing actions. Append scoped component CSS and semantic theme tokens, preserve Light.
5. Meaningful browser tests: reading negative/open-only/quiz-only, exactly-once, completed single-chapter book, offline, real branch IDs/caps/navigation, settings-only theme writes, all surfaces/themes/widths/200%, axe/focus/touch/safe areas, screenshot review. Run existing full regression and actual CHAPTER1 update.
6. Assign EXPERIENCE1 candidate version dated 20261005, content-hash proof, runtime/performance comparison; fresh final gates. Create qa/FINAL_EXPERIENCE_REPORT.md, BIBLE_JOURNEY_REPORT.md, TREE_BRANCHES_REPORT.md, THEME_SYSTEM_REPORT.md, FINAL_EXPERIENCE_REGRESSION.md and downloadable QA bundle/galleries. Commit feature branch; no Production. Final PASS only after all requirements verified, otherwise BLOCKED with concrete limitation.
