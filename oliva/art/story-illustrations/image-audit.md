# OLIVA · Bestand und Motivauswahl

Die Quellbasis ist der GitHub-Branch `hardening/oliva-user-acceptance-20261118`. Story-Index, Bildmanifest und Inventar wurden lesend abgerufen. Der Index wurde mit dem hashgeprüften FaithPath-Originalarchiv abgeglichen. IDs, Titel und Referenzbezeichnungen stimmen in allen 436 Einheiten überein. Sechs Einheiten haben ein Motiv. 430 erscheinen typografisch. Die sechs Bildzuordnungen stimmen mit dem Inventar überein.

[Story-Index](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/src/data/story-index.json) · [Originalprovenienz](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/content/faithpath-stories/provenance.json) · [Bildmanifest](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/art/manifest.json) · [Bildinventar](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/docs/evidence/image-review-final/inventory.json) · [Bildprüfung vom 18. November](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/docs/42-image-review-final.md)

## Bebilderte Originaleinheiten

| ID | Originaltitel | Bibelstelle | Motiv | Laufzeitvarianten |
|---|---|---|---|---|
| NS-0006 | Da gedachte Gott an Noah | 1. Mose 8,1–22 | `noah` | noah-1024.webp, noah-1280.webp, noah-640.webp |
| NS-0010 | Abram glaubte dem HERRN | 1. Mose 15,1–6 | `abraham` | abraham-1024.webp, abraham-1280.webp, abraham-640.webp |
| NS-0052 | Der Streit ist des HERRN | 1. Samuel 17,32–50 | `david-before-goliath` | david-before-goliath-1024.webp, david-before-goliath-1280.webp, david-before-goliath-640.webp |
| NS-0203 | Schweig und verstumme | Markus 4,35–41 | `storm` | storm-1280.webp, storm-640.webp |
| NS-0235 | Sie fürchteten sich | Markus 16,1–8 | `easter-dawn` | easter-dawn-1024.webp, easter-dawn-1280.webp, easter-dawn-640.webp |
| NS-0241 | In der Krippe | Lukas 2,1–20 | `nativity` | nativity-1024.webp, nativity-1280.webp, nativity-640.webp |

Galiläa erscheint in „Heute“ (1.280 px) und auf Wegkarten (640 px). Sturm erscheint in der Einstiegssituation (1.280 px), als Detail und Liste von NS-0203 und auf zwei ursprünglichen Wegkarten. Die fünf anderen erzählerischen Motive werden je nach Ansicht in mehreren Größen für ihre jeweilige Geschichte und in der biblischen Bilddarstellung verwendet. Dasselbe erzählerische Motiv ist im Story-Index jeweils genau einer Originaleinheit zugeordnet. Garten läuft auf den Wegkarten in 640 px. Die 1.280-px-Fassung liegt laut Inventar ohne Laufzeitreferenz im Quellbestand.

## Wege und Themenwege

| ID | Weg | Vorhandenes Motiv | Eignung |
|---|---|---|---|
| `jesus` | Wer ist Jesus? | `storm` | Konkreter Bezug zur ersten Station über den gestillten Sturm. |
| `anfang` | Ich bin neu im Glauben | `galilee` | Galiläa rahmt den Einstieg in Jesu Nachfolge. |
| `bibel` | Wie lese ich die Bibel? | `garden` | Die Gartenlandschaft spiegelt den Einstieg über Genesis. |
| `beten` | Wie kann ich beten? | `galilee` | Ruhige Landschaft als atmosphärischer Rahmen für Gebet. |
| `gnade` | Was bedeutet Gnade? | `garden` | Wachstum und Zuwendung als offene atmosphärische Deutung. |
| `hoffnung` | Hoffnung in schweren Zeiten | `storm` | Der gestillte Sturm ist eine Station des Wegs. |
| `vergebung` | Vergebung verstehen | `garden` | Garten als atmosphärischer Rahmen für Neubeginn. |
| `frieden` | Frieden finden | `galilee` | Das ruhige Ufer passt zur Sammlung und zum Wegthema. |
| `geschichte` | Die Geschichte der Bibel | `garden` | Die Schöpfung eröffnet den Weg. Garten trägt diesen Anfang. |

Alle 18 Themenwege erhalten aktuell `garden` als gemeinsames Serienmotiv. Die Titel und Untertitel tragen die fachliche Unterscheidung. Galiläa und Garten wurden neben Sturm in ihren Laufzeitvarianten visuell geprüft. Die Mehrfachverwendung ist erkennbar, aus dem vorliegenden Audit ergibt sich jedoch kein konkretes Orientierungsproblem. Das Paket enthält daher null neue Wegmotive. Die höhere Priorität liegt bei den 20 Originaleinheiten, die derzeit typografische Karten nutzen.

[Wegkatalog](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/src/features/paths/catalog.ts) · [Themenwege](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/src/features/topics/catalog.ts) · [Thementitel](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/src/data/life-topics.json)

| ID | Thema |
|---|---|
| `faithpath-topic-angst` | Angst & Sorgen |
| `faithpath-topic-streit` | Streit & Konflikte |
| `faithpath-topic-einsam` | Einsamkeit |
| `faithpath-topic-entscheidung` | Entscheidungen |
| `faithpath-topic-vergebung` | Vergebung |
| `faithpath-topic-zweifel` | Glaube & Zweifel |
| `faithpath-topic-ueberfordert` | Überforderung & Ruhe |
| `faithpath-topic-trauer` | Trauer & schwere Zeiten |
| `faithpath-topic-dankbar` | Dankbarkeit |
| `faithpath-topic-wut` | Wut |
| `faithpath-topic-familie` | Beziehung & Familie |
| `faithpath-topic-hoffnung` | Hoffnung |
| `faithpath-topic-versuchung` | Versuchung |
| `faithpath-topic-arbeit` | Arbeit & Berufung |
| `faithpath-topic-schuld` | Schuld |
| `faithpath-topic-selbstbeherrschung` | Selbstbeherrschung |
| `faithpath-topic-ruhe` | Ruhe |
| `faithpath-topic-geduld` | Geduld |

## Persönlicher Olivenbaum A51

Die sieben 384-px-Laufzeitmotive wurden zusammen visuell gesichtet. Die Reihe zeigt Samen, Keimling, jungen Olivenbaum, wachsenden Olivenbaum, starken Olivenbaum, erste Früchte und fruchttragenden Olivenbaum. Die Bildsprache arbeitet mit freigestellten botanischen Formen, sandigem Boden und zunehmender Blatt- und Fruchtmasse. Für die neue Serie dienten vier bereits vorhandene Erzähl- und Landschaftsbilder als direkte visuelle Referenz.

