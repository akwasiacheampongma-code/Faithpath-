> Historical materialization snapshot. The four review cases below have since been resolved. Current results: [FAITHPATH_REVIEW_DECISIONS.md](FAITHPATH_REVIEW_DECISIONS.md) and `faithpath-preflight.json`.

# FaithPath/Nachlese — materialization and preflight

Source branch: develop/v4; original commit 5f6c597916a5854f83085538ae345ff4c2d629dc. Dry runs completed before writes. No editorial whole-catalog recheck, production deploy, remote push or main merge.

- 1,560 FP questions and stable IDs, 2,314 retained N IDs, 435 canonical DOCX story definitions.
- Derived flow: 436 stories, 256 verified FP links, 95 word-equal duplicates shown once.
- 92 EXAKT, 74 SINNGLEICH, 86 FAITHPATH_ONLY story questions assigned without inventing N IDs; four historical KONFLIKT cases resolved.
- 145 HIGH links processed, one HIGH held; 25 MEDIUM verified, three MEDIUM held. 40 mixed-block questions remain chapter quiz. Total separate chapter quiz: 1,300.
- Five exact final-field edits and 1,736 exact-verse expansions, including 1,707 documented block reconstructions and 29 mixed-block expansions. Correct indices, references, legacy IDs and reflections unchanged.
- Final source-bound validator: PASS; qa_evidence_gaps=0, unmaterialized_corrections=0. Four semantic mapping conflicts remain, so content_conflicts=4 and gate status BLOCKED.

Unwritten mappings:

| FP ID | Proposed N ID | Reason |
|---|---|---|
| FP-0120 | N-1466 | Healing outcome versus Jesus command/father response |
| FP-0147 | N-1536 | John 10,11 versus John 10,12; no reference overlap |
| FP-0151 | N-1544 | Man name versus place of origin |
| FP-0239 | N-1761 | Why Herod was struck versus description of the event |

The models are prepared in separate data files. A new reader integration and separately versioned local build remain pending; the immutable F publish files are unchanged. Status is not READY_FOR_RELEASE_GATE.

Machine-readable outputs: faithpath-nachlese-materialization.json, faithpath-nachlese-story-merge.json, faithpath-nachlese-mapping-verification.json, faithpath-preflight.json and faithpath-validator-results.json. Source copies, hash manifest and source-bound baselines make the audit reproducible. The local after-commit SHA and exact changed-file list are recorded in /workspace/faithpath-materialization-20261001/completion.json.
