# Third-party notices

Bible text: Luther Bible 1912, eBible.org, Public Domain.
Source: https://ebible.org/deu1912/copyright.htm
Archive: https://ebible.org/Scriptures/deu1912_usfm.zip
The archive is retained at `assets/deu1912-source.zip`. Import removes USFM layout/Strong's annotations, not Bible words.

DM Sans and Cormorant Garamond: SIL Open Font License 1.1.
Full notices: `assets/fonts/DMSans-OFL.txt`, `assets/fonts/CormorantGaramond-OFL.txt`.

Expo and React Native ecosystem: individual package licenses remain in their installed packages and lockfile-resolved distributions. Initial package metadata was based on the official Expo blank TypeScript template (0BSD).

Biblical art: eight OpenAI image generation outputs; provenance and release-review status are in `art/manifest.json` and `docs/04-art-direction-and-rights.md`.

Book-sword pilots: original OpenAI image generation outputs for John and Genesis, plus a separately generated Romans reference edit of the project-owned John master. The unchanged masters, complete prompts, SHA-256 hashes, technical derivatives and review status are in `art/swords/`; `runtime-index.json` links all active delivery records. Romans preparation remains under `romans-grace/`, Genesis under `genesis-beginnings/`, with exact Luther 1912 source verses and pending independent specialist/public product-release review. Genesis uses seed/seedling symbolism and a wooden grip; no external reference image was supplied to its generation. This is artistic symbolism, not an archaeological reconstruction. Provider terms and public-release review apply; no general release approval is implied.

A51 olive tree: seven original PNG masters, 21 original WebPs and the reviewed mathematical/WebGL engine from the project owner's FaithPath work. Reuse in OLIVA is explicitly authorized by the project owner's instruction of 2026-11-06. Exact commits, original files/hashes, original prompts, adapted files and PNG derivatives are recorded in `art/a51/` and `docs/09-a51-integration.md`. No separate open-source license for this inherited material was found; it is excluded from OLIVA's MIT grant. Public redistribution and inherited image-generation rights review remain pending. No FaithPath user data, navigation, storage or progression code is included.

FaithPath NT study catalog: 1,300 original questions in 260 chapters across all 27 New Testament books. Exact original source and final master are frozen with hashes in `content/faithpath-nt/provenance.json`. These inherited texts, including the generated catalogs `src/data/nt-catalog.json` and `src/data/nt-index.json`, are excluded from OLIVA's MIT grant. The integration is authorized by the project owner; no general content redistribution license or independent theological review is implied. See `content/faithpath-nt/RIGHTS.md`. Editorial explanations and answer keys are distinct from the Luther 1912 Bible text.

FaithPath/Nachlese story catalog: 436 original units, 2,479 primary question elements and 436 reflection prompts, with 95 separately preserved original question variants. The unchanged compressed sources and original hashes are recorded in `content/faithpath-stories/provenance.json`. These inherited editorial texts and the generated `src/data/story-index.json` and `src/data/story-questions.json` are excluded from OLIVA's MIT grant. The owner expressly authorized the integration and approved its visual design; this does not imply a general content redistribution license, independent theological/historical review or public product-release approval. See `content/faithpath-stories/RIGHTS.md`. No new retellings or explanations are represented as original source content.

FaithPath life topics: 18 original topics with 45 Bible references, editorial contexts and voluntary reflection prompts. The original source bytes are archived under `content/faithpath-topics/`; their original texts and the normalized `src/data/life-topics.json` are excluded from the software MIT grant. This Master-scope transfer grants no general public redistribution or independent theological approval. See `content/faithpath-topics/RIGHTS.md`. Supplemental OLIVA context must be separately labeled; no original durations or prayers are invented.


## GitHub-Sicherung ab 08.11.2026

Der Projektauftrag vom08.11.2026 beauftragt ausdrücklich die nachträgliche GitHub-Ablage der OLIVA-Stände0.5,0.6 und0.7 wie bei0.4 sowie die Sicherung folgender Versionen. Das bestehende Zielrepository `akwasiacheampongma-code/Faithpath-` ist öffentlich. Diese Quellenablage erweitert keine MIT-Ausnahme zu einer pauschalen Weiterverwendungslizenz für A51 und ersetzt keine unabhängige Inhalts-, Rechte- oder Storefreigabe. Die Web-Vorschau bleibt eigentümerprivat; eine öffentliche Website-/App-Veröffentlichung ist damit nicht beauftragt.

Current spiritual symbol: one unchanged project-generated sword illustration is reused in the Bible hub as a static symbol of God's Word (Ephesians6:17). It has no book selection, reading-progress or reward function. The former book-sword records above are historical; all original art/provenance remains preserved. The one active512pxPNG and exact source hashes are documented in `art/spiritual-sword/runtime.json`; former runtime files are archived byte-for-byte under `art/swords/historical-runtime-assets/`. Provider terms and pending public product-release review continue to apply.

## Password protection dependencies

Expo Crypto 58.0.7 supplies secure random bytes and authenticated AES on Android and iOS. Noble Hashes 2.4.0 supplies PBKDF2 on those platforms. Both are distributed under MIT. The web implementation uses the browser Web Crypto API.

### Expo Crypto

```text
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Noble Hashes

```text
The MIT License (MIT)

Copyright (c) 2022 Paul Miller (https://paulmillr.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Open Translation Bible · Deutsch

Open Translation Bible (OTB), Deutsch (de-DE) · © OpenBible. Der Text und seine OLIVA-Importdateien stehen unter [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Die Verswörter werden unverändert übernommen. Markdown-Zitatzeichen und Trennlinien werden für die Anzeige entfernt. Anmerkungen werden separat angezeigt. Namensnennung, Lizenzlink, Kennzeichnung von Änderungen und Weitergabe unter derselben Lizenz gelten für Bearbeitungen des Textes. Der App-Code behält seine eigene Lizenz. [Originalquelle](https://github.com/OpenTranslationBible/open-bible/tree/31d411ac1c2d277242a3bd85697f354eaa11526b/lang/de-DE) · [Bedingungen](https://openbible.uk/en-GB/terms-and-conditions/) · [Nachweis und Import](content/open-bible-de/README.md)
