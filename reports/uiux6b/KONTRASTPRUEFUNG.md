# Die22 offenen Kontrastberichte der Premium-Studie

Die alten Berichte aus `f268fc7` werden als Referenz eingeordnet, nicht als Fehlerfreiheit übernommen.22 bezeichnet die Anzahl der Berichte mit unvollständigem Kontrastcheck, nicht22 bewiesene Produktfehler. Ihre konkreten Ziele wurden mit den entsprechenden echten App-Komponenten verglichen. Die Berechnung verwendet im Browser tatsächlich gerenderte Vorder-/Hintergrundfarben, zusammengesetzte Alphawerte und WCAG-Luminanz. Große Schrift hat die3:1-Schwelle, normaler Text4,5:1, der Auswahlindikator3:1.

| Alte Berichte | Tatsächliche Zuordnung in6B | Ergebnis und Grenze |
|---|---|---|
|4× Entdecken: dekorative Themenzeichen | Reale Themenbezeichnungen und Metadaten in Orientierung | Die alten dekorativen Glyphen werden nicht als Informationsquelle benötigt. Wesentliche Textlabels werden gemessen. |
|4× Reader +1× aktive Versauswahl: dekorative Pfeilzeichen | Drei native, beschriftete Auswahlfelder; bestehende Auswahlaktionen | Text und Beschriftung gemessen. Nativer Pfeil/Picker und VoiceOver auf iOS bleiben OFFEN. |
|4× Onboarding: kleine Einleitungszeile | Reale Onboarding-Overline auf dem Dialoghintergrund | In allen vier Themes gemessen. |
|4× Baum: Stufenname und Hinweis | Originaler Stufenname als Seitenüberschrift und Bildunterschrift | Keine Informationsschrift über dem Foto; semantischer Hintergrund gemessen. |
|4× Journal: kleine Kompositionszeile | Reale Aktion „Gedanken festhalten“ mit kleinem Vorspann | Oberfläche und beide Texte in allen vier Themes gemessen. |
|1× aktive Wiederherstellung: Titel und Erläuterungen | Tatsächliche zweite Restorebestätigung des Originalformats | Titel und alle Erläuterungen zusätzlich in allen vier Themes gemessen. Keine Demo-Wiederherstellung übernommen. |

Der maschinenlesbare Nachweis enthält28 Gruppen: die20 Grundgruppen über vier Themes, vier echte Restore-Dialoge und vier bereits markierte/ausgewählte Verse.140 Textmessungen und vier Indikator-Messungen werden einzeln mit Farben, Verhältnis und Schwelle erfasst. Niedrigstes Textverhältnis im geprüften Satz:5,53:1. Alle geprüften Gruppen bestehen. Das ist eine konkrete Komponentenprüfung und keine Behauptung einer vollständigen WCAG-Zertifizierung.

Zusätzlich fand die neue Prüfung einen tatsächlichen6B-Fehler: Im Nachtmodus lag die helle Auswahlunterstreichung auf einer ebenfalls hellen vorhandenen Markierung. Die dokumentierten RED-Farben waren RGB(191,211,215) auf RGB(228,232,207). Der ausgewählte markierte Vers nutzt jetzt den bestehenden dunklen Hervorhebungstext als Indikatorfarbe. GREEN prüft den tatsächlichen Randkontrast in jedem Theme; Fokusumrandung und „Markiert“-Information bleiben erhalten.

Die Accessibility-Automation prüft zusätzlich echte Seiten und Dialoge. Da Axe eigene Inline-Diagnosestyles erzeugt, verwenden ausschließlich diese instrumentierten Auditkontexte `bypassCSP`; die ausgelieferte CSP bleibt unverändert. Eine getrennte uninstrumentierte Routenmatrix prüft Laufzeit, Stylesheets, Fehlrequests und Browserkonsolen unter der tatsächlichen CSP.

OFFEN bleiben physisches Safari-/PWA-/VoiceOver-Verhalten, iOS-Picker, Systemschrift/Displayeinstellungen und individuelle Sehbedingungen. Die Screenshotprüfung und Messung machen diese Grenzen nicht zu PASS.
