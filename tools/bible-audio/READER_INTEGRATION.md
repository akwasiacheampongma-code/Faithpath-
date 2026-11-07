# Vorbereitete Integration in den echten Reader

Die laufende FaithPath-App wurde **nicht** ersetzt oder bereits mit einer Hörfunktion veröffentlicht. Das getestete Vorbereitungsmodul liegt bewusst außerhalb von `src/`. Die separate Hörvorschau verwendet dasselbe Modul mit den echten Kapiteltexten. Synthetische Demo-Datenmodelle gibt es hier nicht.

## Bestehende Anknüpfungspunkte

`src/app.js:reader()` lädt über `createBibleLoader()` den tatsächlichen Buchtext und hält `{book, chapter, translation}` im vorhandenen Readerzustand. Eine kleine Audiozeile kann nach der Kapitelwahl und vor dem Bibeltext eingefügt werden. Das bestehende `chapterNavigation()` und `readRoute()` bleiben für den Kapitelwechsel maßgeblich. Verse, Notizen, Markierungen, Schriftsteuerung, Reflexion und Reiseerfassung bleiben unverändert.

## Statische Veröffentlichungsdaten statt neuer Nutzerspeicher

Eine später explizit freigegebene Aufnahme bekommt einen statischen Manifest-Eintrag, beispielsweise:

```json
{
  "version": 1,
  "entries": {
    "l1912:MAT:1": {
      "url": "audio/l1912/MAT/001/CANDIDATE.mp3",
      "sha256": "EXAKTER_MP3_HASH",
      "book_source_sha256": "EXAKTER_HASH_VON_data/bibles/l1912/MAT.json",
      "duration_seconds": 154.10897959183674,
      "approved_for_release": false
    }
  }
}
```

Die Platzhalter werden erst nach Hörfreigabe ersetzt. Dieser Auftrag aktiviert kein öffentliches Audio-Manifest. Ein Resolver darf nur eine freigegebene Aufnahme für **genau dieselbe Übersetzung und denselben Quellenstand** liefern. Luther-Audio darf nicht bei ausgewählter OTB-Übersetzung als deren Vorlesung erscheinen. Fehlender oder veralteter Eintrag führt zu einer verständlichen Nichtverfügbarkeit; Lesen funktioniert weiter.

## Lebenszyklus

```js
import {createChapterAudio} from './reader-player.js';
const player = createChapterAudio({
  audio: document.querySelector('audio'),
  resolve: async ref => lookupApprovedExactSource(ref),
  onState: state => updateAccessibleStatus(state)
});
await player.load({translation: 'l1912', book: 'MAT', chapter: 1});
// Wiedergabe nur nach Nutzeraktion; native Controls oder player.play().
player.setRate(1.1);
player.pause();
// Vor dem Abbau der Readeransicht:
player.destroy();
```

`lookupApprovedExactSource` und `updateAccessibleStatus` sind explizite App-Anknüpfungspunkte, noch keine behaupteten existierenden Funktionen. `player.load(nextRef)` bereitet ein anderes Kapitel ohne Autoplay vor. Veraltete asynchrone Antworten dürfen die aktuelle Auswahl nicht überschreiben. Positionen bleiben während der Lebensdauer des Controllers im RAM erhalten; die bestehende V5-Nutzerdatenstruktur bekommt keine neuen Felder. Beim Controller-Abbau werden Positionen, Events und Medienquelle aufgeräumt. Sitzungsübergreifendes Hörpositionsspeichern ist nicht Teil dieser Vorbereitung.

## Offline und App-Build

Der derzeitige App-Build kopiert nur seine ausdrücklich definierten Verzeichnisse; das externe TTS-Werkzeug, Modelle und Hörprüfmedien werden dadurch nicht in den Service-Worker-Cache übernommen. Keine automatischen Downloads aller Kapitel. Eine spätere Integration benötigt eine bewusste Strategie für einzelne geprüfte MP3s, Speicherquoten, Abbruch und Löschen von Audiodownloads. Das muss außerhalb persönlicher Backups bleiben.

Das ausgelieferte Standalone-HTML bettet genau die Matthäus-1-MP3 ein und spielt sie nach dem Laden offline. Das ist **kein Nachweis einer bereits integrierten Audio-PWA**. Echte Safari-/iPhone-Medienbedienung, Sperrbildschirm, Audiounterbrechungen und VoiceOver müssen vor der App-Freigabe separat geprüft werden.

## Integration freigeben, wenn

1. Kapitel einschließlich Namen und ASR-Hinweisen vollständig gegengehört.
2. Modell-/Text-/Softwarelizenzen und Veröffentlichungshinweise im Release archiviert.
3. Exakte Übersetzungs- und Quellenzuordnung automatisiert abgesichert.
4. Kein Einfluss von Hören auf Kapitel-/Baumfortschritt ohne bestehende ausdrückliche Nutzeraktion.
5. Audiofehler blockieren Lesen, Notizen, Markierungen und Navigation nicht.
6. Offline-/Update- und echte iPhone-Abnahme der tatsächlich integrierten Version abgeschlossen.
