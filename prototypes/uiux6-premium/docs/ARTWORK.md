# Original artwork · Phase 6A.2

The premium prototype uses ten original, inspectable SVG source files in `assets/art/`. They were composed directly as vector code by the Codex assistant during the Faithpath Phase 6A.2 session on 2026-10-17. The source geometry, branching layouts, leaf contours, sword details, and book seal were created for this session.

No existing tree photographs, external images, stock illustrations, copied SVGs, traced artwork, third-party templates, image-generation output, external fonts, or remote assets were used. Each file stands alone. All references inside the SVGs resolve to geometry within the same file.

## Asset inventory

| File | Existing stage / purpose | Drawing decision |
| --- | --- | --- |
| `tree-1.svg` | Samen | An opening olive seed, tiny emerging shoot, and first root. |
| `tree-2.svg` | Keimling | A flexible single stem, opposite leaves, and fine roots. |
| `tree-3.svg` | Junger Olivenbaum | First woody division and a reaching, asymmetric branch. |
| `tree-4.svg` | Wachsender Olivenbaum | A taller leader with three distinct, open branch tiers. |
| `tree-5.svg` | Starker Olivenbaum | A strong fork, rounded crown, and wider supporting roots. |
| `tree-6.svg` | Erste Früchte | Arching lateral boughs, a broader crown, and first olives. |
| `tree-7.svg` | Fruchttragender Olivenbaum | A weathered, twisted trunk, deep fork, broad canopy, and olives. |
| `sword-vertical.svg` | Editorial sword alternative | Point-down blade, curved brass guard, oval pommel, and small olive accent. |
| `sword-seal.svg` | Compact sword/book alternative | An open book anchors a fine circular seal, with a small point-down sword. |
| `brand-sprig.svg` | Independent brand ornament | A single olive branch for quiet editorial moments. |

The seven tree files share `viewBox="0 0 480 480"`. The vertical sword uses `0 0 240 400`; the seal uses `0 0 240 240`; the sprig uses `0 0 220 160`. All backgrounds are transparent. The fixed colors are olive `#526b55`, silver sage `#8b9b72`, and muted brass `#b8aa7d`. Fixed colors allow the standalone files to render consistently when loaded with `<img>`; they do not rely on CSS inherited across document boundaries.

Every tree has its own root, trunk, and branch composition. The sequence is not a uniform enlargement of one drawing. It is an alternative visual treatment of the seven existing stages, not a new growth system. The prototype must retain the existing stage names, thresholds, and meaning. These files do not replace or modify the seven production tree photographs, production branch rules, or app code.

## Source and use record

- Source author: Codex assistant, directly authored SVG code in this session, 2026-10-17.
- Source location: `prototypes/uiux6-premium/assets/art/`.
- External source URLs and required image attributions: none used in creating this set.
- Image-model service: none used.
- Intended use: display, adapt, recolor, and distribute the source assets as part of the Faithpath project, subject to the applicable terms for the session's output.
- The provenance record removes an unknown third-party image sourcing chain. It is not a legal opinion, an assertion of exclusive copyright, or a worldwide warranty of originality or clearance.

## Review

All ten files were parsed as XML, checked for self-contained references and the absence of embedded raster images, remote resources, fonts, and scripts, and rendered with the installed Inkscape renderer. A temporary contact sheet was inspected against warm paper and deep olive backgrounds. Review renders were kept outside the project; the deliverables remain the editable SVG sources and this note.

These illustrations are decorative. Where the surrounding interface already supplies the stage name, use `alt=""` for the image. Where the image is the only stage description, supply the existing stage name in the image's `alt` attribute. SVG titles and descriptions are included for direct file viewing.
