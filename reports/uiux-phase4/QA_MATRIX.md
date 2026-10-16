# Finale automatisierte QA-Matrix

Build FP4-20261016-G-STABLE1-UIUX4; Code 3e3ebc8. 174 Unit-Tests, 984 Browserfälle, 8 zusätzliche Update-Prüfpunkte. Ausschließlich synthetische Testdaten.

| Suite | Fälle | Ergebnis | SHA-256 der Ergebnisdatei |
|---|---:|---|---|
| core | 12 | PASS | `23bd8b53b94e58958b87977e3bb9ae7130b2c0ba144106be84acbbe1e1a875e1` |
| stabilization | 12 | PASS | `8ad502c80fed9d6f27c0d31ecdb60a55d34e571065e9e5b47e6b1bfb4e222f32` |
| chapter | 17 | PASS | `3d172df5712ff59506438f449f2a6f8b1ce8e3bbdbe40b60c69d125f4fb4428b` |
| nt | 24 | PASS | `fadc00af0d9cbb7336d80d232d77ddaccab0b34e48e49089ee7bd7efb279689d` |
| nachlese | 36 | PASS | `06f299bd2216938e1194f71ae0d3abf7cbd065dfa11f0a6e789e62ac183cc929` |
| mc-fixtures | 6 | PASS | `06cd61c3dd5b9df2f69838ffcf2933e324a3df43ace56f7775f2d8f18b1b299f` |
| worker | 3 | PASS | `8822b5695980142ddf9640b62aaece403ab6eb75a38c3365c4f58573d7f26ade` |
| today | 130 | PASS | `414e79a14c36dbe7a71f7f1f0889653aa3d04a861459e30d7e294ab01ceffd4c` |
| today-zoom | 2 | PASS | `8265faf8245d131a5e1b853f1a0888e694d5fc4f46ac9e7ad0c6027ee8b20e68` |
| phase2 | 24 | PASS | `46879283bc0e3d3a3a028d778684845f0bb44b9b62608542132382b70806b88e` |
| phase2-stress | 40 | PASS | `df1446ad0c21970845c49d5d22d06d17c6e7299deedc872ae21310e4c3dc7329` |
| phase2-short | 12 | PASS | `d8cef56f31ac1c8fc13a5b55cb315ba6fcb76e35347c62b441ce7c59cbd5343c` |
| experience | 18 | PASS | `e05d39f0aa8e0170b4a92eaa3b52725b43ce0900fc2d125aa795121aa4f29902` |
| core-depth | 15 | PASS | `59ad6bfd05248a6c30fb73454ff5746e6ee43dd7d6ea6619e1105120b24db888` |
| core-axe | 15 | PASS | `72066f90bd47e7c511bdaf29c6f38e440a476ed831a660a41c3bc5c86ef70a94` |
| continuity | 24 | PASS | `8efacc7e61d35bf832bed9d599ac4c8ddd49a6632b6cee568e1d928c687cc6fe` |
| branches | 56 | PASS | `0c7dda59bded2e1af1e75bbfdb379c7a76baf20f30100e76553d6b6cd4360597` |
| overview | 56 | PASS | `bacefa60f78efc7ff47a0fda46580f3f138ec1eb4eb5d24393b574a6b1cc2d21` |
| detail | 32 | PASS | `1c062b9d8af533ea7b4fcc9290e7947dbe0f16ca4960dc273a259186d9fd2fe1` |
| tree | 72 | PASS | `f565a18d95d9defe1c122e227ce58a7b6ef973b1435d4c4b749edc5d002ab597` |
| reviews | 72 | PASS | `a5bfcd20b980a09ba62642e022c76a446179101b242abae4d04811d6f6879295` |
| short-navigation | 20 | PASS | `e000071ea11adafd89418f98466bd54ac7cb34267219af5edef2350ef390cff5` |
| stress | 60 | PASS | `5449e71d2bc6fe3fe60ed596a03c6eeb0e73900839f2dc9344e266fe2dfa4020` |
| journey | 2 | PASS | `0fd5c99e10c790c6d8685ccb09b02825c28c1c58a26d7fe348a046ef17aff8ab` |
| navigation4 | 48 | PASS | `1568cd44a760d8c4424245abfe2f2ceb0e0117e132bed16f1d42c8c42eebb840` |
| discover4 | 64 | PASS | `d6433825dada1588fdb482d0cecde013e582f846c73afd1f0aaf9a9f58ad1768` |
| onboarding4 | 64 | PASS | `91742a0a14b6042c6f103f171903930606c4627b7880cf4005b4c1b97b7a3c82` |
| routes4 | 11 | PASS | `0bbf248ac370a60af53be21db4e55453a355c1383351336315c7f53720314674` |
| focus4 | 4 | PASS | `3b4537b57589e712b162ef77887df223d237c31182a7c5d5b75c29a00756fd66` |
| historical-modernized | 19 | PASS | `229ca0dbe947b7fe37a20f610b7eb93943aa7665e297908c11bf4b5ce030c0a5` |
| boundaries4 | 2 | PASS | `8b1a4f3bd31e481c0c690c2d8fa6c48ebdeea47a08b9dd33849abb56b128b717` |
| stress4 | 12 | PASS | `427527411a09013a049d2dc551a70ffd711e152533084b0bdac04fa07adda765` |

344 Deep-Link-Aufrufe sind innerhalb von routes4 enthalten. 104 echte Vorher/Nachher-Paare bei vier Bildschirmgrößen in Hell/Nacht; vier Themes zusätzlich in den Funktionsmatrizen. Physische UIUX1–4-Gates OFFEN.

Erste RED-/Baseline-Protokolle enthalten absichtlich reproduzierte Probleme oder überholte historische Erwartungen. Der erste Regressionstreiber meldet zwei inzwischen korrigierte Titel-Erwartungen; finale Core- und Worker-Vollwiederholungen sind in den hier gehashten Dateien grün. Keine fachliche Datenassertion wurde entfernt.