[A51-Stadien](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/art/a51/reference/manifest.json) · [A51-Prompts](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/art/a51/reference/prompts.json) · [A51-Provenienz](https://github.com/akwasiacheampongma-code/Faithpath-/blob/hardening/oliva-user-acceptance-20261118/oliva/art/a51/provenance.json)

## Ausgewählte Originaleinheiten

| Original-ID | Originaltitel | Bibelstelle | Inhalt | Geplantes Bildmotiv | Auswahlgrund | Bildbestand |
|---|---|---|---|---|---|---|
| NS-0001 | Am Anfang | 1. Mose 1,1–31 | Schöpfung beginnt mit Licht und führt zu einer belebten Welt. | Erstes warmes Licht über dunklem, landlosem Wasser. | Eröffnung des Bibelüberblicks und des Lesewegs. | Typografische Karte |
| NS-0022 | Aus dem Wasser gezogen | 2. Mose 2,1–10 | Die Tochter des Pharaos findet das ausgesetzte Kind und hat Erbarmen. | Ein geöffnetes Schilfkörbchen mit einem Kind am Nilufer. | Eine Rettungsgeschichte aus der Mose-Erzählung mit einem klaren Bildanker. | Typografische Karte |
| NS-0023 | ICH WERDE SEIN, DER ICH SEIN WERDE | 2. Mose 3,1–15 | Gott spricht Mose aus dem brennenden Busch an und beruft ihn. | Ein kleiner brennender Dornbusch und Mose mit verhülltem Gesicht. | Moses Berufung verbindet Gottes Namen mit einer unverwechselbaren Szene. | Typografische Karte |
| NS-0025 | Der HERR wird für euch streiten | 2. Mose 14,13–31 | Israel zieht auf trockenem Grund durch das geteilte Meer. | Menschen gehen durch einen breiten Korridor zwischen den Wassern. | Ein Wendepunkt der Exodusgeschichte mit deutlich lesbarer Raumtiefe. | Typografische Karte |
| NS-0047 | Dein Volk ist mein Volk | Ruth 1,8–18 | Ruth bleibt trotz Noomis Aufforderung bei ihr und bindet ihr eigenes Leben an ihres. | Ruth und Noomi bleiben einander auf dem Weg zugewandt. | Eine Geschichte über Treue und Zugehörigkeit, die den Weg zu Vergebung und Familie ergänzt. | Typografische Karte |
| NS-0049 | Ich habe mein Herz ausgeschüttet | 1. Samuel 1,10–20 | Hanna betet im Kummer leise. Eli missversteht sie zunächst. | Hanna allein im Vordergrund, das leise Gebet am Gesicht ablesbar. | Gebet im Kummer ergänzt den Einstiegsweg zum Vaterunser. | Typografische Karte |
| NS-0059 | Ein stilles, sanftes Sausen | 1. Könige 19,9–18 | Nach Wind, Beben und Feuer hört Elia ein leises Sausen und tritt an den Höhleneingang. | Elia verhüllt am Rand der Höhle das Gesicht. | Ein ruhiges Bild für Hören und Trost in einer Krise. | Typografische Karte |
| NS-0073 | Der HERR ist mein Hirte | Psalmen 23,1–6 | Der Psalm spricht von Gottes Begleitung wie von der eines Hirten, auch im dunklen Tal. | Ein Hirte mit Stab führt wenige Schafe durch ein schattiges Tal. | Direkter Bezug zu vier Einstiegswegen und ein Bild für poetische Sprache. | Typografische Karte |
| NS-0117 | Beten und Vaterunser | Matthäus 6,5–15 | Jesus lehrt das vertrauliche Gebet und gibt das Vaterunser als Beispiel. | Eine Person betet in einer kleinen Kammer bei geschlossener Tür. | Direkter Bezug zum Gebetsweg. Die Nahsicht macht den Unterschied zur öffentlichen Geste sichtbar. | Typografische Karte |
| NS-0142 | Das Gleichnis vom Säemann | Matthäus 13,1–23 | Ein Sämann streut Samen auf unterschiedlichen Boden. Jesus deutet das Bild als verschiedene Arten des Hörens. | Eine ausgestreckte Hand streut Saat nahe dem Übergang von Pfad zu Acker. | Ein Gleichnis aus einer anderen Perspektive mit klarer Bewegung im Kleinformat. | Typografische Karte |
| NS-0192 | Die Zeit ist erfüllet | Markus 1,14–20 | Jesus verkündet Gottes Reich und ruft Fischer in seine Nachfolge. | Jesus spricht Simon und Andreas beim Auswerfen ihrer Netze an. | Direkter Auftakt für drei ursprüngliche Wege. | Typografische Karte |
| NS-0249 | Der barmherzige Samariter | Lukas 10,25–37 | Ein Samariter versorgt einen Überfallenen und sorgt für weitere Pflege. | Ein Reisender verbindet am Weg den Unterarm des Verletzten. | Die zentrale Hilfeleistung macht Nächstenliebe als Handlung sichtbar. | Typografische Karte |
| NS-0254 | Schaf und Groschen | Lukas 15,1–10 | Zwei Gleichnisse erzählen von der Suche nach Verlorenem und der Freude beim Wiederfinden. | Ein Hirte trägt ein wiedergefundenes Schaf auf den Schultern. | Der Hirte gehört zu mehreren Einstiegswegen. Die Nahsicht unterscheidet sich vom Tal in Psalm 23. | Typografische Karte |
| NS-0255 | Der verlorene Sohn | Lukas 15,11–32 | Ein Sohn kehrt um. Sein Vater empfängt ihn voller Mitgefühl. | Ein älterer Vater umarmt seinen heimgekehrten Sohn. | Ein einprägsamer Zugang zu Gnade und Vergebung. | Typografische Karte |
| NS-0260 | Zachäus | Lukas 19,1–10 | Jesus nimmt Zachäus wahr und kündigt seinen Besuch an. Zachäus reagiert mit Freude und Wiedergutmachung. | Jesus blickt zu Zachäus in einem Maulbeerfeigenbaum hinauf. | Eine Begegnung, deren Blickachse auch im Hochformat trägt. | Typografische Karte |
| NS-0264 | Der Weg nach Emmaus | Lukas 24,13–35 | Der Auferstandene begleitet zwei Menschen nach Emmaus. Sie erkennen ihn erst später. | Zwei Reisende und ein Begleiter im Gespräch auf dem Weg. | Verbindet den Auferstehungsbericht mit gemeinsamem Unterwegssein. | Typografische Karte |
| NS-0273 | Jakobs Brunnen | Johannes 4,1–42 | Am Brunnen beginnt Jesus ein Gespräch mit einer Samariterin und spricht von lebendigem Wasser. | Jesus sitzt am Steinbrunnen. Ihm gegenüber hört die Samariterin zu. | Eine Begegnung über soziale Grenzen hinweg mit einem klaren Gegenstand als Bildanker. | Typografische Karte |
| NS-0277 | Fünf Gerstenbrote | Johannes 6,1–21 | Jesus dankt für fünf Gerstenbrote und zwei Fische und lässt die Menschen essen. | Brote und Fische in Nahsicht auf einem Tuch, ein Stück Wiese dahinter. | Eine bekannte Erzählung über Teilen mit einem stilllebenartigen Bild. | Typografische Karte |
| NS-0293 | Ein Becken und ein Schurz | Johannes 13,1–17 | Jesus wäscht seinen Jüngern die Füße und gibt ihnen ein Beispiel des Dienens. | Jesus kniet mit einem Tuch an einem Becken vor einem Jünger. | Die körperliche Geste macht Jesu Verständnis von Dienst sichtbar. | Typografische Karte |
| NS-0332 | Komm herüber nach Mazedonien | Apostelgeschichte 16,9–34 | Paulus und Silas beten im Gefängnis. Nach einem Beben öffnen sich die Türen, doch sie bleiben. | Zwei Männer bleiben in einer offenen Zelle. Eine Lampe beleuchtet den Eingang. | Ein Blick in die frühe Kirche mit einer eigenen Nachtszene über Hoffnung. | Typografische Karte |

## Originaleinheiten ohne Bild im geprüften Ausgangsstand

Die folgende Liste enthält die 430 typografischen Einheiten, einschließlich der 20 ausgewählten Geschichten.

| ID | Originaltitel | Bibelstelle |
|---|---|---|
| NS-0001 | Am Anfang | 1. Mose 1,1–31 |
| NS-0002 | Der Garten Eden | 1. Mose 2,7–25 |
| NS-0003 | Wo bist du? | 1. Mose 3,1–24 |
| NS-0004 | Soll ich meines Bruders Hüter sein? | 1. Mose 4,1–16 |
| NS-0005 | Noah tat alles, was ihm Gott gebot | 1. Mose 6,5–22 |
| NS-0007 | Der Bogen in den Wolken | 1. Mose 9,8–17 |
| NS-0008 | Wohlauf, lasst uns einen Turm bauen | 1. Mose 11,1–9 |
| NS-0009 | Gehe aus deinem Vaterlande | 1. Mose 12,1–9 |
| NS-0011 | Sollte dem HERRN etwas unmöglich sein? | 1. Mose 18,1–15 |
| NS-0012 | Gott wird sich ersehen ein Schaf | 1. Mose 22,1–19 |
| NS-0013 | Also verachtete Esau seine Erstgeburt | 1. Mose 25,19–34 |
| NS-0014 | Gewiss ist der HERR an diesem Ort | 1. Mose 28,10–22 |
| NS-0015 | Ich lasse dich nicht, du segnest mich denn | 1. Mose 32,22–32 |
| NS-0016 | Seht, der Träumer kommt | 1. Mose 37,1–36 |
| NS-0017 | Wie sollte ich wider Gott sündigen? | 1. Mose 39,1–23 |
| NS-0018 | Das steht bei mir nicht | 1. Mose 41,14–41 |
| NS-0019 | Ich bin Joseph | 1. Mose 45,1–15 |
| NS-0020 | Ihr gedachtet's böse — Gott gedachte es gut | 1. Mose 50,15–21 |
| NS-0021 | Ein König, der nichts von Joseph wusste | 2. Mose 1,8–22 |
| NS-0022 | Aus dem Wasser gezogen | 2. Mose 2,1–10 |
| NS-0023 | ICH WERDE SEIN, DER ICH SEIN WERDE | 2. Mose 3,1–15 |
| NS-0024 | Des HERRN Passah | 2. Mose 12,1–14 |
| NS-0025 | Der HERR wird für euch streiten | 2. Mose 14,13–31 |
| NS-0026 | Was ist das? | 2. Mose 16,1–15 |
| NS-0027 | Auf Adlerflügeln | 2. Mose 19,1–9 |
| NS-0028 | Ich bin der HERR, dein Gott | 2. Mose 20,1–17 |
| NS-0029 | Ein gegossenes Kalb | 2. Mose 32,1–14 |
| NS-0030 | Barmherzig und gnädig | 2. Mose 34,4–10 |
| NS-0031 | An diesem Tage geschieht eure Versöhnung | 3. Mose 16,29–34 |
| NS-0032 | Du sollst deinen Nächsten lieben wie dich selbst | 3. Mose 19,1–18 |
| NS-0033 | Wir waren wie Heuschrecken | 4. Mose 13,25–33 |
| NS-0034 | Der HERR aber ist mit uns | 4. Mose 14,1–9 |
| NS-0035 | Die eherne Schlange | 4. Mose 21,4–9 |
| NS-0036 | Höre, Israel | 5. Mose 6,4–9 |
| NS-0037 | Nicht vom Brot allein | 5. Mose 8,1–10 |
| NS-0038 | So erwähl das Leben | 5. Mose 30,15–20 |
| NS-0039 | Du sollst nicht hinübergehen | 5. Mose 34,1–12 |
| NS-0040 | Sei getrost und unverzagt | Josua 1,1–9 |
| NS-0041 | Rahab verbirgt die Boten | Josua 2,1–14 |
| NS-0042 | Die Mauern fielen um | Josua 6,1–20 |
| NS-0043 | Ich aber und mein Haus | Josua 24,14–24 |
| NS-0044 | Der HERR mit dir, du streitbarer Held | Richter 6,11–16 |
| NS-0045 | Durch dreihundert Mann | Richter 7,2–8 |
| NS-0046 | Meine Seele sterbe mit den Philistern | Richter 16,23–30 |
| NS-0047 | Dein Volk ist mein Volk | Ruth 1,8–18 |
| NS-0048 | Besser als sieben Söhne | Ruth 4,13–17 |
| NS-0049 | Ich habe mein Herz ausgeschüttet | 1. Samuel 1,10–20 |
| NS-0050 | Rede, denn dein Knecht hört | 1. Samuel 3,1–10 |
| NS-0051 | Der HERR sieht das Herz an | 1. Samuel 16,1–13 |
| NS-0053 | Der HERR will dir ein Haus machen | 2. Samuel 7,8–16 |
| NS-0054 | Du bist der Mann | 2. Samuel 12,1–7 |
| NS-0055 | Ein gehorsames Herz | 1. Könige 3,5–14 |
| NS-0056 | Sollte Gott auf Erden wohnen? | 1. Könige 8,22–30 |
| NS-0057 | Das Mehl im Kad soll nicht verzehrt werden | 1. Könige 17,1–16 |
| NS-0058 | Der HERR ist Gott | 1. Könige 18,21–39 |
| NS-0059 | Ein stilles, sanftes Sausen | 1. Könige 19,9–18 |
| NS-0060 | Wagen Israels und seine Reiter | 2. Könige 2,9–14 |
| NS-0061 | Wasche dich, so wirst du rein | 2. Könige 5,1–14 |
| NS-0062 | Das Haus des HERRN verbrannt | 2. Könige 25,8–12 |
| NS-0063 | Von deiner Hand haben wir dir's gegeben | 1. Chronik 29,10–14 |
| NS-0064 | Ihr streitet nicht, sondern Gott | 2. Chronik 20,15–17 |
| NS-0065 | Wer unter euch seines Volkes ist | Esra 1,1–5 |
| NS-0066 | So lasst uns auf sein und bauen | Nehemia 2,17–20 |
| NS-0067 | Die Freude am HERRN ist eure Stärke | Nehemia 8,1–12 |
| NS-0068 | Komme ich um, so komme ich um | Esther 4,13–16 |
| NS-0069 | Der HERR hat's gegeben, der HERR hat's genommen | Hiob 1,6–22 |
| NS-0070 | Wo warst du, da ich die Erde gründete? | Hiob 38,1–7 |
| NS-0071 | Nun hat dich mein Auge gesehen | Hiob 42,1–6 |
| NS-0072 | Wie ein Baum an den Wasserbächen | Psalmen 1,1–6 |
| NS-0073 | Der HERR ist mein Hirte | Psalmen 23,1–6 |
| NS-0074 | Eine Hilfe in den großen Nöten | Psalmen 46,1–8 |
| NS-0075 | Ein reines Herz | Psalmen 51,1–12 |
| NS-0076 | Lehre uns bedenken, dass wir sterben müssen | Psalmen 90,1–12 |
| NS-0077 | Vergiss nicht, was er dir Gutes getan hat | Psalmen 103,1–13 |
| NS-0078 | Meine Hilfe kommt von dem HERRN | Psalmen 121,1–8 |
| NS-0079 | Aus der Tiefe rufe ich | Psalmen 130,1–8 |
| NS-0080 | Wo soll ich hin fliehen vor deinem Angesicht? | Psalmen 139,1–14 |
| NS-0081 | Verlass dich nicht auf deinen Verstand | Sprüche 3,1–12 |
| NS-0082 | Ein jegliches hat seine Zeit | Prediger 3,1–8 |
| NS-0083 | Liebe ist stark wie der Tod | Hohelied 8,6–7 |
| NS-0084 | Hier bin ich; sende mich | Jesaja 6,1–8 |
| NS-0085 | Uns ist ein Kind geboren | Jesaja 9,1–6 |
| NS-0086 | Tröstet, tröstet mein Volk | Jesaja 40,1–11 |
| NS-0087 | Durch seine Wunden sind wir geheilt | Jesaja 53,1–6 |
| NS-0088 | Sage nicht: Ich bin zu jung | Jeremia 1,4–10 |
| NS-0089 | Gedanken des Friedens | Jeremia 29,10–14 |
| NS-0090 | Ein neuer Bund | Jeremia 31,31–34 |
| NS-0091 | Seine Barmherzigkeit hat noch kein Ende | Klagelieder 3,21–26 |
| NS-0092 | Ihr verdorrten Gebeine, höret | Hesekiel 37,1–14 |
| NS-0093 | Wo er's nicht tun will | Daniel 3,16–28 |
| NS-0094 | Der den Löwen den Rachen zugehalten hat | Daniel 6,16–23 |
| NS-0095 | Mein Herz ist andern Sinnes | Hosea 11,1–9 |
| NS-0096 | Zerreißet eure Herzen | Joel 2,12–14 |
| NS-0097 | Das Recht wie Wasser | Amos 5,21–24 |
| NS-0098 | Der Hochmut deines Herzens | Obadja 1,1–4 |
| NS-0099 | Jona floh vor dem HERRN | Jona 1,1–17 |
| NS-0100 | Es sind noch vierzig Tage | Jona 3,1–10 |
| NS-0101 | Was der HERR von dir fordert | Micha 6,6–8 |
| NS-0102 | Eine Feste zur Zeit der Not | Nahum 1,7–8 |
| NS-0103 | Der Gerechte wird seines Glaubens leben | Habakuk 2,2–4 |
| NS-0104 | Ein starker Heiland ist bei dir | Zephanja 3,14–17 |
| NS-0105 | Die Zeit ist noch nicht da? | Haggai 1,2–8 |
| NS-0106 | Dein König kommt zu dir | Sacharja 9,9–10 |
| NS-0107 | Wer wird bestehen, wenn er erscheint? | Maleachi 3,1–2 |
| NS-0108 | Jesu Geburt | Matthäus 1,18–25 |
| NS-0109 | Die Weisen aus dem Morgenland | Matthäus 2,1–12 |
| NS-0110 | Flucht nach Ägypten und Rückkehr | Matthäus 2,13–23 |
| NS-0111 | Johannes der Täufer | Matthäus 3,1–12 |
| NS-0112 | Taufe Jesu | Matthäus 3,13–17 |
| NS-0113 | Versuchung Jesu | Matthäus 4,1–11 |
| NS-0114 | Berufung der ersten Jünger | Matthäus 4,18–22 |
| NS-0115 | Die Seligpreisungen | Matthäus 5,1–12 |
| NS-0116 | Salz und Licht | Matthäus 5,13–16 |
| NS-0117 | Beten und Vaterunser | Matthäus 6,5–15 |
| NS-0118 | Schätze und Sorgen | Matthäus 6,19–34 |
| NS-0119 | Richten, Bitten und Suchen | Matthäus 7,1–12 |
| NS-0120 | Enge Pforte und falsche Propheten | Matthäus 7,13–23 |
| NS-0121 | Haus auf Fels oder Sand | Matthäus 7,24–29 |
| NS-0122 | Heilung eines Aussätzigen | Matthäus 8,1–4 |
| NS-0123 | Der Hauptmann von Kapernaum | Matthäus 8,5–13 |
| NS-0124 | Jesus im Haus des Petrus | Matthäus 8,14–17 |
| NS-0125 | Stillung des Sturms | Matthäus 8,23–27 |
| NS-0126 | Heilung der zwei Besessenen | Matthäus 8,28–34 |
| NS-0127 | Heilung des Gelähmten | Matthäus 9,1–8 |
| NS-0128 | Die Berufung des Matthäus | Matthäus 9,9–13 |
| NS-0129 | Fasten, Kleid und Schläuche | Matthäus 9,14–17 |
| NS-0130 | Die Tochter des Obersten und die Frau am Saum | Matthäus 9,18–26 |
| NS-0131 | Zwei Blinde rufen den Sohn Davids | Matthäus 9,27–31 |
| NS-0132 | Der Stumme und die große Ernte | Matthäus 9,32–38 |
| NS-0133 | Die Aussendung der Zwölf | Matthäus 10,1–15 |
| NS-0134 | Schafe unter Wölfen | Matthäus 10,16–31 |
| NS-0135 | Bekennen, Schwert und ein Becher Wasser | Matthäus 10,32–42 |
| NS-0136 | Johannes fragt aus dem Gefängnis | Matthäus 11,2–19 |
| NS-0137 | Wehe den Städten — und kommt her zu mir | Matthäus 11,20–30 |
| NS-0138 | Ähren am Sabbat und die verdorrte Hand | Matthäus 12,1–14 |
| NS-0139 | Beelzebub und der Geist Gottes | Matthäus 12,22–37 |
| NS-0140 | Das Zeichen des Jona | Matthäus 12,38–45 |
| NS-0141 | Meine Mutter und meine Brüder | Matthäus 12,46–50 |
| NS-0142 | Das Gleichnis vom Säemann | Matthäus 13,1–23 |
| NS-0143 | Unkraut, Senfkorn und Sauerteig | Matthäus 13,24–33 |
| NS-0144 | Schatz, Perle und Netz | Matthäus 13,44–52 |
| NS-0145 | Verworfen in der Vaterstadt | Matthäus 13,53–58 |
| NS-0146 | Der Tod Johannes des Täufers | Matthäus 14,1–12 |
| NS-0147 | Speisung der Fünftausend | Matthäus 14,13–21 |
| NS-0148 | Jesus kommt auf dem Meer | Matthäus 14,22–33 |
| NS-0149 | Das kanaanäische Weib | Matthäus 15,21–28 |
| NS-0150 | Speisung der Viertausend | Matthäus 15,32–39 |
| NS-0151 | Du bist Christus | Matthäus 16,13–20 |
| NS-0152 | Das Kreuz und das Leben | Matthäus 16,21–28 |
| NS-0153 | Die Verklärung | Matthäus 17,1–13 |
| NS-0154 | Der mondsüchtige Knabe | Matthäus 17,14–21 |
| NS-0155 | Wie die Kinder — und das verirrte Schaf | Matthäus 18,1–14 |
| NS-0156 | Siebzigmal siebenmal | Matthäus 18,21–35 |
| NS-0157 | Lasset die Kindlein | Matthäus 19,13–15 |
| NS-0158 | Der reiche Jüngling | Matthäus 19,16–26 |
| NS-0159 | Arbeiter im Weinberg | Matthäus 20,1–16 |
| NS-0160 | Hinauf nach Jerusalem | Matthäus 20,17–28 |
| NS-0161 | Zwei Blinde bei Jericho | Matthäus 20,29–34 |
| NS-0162 | Einzug in Jerusalem | Matthäus 21,1–11 |
| NS-0163 | Im Tempel: Bethaus oder Mördergrube | Matthäus 21,12–17 |
| NS-0164 | Der verdorrte Feigenbaum | Matthäus 21,18–22 |
| NS-0165 | Die Taufe des Johannes und die zwei Söhne | Matthäus 21,23–32 |
| NS-0166 | Die bösen Weingärtner | Matthäus 21,33–46 |
| NS-0167 | Die königliche Hochzeit | Matthäus 22,1–14 |
| NS-0168 | Der Groschen des Kaisers | Matthäus 22,15–22 |
| NS-0169 | Die Sadduzäer und die Auferstehung | Matthäus 22,23–33 |
| NS-0170 | Das vornehmste Gebot | Matthäus 22,34–46 |
| NS-0171 | Auf Mose’s Stuhl | Matthäus 23,1–12 |
| NS-0172 | Wehe — und Jerusalem, Jerusalem | Matthäus 23,13–39 |
| NS-0173 | Nicht ein Stein auf dem anderen | Matthäus 24,1–14 |
| NS-0174 | Der Greuel und der Blitz | Matthäus 24,15–35 |
| NS-0175 | Wachet — ihr wisst die Stunde nicht | Matthäus 24,36–51 |
| NS-0176 | Zehn Jungfrauen | Matthäus 25,1–13 |
| NS-0177 | Die Zentner | Matthäus 25,14–30 |
| NS-0178 | Schafe und Böcke | Matthäus 25,31–46 |
| NS-0179 | Das Glas in Bethanien und dreißig Silberlinge | Matthäus 26,1–16 |
| NS-0180 | Das Osterlamm | Matthäus 26,17–30 |
| NS-0181 | Gethsemane | Matthäus 26,31–46 |
| NS-0182 | Der Kuss und das Schwert | Matthäus 26,47–56 |
| NS-0183 | Vor Kaiphas | Matthäus 26,57–68 |
| NS-0184 | Petrus im Hof | Matthäus 26,69–75 |
| NS-0185 | Judas und der Blutacker | Matthäus 27,1–10 |
| NS-0186 | Barabbas oder Jesus | Matthäus 27,11–26 |
| NS-0187 | Dornenkrone und Golgatha | Matthäus 27,27–44 |
| NS-0188 | Eli, Eli — und das Grab | Matthäus 27,45–66 |
| NS-0189 | Er ist nicht hier | Matthäus 28,1–10 |
| NS-0190 | Alle Gewalt — bis an der Welt Ende | Matthäus 28,11–20 |
| NS-0191 | Der Anfang des Evangeliums | Markus 1,1–13 |
| NS-0192 | Die Zeit ist erfüllet | Markus 1,14–20 |
| NS-0193 | Eine neue Lehre mit Gewalt | Markus 1,21–34 |
| NS-0194 | Jedermann sucht dich | Markus 1,35–45 |
| NS-0195 | Sie deckten das Dach auf | Markus 2,1–12 |
| NS-0196 | Nicht die Gerechten | Markus 2,13–22 |
| NS-0197 | Der Sabbat um des Menschen willen | Markus 2,23–28 |
| NS-0198 | Die verdorrte Hand | Markus 3,1–6 |
| NS-0199 | Donnerskinder | Markus 3,13–19 |
| NS-0200 | Er ist von Sinnen | Markus 3,20–35 |
| NS-0201 | Der Sämann sät das Wort | Markus 4,1–20 |
| NS-0202 | Die Erde bringt von selbst | Markus 4,26–34 |
| NS-0204 | Legion heiße ich | Markus 5,1–20 |
| NS-0205 | Talitha kumi | Markus 5,21–43 |
| NS-0206 | Auf einer Schüssel | Markus 6,14–29 |
| NS-0207 | Gebt ihr ihnen zu essen | Markus 6,30–44 |
| NS-0208 | Er wollte an ihnen vorübergehen | Markus 6,45–52 |
| NS-0209 | Korban | Markus 7,1–23 |
| NS-0210 | Die Hündlein unter dem Tisch | Markus 7,24–30 |
| NS-0211 | Hephatha | Markus 7,31–37 |
| NS-0212 | Sieben Brote, sieben Körbe | Markus 8,1–21 |
| NS-0213 | Menschen wie Bäume | Markus 8,22–30 |
| NS-0214 | Gehe hinter mich, du Satan | Markus 8,31–38 |
| NS-0215 | Weiß wie der Schnee | Markus 9,1–13 |
| NS-0216 | Hilf meinem Unglauben | Markus 9,14–29 |
| NS-0217 | Der Erste sei aller Knecht | Markus 9,30–50 |
| NS-0218 | Wie ein Kindlein | Markus 10,13–31 |
| NS-0219 | Zur Bezahlung für viele | Markus 10,32–45 |
| NS-0220 | Rabbuni, dass ich sehend werde | Markus 10,46–52 |
| NS-0221 | Ein Füllen, auf dem nie ein Mensch saß | Markus 11,1–11 |
| NS-0222 | Eine Mördergrube | Markus 11,12–25 |
| NS-0223 | Der Erbe | Markus 12,1–12 |
| NS-0224 | Des Kaisers Bild | Markus 12,13–17 |
| NS-0225 | Nicht ferne vom Reich | Markus 12,28–34 |
| NS-0226 | Zwei Scherflein | Markus 12,38–44 |
| NS-0227 | Nicht ein Stein auf dem anderen | Markus 13,1–13 |
| NS-0228 | Wachet | Markus 13,14–37 |
| NS-0229 | Sie zerbrach das Glas | Markus 14,1–11 |
| NS-0230 | Ehe der Hahn zweimal kräht | Markus 14,12–31 |
| NS-0231 | Abba — die Leinwand fahren | Markus 14,32–52 |
| NS-0232 | Aus Neid | Markus 15,1–20 |
| NS-0233 | Eli, Eli lama asabthani | Markus 15,21–39 |
| NS-0234 | Ein ehrbarer Ratsherr | Markus 15,40–47 |
| NS-0236 | Prediget das Evangelium aller Kreatur | Markus 16,9–20 |
| NS-0237 | Zacharias im Tempel | Lukas 1,5–25 |
| NS-0238 | Gegrüßet seist du, Holdselige | Lukas 1,26–38 |
| NS-0239 | Maria bei Elisabeth | Lukas 1,39–56 |
| NS-0240 | Er heißt Johannes | Lukas 1,57–80 |
| NS-0242 | Simeon und Hanna | Lukas 2,21–40 |
| NS-0243 | Der Zwölfjährige im Tempel | Lukas 2,41–52 |
| NS-0244 | Heute ist diese Schrift erfüllt | Lukas 4,16–30 |
| NS-0245 | Menschen fangen | Lukas 5,1–11 |
| NS-0246 | Der Jüngling zu Nain | Lukas 7,11–17 |
| NS-0247 | Die Sünderin im Haus Simons | Lukas 7,36–50 |
| NS-0248 | Die Siebzig | Lukas 10,1–20 |
| NS-0249 | Der barmherzige Samariter | Lukas 10,25–37 |
| NS-0250 | Maria und Martha | Lukas 10,38–42 |
| NS-0251 | Du Narr — diese Nacht | Lukas 12,13–21 |
| NS-0252 | Abrahams Tochter am Sabbat | Lukas 13,10–17 |
| NS-0253 | Setze dich untenan | Lukas 14,7–14 |
| NS-0254 | Schaf und Groschen | Lukas 15,1–10 |
| NS-0255 | Der verlorene Sohn | Lukas 15,11–32 |
| NS-0256 | Der Reiche und Lazarus | Lukas 16,19–31 |
| NS-0257 | Wo sind die neun? | Lukas 17,11–19 |
| NS-0258 | Die Witwe und der Richter | Lukas 18,1–8 |
| NS-0259 | Pharisäer und Zöllner im Tempel | Lukas 18,9–14 |
| NS-0260 | Zachäus | Lukas 19,1–10 |
| NS-0261 | Er weinte über die Stadt | Lukas 19,41–44 |
| NS-0262 | Heute im Paradiese | Lukas 23,32–43 |
| NS-0263 | Was suchet ihr den Lebendigen bei den Toten? | Lukas 24,1–12 |
| NS-0264 | Der Weg nach Emmaus | Lukas 24,13–35 |
| NS-0265 | Friede sei mit euch — bis gen Himmel | Lukas 24,36–53 |
| NS-0266 | Im Anfang war das Wort | Johannes 1,1–18 |
| NS-0267 | Gottes Lamm | Johannes 1,19–34 |
| NS-0268 | Komm und sieh es | Johannes 1,35–51 |
| NS-0269 | Hochzeit zu Kana | Johannes 2,1–12 |
| NS-0270 | Nicht zum Kaufhause | Johannes 2,13–25 |
| NS-0271 | Von neuem geboren | Johannes 3,1–21 |
| NS-0272 | Er muss wachsen | Johannes 3,22–36 |
| NS-0273 | Jakobs Brunnen | Johannes 4,1–42 |
| NS-0274 | Dein Sohn lebt | Johannes 4,43–54 |
| NS-0275 | Der Teich Bethesda | Johannes 5,1–18 |
| NS-0276 | Vom Tode zum Leben | Johannes 5,19–47 |
| NS-0277 | Fünf Gerstenbrote | Johannes 6,1–21 |
| NS-0278 | Das Brot des Lebens | Johannes 6,25–40 |
| NS-0279 | Wollt ihr auch weggehen? | Johannes 6,41–71 |
| NS-0280 | Laubhütten — heimlich hinauf | Johannes 7,1–24 |
| NS-0281 | Ströme lebendigen Wassers | Johannes 7,37–52 |
| NS-0282 | Wer ohne Sünde ist | Johannes 8,1–11 |
| NS-0283 | Das Licht der Welt | Johannes 8,12–30 |
| NS-0284 | Ehe denn Abraham ward, bin ich | Johannes 8,31–59 |
| NS-0285 | Blind geboren | Johannes 9,1–38 |
| NS-0286 | Der gute Hirte | Johannes 10,1–18 |
| NS-0287 | Ich und der Vater sind eins | Johannes 10,22–42 |
| NS-0288 | Lazarus, komm heraus | Johannes 11,1–44 |
| NS-0289 | Besser ein Mensch sterbe für das Volk | Johannes 11,45–57 |
| NS-0290 | Ein Pfund Narde | Johannes 12,1–11 |
| NS-0291 | Hosianna — der König auf dem Eselein | Johannes 12,12–19 |
| NS-0292 | Das Weizenkorn | Johannes 12,20–36 |
| NS-0293 | Ein Becken und ein Schurz | Johannes 13,1–17 |
| NS-0294 | Und es war Nacht | Johannes 13,18–38 |
| NS-0295 | Der Weg, die Wahrheit, das Leben | Johannes 14,1–6 |
| NS-0296 | Einen andern Tröster | Johannes 14,7–31 |
| NS-0297 | Der rechte Weinstock | Johannes 15,1–13 |
| NS-0298 | Ich habe die Welt überwunden | Johannes 16,1–33 |
| NS-0299 | Heiliger Vater, erhalte sie | Johannes 17,1–26 |
| NS-0300 | Ich bin's — Malchus | Johannes 18,1–27 |
| NS-0301 | Was ist Wahrheit? | Johannes 18,28–40 |
| NS-0302 | Sehet, welch ein Mensch | Johannes 19,1–16 |
| NS-0303 | Es ist vollbracht | Johannes 19,17–30 |
| NS-0304 | Blut und Wasser | Johannes 19,31–42 |
| NS-0305 | Mein HERR und mein Gott | Johannes 20,1–31 |
| NS-0306 | Weide meine Schafe | Johannes 21,1–25 |
| NS-0307 | Bis an das Ende der Erde | Apostelgeschichte 1,1–11 |
| NS-0308 | Das Los fiel auf Matthias | Apostelgeschichte 1,12–26 |
| NS-0309 | Zungen wie von Feuer | Apostelgeschichte 2,1–13 |
| NS-0310 | Bei dreitausend Seelen | Apostelgeschichte 2,14–41 |
| NS-0311 | Ein Herz und Brotbrechen | Apostelgeschichte 2,42–47 |
| NS-0312 | Die schöne Tür | Apostelgeschichte 3,1–10 |
| NS-0313 | Kein andrer Name | Apostelgeschichte 4,1–22 |
| NS-0314 | Ein Sohn des Trostes | Apostelgeschichte 4,32–37 |
| NS-0315 | Ananias und Saphira | Apostelgeschichte 5,1–11 |
| NS-0316 | Man muss Gott mehr gehorchen | Apostelgeschichte 5,17–42 |
| NS-0317 | Sieben Männer, Angesicht eines Engels | Apostelgeschichte 6,1–15 |
| NS-0318 | HERR, behalte ihnen diese Sünde nicht | Apostelgeschichte 7,51–60 |
| NS-0319 | Gottes Gabe nicht um Geld | Apostelgeschichte 8,4–25 |
| NS-0320 | Was hindert's, dass ich mich taufen lasse? | Apostelgeschichte 8,26–40 |
| NS-0321 | Saul, Saul, was verfolgst du mich? | Apostelgeschichte 9,1–19 |
| NS-0322 | Im Korbe die Mauer hinab | Apostelgeschichte 9,20–31 |
| NS-0323 | Tabea, stehe auf | Apostelgeschichte 9,32–43 |
| NS-0324 | Was Gott gereinigt hat | Apostelgeschichte 10,1–48 |
| FP-STORY-0391 | Petrus erklärt sein Handeln in Jerusalem | Apg 11,1-18 |
| NS-0325 | Zuerst Christen genannt | Apostelgeschichte 11,19–30 |
| NS-0326 | Rhode öffnet nicht | Apostelgeschichte 12,1–24 |
| NS-0327 | Saulus, der auch Paulus heißt | Apostelgeschichte 13,1–12 |
| NS-0328 | So wenden wir uns zu den Heiden | Apostelgeschichte 13,13–52 |
| NS-0329 | Jupiter und Merkurius | Apostelgeschichte 14,8–23 |
| NS-0330 | Das Joch auf der Jünger Hälse | Apostelgeschichte 15,1–21 |
| NS-0331 | Timotheus — der Geist wehrte | Apostelgeschichte 16,1–8 |
| NS-0332 | Komm herüber nach Mazedonien | Apostelgeschichte 16,9–34 |
| NS-0333 | Dem unbekannten Gott | Apostelgeschichte 17,16–34 |
| NS-0334 | Ein großes Volk in dieser Stadt | Apostelgeschichte 18,1–17 |
| NS-0335 | Apollos, mächtig in der Schrift | Apostelgeschichte 18,18–28 |
| NS-0336 | Jesus kenne ich wohl | Apostelgeschichte 19,11–20 |
| NS-0337 | Groß ist die Diana der Epheser | Apostelgeschichte 19,23–40 |
| NS-0338 | Eutychus im Fenster | Apostelgeschichte 20,7–12 |
| NS-0339 | Geben ist seliger denn Nehmen | Apostelgeschichte 20,17–38 |
| NS-0340 | Den Mann, des der Gürtel ist | Apostelgeschichte 21,8–14 |
| NS-0341 | Weg mit ihm | Apostelgeschichte 21,17–40 |
| NS-0342 | Ich bin auch römisch geboren | Apostelgeschichte 22,1–29 |
| NS-0343 | Wie du zu Jerusalem gezeugt hast | Apostelgeschichte 23,11–35 |
| NS-0344 | Wenn ich gelegene Zeit habe | Apostelgeschichte 24,22–27 |
| NS-0345 | Ich berufe mich auf den Kaiser | Apostelgeschichte 25,1–27 |
| NS-0346 | Es fehlt nicht viel | Apostelgeschichte 26,1–32 |
| NS-0347 | Zweihundertsechsundsiebzig Seelen | Apostelgeschichte 27,13–44 |
| NS-0348 | Unverboten in Rom | Apostelgeschichte 28,1–31 |
| NS-0349 | Ich schäme mich des Evangeliums nicht | Römer 1,1–17 |
| NS-0350 | Gottes Güte leitet zur Buße | Römer 2,1–16 |
| NS-0351 | Allein durch den Glauben | Römer 3,19–31 |
| NS-0352 | Abraham hat Gott geglaubt | Römer 4,1–25 |
| NS-0353 | Frieden mit Gott | Römer 5,1–21 |
| NS-0354 | Der Tod ist der Sünde Sold | Römer 6,1–23 |
| NS-0355 | Ich elender Mensch | Römer 7,14–25 |
| NS-0356 | Abba, lieber Vater | Römer 8,1–17 |
| NS-0357 | Nichts kann uns scheiden | Römer 8,18–39 |
| NS-0358 | Glaube kommt aus der Predigt | Römer 10,1–17 |
| NS-0359 | Die Wurzel trägt dich | Römer 11,17–36 |
| NS-0360 | Ein lebendiges Opfer | Römer 12,1–21 |
| NS-0361 | Die Liebe erfüllt das Gesetz | Römer 13,8–14 |
| NS-0362 | Den Schwachen im Glauben aufnehmen | Römer 14,1–19 |
| NS-0363 | Das Wort vom Kreuz | 1. Korinther 1,18–31 |
| NS-0364 | Euer Leib ein Tempel | 1. Korinther 6,12–20 |
| NS-0365 | Zu meinem Gedächtnis | 1. Korinther 11,23–29 |
| NS-0366 | Ein Leib, viele Glieder | 1. Korinther 12,4–27 |
| NS-0367 | Die Liebe ist die größte | 1. Korinther 13,1–13 |
| NS-0368 | Auferstanden am dritten Tage | 1. Korinther 15,1–22 |
| NS-0369 | Gott alles Trostes | 2. Korinther 1,3–11 |
| NS-0370 | Schatz in irdischen Gefäßen | 2. Korinther 4,7–18 |
| NS-0371 | Eine neue Kreatur | 2. Korinther 5,14–21 |
| NS-0372 | Einen fröhlichen Geber | 2. Korinther 9,6–15 |
| NS-0373 | Laß dir an meiner Gnade genügen | 2. Korinther 12,7–10 |
| NS-0374 | Ein anderes Evangelium | Galater 1,1–12 |
| NS-0375 | Nicht ich, sondern Christus | Galater 2,11–21 |
| NS-0376 | Allzumal einer in Christus | Galater 3,13–29 |
| NS-0377 | Die Frucht des Geistes | Galater 5,1–26 |
| NS-0378 | Was der Mensch sät | Galater 6,1–18 |
| NS-0379 | Gesegnet vor Grundlegung der Welt | Epheser 1,3–14 |
| NS-0380 | Aus Gnade selig | Epheser 2,1–22 |
| NS-0381 | Ein Leib — und die Sonne über dem Zorn | Epheser 4,1–32 |
| NS-0382 | Wandelt in der Liebe | Epheser 5,1–21 |
| NS-0383 | Den Harnisch Gottes | Epheser 6,10–20 |
| NS-0384 | Christus ist mein Leben | Philipper 1,20–26 |
| NS-0385 | Knechtsgestalt | Philipper 2,1–18 |
| NS-0386 | Ich jage dem Ziel nach | Philipper 3,7–14 |
| NS-0387 | Freuet euch — sorget nichts | Philipper 4,4–13 |
| NS-0388 | Das Ebenbild des unsichtbaren Gottes | Kolosser 1,15–23 |
| NS-0389 | In ihm wohnt die Fülle | Kolosser 2,6–15 |
| NS-0390 | Suchet, was droben ist | Kolosser 3,1–17 |
| NS-0391 | Die Toten in Christus zuerst | 1. Thessalonicher 4,13–18 |
| NS-0392 | Seid allezeit fröhlich | 1. Thessalonicher 5,14–24 |
| NS-0393 | Wer nicht arbeiten will | 2. Thessalonicher 3,6–13 |
| NS-0394 | Für alle Menschen bitten | 1. Timotheus 2,1–8 |
| NS-0395 | Geiz ist eine Wurzel | 1. Timotheus 6,6–19 |
| NS-0396 | Nicht den Geist der Furcht | 2. Timotheus 1,3–14 |
| NS-0397 | Ich habe den Lauf vollendet | 2. Timotheus 4,1–8 |
| NS-0398 | Die heilsame Gnade ist erschienen | Titus 2,11–14 |
| NS-0399 | Nicht mehr als einen Knecht | Philemon 1–25 |
| NS-0400 | Der Sohn trägt alle Dinge | Hebräer 1,1–4 |
| NS-0401 | Hinzu zum Gnadenstuhl | Hebräer 4,12–16 |
| NS-0402 | Der Mittler eines besseren Bundes | Hebräer 8,1–13 |
| NS-0403 | Lasst uns hinzugehen | Hebräer 10,19–25 |
| NS-0404 | Glaube: Zuversicht des Gehofften | Hebräer 11,1–16 |
| NS-0405 | Eine Wolke von Zeugen | Hebräer 12,1–3 |
| NS-0406 | Täter des Worts | Jakobus 1,19–27 |
| NS-0407 | Glaube ohne Werke ist tot | Jakobus 2,14–26 |
| NS-0408 | Die Zunge ein Feuer | Jakobus 3,1–12 |
| NS-0409 | Des Gerechten Gebet vermag viel | Jakobus 5,13–20 |
| NS-0410 | Eine lebendige Hoffnung | 1. Petrus 1,3–9 |
| NS-0411 | Lebendige Steine | 1. Petrus 2,4–10 |
| NS-0412 | Alle Sorge werfet auf ihn | 1. Petrus 5,5–11 |
| NS-0413 | Getrieben vom heiligen Geist | 2. Petrus 1,16–21 |
| NS-0414 | Ein neuer Himmel und eine neue Erde | 2. Petrus 3,8–13 |
| NS-0415 | Gott ist Licht | 1. Johannes 1,5–10 |
| NS-0416 | Welch eine Liebe | 1. Johannes 3,1–18 |
| NS-0417 | Gott ist Liebe | 1. Johannes 4,7–21 |
| NS-0418 | Wandeln nach seinem Gebot | 2. Johannes 1–13 |
| NS-0419 | In der Wahrheit wandeln | 3. Johannes 1–14 |
| NS-0420 | Für den Glauben kämpfen | Judas 1–4.17–25 |
| NS-0421 | Die Zeit ist nahe | Offenbarung 1,1–8 |
| NS-0422 | Der Erste und der Letzte | Offenbarung 1,9–20 |
| NS-0423 | Die erste Liebe | Offenbarung 2,1–7 |
| NS-0424 | Sei getreu bis an den Tod | Offenbarung 2,8–11 |
| NS-0425 | Eine offene Tür | Offenbarung 3,7–13 |
| NS-0426 | Weder kalt noch warm | Offenbarung 3,14–22 |
| NS-0427 | Ein Thron im Himmel | Offenbarung 4,1–11 |
| NS-0428 | Das Lamm und das Buch | Offenbarung 5,1–14 |
| NS-0429 | Eine große Schar | Offenbarung 7,9–17 |
| NS-0430 | Die Frau und der Drache | Offenbarung 12,1–12 |
| NS-0431 | Die Hochzeit des Lammes | Offenbarung 19,6–16 |
| NS-0432 | Das Buch des Lebens | Offenbarung 20,11–15 |
| NS-0433 | Ich mache alles neu | Offenbarung 21,1–8 |
| NS-0434 | Ihre Leuchte ist das Lamm | Offenbarung 21,22–27 |
| NS-0435 | Ja, ich komme bald | Offenbarung 22,1–21 |

## Größen der gelieferten WebPs

| Story-ID | Detailbild (Byte) | Listenbild (Byte) |
|---|---:|---:|
| NS-0001 | 62394 | 11464 |
| NS-0022 | 159108 | 25638 |
| NS-0023 | 177780 | 28446 |
| NS-0025 | 159064 | 20846 |
| NS-0047 | 177072 | 21914 |
| NS-0049 | 121940 | 16280 |
| NS-0059 | 152062 | 19492 |
| NS-0073 | 167186 | 29060 |
| NS-0117 | 123890 | 15550 |
| NS-0142 | 159462 | 25996 |
| NS-0192 | 156598 | 24952 |
| NS-0249 | 161394 | 26114 |
| NS-0254 | 135516 | 20440 |
| NS-0255 | 167460 | 25468 |
| NS-0260 | 153062 | 27104 |
| NS-0264 | 162982 | 25946 |
| NS-0273 | 174910 | 26896 |
| NS-0277 | 171032 | 27960 |
| NS-0293 | 157586 | 19234 |
| NS-0332 | 120582 | 19154 |
| **Gesamt** | **3021080** | **457954** |
