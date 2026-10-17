# Unabhängiges lesendes Code-Review

Ein separater Review-Agent untersuchte den tatsächlichen Diff von `fc9e5b9` bis zum Kandidaten und prüfte eigene synthetische Browserfälle. Kein Schreibzugriff, kein Commit und keine Veröffentlichung durch den Reviewer. Dies ist eine unabhängige Agentenprüfung innerhalb derselben Arbeitsumgebung, keine externe menschliche oder physische Geräteabnahme.

Im zunächst geprüften Stand418e27d wurden keine P0/P1- oder Datenintegritätsfehler gefunden. Zwei P2-Bedienfehler waren nachweisbar:

1. Bei320×420 und200% Schrift verdrängte ein332,61px hoher Schreibheader fast das ganze Textfeld. Sichtbarer Bereich71,39px bei78,4px Zeilenhöhe. Alte `#dialog`-Regeln übersteuerten das neue Design. Eine erste Flexkorrektur ließ den Titel auf0px schrumpfen und wurde deshalb verworfen.
2. Im Vollbild fehlte die obere Safe-Area-Reserve. Bei simulierten44px begann Speichern bei30px. Eine erste Korrektur rechnete den Sicherheitsabstand doppelt an; im kombinierten Stressfall wurde die letzte Zeile verdeckt. Auch diese Zwischenlösung wurde nicht als fertig akzeptiert.

Die Endkorrektur verwendet eine eigene mobile Titelzeile bis700px, begrenzte Textfeldhöhe mit nativer Innenscroll-/Caretsteuerung, genau eine Safe-Area-Reserve und eine Scrollreserve anhand der tatsächlichen Headerunterkante. Nach synchronem Erstfokus wird das Feld sichtbar gescrollt. Keine Speicher-, Entwurfs- oder Transaktionsregel wurde geändert.

Der Reviewer bestätigte am bytegleichen Anwendungscode des eingefrorenen Prüfbuilds4504 alle fünf Fälle:320×420/200%, Journal und Reader;390×844/100% mit44px Safe Top;320×420/200% mit44px;390×844/200%. Nach Scrollen und Schreiben am Ende eines80-Zeilen-Entwurfs blieben172,36px sichtbarer Bereich für eine78,4px-Zeile im kombinierten Stressfall. Titel ohne Überdeckung, Save/Close sichtbar, Close44×44px; alle fünf Gedanken exakt gespeichert. Keine verbliebene Feststellung in dieser Korrektur.

Zusätzlich blieben die geschützten Daten-/Speichermodule und Inhalte bytegleich. Das umgesetzte Formular behält ursprüngliche Felder und Submitpfad. Verzögerte Font-Proben an kurzen Psalmen erzeugten keinen falschen Kapitelabschluss. Das behebt keinen behaupteten physischen iPhone-Befund: Safari, installierte PWA und VoiceOver bleiben ausdrücklich OFFEN.

Eigene maschinenlesbare RED-/GREEN-Nachweise befinden sich unter `evidence/fullscreen-red`, `evidence/fullscreen-combined-red` und `evidence/fullscreen-green`. Die finale gemeinsame Regression ist separat protokolliert.
