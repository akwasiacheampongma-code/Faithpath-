# Persistent and content contracts

Phase7 does not change a persistent key, schema, migration or backup format.
`scripts/check-contracts.mjs` compares source authorities, all data/tree files
and all styles with exact accepted commit `7d24aea...`. Historical content
validators independently compare editorial evidence and approved masters.

| Key | Existing purpose |
| --- | --- |
| `faithpath.v1.rebuild` | Main Schema V5 JSON, including settings, quiz, reading, paths and guided plans |
| `faithpath.guidedPlans.v1` | Legacy plan source, retained for existing migration |
| `faithpath.onboarding.v4` | Current onboarding marker |
| `faithpath.onboarding.v3` | Legacy marker |
| `faithpath.backup.pre-v5` | Existing migration safety copy |
| `faithpath.backup.before-import` | Pre-restore main/plan safety copy |
| `faithpath.draft.v4` | Existing single draft `{type,args,values,saved}` |
| `faithpath_journal_write_pending` | Existing durable journal/draft coordination record, not a new Phase7 key |

## Mutation and failure rules

- `createStore` preserves unknown fields. Local legacy normalization and strict
  imported-data validation are different contracts. Do not make import permissive
  just to accept a corrupt source; never silently drop entries.
- Store transactions clone, compare original persisted bytes, persist successfully
  and only then publish new in-memory state. A quota/access failure must not claim
  success. Stale tabs must reload before exporting or writing.
- Restore validates first and preserves a safety copy before replacing main data.
  The UI performs file preview and a separate explicit confirmation. The preview
  is bound to exact main/draft bytes and invalidated by close/navigation/new files.
  Restore rechecks after the asynchronous lock wait. A read-only backup check
  never gains restore authority.
- `journalTransaction` uses the shared Web Lock plus a durable recovery record.
  Its mutation callback is evaluated twice: allocate UUIDs/timestamps **before**
  it, and make it deterministic. Interrupted writes recover exact known bytes;
  an unrelated newer draft blocks recovery rather than being overwritten.
- Missing/corrupt/denied storage displays the existing recovery/error UI and offers
  explicit raw backup. It does not authorize automatic reset or repair.
- Web Locks serialize cooperating journal/draft writers where available. Generic
  Store transactions use synchronous compare-before-write. LocalStorage has no
  multi-key or cross-process CAS; truly simultaneous independent writers cannot
  receive a universal serializability guarantee. This residual risk is explicit.
- Personal data stays local and unencrypted. Browser eviction/device loss cannot
  be recovered without an external backup. A download request does not prove that
  the operating system saved the file.

## Identity and history

Preserve all record and question IDs, stable quiz completion keys, path links,
archived records, journal/reflection mirror identity and original snapshots.
Do not recreate a historical source by matching prose. Live links are validated;
detached historical `sourceKey` references may legitimately outlive their source.
Bible-note-role deletion and physical journal deletion are distinct operations.

Tree development uses only the existing explicitly confirmed records and seven
thresholds. Reading, quizzes and completed steps do not award development. The
sword shows documented unique explored chapters, never spiritual worth.

## Content and export

Both offline Bibles, stories, 2,314 Nachlese questions and 1,300 approved NT chapter
questions are unchanged. No final AT source is inferred or added. Source content
hash stays `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`.
The build removes only an unused generated duplicate of the same Bibles.

Main exports retain the existing application/schema/data/guided-plan envelope;
raw recovery and draft exports remain distinct documents. No demo backup model
or replacement storage system is introduced.

The only new historical-digest compatibility record is the exact old/new
`package-lock.json` pair for development-only ESLint10. The accompanying test
proves every prior package record unchanged and all77 additions development-only.
It does not exempt content or arbitrary future lock changes. Editorial manifests
remain byte-identical; pre-existing Store compatibility remains unchanged.
