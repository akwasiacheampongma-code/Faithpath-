# Visuelle Prüfung MOBILE2

Geprüft wurden echte PNGs des unveränderten 6B-Ausgangsbuilds und des finalen MOBILE2-Builds. Keine erzeugten Konzeptbilder. Beide nutzen dieselben vorhandenen App-Funktionen und ausschließlich synthetische persönliche Daten.

## Angesehene Übersichtstafeln

Jeweils 23 Haupt-/Unterseiten und Zustände, in derselben Reihenfolge: Heute, Bibel, OTB-Langkapitel, Luther-Langkapitel, Kurzkapitel, Reise, Baum, viele Wege, Wegdetail, gefülltes Journal, langer Eintrag, Rückblicke, Rückblickdetail, Entdecken, Geschichte, Nachlesefrage, Kapitelquiz, Mehr, Einstellungen, Backup, leeres Journal, Editor, leere Suche.

| Theme |390×844,100%|320×568,200%|
|---|---|---|
| Hell |[Tafel](screenshots/contact-sheets/light-390-100.png)|[Tafel](screenshots/contact-sheets/light-320-200.png)|
| Atmosphärisch |[Tafel](screenshots/contact-sheets/atmospheric-390-100.png)|[Tafel](screenshots/contact-sheets/atmospheric-320-200.png)|
| Papier |[Tafel](screenshots/contact-sheets/paper-390-100.png)|[Tafel](screenshots/contact-sheets/paper-320-200.png)|
| Nacht |[Tafel](screenshots/contact-sheets/night-390-100.png)|[Tafel](screenshots/contact-sheets/night-320-200.png)|

Die Tafeln verkleinern die Screenshots nur zur Übersicht. Die unveränderten Original-PNGs bleiben in der Galerie bzw. im vollständigen Screenshot-ZIP. Schrift-/Detailbefunde wurden zusätzlich an Originalbildern geprüft, insbesondere leeres Nachtjournal, Header-Stresstest, Psalmen119, lange Kapitelquizfrage und Einstellungen bei 200%. Der unabhängige Reviewer kontrollierte21 weitere gezielte Aufnahmen einschließlich Desktop.

## Beobachtung

- Normale Größe: ruhige gemeinsame Typografie und Farbgebung; Bibeltext früher, weniger dominante Quizfrage; eine eindeutige leere Journalaktion. Die vier Themes behalten ihre Identität.
- 200% auf320px: Markenname zusammenhängend; Settings-/Reisetitel ohne einzelne abgetrennte Endbuchstaben; erste Readerzeile oberhalb der Navigation; leere Journalaktion komplett erreichbar. Navigation darf mehrzeilig werden und bleibt bedienbar.
- Große persönliche Inhalte sind weiterhin vertikal scrollbar. Bei200% liegen in gefülltem Journal und langen Themen-/Fragenansichten weitere Aktionen unterhalb des ersten Viewports. Diese werden nicht abgeschnitten oder durch kleinere Leseschrift kaschiert.
- Datumsüberschriften in Eintrags-/Rückblickdetails nehmen bei 200% mehrere natürliche Zeilen ein. Das bleibt ein enger Extremzustand zur qualitativen Geräteabnahme, kein nachgewiesener verlorener Inhalt. Es wurde kein weiterer Datums-/Editorumbau vorgenommen.
- Die leere Suche ist nach Eingabe auf das Suchfeld gescrollt; ein oben teilweise außerhalb des Viewports liegender Titel ist dort ein Fokus-/Scrollzustand, kein abgeschnittener Seitentext.
- Auf den Chromium-Bildern hat das Markenicon keine schwarze Trägerfläche wie im Nutzerfoto. Der iPhone-Compositingzustand bleibt offen.

Die Bilder beweisen keine vollständige Barrierefreiheit und kein iOS-Verhalten.150%-Fälle,430px und1440px sind vollständig in der automatisierten Matrix enthalten. Es wird nicht behauptet, jedes der1.104 Bilder einzeln gelesen oder mit einem Screenreader geprüft zu haben.

## Verworfen

Der erste Bildlauf mit blockiertem Service Worker erzeugte eine vom Testaufbau verursachte Offlinewarnung. Er wurde durch neue Aufnahmen mit echtem aktiven Worker ersetzt. Der erste interne MOBILE1-Kandidat zeigte bei der Bildkontrolle weitere Titelprobleme; seine Teilregressionen werden nicht mit den finalen MOBILE2-Ergebnissen verrechnet. Alte Referenzbuilds und ihre früheren Berichte wurden nicht verändert.

Die zusätzlichen 21 Nacht-Zustände (Onboarding, Menü, leere/archivierte Wege, Erinnerungen, Quizfeedback, Backup-Dialoge, sieben Baumstufen und vier dokumentierte Lesestände) wurden ebenfalls als Übersichtstafel angesehen: [Tafel](screenshots/contact-sheets/secondary-night.png). Die Baumregeln und Originalgrafiken bleiben unverändert.
