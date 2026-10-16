# Finale QA-Matrix UIUX5

180 Unit-Tests, 993 Browserfälle in 33 Suiten, zehn zusätzliche Update-Prüfpunkte. Anwendungscode e33c139ca46090cdeb74d82b91e20797f0273071. Ausschließlich synthetische Daten.

| Suite | Fälle | Ergebnis | SHA-256 der Ergebnisdatei |
|---|---:|---|---|
| core | 12 | PASS | `23bd8b53b94e58958b87977e3bb9ae7130b2c0ba144106be84acbbe1e1a875e1` |
| stabilization | 12 | PASS | `3556e3bc719e5d769edd761ee03a57273bc0b9be591d332165584d77281d737d` |
| chapter | 17 | PASS | `97c2bbb93958a4b81296f52a5f48a11d7ad75fd075c2fa056721a51a29e0bfdd` |
| nt | 24 | PASS | `aeda0578902888febb83974923dfd3be00bd036413c2a2c0c302133ce819e65b` |
| nachlese | 36 | PASS | `166b41958b06d4651daf837d35de8baf2172bd9c2998bb24b5d3c65df12af986` |
| mc-fixtures | 6 | PASS | `9376843b02e52060ac10bb8445785092c3c2ece4385300d682d918b031df333c` |
| worker | 3 | PASS | `8822b5695980142ddf9640b62aaece403ab6eb75a38c3365c4f58573d7f26ade` |
| today | 130 | PASS | `2f2dfd9e05d1af2643761ba2b80b934e8d1fb460acb6a6e8f93552fe13fc4423` |
| today-zoom | 2 | PASS | `28d2d3262e1a054d57a9073f6caf386ff066c727a0794819fbde51842f8625d0` |
| phase2 | 24 | PASS | `ad6776bfbb3887f380375977b0d02ab728427e61406adb4c8f3e412c0d338785` |
| phase2-stress | 40 | PASS | `df1446ad0c21970845c49d5d22d06d17c6e7299deedc872ae21310e4c3dc7329` |
| phase2-short | 12 | PASS | `d8cef56f31ac1c8fc13a5b55cb315ba6fcb76e35347c62b441ce7c59cbd5343c` |
| experience | 18 | PASS | `07d80b52a244687f4a36471001667dd95666d4d96dd2c26dd2e21882a2d38c73` |
| core-depth | 15 | PASS | `59ad6bfd05248a6c30fb73454ff5746e6ee43dd7d6ea6619e1105120b24db888` |
| core-axe | 15 | PASS | `72066f90bd47e7c511bdaf29c6f38e440a476ed831a660a41c3bc5c86ef70a94` |
| continuity | 24 | PASS | `6c0742cb4a0949881ee7dd7e2a68f4568f21bd1a290691a045d3639de10d8a8b` |
| branches | 56 | PASS | `a862475e15e84342465f7285f7ee01027386d6adc30b7c362bb8803fd8a1ee9b` |
| overview | 56 | PASS | `12313b6ffd1bc63d319d7e5dbb406494c5c31f9aaeeade2798d4ca8d59050ee2` |
| detail | 32 | PASS | `a320eb0c10bb34db8dcf22d50b43eaf1e8485a04c1bbee75d4229398380053ca` |
| tree | 72 | PASS | `ea78b6d7953418b00322721c485838140c2297e48eab0500fd29a0d5d913733d` |
| reviews-original | 72 | PASS | `8d399f3fe215a7d7352f2317ae14809dc07261904cf4e8284aaa9407e0a5754e` |
| short-navigation | 20 | PASS | `a050b12ac5b71d5f6816a1b92df3572ac6322b980622f7131a02715daa49d303` |
| stress-original | 60 | PASS | `5449e71d2bc6fe3fe60ed596a03c6eeb0e73900839f2dc9344e266fe2dfa4020` |
| journey | 2 | PASS | `0fd5c99e10c790c6d8685ccb09b02825c28c1c58a26d7fe348a046ef17aff8ab` |
| premium-journal | 12 | PASS | `85d891750e933ba7be65a1594299028f45058bb89128ec19dcf64019cee9641c` |
| final-notes | 11 | PASS | `81dc55d1ebfe28272c0cc1487482030f5a8d70a9c7efed65b75f8503164313fc` |
| journal5 | 54 | PASS | `ba34a51e83c650ea7a0e7524b386f248c25ebeaaa1036c2110af1c85d6ba8c4f` |
| reviews5 | 48 | PASS | `f27927f0fb9b6368c302a7d96191af56099de1249587cbdcceb14e1943932c30` |
| reminders5 | 15 | PASS | `343e7d64c578d395086c42b9df8bde767627230284f898da01579e2b1b9f1587` |
| backup5 | 29 | PASS | `47261e9cf6413a7c76ffe2ab842e395f9c508e55d11383e6167c9e59e98631ca` |
| backup-races5 | 4 | PASS | `fa62f4821f7de68a606a823aa8da8f5d7c237d228d0714514de68261bbac9ae4` |
| stress5 | 36 | PASS | `cd70e722959cffff0ef85b7fc3c484351c061d4914db8b4e14b5c4960c2230f0` |
| backup-dialogs5 | 24 | PASS | `6e6bce430fcf0983f7a48f69a9ae99092d6681f1e0378b23030691a84a1b2cc6` |

144 Vorher/Nachher-Paare, 288 Original-PNGs. Code und Content-Hashes siehe qa-summary.json. Vier unabhängige Review-Racefälle sind vor Korrektur FAIL und nach Korrektur PASS; initialer Vor-Fix-Regressionslauf wurde abgebrochen und zählt nicht als Endnachweis.

Physische UIUX1–5-Gates OFFEN; UIUX4 ist nicht in diesen eigenständigen Build integriert. P3: generischer/alter Filter-Summary-Text, funktional korrekte Ergebnisse. Keine bekannten offenen P0/P1/P2-Blocker im geprüften Kandidaten.
