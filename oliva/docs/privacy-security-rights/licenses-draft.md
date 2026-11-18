# Lizenzübersicht · Entwurf, rechtlich zu prüfen

Diese Übersicht unterscheidet den Softwarecode, die Abhängigkeiten, den Bibeltext, die Schriften und die redaktionellen oder bildlichen Inhalte. Nutzungsrechte und Verteilbarkeit sind für die beabsichtigte Plattform und Region zu prüfen.

| Bestandteil | Vorhandener Nachweis | Zur Freigabe nötig |
|---|---|---|
| OLIVA-Software | MIT-Lizenz mit ausdrücklich benannten Ausnahmen für geerbte Inhalte und A51. | **[Urheber- und Copyrightangaben der tatsächlichen Finalfassung]** |
| Laufzeitbibliotheken und native Komponenten | Lockfile, deklarierte Paketlizenzen und ausgewählte Originaltexte im Repository. Webexport enthält die allgemeinen Hinweise. | **[Vollständige Liste tatsächlich ausgelieferter Module und nativer Bestandteile samt Copyrighttexten und Lizenzpflichten]** |
| Schriften | DM Sans und Cormorant Garamond mit SIL OFL 1.1. Der Web-Kandidat enthält daraus konvertierte WOFF2-Dateien mit geprüften Glyphen, Zeichenzuordnungen, Metriken, Namen und Layouttabellen. Das Webpaket enthält die vorhandenen vollständigen OFL-Texte. | **[Auslieferung und Lizenztexte je Zielpaket verifizieren]** |
| Lutherbibel 1912 | eBible.org weist die verwendete Ausgabe als Public Domain aus. Bezugsarchiv und Verarbeitung sind dokumentiert. | **[Ausgabe, Märkte und Quellenhinweis für die konkrete Veröffentlichung bestätigen]** |
| FaithPath-Fragen, Geschichten und Lebensthemen | Herkunft und Originalkataloge eingefroren. Projektübernahme dokumentiert. Inhalte sind vom MIT-Grant ausgenommen. | **[Schriftliche Weitergaberechte, Urheber und etwaige Quellenpflichten je Katalog, fachliche Prüfung]** |
| A51, KI-Illustrationen und App-Symbole | Provenienz und vorhandene Freigaben je Bilddatei im Inventar. | **[Rechtekette, Anbieterbedingungen und geplante Verteilung je Bildgruppe]** |

Der Abgleich der Metro-Quellpfade mit den ausgelieferten Web-Chunks listet die tatsächlich enthaltenen npm-Paketinstanzen nach Version und Lizenzdeklaration. Bei einigen MIT-Paketen liegt keine eigene Lizenzdatei im installierten Paketordner. Dafür sind die passenden Upstream-Notices zu belegen. Beim nativen Paket gehören auch eingebundene Bibliotheken aus Gradle, CocoaPods und der Plattformauslieferung zur Prüfung. Erst die Zuordnung der vollständigen Copyright- und Lizenztexte zur fertigen Ausgabe ermöglicht die Freigabe. [Tatsächlicher Web-Modulbestand](../evidence/stabilization/web-runtime-dependencies.json) · [Fontprüfung](../evidence/stabilization/web-fonts.json) · [Lockfile-Softwareinventar](../evidence/privacy-security-rights/software-license-inventory.json) · [Drittanbieterhinweise](../../THIRD_PARTY_NOTICES.md) · [Bibelquellenangabe](https://ebible.org/deu1912/copyright.htm)
