# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading-position.spec.ts >> ein langer Psalm behält den Vers bei Display- und Schriftänderungen
- Location: tests/e2e/reading-position.spec.ts:24:1

# Error details

```
Error: expect(received).toBeNull()

Received: {"mode": "read", "ref": {"book": "PSA", "chapter": 119}, "verse": 1}

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - main [ref=f1e11]:
    - generic [ref=f1e14]:
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - button "Zurück" [ref=f1e17] [cursor=pointer]
          - button "Psalmen 119⌄" [ref=f1e20] [cursor=pointer]
        - generic [ref=f1e22]:
          - generic [ref=f1e23]: Luther 1912
          - button "Leseeinstellungen" [ref=f1e25] [cursor=pointer]
          - button "Dunklen Modus aktivieren" [ref=f1e29] [cursor=pointer]
      - generic [ref=f1e32]:
        - generic [ref=f1e33]: ALTES TESTAMENT
        - heading "Psalmen" [level=1] [ref=f1e34]
        - generic [ref=f1e35]: Psalmen 119 · Bibeltext
        - button "Zum Kapitelanfang" [ref=f1e36] [cursor=pointer]
        - generic [ref=f1e40]:
          - button "Einfach lesen" [pressed] [ref=f1e41] [cursor=pointer]
          - button "Tiefer verstehen" [ref=f1e43] [cursor=pointer]
        - button "Lesefokus starten" [ref=f1e45] [cursor=pointer]
      - generic [ref=f1e49]:
        - generic [ref=f1e50]: Tippe auf einen Vers, um ihn zu markieren, zu merken, zu kopieren oder eine Notiz zu schreiben.
        - generic [ref=f1e51]:
          - button "Mehrere Verse auswählen" [ref=f1e52] [cursor=pointer]
          - button "Versaktionen" [ref=f1e57] [cursor=pointer]
        - generic [ref=f1e62]:
          - paragraph [ref=f1e64]:
            - 'button "Vers 1: Wohl denen, die ohne Tadel leben, die im Gesetz des HERRN wandeln!" [active] [ref=f1e66] [cursor=pointer]': 1 Wohl denen, die ohne Tadel leben, die im Gesetz des HERRN wandeln!
            - 'button "Vers 2: Wohl denen, die seine Zeugnisse halten, die ihn von ganzem Herzen suchen!" [ref=f1e68] [cursor=pointer]': 2 Wohl denen, die seine Zeugnisse halten, die ihn von ganzem Herzen suchen!
            - 'button "Vers 3: Denn welche auf seinen Wegen wandeln, die tun kein Übel." [ref=f1e70] [cursor=pointer]': 3 Denn welche auf seinen Wegen wandeln, die tun kein Übel.
            - 'button "Vers 4: Du hast geboten, fleißig zu halten deine Befehle." [ref=f1e72] [cursor=pointer]': 4 Du hast geboten, fleißig zu halten deine Befehle.
            - 'button "Vers 5: Oh daß mein Leben deine Rechte mit ganzem Ernst hielte!" [ref=f1e74] [cursor=pointer]': 5 Oh daß mein Leben deine Rechte mit ganzem Ernst hielte!
          - paragraph [ref=f1e76]:
            - 'button "Vers 6: Wenn ich schaue allein auf deine Gebote, so werde ich nicht zu Schanden." [ref=f1e78] [cursor=pointer]': 6 Wenn ich schaue allein auf deine Gebote, so werde ich nicht zu Schanden.
            - 'button "Vers 7: Ich danke dir von Herzen, daß du mich lehrst die Rechte deiner Gerechtigkeit." [ref=f1e80] [cursor=pointer]': 7 Ich danke dir von Herzen, daß du mich lehrst die Rechte deiner Gerechtigkeit.
            - 'button "Vers 8: Deine Rechte will ich halten; verlaß mich nimmermehr." [ref=f1e82] [cursor=pointer]': 8 Deine Rechte will ich halten; verlaß mich nimmermehr.
            - 'button "Vers 9: Wie wird ein Jüngling seinen Weg unsträflich gehen? Wenn er sich hält nach deinen Worten." [ref=f1e84] [cursor=pointer]': 9 Wie wird ein Jüngling seinen Weg unsträflich gehen? Wenn er sich hält nach deinen Worten.
            - 'button "Vers 10: Ich suche dich von ganzem Herzen; laß mich nicht abirren von deinen Geboten." [ref=f1e86] [cursor=pointer]': 10 Ich suche dich von ganzem Herzen; laß mich nicht abirren von deinen Geboten.
          - paragraph [ref=f1e88]:
            - 'button "Vers 11: Ich behalte dein Wort in meinem Herzen, auf daß ich nicht wieder dich sündige." [ref=f1e90] [cursor=pointer]': 11 Ich behalte dein Wort in meinem Herzen, auf daß ich nicht wieder dich sündige.
            - 'button "Vers 12: Gelobt seist du, HERR! Lehre mich deine Rechte!" [ref=f1e92] [cursor=pointer]': 12 Gelobt seist du, HERR! Lehre mich deine Rechte!
            - 'button "Vers 13: Ich will mit meinen Lippen erzählen alle Rechte deines Mundes." [ref=f1e94] [cursor=pointer]': 13 Ich will mit meinen Lippen erzählen alle Rechte deines Mundes.
            - 'button "Vers 14: Ich freue mich des Weges deiner Zeugnisse wie über allerlei Reichtum." [ref=f1e96] [cursor=pointer]': 14 Ich freue mich des Weges deiner Zeugnisse wie über allerlei Reichtum.
            - 'button "Vers 15: Ich rede von dem, was du befohlen hast, und schaue auf deine Wege." [ref=f1e98] [cursor=pointer]': 15 Ich rede von dem, was du befohlen hast, und schaue auf deine Wege.
          - paragraph [ref=f1e100]:
            - 'button "Vers 16: Ich habe Lust zu deinen Rechten und vergesse deiner Worte nicht." [ref=f1e102] [cursor=pointer]': 16 Ich habe Lust zu deinen Rechten und vergesse deiner Worte nicht.
            - 'button "Vers 17: Tue wohl deinem Knecht, daß ich lebe und dein Wort halte." [ref=f1e104] [cursor=pointer]': 17 Tue wohl deinem Knecht, daß ich lebe und dein Wort halte.
            - 'button "Vers 18: Öffne mir die Augen, daß ich sehe die Wunder an deinem Gesetz." [ref=f1e106] [cursor=pointer]': 18 Öffne mir die Augen, daß ich sehe die Wunder an deinem Gesetz.
            - 'button "Vers 19: Ich bin ein Gast auf Erden; verbirg deine Gebote nicht vor mir." [ref=f1e108] [cursor=pointer]': 19 Ich bin ein Gast auf Erden; verbirg deine Gebote nicht vor mir.
            - 'button "Vers 20: Meine Seele ist zermalmt vor Verlangen nach deinen Rechten allezeit." [ref=f1e110] [cursor=pointer]': 20 Meine Seele ist zermalmt vor Verlangen nach deinen Rechten allezeit.
          - paragraph [ref=f1e112]:
            - 'button "Vers 21: Du schiltst die Stolzen; verflucht sind, die von deinen Geboten abirren." [ref=f1e114] [cursor=pointer]': 21 Du schiltst die Stolzen; verflucht sind, die von deinen Geboten abirren.
            - 'button "Vers 22: Wende von mir Schmach und Verachtung; denn ich halte deine Zeugnisse." [ref=f1e116] [cursor=pointer]': 22 Wende von mir Schmach und Verachtung; denn ich halte deine Zeugnisse.
            - 'button "Vers 23: Es sitzen auch die Fürsten und reden wider mich; aber dein Knecht redet von deinen Rechten." [ref=f1e118] [cursor=pointer]': 23 Es sitzen auch die Fürsten und reden wider mich; aber dein Knecht redet von deinen Rechten.
            - 'button "Vers 24: Ich habe Lust zu deinen Zeugnissen; die sind meine Ratsleute." [ref=f1e120] [cursor=pointer]': 24 Ich habe Lust zu deinen Zeugnissen; die sind meine Ratsleute.
            - 'button "Vers 25: Meine Seele liegt im Staube; erquicke mich nach deinem Wort." [ref=f1e122] [cursor=pointer]': 25 Meine Seele liegt im Staube; erquicke mich nach deinem Wort.
          - paragraph [ref=f1e124]:
            - 'button "Vers 26: Ich erzähle meine Wege, und du erhörst mich; lehre mich deine Rechte." [ref=f1e126] [cursor=pointer]': 26 Ich erzähle meine Wege, und du erhörst mich; lehre mich deine Rechte.
            - 'button "Vers 27: Unterweise mich den Weg deiner Befehle, so will ich reden von deinen Wundern." [ref=f1e128] [cursor=pointer]': 27 Unterweise mich den Weg deiner Befehle, so will ich reden von deinen Wundern.
            - 'button "Vers 28: Ich gräme mich, daß mir das Herz verschmachtet; stärke mich nach deinem Wort." [ref=f1e130] [cursor=pointer]': 28 Ich gräme mich, daß mir das Herz verschmachtet; stärke mich nach deinem Wort.
            - 'button "Vers 29: Wende von mir den falschen Weg und gönne mir dein Gesetz." [ref=f1e132] [cursor=pointer]': 29 Wende von mir den falschen Weg und gönne mir dein Gesetz.
            - 'button "Vers 30: Ich habe den Weg der Wahrheit erwählt; deine Rechte habe ich vor mich gestellt." [ref=f1e134] [cursor=pointer]': 30 Ich habe den Weg der Wahrheit erwählt; deine Rechte habe ich vor mich gestellt.
          - paragraph [ref=f1e136]:
            - 'button "Vers 31: Ich hange an deinen Zeugnissen; HERR, laß mich nicht zu Schanden werden!" [ref=f1e138] [cursor=pointer]': 31 Ich hange an deinen Zeugnissen; HERR, laß mich nicht zu Schanden werden!
            - 'button "Vers 32: Wenn du mein Herz tröstest, so laufe ich den Weg deiner Gebote." [ref=f1e140] [cursor=pointer]': 32 Wenn du mein Herz tröstest, so laufe ich den Weg deiner Gebote.
            - 'button "Vers 33: Zeige mir, HERR, den Weg deiner Rechte, daß ich sie bewahre bis ans Ende." [ref=f1e142] [cursor=pointer]': 33 Zeige mir, HERR, den Weg deiner Rechte, daß ich sie bewahre bis ans Ende.
            - 'button "Vers 34: Unterweise mich, daß ich bewahre dein Gesetz und halte es von ganzem Herzen." [ref=f1e144] [cursor=pointer]': 34 Unterweise mich, daß ich bewahre dein Gesetz und halte es von ganzem Herzen.
            - 'button "Vers 35: Führe mich auf dem Steige deiner Gebote; denn ich habe Lust dazu." [ref=f1e146] [cursor=pointer]': 35 Führe mich auf dem Steige deiner Gebote; denn ich habe Lust dazu.
          - paragraph [ref=f1e148]:
            - 'button "Vers 36: Neige mein Herz zu deinen Zeugnissen, und nicht zum Geiz." [ref=f1e150] [cursor=pointer]': 36 Neige mein Herz zu deinen Zeugnissen, und nicht zum Geiz.
            - 'button "Vers 37: Wende meine Augen ab, daß sie nicht sehen nach unnützer Lehre; sondern erquicke mich auf deinem Wege." [ref=f1e152] [cursor=pointer]': 37 Wende meine Augen ab, daß sie nicht sehen nach unnützer Lehre; sondern erquicke mich auf deinem Wege.
            - 'button "Vers 38: Laß deinen Knecht dein Gebot fest für dein Wort halten, daß ich mich nicht fürchte." [ref=f1e154] [cursor=pointer]': 38 Laß deinen Knecht dein Gebot fest für dein Wort halten, daß ich mich nicht fürchte.
            - 'button "Vers 39: Wende von mir die Schmach, die ich scheue; denn deine Rechte sind lieblich." [ref=f1e156] [cursor=pointer]': 39 Wende von mir die Schmach, die ich scheue; denn deine Rechte sind lieblich.
            - 'button "Vers 40: Siehe, ich begehre deiner Befehle; erquicke mich mit deiner Gerechtigkeit." [ref=f1e158] [cursor=pointer]': 40 Siehe, ich begehre deiner Befehle; erquicke mich mit deiner Gerechtigkeit.
          - paragraph [ref=f1e160]:
            - 'button "Vers 41: HERR, laß mir deine Gnade widerfahren, deine Hilfe nach deinem Wort," [ref=f1e162] [cursor=pointer]': 41 HERR, laß mir deine Gnade widerfahren, deine Hilfe nach deinem Wort,
            - 'button "Vers 42: daß ich antworten möge meinem Lästerer; denn ich verlasse mich auf dein Wort." [ref=f1e164] [cursor=pointer]': 42 daß ich antworten möge meinem Lästerer; denn ich verlasse mich auf dein Wort.
            - 'button "Vers 43: Und nimm ja nicht von meinem Munde das Wort der Wahrheit; denn ich hoffe auf deine Rechte." [ref=f1e166] [cursor=pointer]': 43 Und nimm ja nicht von meinem Munde das Wort der Wahrheit; denn ich hoffe auf deine Rechte.
            - 'button "Vers 44: Ich will dein Gesetz halten allewege, immer und ewiglich." [ref=f1e168] [cursor=pointer]': 44 Ich will dein Gesetz halten allewege, immer und ewiglich.
            - 'button "Vers 45: Und ich wandle fröhlich; denn ich suche deine Befehle." [ref=f1e170] [cursor=pointer]': 45 Und ich wandle fröhlich; denn ich suche deine Befehle.
          - paragraph [ref=f1e172]:
            - 'button "Vers 46: Ich rede von deinen Zeugnissen vor Königen und schäme mich nicht" [ref=f1e174] [cursor=pointer]': 46 Ich rede von deinen Zeugnissen vor Königen und schäme mich nicht
            - 'button "Vers 47: und habe Lust an deinen Geboten, und sie sind mir lieb," [ref=f1e176] [cursor=pointer]': 47 und habe Lust an deinen Geboten, und sie sind mir lieb,
            - 'button "Vers 48: und hebe meine Hände auf zu deinen Geboten, die mir lieb sind, und rede von deinen Rechten." [ref=f1e178] [cursor=pointer]': 48 und hebe meine Hände auf zu deinen Geboten, die mir lieb sind, und rede von deinen Rechten.
            - 'button "Vers 49: Gedenke deinem Knechte an dein Wort, auf welches du mich lässest hoffen." [ref=f1e180] [cursor=pointer]': 49 Gedenke deinem Knechte an dein Wort, auf welches du mich lässest hoffen.
            - 'button "Vers 50: Das ist mein Trost in meinem Elend; denn dein Wort erquickt mich." [ref=f1e182] [cursor=pointer]': 50 Das ist mein Trost in meinem Elend; denn dein Wort erquickt mich.
          - paragraph [ref=f1e184]:
            - 'button "Vers 51: Die Stolzen haben ihren Spott an mir; dennoch weiche ich nicht von deinem Gesetz." [ref=f1e186] [cursor=pointer]': 51 Die Stolzen haben ihren Spott an mir; dennoch weiche ich nicht von deinem Gesetz.
            - 'button "Vers 52: HERR, wenn ich gedenke, wie du von der Welt her gerichtet hast, so werde ich getröstet." [ref=f1e188] [cursor=pointer]': 52 HERR, wenn ich gedenke, wie du von der Welt her gerichtet hast, so werde ich getröstet.
            - 'button "Vers 53: Ich bin entbrannt über die Gottlosen, die dein Gesetz verlassen." [ref=f1e190] [cursor=pointer]': 53 Ich bin entbrannt über die Gottlosen, die dein Gesetz verlassen.
            - 'button "Vers 54: Deine Rechte sind mein Lied in dem Hause meiner Wallfahrt." [ref=f1e192] [cursor=pointer]': 54 Deine Rechte sind mein Lied in dem Hause meiner Wallfahrt.
            - 'button "Vers 55: HERR, ich gedenke des Nachts an deinen Namen und halte dein Gesetz." [ref=f1e194] [cursor=pointer]': 55 HERR, ich gedenke des Nachts an deinen Namen und halte dein Gesetz.
          - paragraph [ref=f1e196]:
            - 'button "Vers 56: Das ist mein Schatz, daß ich deine Befehle halte." [ref=f1e198] [cursor=pointer]': 56 Das ist mein Schatz, daß ich deine Befehle halte.
            - 'button "Vers 57: Ich habe gesagt: “HERR, das soll mein Erbe sein, daß ich deine Worte halte.”" [ref=f1e200] [cursor=pointer]': "57 Ich habe gesagt: “HERR, das soll mein Erbe sein, daß ich deine Worte halte.”"
            - 'button "Vers 58: Ich flehe vor deinem Angesicht von ganzem Herzen; sei mir gnädig nach deinem Wort." [ref=f1e202] [cursor=pointer]': 58 Ich flehe vor deinem Angesicht von ganzem Herzen; sei mir gnädig nach deinem Wort.
            - 'button "Vers 59: Ich betrachte meine Wege und kehre meine Füße zu deinen Zeugnissen." [ref=f1e204] [cursor=pointer]': 59 Ich betrachte meine Wege und kehre meine Füße zu deinen Zeugnissen.
            - 'button "Vers 60: Ich eile und säume mich nicht, zu halten deine Gebote." [ref=f1e206] [cursor=pointer]': 60 Ich eile und säume mich nicht, zu halten deine Gebote.
          - paragraph [ref=f1e208]:
            - 'button "Vers 61: Der Gottlosen Rotte beraubt mich; aber ich vergesse deines Gesetzes nicht." [ref=f1e210] [cursor=pointer]': 61 Der Gottlosen Rotte beraubt mich; aber ich vergesse deines Gesetzes nicht.
            - 'button "Vers 62: Zur Mitternacht stehe ich auf, dir zu danken für die Rechte deiner Gerechtigkeit." [ref=f1e212] [cursor=pointer]': 62 Zur Mitternacht stehe ich auf, dir zu danken für die Rechte deiner Gerechtigkeit.
            - 'button "Vers 63: Ich halte mich zu denen, die dich fürchten und deine Befehle halten." [ref=f1e214] [cursor=pointer]': 63 Ich halte mich zu denen, die dich fürchten und deine Befehle halten.
            - 'button "Vers 64: HERR, die Erde ist voll deiner Güte; lehre mich deine Rechte." [ref=f1e216] [cursor=pointer]': 64 HERR, die Erde ist voll deiner Güte; lehre mich deine Rechte.
            - 'button "Vers 65: Du tust Gutes deinem Knechte, HERR, nach deinem Wort." [ref=f1e218] [cursor=pointer]': 65 Du tust Gutes deinem Knechte, HERR, nach deinem Wort.
          - paragraph [ref=f1e220]:
            - 'button "Vers 66: Lehre mich heilsame Sitten und Erkenntnis; den ich glaube deinen Geboten." [ref=f1e222] [cursor=pointer]': 66 Lehre mich heilsame Sitten und Erkenntnis; den ich glaube deinen Geboten.
            - 'button "Vers 67: Ehe ich gedemütigt ward, irrte ich; nun aber halte ich dein Wort." [ref=f1e224] [cursor=pointer]': 67 Ehe ich gedemütigt ward, irrte ich; nun aber halte ich dein Wort.
            - 'button "Vers 68: Du bist gütig und freundlich; lehre mich deine Rechte." [ref=f1e226] [cursor=pointer]': 68 Du bist gütig und freundlich; lehre mich deine Rechte.
            - 'button "Vers 69: Die Stolzen erdichten Lügen über mich; ich aber halte von ganzem Herzen deine Befehle." [ref=f1e228] [cursor=pointer]': 69 Die Stolzen erdichten Lügen über mich; ich aber halte von ganzem Herzen deine Befehle.
            - 'button "Vers 70: Ihr Herz ist dick wie Schmer; ich aber habe Lust an deinem Gesetz." [ref=f1e230] [cursor=pointer]': 70 Ihr Herz ist dick wie Schmer; ich aber habe Lust an deinem Gesetz.
          - paragraph [ref=f1e232]:
            - 'button "Vers 71: Es ist mir lieb, daß du mich gedemütigt hast, daß ich deine Rechte lerne." [ref=f1e234] [cursor=pointer]': 71 Es ist mir lieb, daß du mich gedemütigt hast, daß ich deine Rechte lerne.
            - 'button "Vers 72: Das Gesetz deines Mundes ist mir lieber denn viel tausend Stück Gold und Silber." [ref=f1e236] [cursor=pointer]': 72 Das Gesetz deines Mundes ist mir lieber denn viel tausend Stück Gold und Silber.
            - 'button "Vers 73: Deine Hand hat mich gemacht und bereitet; unterweise mich, daß ich deine Gebote lerne." [ref=f1e238] [cursor=pointer]': 73 Deine Hand hat mich gemacht und bereitet; unterweise mich, daß ich deine Gebote lerne.
            - 'button "Vers 74: Die dich fürchten, sehen mich und freuen sich; denn ich hoffe auf dein Wort." [ref=f1e240] [cursor=pointer]': 74 Die dich fürchten, sehen mich und freuen sich; denn ich hoffe auf dein Wort.
            - 'button "Vers 75: HERR, ich weiß, daß deine Gerichte recht sind; du hast mich treulich gedemütigt." [ref=f1e242] [cursor=pointer]': 75 HERR, ich weiß, daß deine Gerichte recht sind; du hast mich treulich gedemütigt.
          - paragraph [ref=f1e244]:
            - 'button "Vers 76: Deine Gnade müsse mein Trost sein, wie du deinem Knecht zugesagt hast." [ref=f1e246] [cursor=pointer]': 76 Deine Gnade müsse mein Trost sein, wie du deinem Knecht zugesagt hast.
            - 'button "Vers 77: Laß mir deine Barmherzigkeit widerfahren, daß ich lebe; denn ich habe Lust zu deinem Gesetz." [ref=f1e248] [cursor=pointer]': 77 Laß mir deine Barmherzigkeit widerfahren, daß ich lebe; denn ich habe Lust zu deinem Gesetz.
            - 'button "Vers 78: Ach daß die Stolzen müßten zu Schanden werden, die mich mit Lügen niederdrücken! ich aber rede von deinen Befehlen." [ref=f1e250] [cursor=pointer]': 78 Ach daß die Stolzen müßten zu Schanden werden, die mich mit Lügen niederdrücken! ich aber rede von deinen Befehlen.
            - 'button "Vers 79: Ach daß sich müßten zu mir halten, die dich fürchten und deine Zeugnisse kennen!" [ref=f1e252] [cursor=pointer]': 79 Ach daß sich müßten zu mir halten, die dich fürchten und deine Zeugnisse kennen!
            - 'button "Vers 80: Mein Herz bleibe rechtschaffen in deinen Rechten, daß ich nicht zu Schanden werde." [ref=f1e254] [cursor=pointer]': 80 Mein Herz bleibe rechtschaffen in deinen Rechten, daß ich nicht zu Schanden werde.
          - paragraph [ref=f1e256]:
            - 'button "Vers 81: Meine Seele verlangt nach deinem Heil; ich hoffe auf dein Wort." [ref=f1e258] [cursor=pointer]': 81 Meine Seele verlangt nach deinem Heil; ich hoffe auf dein Wort.
            - 'button "Vers 82: Meine Augen sehnen sich nach deinem Wort und sagen: Wann tröstest du mich?" [ref=f1e260] [cursor=pointer]': "82 Meine Augen sehnen sich nach deinem Wort und sagen: Wann tröstest du mich?"
            - 'button "Vers 83: Denn ich bin wie ein Schlauch im Rauch; deiner Rechte vergesse ich nicht." [ref=f1e262] [cursor=pointer]': 83 Denn ich bin wie ein Schlauch im Rauch; deiner Rechte vergesse ich nicht.
            - 'button "Vers 84: Wie lange soll dein Knecht warten? Wann willst du Gericht halten über meine Verfolger?" [ref=f1e264] [cursor=pointer]': 84 Wie lange soll dein Knecht warten? Wann willst du Gericht halten über meine Verfolger?
            - 'button "Vers 85: Die Stolzen graben ihre Gruben, sie, die nicht sind nach deinem Gesetz." [ref=f1e266] [cursor=pointer]': 85 Die Stolzen graben ihre Gruben, sie, die nicht sind nach deinem Gesetz.
          - paragraph [ref=f1e268]:
            - 'button "Vers 86: Deine Gebote sind eitel Wahrheit. Sie verfolgen mich mit Lügen; hilf mir." [ref=f1e270] [cursor=pointer]': 86 Deine Gebote sind eitel Wahrheit. Sie verfolgen mich mit Lügen; hilf mir.
            - 'button "Vers 87: Sie haben mich schier umgebracht auf Erden; ich aber lasse deine Befehle nicht." [ref=f1e272] [cursor=pointer]': 87 Sie haben mich schier umgebracht auf Erden; ich aber lasse deine Befehle nicht.
            - 'button "Vers 88: Erquicke mich durch deine Gnade, daß ich halte die Zeugnisse deines Mundes." [ref=f1e274] [cursor=pointer]': 88 Erquicke mich durch deine Gnade, daß ich halte die Zeugnisse deines Mundes.
            - 'button "Vers 89: HERR, dein Wort bleibt ewiglich, soweit der Himmel ist;" [ref=f1e276] [cursor=pointer]': 89 HERR, dein Wort bleibt ewiglich, soweit der Himmel ist;
            - 'button "Vers 90: deine Wahrheit währet für und für. Du hast die Erde zugerichtet, und sie bleibt stehen." [ref=f1e278] [cursor=pointer]': 90 deine Wahrheit währet für und für. Du hast die Erde zugerichtet, und sie bleibt stehen.
          - paragraph [ref=f1e280]:
            - 'button "Vers 91: Es bleibt täglich nach deinem Wort; denn es muß dir alles dienen." [ref=f1e282] [cursor=pointer]': 91 Es bleibt täglich nach deinem Wort; denn es muß dir alles dienen.
            - 'button "Vers 92: Wo dein Gesetz nicht mein Trost gewesen wäre, so wäre ich vergangen in meinem Elend." [ref=f1e284] [cursor=pointer]': 92 Wo dein Gesetz nicht mein Trost gewesen wäre, so wäre ich vergangen in meinem Elend.
            - 'button "Vers 93: Ich will deine Befehle nimmermehr vergessen; denn du erqickest mich damit." [ref=f1e286] [cursor=pointer]': 93 Ich will deine Befehle nimmermehr vergessen; denn du erqickest mich damit.
            - 'button "Vers 94: Ich bin dein, hilf mir! denn ich suche deine Befehle." [ref=f1e288] [cursor=pointer]': 94 Ich bin dein, hilf mir! denn ich suche deine Befehle.
            - 'button "Vers 95: Die Gottlosen lauern auf mich, daß sie mich umbringen; ich aber merke auf deine Zeugnisse." [ref=f1e290] [cursor=pointer]': 95 Die Gottlosen lauern auf mich, daß sie mich umbringen; ich aber merke auf deine Zeugnisse.
          - paragraph [ref=f1e292]:
            - 'button "Vers 96: Ich habe alles Dinges ein Ende gesehen; aber dein Gebot währet." [ref=f1e294] [cursor=pointer]': 96 Ich habe alles Dinges ein Ende gesehen; aber dein Gebot währet.
            - 'button "Vers 97: Wie habe ich dein Gesetz so lieb! Täglich rede ich davon." [ref=f1e296] [cursor=pointer]': 97 Wie habe ich dein Gesetz so lieb! Täglich rede ich davon.
            - 'button "Vers 98: Du machst mich mit deinem Gebot weiser, als meine Feinde sind; denn es ist ewiglich mein Schatz." [ref=f1e298] [cursor=pointer]': 98 Du machst mich mit deinem Gebot weiser, als meine Feinde sind; denn es ist ewiglich mein Schatz.
            - 'button "Vers 99: Ich bin gelehrter denn alle meine Lehrer; denn deine Zeugnisse sind meine Rede." [ref=f1e300] [cursor=pointer]': 99 Ich bin gelehrter denn alle meine Lehrer; denn deine Zeugnisse sind meine Rede.
            - 'button "Vers 100: Ich bin klüger denn die Alten; denn ich halte deine Befehle." [ref=f1e302] [cursor=pointer]': 100 Ich bin klüger denn die Alten; denn ich halte deine Befehle.
          - paragraph [ref=f1e304]:
            - 'button "Vers 101: Ich wehre meinem Fuß alle bösen Wege, daß ich dein Wort halte." [ref=f1e306] [cursor=pointer]': 101 Ich wehre meinem Fuß alle bösen Wege, daß ich dein Wort halte.
            - 'button "Vers 102: Ich weiche nicht von deinen Rechten; denn du lehrest mich." [ref=f1e308] [cursor=pointer]': 102 Ich weiche nicht von deinen Rechten; denn du lehrest mich.
            - 'button "Vers 103: Dein Wort ist meinem Munde süßer denn Honig." [ref=f1e310] [cursor=pointer]': 103 Dein Wort ist meinem Munde süßer denn Honig.
            - 'button "Vers 104: Dein Wort macht mich klug; darum hasse ich alle falschen Wege." [ref=f1e312] [cursor=pointer]': 104 Dein Wort macht mich klug; darum hasse ich alle falschen Wege.
            - 'button "Vers 105: Dein Wort ist meine Fußes Leuchte und ein Licht auf meinem Wege." [ref=f1e314] [cursor=pointer]': 105 Dein Wort ist meine Fußes Leuchte und ein Licht auf meinem Wege.
          - paragraph [ref=f1e316]:
            - 'button "Vers 106: Ich schwöre und will''s halten, daß ich die Rechte deiner Gerechtigkeit halten will." [ref=f1e318] [cursor=pointer]': 106 Ich schwöre und will's halten, daß ich die Rechte deiner Gerechtigkeit halten will.
            - 'button "Vers 107: Ich bin sehr gedemütigt; HERR, erquicke mich nach deinem Wort!" [ref=f1e320] [cursor=pointer]': 107 Ich bin sehr gedemütigt; HERR, erquicke mich nach deinem Wort!
            - 'button "Vers 108: Laß dir gefallen, HERR das willige Opfer meines Mundes und lehre mich deine Rechte." [ref=f1e322] [cursor=pointer]': 108 Laß dir gefallen, HERR das willige Opfer meines Mundes und lehre mich deine Rechte.
            - 'button "Vers 109: Ich trage meine Seele immer in meinen Händen, und ich vergesse deines Gesetzes nicht." [ref=f1e324] [cursor=pointer]': 109 Ich trage meine Seele immer in meinen Händen, und ich vergesse deines Gesetzes nicht.
            - 'button "Vers 110: Die Gottlosen legen mir Stricke; ich aber irre nicht von deinen Befehlen." [ref=f1e326] [cursor=pointer]': 110 Die Gottlosen legen mir Stricke; ich aber irre nicht von deinen Befehlen.
          - paragraph [ref=f1e328]:
            - 'button "Vers 111: Deine Zeugnisse sind mein ewiges Erbe; denn sie sind meines Herzens Wonne." [ref=f1e330] [cursor=pointer]': 111 Deine Zeugnisse sind mein ewiges Erbe; denn sie sind meines Herzens Wonne.
            - 'button "Vers 112: Ich neige mein Herz, zu tun nach deinen Rechten immer und ewiglich." [ref=f1e332] [cursor=pointer]': 112 Ich neige mein Herz, zu tun nach deinen Rechten immer und ewiglich.
            - 'button "Vers 113: Ich hasse die Flattergeister und liebe dein Gesetz." [ref=f1e334] [cursor=pointer]': 113 Ich hasse die Flattergeister und liebe dein Gesetz.
            - 'button "Vers 114: Du bist mein Schirm und Schild; ich hoffe auf dein Wort." [ref=f1e336] [cursor=pointer]': 114 Du bist mein Schirm und Schild; ich hoffe auf dein Wort.
            - 'button "Vers 115: Weichet von mir, ihr Boshaften! Ich will halten die Gebote meines Gottes." [ref=f1e338] [cursor=pointer]': 115 Weichet von mir, ihr Boshaften! Ich will halten die Gebote meines Gottes.
          - paragraph [ref=f1e340]:
            - 'button "Vers 116: Erhalte mich durch dein Wort, daß ich lebe; und laß mich nicht zu Schanden werden über meiner Hoffnung." [ref=f1e342] [cursor=pointer]': 116 Erhalte mich durch dein Wort, daß ich lebe; und laß mich nicht zu Schanden werden über meiner Hoffnung.
            - 'button "Vers 117: Stärke mich, daß ich genese, so will ich stets meine Lust haben an deinen Rechten." [ref=f1e344] [cursor=pointer]': 117 Stärke mich, daß ich genese, so will ich stets meine Lust haben an deinen Rechten.
            - 'button "Vers 118: Du zertrittst alle, die von deinen Rechten abirren; denn ihre Trügerei ist eitel Lüge." [ref=f1e346] [cursor=pointer]': 118 Du zertrittst alle, die von deinen Rechten abirren; denn ihre Trügerei ist eitel Lüge.
            - 'button "Vers 119: Du wirfst alle Gottlosen auf Erden weg wie Schlacken; darum liebe ich deine Zeugnisse." [ref=f1e348] [cursor=pointer]': 119 Du wirfst alle Gottlosen auf Erden weg wie Schlacken; darum liebe ich deine Zeugnisse.
            - 'button "Vers 120: Ich fürchte mich vor dir, daß mir die Haut schaudert, und entsetze mich vor deinen Gerichten." [ref=f1e350] [cursor=pointer]': 120 Ich fürchte mich vor dir, daß mir die Haut schaudert, und entsetze mich vor deinen Gerichten.
          - paragraph [ref=f1e352]:
            - 'button "Vers 121: Ich halte über Recht und Gerechtigkeit; übergib mich nicht denen, die mir wollen Gewalt tun." [ref=f1e354] [cursor=pointer]': 121 Ich halte über Recht und Gerechtigkeit; übergib mich nicht denen, die mir wollen Gewalt tun.
            - 'button "Vers 122: Vertritt du deinen Knecht und tröste ihn; mögen mir die Stolzen nicht Gewalt tun." [ref=f1e356] [cursor=pointer]': 122 Vertritt du deinen Knecht und tröste ihn; mögen mir die Stolzen nicht Gewalt tun.
            - 'button "Vers 123: Meine Augen sehnen sich nach deinem Heil und nach dem Wort deiner Gerechtigkeit." [ref=f1e358] [cursor=pointer]': 123 Meine Augen sehnen sich nach deinem Heil und nach dem Wort deiner Gerechtigkeit.
            - 'button "Vers 124: Handle mit deinem Knecht nach deiner Gnade und lehre mich deine Rechte." [ref=f1e360] [cursor=pointer]': 124 Handle mit deinem Knecht nach deiner Gnade und lehre mich deine Rechte.
            - 'button "Vers 125: Ich bin dein Knecht; unterweise mich, daß ich erkenne deine Zeugnisse." [ref=f1e362] [cursor=pointer]': 125 Ich bin dein Knecht; unterweise mich, daß ich erkenne deine Zeugnisse.
          - paragraph [ref=f1e364]:
            - 'button "Vers 126: Es ist Zeit, daß der HERR dazutue; sie haben dein Gesetz zerrissen." [ref=f1e366] [cursor=pointer]': 126 Es ist Zeit, daß der HERR dazutue; sie haben dein Gesetz zerrissen.
            - 'button "Vers 127: Darum liebe ich dein Gebot über Gold und über feines Gold." [ref=f1e368] [cursor=pointer]': 127 Darum liebe ich dein Gebot über Gold und über feines Gold.
            - 'button "Vers 128: Darum halte ich stracks alle deine Befehle; ich hasse allen falschen Weg." [ref=f1e370] [cursor=pointer]': 128 Darum halte ich stracks alle deine Befehle; ich hasse allen falschen Weg.
            - 'button "Vers 129: Deine Zeugnisse sind wunderbar; darum hält sie meine Seele." [ref=f1e372] [cursor=pointer]': 129 Deine Zeugnisse sind wunderbar; darum hält sie meine Seele.
            - 'button "Vers 130: Wenn dein Wort offenbar wird, so erfreut es und macht klug die Einfältigen." [ref=f1e374] [cursor=pointer]': 130 Wenn dein Wort offenbar wird, so erfreut es und macht klug die Einfältigen.
          - paragraph [ref=f1e376]:
            - 'button "Vers 131: Ich sperre meinen Mund auf und lechze nach deinen Geboten; denn mich verlangt darnach." [ref=f1e378] [cursor=pointer]': 131 Ich sperre meinen Mund auf und lechze nach deinen Geboten; denn mich verlangt darnach.
            - 'button "Vers 132: Wende dich zu mir und sei mir gnädig, wie du pflegst zu tun denen, die deinen Namen lieben." [ref=f1e380] [cursor=pointer]': 132 Wende dich zu mir und sei mir gnädig, wie du pflegst zu tun denen, die deinen Namen lieben.
            - 'button "Vers 133: Laß meinen Gang gewiß sein in deinem Wort und laß kein Unrecht über mich herrschen." [ref=f1e382] [cursor=pointer]': 133 Laß meinen Gang gewiß sein in deinem Wort und laß kein Unrecht über mich herrschen.
            - 'button "Vers 134: Erlöse mich von der Menschen Frevel, so will ich halten deine Befehle." [ref=f1e384] [cursor=pointer]': 134 Erlöse mich von der Menschen Frevel, so will ich halten deine Befehle.
            - 'button "Vers 135: Laß dein Antlitz leuchten über deinen Knecht und lehre mich deine Rechte." [ref=f1e386] [cursor=pointer]': 135 Laß dein Antlitz leuchten über deinen Knecht und lehre mich deine Rechte.
          - paragraph [ref=f1e388]:
            - 'button "Vers 136: Meine Augen fließen mit Wasser, daß man dein Gesetz nicht hält." [ref=f1e390] [cursor=pointer]': 136 Meine Augen fließen mit Wasser, daß man dein Gesetz nicht hält.
            - 'button "Vers 137: HERR, du bist gerecht, und dein Wort ist recht." [ref=f1e392] [cursor=pointer]': 137 HERR, du bist gerecht, und dein Wort ist recht.
            - 'button "Vers 138: Du hast die Zeugnisse deiner Gerechtigkeit und die Wahrheit hart geboten." [ref=f1e394] [cursor=pointer]': 138 Du hast die Zeugnisse deiner Gerechtigkeit und die Wahrheit hart geboten.
            - 'button "Vers 139: Ich habe mich schier zu Tode geeifert, daß meine Gegner deiner Worte vergessen." [ref=f1e396] [cursor=pointer]': 139 Ich habe mich schier zu Tode geeifert, daß meine Gegner deiner Worte vergessen.
            - 'button "Vers 140: Dein Wort ist wohl geläutert, und dein Knecht hat es lieb." [ref=f1e398] [cursor=pointer]': 140 Dein Wort ist wohl geläutert, und dein Knecht hat es lieb.
          - paragraph [ref=f1e400]:
            - 'button "Vers 141: Ich bin gering und verachtet; ich vergesse aber nicht deiner Befehle." [ref=f1e402] [cursor=pointer]': 141 Ich bin gering und verachtet; ich vergesse aber nicht deiner Befehle.
            - 'button "Vers 142: Deine Gerechtigkeit ist eine ewige Gerechtigkeit, und dein Gesetz ist Wahrheit." [ref=f1e404] [cursor=pointer]': 142 Deine Gerechtigkeit ist eine ewige Gerechtigkeit, und dein Gesetz ist Wahrheit.
            - 'button "Vers 143: Angst und Not haben mich getroffen; ich habe aber Lust an deinen Geboten." [ref=f1e406] [cursor=pointer]': 143 Angst und Not haben mich getroffen; ich habe aber Lust an deinen Geboten.
            - 'button "Vers 144: Die Gerechtigkeit deiner Zeugnisse ist ewig; unterweise mich, so lebe ich." [ref=f1e408] [cursor=pointer]': 144 Die Gerechtigkeit deiner Zeugnisse ist ewig; unterweise mich, so lebe ich.
            - 'button "Vers 145: Ich rufe von ganzem Herzen; erhöre mich, HERR, daß ich dein Rechte halte." [ref=f1e410] [cursor=pointer]': 145 Ich rufe von ganzem Herzen; erhöre mich, HERR, daß ich dein Rechte halte.
          - paragraph [ref=f1e412]:
            - 'button "Vers 146: Ich rufe zu dir; hilf mir, daß ich deine Zeugnisse halte." [ref=f1e414] [cursor=pointer]': 146 Ich rufe zu dir; hilf mir, daß ich deine Zeugnisse halte.
            - 'button "Vers 147: Ich komme in der Frühe und schreie; auf dein Wort hoffe ich." [ref=f1e416] [cursor=pointer]': 147 Ich komme in der Frühe und schreie; auf dein Wort hoffe ich.
            - 'button "Vers 148: Ich wache auf, wenn''s noch Nacht ist, zu sinnen über dein Wort." [ref=f1e418] [cursor=pointer]': 148 Ich wache auf, wenn's noch Nacht ist, zu sinnen über dein Wort.
            - 'button "Vers 149: Höre meine Stimme nach deiner Gnade; HERR, erquicke mich nach deinen Rechten." [ref=f1e420] [cursor=pointer]': 149 Höre meine Stimme nach deiner Gnade; HERR, erquicke mich nach deinen Rechten.
            - 'button "Vers 150: Meine boshaften Verfolger nahen herzu und sind ferne von deinem Gesetz." [ref=f1e422] [cursor=pointer]': 150 Meine boshaften Verfolger nahen herzu und sind ferne von deinem Gesetz.
          - paragraph [ref=f1e424]:
            - 'button "Vers 151: HERR, du bist nahe, und deine Gebote sind eitel Wahrheit." [ref=f1e426] [cursor=pointer]': 151 HERR, du bist nahe, und deine Gebote sind eitel Wahrheit.
            - 'button "Vers 152: Längst weiß ich, daß du deine Zeugnisse für ewig gegründet hast." [ref=f1e428] [cursor=pointer]': 152 Längst weiß ich, daß du deine Zeugnisse für ewig gegründet hast.
            - 'button "Vers 153: Siehe mein Elend und errette mich; hilf mir aus, denn ich vergesse deines Gesetzes nicht." [ref=f1e430] [cursor=pointer]': 153 Siehe mein Elend und errette mich; hilf mir aus, denn ich vergesse deines Gesetzes nicht.
            - 'button "Vers 154: Führe meine Sache und erlöse mich; erquicke mich durch dein Wort." [ref=f1e432] [cursor=pointer]': 154 Führe meine Sache und erlöse mich; erquicke mich durch dein Wort.
            - 'button "Vers 155: Das Heil ist ferne von den Gottlosen; denn sie achten deine Rechte nicht." [ref=f1e434] [cursor=pointer]': 155 Das Heil ist ferne von den Gottlosen; denn sie achten deine Rechte nicht.
          - paragraph [ref=f1e436]:
            - 'button "Vers 156: HERR, deine Barmherzigkeit ist groß; erquicke mich nach deinen Rechten." [ref=f1e438] [cursor=pointer]': 156 HERR, deine Barmherzigkeit ist groß; erquicke mich nach deinen Rechten.
            - 'button "Vers 157: Meiner Verfolger und Widersacher sind viele; ich weiche aber nicht von deinen Zeugnissen." [ref=f1e440] [cursor=pointer]': 157 Meiner Verfolger und Widersacher sind viele; ich weiche aber nicht von deinen Zeugnissen.
            - 'button "Vers 158: Ich sehe die Verächter, und es tut mir wehe, daß sie dein Wort nicht halten." [ref=f1e442] [cursor=pointer]': 158 Ich sehe die Verächter, und es tut mir wehe, daß sie dein Wort nicht halten.
            - 'button "Vers 159: Siehe, ich liebe deine Befehle; HERR, erquicke mich nach deiner Gnade." [ref=f1e444] [cursor=pointer]': 159 Siehe, ich liebe deine Befehle; HERR, erquicke mich nach deiner Gnade.
            - 'button "Vers 160: Dein Wort ist nichts denn Wahrheit; alle Rechte deiner Gerechtigkeit währen ewiglich." [ref=f1e446] [cursor=pointer]': 160 Dein Wort ist nichts denn Wahrheit; alle Rechte deiner Gerechtigkeit währen ewiglich.
          - paragraph [ref=f1e448]:
            - 'button "Vers 161: Die Fürsten verfolgen mich ohne Ursache, und mein Herz fürchtet sich vor deinen Worten." [ref=f1e450] [cursor=pointer]': 161 Die Fürsten verfolgen mich ohne Ursache, und mein Herz fürchtet sich vor deinen Worten.
            - 'button "Vers 162: Ich freue mich über dein Wort wie einer, der eine große Beute kriegt." [ref=f1e452] [cursor=pointer]': 162 Ich freue mich über dein Wort wie einer, der eine große Beute kriegt.
            - 'button "Vers 163: Lügen bin ich gram und habe Greuel daran; aber dein Gesetz habe ich lieb." [ref=f1e454] [cursor=pointer]': 163 Lügen bin ich gram und habe Greuel daran; aber dein Gesetz habe ich lieb.
            - 'button "Vers 164: Ich lobe dich des Tages siebenmal um der Rechte willen deiner Gerechtigkeit." [ref=f1e456] [cursor=pointer]': 164 Ich lobe dich des Tages siebenmal um der Rechte willen deiner Gerechtigkeit.
            - 'button "Vers 165: Großen Frieden haben, die dein Gesetz lieben; sie werden nicht straucheln." [ref=f1e458] [cursor=pointer]': 165 Großen Frieden haben, die dein Gesetz lieben; sie werden nicht straucheln.
          - paragraph [ref=f1e460]:
            - 'button "Vers 166: HERR, ich warte auf dein Heil und tue nach deinen Geboten." [ref=f1e462] [cursor=pointer]': 166 HERR, ich warte auf dein Heil und tue nach deinen Geboten.
            - 'button "Vers 167: Meine Seele hält deine Zeugnisse und liebt sie sehr." [ref=f1e464] [cursor=pointer]': 167 Meine Seele hält deine Zeugnisse und liebt sie sehr.
            - 'button "Vers 168: Ich halte deine Befehle und deine Zeugnisse; denn alle meine Wege sind vor dir." [ref=f1e466] [cursor=pointer]': 168 Ich halte deine Befehle und deine Zeugnisse; denn alle meine Wege sind vor dir.
            - 'button "Vers 169: HERR, laß meine Klage vor dich kommen; unterweise mich nach deinem Wort." [ref=f1e468] [cursor=pointer]': 169 HERR, laß meine Klage vor dich kommen; unterweise mich nach deinem Wort.
            - 'button "Vers 170: Laß mein Flehen vor dich kommen; errette mich nach deinem Wort." [ref=f1e470] [cursor=pointer]': 170 Laß mein Flehen vor dich kommen; errette mich nach deinem Wort.
          - paragraph [ref=f1e472]:
            - 'button "Vers 171: Meine Lippen sollen loben, wenn du mich deine Rechte lehrest." [ref=f1e474] [cursor=pointer]': 171 Meine Lippen sollen loben, wenn du mich deine Rechte lehrest.
            - 'button "Vers 172: Meine Zunge soll ihr Gespräch haben von deinem Wort; denn alle deine Gebote sind recht." [ref=f1e476] [cursor=pointer]': 172 Meine Zunge soll ihr Gespräch haben von deinem Wort; denn alle deine Gebote sind recht.
            - 'button "Vers 173: Laß mir deine Hand beistehen; denn ich habe erwählt deine Befehle." [ref=f1e478] [cursor=pointer]': 173 Laß mir deine Hand beistehen; denn ich habe erwählt deine Befehle.
            - 'button "Vers 174: HERR, mich verlangt nach deinem Heil, und ich habe Lust an deinem Gesetz." [ref=f1e480] [cursor=pointer]': 174 HERR, mich verlangt nach deinem Heil, und ich habe Lust an deinem Gesetz.
            - 'button "Vers 175: Laß meine Seele leben, daß sie dich lobe, und deine Rechte mir helfen." [ref=f1e482] [cursor=pointer]': 175 Laß meine Seele leben, daß sie dich lobe, und deine Rechte mir helfen.
          - paragraph [ref=f1e484]:
            - 'button "Vers 176: Ich bin ein verirrtes und verlorenes Schaf. Suche deinen Knecht; denn ich vergesse deiner Gebote nicht." [ref=f1e486] [cursor=pointer]': 176 Ich bin ein verirrtes und verlorenes Schaf. Suche deinen Knecht; denn ich vergesse deiner Gebote nicht.
      - generic [ref=f1e488]:
        - generic [ref=f1e489]: Du bist am Ende dieses Kapitels.
        - button "Kapitel als gelesen bestätigen" [ref=f1e490] [cursor=pointer]
        - generic [ref=f1e495]:
          - button "Vorheriges Kapitel" [ref=f1e496] [cursor=pointer]
          - button "Nächstes Kapitel" [ref=f1e500] [cursor=pointer]
        - generic [ref=f1e504]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
      - generic [ref=f1e505]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
  - generic [ref=f1e506]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1  | import { test, expect, type Page } from "@playwright/test";
  2  | import { localData, rawData } from "./persistence";
  3  | async function anchor(page: Page, verse: number) {
  4  |   await expect.poll(async () => (await localData(page))?.readingPosition?.verse).toBe(verse);
  5  | }
  6  | async function atVerse(page: Page, verse: number) {
  7  |   await expect.poll(async () => {
  8  |     const box = await page.getByRole("button", {name:new RegExp(`^Vers ${verse}:`)}).boundingBox();
  9  |     return box ? box.y >= 0 && box.y < 120 : false;
  10 |   }).toBe(true);
  11 | }
  12 | test("Weiterlesen führt nach Bereichswechsel und Offline-Neustart zum tatsächlichen Vers", async ({page,context}) => {
  13 |   await page.goto("/lesen/JHN?chapter=6&verse=35");
  14 |   await anchor(page,35); await atVerse(page,35);
  15 |   await page.goto("/bibel");
  16 |   await expect(page.getByText("Zuletzt bei Vers 35",{exact:true})).toBeVisible();
  17 |   await page.getByRole("button",{name:"Weiterlesen",exact:true}).click();
  18 |   await atVerse(page,35);
  19 |   await expect(page.getByText("Für den Offline-Neustart bereit.",{exact:true})).toBeVisible();
  20 |   await context.setOffline(true); await page.reload(); await atVerse(page,35);
  21 |   const data = await localData(page);
  22 |   expect(data.readChapters).toEqual([]);expect(data.readPassages).toEqual([]);expect(data.completedSteps).toEqual([]);expect(data.growthStage).toBe(0);
  23 | });
  24 | test("ein langer Psalm behält den Vers bei Display- und Schriftänderungen", async ({page}) => {
  25 |   await page.goto("/lesen/PSA?chapter=119&verse=90");
  26 |   await anchor(page,90);
  27 |   // Inline text may share a line with the previous verse. This test exercises
  28 |   // an explicit canonical jump; separate flow cases check actual scroll lines.
  29 |   await page.getByRole("button",{name:"Versaktionen",exact:true}).click();
  30 |   await page.getByRole("button",{name:"Vers 120",exact:true}).click();
  31 |   await anchor(page,120);
  32 |   await page.setViewportSize({width:1440,height:1000}); await atVerse(page,120);
  33 |   await page.getByRole("button",{name:"Leseeinstellungen",exact:true}).click();
  34 |   await page.getByRole("button",{name:"Größer",exact:true}).click();
  35 |   await page.getByRole("button",{name:"2,1",exact:true}).click();
  36 |   await page.getByRole("button",{name:"Leseeinstellungen schließen",exact:true}).click();
  37 |   await atVerse(page,120); await anchor(page,120);
  38 |   await page.reload(); await atVerse(page,120);
  39 |   await page.getByRole("button",{name:"Zum Kapitelanfang",exact:true}).click();
> 40 |   await expect.poll(async()=> (await localData(page))?.readingPosition).toBeNull();
     |                                                                         ^ Error: expect(received).toBeNull()
  41 |   await page.reload();
  42 |   await expect(page.getByRole("button",{name:"Leseeinstellungen",exact:true})).toBeInViewport();
  43 | });
  44 | test("Abschnitt und ausdrücklicher Verslink bleiben maßgeblich; Kapitelwechsel verwirft alte Anker", async ({page}) => {
  45 |   await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=38");
  46 |   await anchor(page,38); await page.reload(); await atVerse(page,38);
  47 |   await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=40"); await anchor(page,40);await atVerse(page,40);
  48 |   await page.goto("/lesen/MRK?chapter=5");
  49 |   await expect.poll(async()=> (await localData(page))?.reading.chapter).toBe(5);
  50 |   expect((await localData(page)).readingPosition).toBeNull();
  51 |   await expect(page.getByRole("button",{name:"Leseeinstellungen",exact:true})).toBeInViewport();
  52 |   expect((await localData(page)).readChapters).toEqual([]);
  53 | });
  54 | test("eine installierte private V4-Speicherung migriert beim Lesen ohne Datenverlust", async ({page}) => {
  55 |   await page.goto("/einstellungen");
  56 |   await page.getByRole("textbox",{name:"Dein Vorname (freiwillig)"}).fill("Ada");
  57 |   await page.getByRole("button",{name:"Namen speichern",exact:true}).click();
  58 |   await expect.poll(async()=> (await localData(page))?.name).toBe("Ada");
  59 |   const old=await rawData(page);delete old.data.readingPosition;delete old.data.retainedReviewGrowth;delete old.data.invitations;delete old.data.ntStudy;old.data.version=4;old.data.reading={book:"JHN",chapter:6};
  60 |   await page.evaluate(value=>new Promise<void>((resolve,reject)=>{
  61 |     const r=indexedDB.open("oliva-local-v1",1);r.onsuccess=()=>{const db=r.result,tx=db.transaction("state","readwrite");tx.objectStore("state").put(value,"main");tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
  62 |   }),old);
  63 |   await page.goto("/lesen/JHN?chapter=6&verse=35");await anchor(page,35);
  64 |   expect((await localData(page)).version).toBe(9);expect((await localData(page)).name).toBe("Ada");
  65 | });
  66 | 
```