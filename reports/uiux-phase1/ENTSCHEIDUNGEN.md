# Heute Phase 1 — Entscheidungen und Wartung

Grundlage: vollständig gelesene `docs/UIUX_PHASE1_TODAY_2026-10-16.md`, Branch-Start `00387e1a4d87227b76adc4cf9bf8c7efd5ea6be1`, enthaltene Nachlese-Basis `c2aaa481fe11874c2fff649311e4970c380ab092`. Keine neue Zusammenführung und kein neues Datenmodell.

| Beobachtung im echten Ausgangsbild | Entscheidung | Erwarteter Nutzen | Absicherung |
|---|---|---|---|
| Rückkehrer: Wege-Aktion unten bei y≈731 (390) bzw. y≈679 (320), zusätzlich Wege-Link im Baum | Aktuellen Weg mit konkretem Schritt zuerst zeigen; genau eine Fortsetzungsaktion; Baum ohne zweite Wege-Aktion | Weniger Suche und Scrollen, eindeutiges Ziel | Vorher/Nachher-Messung und identischer Zielweg, Keyboard- und Klicktest |
| Entwurf erst ab y≈1116 (390) / y≈1044 (320) | Kompakter Hinweis direkt nach Schritt bzw. Einstieg, vor Baum | Ungespeicherte Worte werden leichter wiedergefunden | Entwurf unverändert, echter Fortsetzungsdialog, Update-/Reload-Tests |
| Erstbesuch wird als „Neu im Glauben“ angesprochen | Zwei vorhandene Einstiege zuerst; neutrale Erklärung des persönlichen Weges einmal | Anfänger und erfahrene Bibelleser können selbst wählen | Beide Routen sichtbar; bisheriger Anfängerleitfaden bleibt über Orientierung erreichbar |
| Ein Weg erscheint als Baum-Link, Karten-Titellink, Karten-Aktion und Listenzeile | Ein aktuelles Wegziel; Liste zeigt höchstens zwei andere Wege und „Alle Wege“ | Weniger redundante Entscheidungen | Anzahl und Ziel der Links, viele/archivierte Wege geprüft |
| Orientierung, Wegbeschreibung und Erklärung wiederholen sich | Auf der Heute-Seite einmal knapp erklären; bei Rückkehr den vorhandenen Inhalt zeigen | Ruhigere Seite, mehr Platz für persönliche Fortsetzung | Inhalte bleiben an ihren eigentlichen Zielen erhalten |
| Mehrere offene Rückblicke könnten wie Aufgaben wirken | Nur einen tatsächlich fälligen Rückblick einladen, weitere über vorhandene Rückblicke-Seite | Kontinuität ohne Aufgaben-Druck | Vorhandene `gaps()`-Regeln, keine erfundenen Rückblicke |
| App-Neulinge mit gespeichertem Entwurf sind nicht automatisch erfahrene Nutzer | Neutrale Einstiege bleiben oben, Entwurf zusätzlich davor erreichbar | Keine Fehlannahme über App- oder Glaubenserfahrung | Eigener Regressionstest für `draft-only` |

## Grenzen der Änderung

`styles.css`, alle Theme-Tokens und `src/themes.js` bleiben bytegleich. Alle Bibel-, Story-, Kapitelquiz-, Nachlese- und Indexdateien bleiben bytegleich. Ebenso Store, Importvalidierung, Entwurfslogik, Migrationen und Service-Worker-Template. Der neue Build enthält zusätzliche versionierte Module und ein neues Stylesheet; der Worker selbst verwendet unverändert seine bestehende Asset-/Update-Logik.

`home()` liest weiterhin den vorhandenen Entwurf defensiv. Es reicht den normalisierten Store an `selectToday()` und übergibt dessen Ergebnis an `renderToday()`. Die vorhandenen Aktionen `new-path`, `resume` und `gap` sowie bestehende Routen werden weiterverwendet. Es gibt keine neuen Fortschrittsschlüssel, Migrationsregeln oder persistenten UI-Einstellungen.

## Module für menschliche Entwickler

- `src/today-model.js`: reine, schreibfreie Auswahl des aktuellen Weges, offenen Schritts, letzten Gedankens, ersten fälligen Rückblicks und Baumzustands. Nutzt die bestehenden Domainfunktionen; die Zeit kann für Tests übergeben werden. Keine Browser- oder DOM-Abhängigkeit.
- `src/today-view.js`: reine HTML-Darstellung mit dokumentiertem UI-Adapter aus der App. Persönliche Texte werden über den bestehenden Escape-Helper abgesichert. Keine Speicherzugriffe und keine neuen Eventhandler. DOM-Reihenfolge entspricht Darstellung und Tastaturfluss.
- `src/today.css`: ausschließlich `.today-phase1`-Regeln. Verwendet vorhandene Theme-Tokens, natürliche Höhen und `object-fit: contain`; keine CSS-Reihenfolge-Tricks, keine versteckte primäre Aktion und kein Abschneiden langer Schrittexte.
- `src/app.js`: nur der Heute-Adapter und zwei Importe wurden geändert. Der Rest der App bleibt an seinen bisherigen Schnittstellen.
- `index.html` und `scripts/build.mjs`: das neue Stylesheet wird in Entwicklung und versioniertem Build korrekt verlinkt. Das vorhandene Build-Verfahren kopiert `src` und nimmt neue Dateien automatisch in die Worker-Assetliste auf.

Zum Ändern der Priorisierung zuerst einen gezielten Test in `tests/today-page.test.mjs` ergänzen. Bei Layoutänderungen zusätzlich `tests/today-phase1-browser.mjs` und Vorher/Nachher-Screenshots prüfen. Keine Kopie der Baum-, Erinnerungs- oder Speicherlogik in die View einführen. Neue Bereiche werden nicht automatisch in diese Phase aufgenommen.

Die alten Variant-B-Skripte sind historische Layoutvergleiche ihres damaligen Designs. Ihre Anforderungen an den entfernten Baum-CTA sind kein Kriterium für Phase 1. Der neue Today-Browserlauf übernimmt die sieben Baumstufen, Sonderzustände, kleinen Größen, langen Texte und Schriftvergrößerung. Die vorhandenen fachlichen Stabilisierungssuites werden weiterhin ausgeführt.
