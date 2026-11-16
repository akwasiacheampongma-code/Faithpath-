# Ausdrückliches Kopieren mit manuellem Rückfall

`CopyPassage` erhält ausschließlich eine geprüfte `Reference`, optional `onFocusChange` und optional `label`. Der Text kommt unverändert aus `formatBibleCopy`; die Komponente importiert keinen Appstore und schreibt weder Lese-, Lern- noch Wachstumsdaten. Der Integrationsbesitzer hat `expo-clipboard ~58.0.4` installiert; dieser Teil hat keine Pakete oder Lockfiles geändert.

## Verhalten

- Der Standardbutton heißt `Bibeltext kopieren`. `Bibeltext kopiert.` erscheint erst, nachdem das tatsächliche Plattformversprechen erfüllt wurde.
- Web verlangt einen sicheren Browserkontext und `navigator.clipboard.writeText`. Der Adapter wartet auf genau diesen Aufruf. Er nutzt keine versteckte Ersatz-API und fragt keine Berechtigungen selbständig ab.
- Der native Adapter wartet auf `ExpoClipboard.setStringAsync`. Ausschließlich `true` ist ein angenommenes Ergebnis; `false`, ein fehlender Erfolgswert oder eine Ablehnung führen zum Rückfall.
- Bei Ablehnung oder fehlender API zeigt eine zugängliche Card einen schreibgeschützten mehrzeiligen Text mit dem Label `Bibeltext zum manuellen Kopieren`. Sein `value` ist exakt derselbe String wie beim fehlgeschlagenen Aufruf. Der vollständige Inhalt bleibt im scrollbar begrenzten Feld erhalten. Der Hinweis lautet: `Automatisches Kopieren ist hier nicht verfügbar. Markiere den Text im Feld und wähle „Kopieren“.`
- `Kopierfeld schließen` schließt den Rückfall und gibt dem auslösenden Button den Fokus zurück. Das vorhandene React-Native-`selectTextOnFocus` bietet Auswahl beim Fokussieren; es wird kein vermeintlicher plattformübergreifender Auswahlbutton angeboten. Native Auswahl- und Rückfokuseigenschaften benötigen weiterhin eine tatsächliche Geräteprüfung.
- Ungültige Referenzen zeigen einen endlichen verständlichen Fehler statt eines unvollständigen Kopiertexts: `Diese Bibelstelle kann nicht kopiert werden. Öffne eine gültige Stelle.`

Jede Referenz besitzt eine eigene Komponenteninstanz. Eine Anforderung merkt sich ihre Generation; nach Referenzwechsel, Unmount oder Routenblur darf ihr verspätetes Ergebnis keine Erfolgsmeldung und keinen Rückfall mehr öffnen. Bereits geöffneter Rückfalltext wird bei gewöhnlichem Routenblur einer beibehaltenen Instanz nicht gelöscht. Beim erneuten Fokussieren ist eine neue bewusste Anforderung möglich. Ein bereits an das Betriebssystem übergebener Schreibaufruf lässt sich durch diesen UI-Schutz nicht nachträglich abbrechen.

## Tatsächlich ausgeführt

`npx vitest run tests/clipboard.test.ts tests/reader-selection.test.ts` bestand mit **2 Dateien und 17 Tests**. Die sechs neuen Adapterfälle prüfen:

1. Unveränderten Web-Kopierstring und ein bewusst offen gehaltenes Versprechen: vor Annahme kein Erfolg.
2. Fehlendes `window`, unsicheren Kontext, fehlenden Navigator und fehlende Clipboardfunktion ohne Schreibversuch.
3. Abgelehntes Versprechen und synchron geworfenen Browserfehler.
4. Unveränderten Expo-Kopierstring und ein bewusst offen gehaltenes Versprechen, das erst mit `true` erfüllt.
5. Expo `false` und fehlenden Erfolgswert als Fehler.
6. Expo-Ablehnung als Fehler.

Der begrenzte TypeScriptlauf bestand:

```sh
./node_modules/.bin/tsc --noEmit --ignoreConfig --strict --noUncheckedIndexedAccess --resolveJsonModule --esModuleInterop --moduleResolution bundler --module esnext --target es2022 --jsx react-jsx --skipLibCheck src/features/bible/clipboard/CopyPassage.tsx src/features/bible/clipboard/writeText.ts src/features/bible/clipboard/writeText.web.ts tests/clipboard.test.ts
```

Der parallel ausgeführte Gesamtaufruf `npm run typecheck` endete mit Status 2, ausschließlich wegen des damals noch auf 8 festgelegten Nutzdatenwerts in `tests/e2e/invitations.spec.ts:27`. Die neuen Clipboarddateien hatten keine TypeScriptfehler. Die endgültige Gesamtprüfung liegt beim Integrationsbesitzer.

Diese Fälle verwenden gemockte Plattformaufrufe. Sie belegen den Adaptervertrag, keine erfolgreiche Browserzwischenablage, Gerätezwischenablage, native Textauswahl oder Screenreaderbedienung. Echte Browser-Clipboard- und Rückfallprüfungen werden im getrennten Integrationslauf durchgeführt. Die Generation-/Fokuswache ist hier als Quellverhalten dokumentiert und wurde nicht als nativer Lauf ausgegeben.

## SHA-256

| Datei | SHA-256 |
| --- | --- |
| `src/features/bible/clipboard/CopyPassage.tsx` | `473c18bd2e93e4baadb29c5ca1e14abbfac1c0f6c3a83216451440e093a88559` |
| `src/features/bible/clipboard/writeText.ts` | `385880df64e4943b1d550c2f37328b15c99898f5095000f94ed1e5b1cc1059bf` |
| `src/features/bible/clipboard/writeText.web.ts` | `d029049fa0953aef707401764f147b7208939b1e66352e98804dacb1570aac1f` |
| `tests/clipboard.test.ts` | `5893e02709fb891d351beb0f73730faf67192550046c14eb39c6eb3aa4a06c98` |
