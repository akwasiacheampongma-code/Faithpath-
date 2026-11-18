# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: today.spec.ts >> Heute bleibt in beiden Themen bei320/375/390px mit reduzierter Bewegung zugänglich
- Location: tests/e2e/today.spec.ts:44:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f4e4]:
  - generic [ref=f4e10]:
    - banner [ref=f4e11]:
      - generic [ref=f4e12]: OLIVA
      - generic [ref=f4e19]:
        - button "Dunklen Modus aktivieren" [ref=f4e20] [cursor=pointer]
        - button "M · Profil und Einstellungen" [ref=f4e23] [cursor=pointer]:
          - generic [ref=f4e24]: M
    - main [ref=f4e25]:
      - generic [ref=f4e27]:
        - generic [ref=f4e28]: Dein persönlicher Raum
        - heading "So, wie es zu dir passt." [level=1] [ref=f4e33]
        - generic [ref=f4e34]:
          - generic [ref=f4e35]:
            - generic [ref=f4e36]: Wie dürfen wir dich begrüßen?
            - generic [ref=f4e37]:
              - generic [ref=f4e38]: Dein Vorname (freiwillig)
              - textbox "Dein Vorname (freiwillig)" [active] [ref=f4e39]:
                - /placeholder: Du darfst auch ohne Namen bleiben
                - text: Mara
            - button "Namen speichern" [disabled]
            - generic [ref=f4e43]: Du nutzt OLIVA ohne Konto. Es gibt keine Registrierung und keinen Cloud-Sync.
          - generic [ref=f4e44]:
            - generic [ref=f4e45]: Deine Atmosphäre
            - generic [ref=f4e46]:
              - button "Hell" [ref=f4e47] [cursor=pointer]
              - button "Dunkel" [ref=f4e49] [cursor=pointer]
              - button "Wie das Gerät" [ref=f4e51] [cursor=pointer]
            - generic [ref=f4e53]:
              - generic [ref=f4e54]:
                - generic [ref=f4e55]: Animationen reduzieren
                - generic [ref=f4e56]: Auch die Systemeinstellung wird berücksichtigt. Die Entwicklung bleibt als ruhiges Bild sichtbar.
              - switch "Animationen reduzieren" [checked] [ref=f4e60] [cursor=pointer]
            - generic [ref=f4e61]: Schriftgröße und Zeilenabstand findest du direkt in den Leseeinstellungen des Readers.
          - generic [ref=f4e62]:
            - generic [ref=f4e63]: Deine Daten gehören dir.
            - generic [ref=f4e64]: Gedanken, Markierungen und Fortschritt bleiben lokal. Sie sind in der App-Datenbank nicht zusätzlich verschlüsselt. Bei Geräteverlust oder Löschen der App-/Browserdaten können sie verloren gehen.
            - generic [ref=f4e65]: Sichere deine Daten regelmäßig an einem Ort, dem du vertraust. Eine Sicherung enthält auch deine persönlichen Texte.
            - button "Sicherung exportieren" [ref=f4e66] [cursor=pointer]
            - button "Sicherung wiederherstellen" [ref=f4e70] [cursor=pointer]
            - button "FaithPath-Daten mitnehmen" [ref=f4e74] [cursor=pointer]
          - generic [ref=f4e78]:
            - generic [ref=f4e79]:
              - generic [ref=f4e80]:
                - generic [ref=f4e81]: Gedanken wiederbegegnen.
                - generic [ref=f4e82]: Freiwillige Einladungen in OLIVA
              - switch "Einladungen in der App erlauben" [ref=f4e86] [cursor=pointer]
            - generic [ref=f4e87]: Wenn du möchtest, begegnen dir ältere Vorhaben und Gedanken wieder, während du OLIVA nutzt. Du kannst sie für 14 Tage zurückstellen oder ausblenden.
            - generic [ref=f4e88]: Du erhältst keine Push-Nachrichten oder E-Mails. Eine Pause sagt nichts über deinen Glauben aus. Deine gespeicherten Entscheidungen bleiben beim Ausschalten erhalten.
            - button "Deine Einladungen ansehen" [ref=f4e89] [cursor=pointer]
          - generic [ref=f4e94]:
            - generic [ref=f4e95]: Einordnungen und KI
            - generic [ref=f4e96]: Diese Ausgabe verwendet lokale, klar gekennzeichnete Erklärungstexte. Es werden keine Fragen oder persönlichen Texte an einen KI-Dienst übertragen.
            - generic [ref=f4e97]: Ein optionaler KI-Begleiter ist für einen späteren Ausbau vorgesehen und hier nicht angeschlossen.
          - generic [ref=f4e98]:
            - generic [ref=f4e99]: Transparent von Anfang an
            - button "Bibeltexte, Bilder & Quellen" [ref=f4e100] [cursor=pointer]
            - button "Den Einstieg noch einmal ansehen" [ref=f4e105] [cursor=pointer]
            - generic [ref=f4e110]: OLIVA · lokale Entwicklungsausgabe 0.18.0
    - navigation "Hauptnavigation" [ref=f4e111]:
      - button "Heute" [ref=f4e112] [cursor=pointer]
      - button "Bibel" [ref=f4e116] [cursor=pointer]
      - button "Wege" [ref=f4e120] [cursor=pointer]
      - button "Mein Garten" [ref=f4e125] [cursor=pointer]
      - button "Sammlung" [ref=f4e130] [cursor=pointer]
  - generic [ref=f4e134]: Für den Offline-Neustart bereit.
```