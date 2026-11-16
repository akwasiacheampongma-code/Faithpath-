# Lesefokus: tatsächliche Scroll-Zeitlinie

Der erste vollständige 0.13-Kandidatenlauf bestand 125 von 126 Fällen. Der Fehlfall erwartete nach einem unmittelbaren DOM-`scrollIntoView` des letzten Verses den maximalen Scrolloffset. Der unveränderte Fall bestand anschließend isoliert mit sämtlichen Text-, Fokus-, Axe- und Fortschrittsprüfungen: 1/1, 12,1 Sekunden.

Die Beobachtung erklärt den ursprünglichen Offset. Im dunklen Modus bei normaler CPU erreichte der DOM-Sprung zunächst das Maximum 6814. Die echte spätere React-Native-Restaurierung rief anschließend `scrollTo({y:6611.546875,animated:false})` auf und ließ 202 Pixel bis zum Ende. Shell, Unterabstand, Textabsätze und Quellenzeile entsprechen der 0.12; es gibt keinen neu hinzugefügten Footerüberhang.

| Tatsächlich ausgeführte Eingabe | Fälle | Beobachtung |
|---|---:|---|
| Direkter DOM-Sprung zum letzten Vers | 6 | Fünf erreichen das Ende; ein normaler CPU-/Dunkel-Fall wird von der späteren Restaurierung versetzt |
| Einzelne echte Mausradgeste | 4 | Alle erreichen das Ende; in diesen Beobachtungen erfolgt die Restaurierung vor der Radzustellung |
| Echtes Tab, dann einmal End oder Strg+End | 8 | Alle erreichen das Ende, auch bei währenddessen gemessener Restaurierung |

Die tatsächlichen Rad-/Tastaturereignisse wurden als `isTrusted` beobachtet. Eine verlorene reale Benutzerabsicht wurde nicht reproduziert. Das ist keine Aussage über alle möglichen Gerätetimings. Die künstliche CPU-Drosselung in Chromium ist eine Browserdiagnose, keine Prüfung auf einem Smartphone oder Simulator.

Es gab keine Runtimeänderung. Alle 327 eingefrorenen Dateien wurden nach den Beobachtungen erneut geprüft. Die Testkorrektur verändert ausschließlich `bottom()`: realen festen Ausstieg fokussieren, mit Tab tatsächlich in den Reader wechseln, Fokus innerhalb des Readers prüfen und End drücken. Die ursprüngliche exakte Endposition, erreichbare feste Toolbar, vollständiger Bibeltext, Axe-Prüfung und unveränderter Fortschritt bleiben erhalten. Keine beliebige Wartezeit und keine aufgeweichte Endassertion. Der gezielte Lauf aller Lesefokusfälle wird separat unter `targeted-results.json` erfasst.

Die archivierten Runner verwenden das vorhandene Chromium und lokale Server mit eigenem zufälligen Port. Sie beobachten echte DOM-Geometrie in einem begrenzten `requestAnimationFrame`-Zeitfenster. Der `scrollTo`-Beobachter delegiert unveränderte Argumente und Rückgabewerte an die originale Methode. Keine gefälschten Positionen, Ereignisse oder Workerantworten.

Der gezielte Abschlusslauf aller drei Lesefokusfälle besteht: **3/3**, keine Skips, instabilen Ergebnisse oder Wiederholungen, 21,1 Sekunden. Das erste Hell-/Dunkel-Szenario besteht in 9,3 Sekunden. Die Runtime-Freezeprüfung wurde danach erneut erfolgreich durchgeführt. Der vollständige 126er Lauf wird durch Root separat ausgeführt und hier nicht vorweggenommen.
