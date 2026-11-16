# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-selection.spec.ts >> Einzelvers: ein echter Speicherfehler bewahrt den ungesicherten Entwurf über Sammlung und die genaue Wiederaufnahme
- Location: tests/e2e/reader-selection.spec.ts:485:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText(/Dieser Bibelentwurf ist nicht mehr vorhanden/)
Expected: 0
Received: 1
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByText(/Dieser Bibelentwurf ist nicht mehr vorhanden/) with timeout 15000ms
  - waiting for getByText(/Dieser Bibelentwurf ist nicht mehr vorhanden/)
    33 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e10]:
    - alert [ref=e11]:
      - generic [ref=e12]: Speichern fehlgeschlagen. Der Gerätespeicher könnte voll sein.
      - button "Meldung schließen" [ref=e13] [cursor=pointer]
    - main [ref=e16]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]:
            - button "Zurück" [ref=e22] [cursor=pointer]
            - button "Johannes 6⌄" [ref=e25] [cursor=pointer]
          - generic [ref=e27]:
            - button "Leseeinstellungen" [ref=e28] [cursor=pointer]
            - button "Dunklen Modus aktivieren" [ref=e32] [cursor=pointer]
        - generic [ref=e35]:
          - generic [ref=e36]: NEUES TESTAMENT
          - heading "Johannes" [level=1] [ref=e37]
          - generic [ref=e38]: Johannes 6 · Bibeltext
          - button "Zum Kapitelanfang" [ref=e39] [cursor=pointer]
          - generic [ref=e43]:
            - button "Einfach lesen" [pressed] [ref=e44] [cursor=pointer]
            - button "Tiefer verstehen" [ref=e46] [cursor=pointer]
          - button "Lesefokus starten" [ref=e48] [cursor=pointer]
        - generic [ref=e52]:
          - alert [ref=e53]: Dieser Bibelentwurf ist nicht mehr vorhanden. Deine übrigen Entwürfe bleiben in der Sammlung.
          - generic [ref=e54]: Tippe auf einen Vers, um ihn zu markieren, zu merken, zu kopieren oder eine Notiz zu schreiben.
          - generic [ref=e55]:
            - button "Mehrere Verse auswählen" [ref=e56] [cursor=pointer]
            - button "Versaktionen" [ref=e61] [cursor=pointer]
          - generic [ref=e66]:
            - paragraph [ref=e68]:
              - 'button "Vers 1: Darnach fuhr Jesus weg über das Meer an der Stadt Tiberias in Galiläa." [ref=e70] [cursor=pointer]': 1 Darnach fuhr Jesus weg über das Meer an der Stadt Tiberias in Galiläa.
              - 'button "Vers 2: Und es zog ihm viel Volks nach, darum daß sie die Zeichen sahen, die er an den Kranken tat." [ref=e72] [cursor=pointer]': 2 Und es zog ihm viel Volks nach, darum daß sie die Zeichen sahen, die er an den Kranken tat.
              - 'button "Vers 3: Jesus aber ging hinauf auf einen Berg und setzte sich daselbst mit seinen Jüngern." [ref=e74] [cursor=pointer]': 3 Jesus aber ging hinauf auf einen Berg und setzte sich daselbst mit seinen Jüngern.
              - 'button "Vers 4: Es war aber nahe Ostern, der Juden Fest." [ref=e76] [cursor=pointer]': 4 Es war aber nahe Ostern, der Juden Fest.
              - 'button "Vers 5: Da hob Jesus seine Augen auf und sieht, daß viel Volks zu ihm kommt, und spricht zu Philippus: Wo kaufen wir Brot, daß diese essen?" [ref=e78] [cursor=pointer]': "5 Da hob Jesus seine Augen auf und sieht, daß viel Volks zu ihm kommt, und spricht zu Philippus: Wo kaufen wir Brot, daß diese essen?"
            - paragraph [ref=e80]:
              - 'button "Vers 6: (Das sagte er aber, ihn zu versuchen; denn er wußte wohl, was er tun wollte.)" [ref=e82] [cursor=pointer]': 6 (Das sagte er aber, ihn zu versuchen; denn er wußte wohl, was er tun wollte.)
              - 'button "Vers 7: Philippus antwortete ihm: Für zweihundert Groschen Brot ist nicht genug unter sie, daß ein jeglicher unter ihnen ein wenig nehme." [ref=e84] [cursor=pointer]': "7 Philippus antwortete ihm: Für zweihundert Groschen Brot ist nicht genug unter sie, daß ein jeglicher unter ihnen ein wenig nehme."
              - 'button "Vers 8: Spricht zu ihm einer seiner Jünger, Andreas, der Bruder des Simon Petrus:" [ref=e86] [cursor=pointer]': "8 Spricht zu ihm einer seiner Jünger, Andreas, der Bruder des Simon Petrus:"
              - 'button "Vers 9: Es ist ein Knabe hier, der hat fünf Gerstenbrote und zwei Fische; aber was ist das unter so viele?" [ref=e88] [cursor=pointer]': 9 Es ist ein Knabe hier, der hat fünf Gerstenbrote und zwei Fische; aber was ist das unter so viele?
              - 'button "Vers 10: Jesus aber sprach: Schaffet, daß sich das Volk lagert. Es war aber viel Gras an dem Ort. Da lagerten sich bei fünftausend Mann." [ref=e90] [cursor=pointer]': "10 Jesus aber sprach: Schaffet, daß sich das Volk lagert. Es war aber viel Gras an dem Ort. Da lagerten sich bei fünftausend Mann."
            - paragraph [ref=e92]:
              - 'button "Vers 11: Jesus aber nahm die Brote, dankte und gab sie den Jüngern, die Jünger aber denen, die sich gelagert hatten; desgleichen auch von den Fischen, wieviel sie wollten." [ref=e94] [cursor=pointer]': 11 Jesus aber nahm die Brote, dankte und gab sie den Jüngern, die Jünger aber denen, die sich gelagert hatten; desgleichen auch von den Fischen, wieviel sie wollten.
              - 'button "Vers 12: Da sie aber satt waren, sprach er zu seinen Jüngern: Sammelt die übrigen Brocken, daß nichts umkommt." [ref=e96] [cursor=pointer]': "12 Da sie aber satt waren, sprach er zu seinen Jüngern: Sammelt die übrigen Brocken, daß nichts umkommt."
              - 'button "Vers 13: Da sammelten sie und füllten zwölf Körbe mit Brocken von den fünf Gerstenbroten, die übrig blieben denen, die gespeist worden." [ref=e98] [cursor=pointer]': 13 Da sammelten sie und füllten zwölf Körbe mit Brocken von den fünf Gerstenbroten, die übrig blieben denen, die gespeist worden.
              - 'button "Vers 14: Da nun die Menschen das Zeichen sahen, das Jesus tat, sprachen sie: Das ist wahrlich der Prophet, der in die Welt kommen soll." [ref=e100] [cursor=pointer]': "14 Da nun die Menschen das Zeichen sahen, das Jesus tat, sprachen sie: Das ist wahrlich der Prophet, der in die Welt kommen soll."
              - 'button "Vers 15: Da Jesus nun merkte, daß sie kommen würden und ihn haschen, daß sie ihn zum König machten, entwich er abermals auf den Berg, er selbst allein." [ref=e102] [cursor=pointer]': 15 Da Jesus nun merkte, daß sie kommen würden und ihn haschen, daß sie ihn zum König machten, entwich er abermals auf den Berg, er selbst allein.
            - paragraph [ref=e104]:
              - 'button "Vers 16: Am Abend aber gingen die Jünger hinab an das Meer" [ref=e106] [cursor=pointer]': 16 Am Abend aber gingen die Jünger hinab an das Meer
              - 'button "Vers 17: und traten in das Schiff und kamen über das Meer gen Kapernaum. Und es war schon finster geworden, und Jesus war nicht zu ihnen gekommen." [ref=e108] [cursor=pointer]': 17 und traten in das Schiff und kamen über das Meer gen Kapernaum. Und es war schon finster geworden, und Jesus war nicht zu ihnen gekommen.
              - 'button "Vers 18: Und das Meer erhob sich von einem großen Winde." [ref=e110] [cursor=pointer]': 18 Und das Meer erhob sich von einem großen Winde.
              - 'button "Vers 19: Da sie nun gerudert hatten bei fünfundzwanzig oder dreißig Feld Wegs, sahen sie Jesum auf dem Meere dahergehen und nahe zum Schiff kommen; und sie fürchteten sich." [ref=e112] [cursor=pointer]': 19 Da sie nun gerudert hatten bei fünfundzwanzig oder dreißig Feld Wegs, sahen sie Jesum auf dem Meere dahergehen und nahe zum Schiff kommen; und sie fürchteten sich.
              - 'button "Vers 20: Er aber sprach zu ihnen: Ich bin''s; fürchtet euch nicht!" [ref=e114] [cursor=pointer]': "20 Er aber sprach zu ihnen: Ich bin's; fürchtet euch nicht!"
            - paragraph [ref=e116]:
              - 'button "Vers 21: Da wollten sie ihn in das Schiff nehmen; und alsbald war das Schiff am Lande, da sie hin fuhren." [ref=e118] [cursor=pointer]': 21 Da wollten sie ihn in das Schiff nehmen; und alsbald war das Schiff am Lande, da sie hin fuhren.
              - 'button "Vers 22: Des anderen Tages sah das Volk, das diesseit des Meeres stand, daß kein anderes Schiff daselbst war denn das eine, darin seine Jünger getreten waren, und daß Jesus nicht mit seinen Jüngern in das Schiff getreten war, sondern allein seine Jünger waren weggefahren." [ref=e120] [cursor=pointer]': 22 Des anderen Tages sah das Volk, das diesseit des Meeres stand, daß kein anderes Schiff daselbst war denn das eine, darin seine Jünger getreten waren, und daß Jesus nicht mit seinen Jüngern in das Schiff getreten war, sondern allein seine Jünger waren weggefahren.
              - 'button "Vers 23: Es kamen aber andere Schiffe von Tiberias nahe zur Stätte, da sie das Brot gegessen hatten durch des HERRN Danksagung." [ref=e122] [cursor=pointer]': 23 Es kamen aber andere Schiffe von Tiberias nahe zur Stätte, da sie das Brot gegessen hatten durch des HERRN Danksagung.
              - 'button "Vers 24: Da nun das Volk sah, daß Jesus nicht da war noch seine Jünger, traten sie auch in Schiffe und kamen gen Kapernaum und suchten Jesum." [ref=e124] [cursor=pointer]': 24 Da nun das Volk sah, daß Jesus nicht da war noch seine Jünger, traten sie auch in Schiffe und kamen gen Kapernaum und suchten Jesum.
              - 'button "Vers 25: Und da sie ihn fanden jenseit des Meeres, sprachen sie zu ihm: Rabbi, wann bist du hergekommen?" [ref=e126] [cursor=pointer]': "25 Und da sie ihn fanden jenseit des Meeres, sprachen sie zu ihm: Rabbi, wann bist du hergekommen?"
            - paragraph [ref=e128]:
              - 'button "Vers 26: Jesus antwortete ihnen und sprach: Wahrlich, wahrlich ich sage euch: Ihr suchet mich nicht darum, daß ihr Zeichen gesehen habt, sondern daß ihr von dem Brot gegessen habt und seid satt geworden." [ref=e130] [cursor=pointer]': "26 Jesus antwortete ihnen und sprach: Wahrlich, wahrlich ich sage euch: Ihr suchet mich nicht darum, daß ihr Zeichen gesehen habt, sondern daß ihr von dem Brot gegessen habt und seid satt geworden."
              - 'button "Vers 27: Wirket Speise, nicht, die vergänglich ist, sondern die da bleibt in das ewige Leben, welche euch des Menschen Sohn geben wird; denn den hat Gott der Vater versiegelt." [ref=e132] [cursor=pointer]': 27 Wirket Speise, nicht, die vergänglich ist, sondern die da bleibt in das ewige Leben, welche euch des Menschen Sohn geben wird; denn den hat Gott der Vater versiegelt.
              - 'button "Vers 28: Da sprachen sie zu ihm: Was sollen wir tun, daß wir Gottes Werke wirken?" [ref=e134] [cursor=pointer]': "28 Da sprachen sie zu ihm: Was sollen wir tun, daß wir Gottes Werke wirken?"
              - 'button "Vers 29: Jesus antwortete und sprach zu ihnen: Das ist Gottes Werk, daß ihr an den glaubt, den er gesandt hat." [ref=e136] [cursor=pointer]': "29 Jesus antwortete und sprach zu ihnen: Das ist Gottes Werk, daß ihr an den glaubt, den er gesandt hat."
              - 'button "Vers 30: Da sprachen sie zu ihm: Was tust du denn für ein Zeichen, auf daß wir sehen und glauben dir? Was wirkst du?" [ref=e138] [cursor=pointer]': "30 Da sprachen sie zu ihm: Was tust du denn für ein Zeichen, auf daß wir sehen und glauben dir? Was wirkst du?"
            - generic [ref=e139]:
              - paragraph [ref=e140]:
                - 'button "Vers 31: Unsere Väter haben Manna gegessen in der Wüste, wie geschrieben steht: “Er gab ihnen Brot vom Himmel zu essen.”" [ref=e142] [cursor=pointer]': "31 Unsere Väter haben Manna gegessen in der Wüste, wie geschrieben steht: “Er gab ihnen Brot vom Himmel zu essen.”"
                - 'button "Vers 32: Da sprach Jesus zu ihnen: Wahrlich, wahrlich ich sage euch: Mose hat euch nicht das Brot vom Himmel gegeben, sondern mein Vater gibt euch das rechte Brot vom Himmel." [ref=e144] [cursor=pointer]': "32 Da sprach Jesus zu ihnen: Wahrlich, wahrlich ich sage euch: Mose hat euch nicht das Brot vom Himmel gegeben, sondern mein Vater gibt euch das rechte Brot vom Himmel."
                - 'button "Vers 33: Denn dies ist das Brot Gottes, das vom Himmel kommt und gibt der Welt das Leben." [ref=e146] [cursor=pointer]': 33 Denn dies ist das Brot Gottes, das vom Himmel kommt und gibt der Welt das Leben.
                - 'button "Vers 34: Da sprachen sie zu ihm: HERR, gib uns allewege solch Brot." [ref=e148] [cursor=pointer]': "34 Da sprachen sie zu ihm: HERR, gib uns allewege solch Brot."
                - 'button "Vers 35: Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten." [pressed] [ref=e150] [cursor=pointer]': "35 Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten."
              - generic [ref=e152]:
                - heading "DEIN MOMENT MIT VERS 35" [level=1] [ref=e153]
                - generic [ref=e154]:
                  - button "Merken" [ref=e155] [cursor=pointer]
                  - button "Oliv markieren" [ref=e159] [cursor=pointer]
                  - button "Gold markieren" [ref=e161] [cursor=pointer]
                - button "Bibeltext kopieren" [ref=e164] [cursor=pointer]
                - button "Mit einem Vorhaben verbinden" [ref=e166] [cursor=pointer]
                - generic [ref=e171]:
                  - 'generic "Dein Bibelbezug: Johannes 6,35 · Luther 1912" [ref=e172]'
                  - generic [ref=e173]:
                    - generic [ref=e174]: Notiz zu Vers 35
                    - textbox "Notiz zu Vers 35" [ref=e175]:
                      - /placeholder: Was möchtest du festhalten?
                      - text: Meine ungesicherten Worte zu genau Vers 35.
                  - generic [ref=e176]:
                    - generic [ref=e177]: Entwurf konnte nicht gesichert werden. Deine Eingabe bleibt hier sichtbar. Bitte sichere deine Worte, bevor du die App schließt.
                    - button "Notiz speichern" [ref=e178] [cursor=pointer]
                    - button "Entwurf verwerfen" [ref=e182] [cursor=pointer]
                - button "Versaktionen schließen" [ref=e186] [cursor=pointer]
            - paragraph [ref=e191]:
              - 'button "Vers 36: Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht." [ref=e193] [cursor=pointer]': 36 Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht.
              - 'button "Vers 37: Alles, was mir mein Vater gibt, das kommt zu mir; und wer zu mir kommt, den werde ich nicht hinausstoßen." [ref=e195] [cursor=pointer]': 37 Alles, was mir mein Vater gibt, das kommt zu mir; und wer zu mir kommt, den werde ich nicht hinausstoßen.
              - 'button "Vers 38: Denn ich bin vom Himmel gekommen, nicht daß ich meinen Willen tue, sondern den Willen des, der mich gesandt hat." [ref=e197] [cursor=pointer]': 38 Denn ich bin vom Himmel gekommen, nicht daß ich meinen Willen tue, sondern den Willen des, der mich gesandt hat.
              - 'button "Vers 39: Das ist aber der Wille des Vaters, der mich gesandt hat, daß ich nichts verliere von allem, was er mir gegeben hat, sondern daß ich''s auferwecke am Jüngsten Tage." [ref=e199] [cursor=pointer]': 39 Das ist aber der Wille des Vaters, der mich gesandt hat, daß ich nichts verliere von allem, was er mir gegeben hat, sondern daß ich's auferwecke am Jüngsten Tage.
              - 'button "Vers 40: Denn das ist der Wille des, der mich gesandt hat, daß, wer den Sohn sieht und glaubt an ihn, habe das ewige Leben; und ich werde ihn auferwecken am Jüngsten Tage." [ref=e201] [cursor=pointer]': 40 Denn das ist der Wille des, der mich gesandt hat, daß, wer den Sohn sieht und glaubt an ihn, habe das ewige Leben; und ich werde ihn auferwecken am Jüngsten Tage.
            - paragraph [ref=e203]:
              - 'button "Vers 41: Da murrten die Juden darüber, daß er sagte: Ich bin das Brot, daß vom Himmel gekommen ist," [ref=e205] [cursor=pointer]': "41 Da murrten die Juden darüber, daß er sagte: Ich bin das Brot, daß vom Himmel gekommen ist,"
              - 'button "Vers 42: und sprachen: Ist dieser nicht Jesus, Josephs Sohn, des Vater und Mutter wir kennen? Wie spricht er denn: Ich bin vom Himmel gekommen?" [ref=e207] [cursor=pointer]': "42 und sprachen: Ist dieser nicht Jesus, Josephs Sohn, des Vater und Mutter wir kennen? Wie spricht er denn: Ich bin vom Himmel gekommen?"
              - 'button "Vers 43: Jesus antwortete und sprach zu ihnen: Murret nicht untereinander." [ref=e209] [cursor=pointer]': "43 Jesus antwortete und sprach zu ihnen: Murret nicht untereinander."
              - 'button "Vers 44: Es kann niemand zu mir kommen, es sei denn, daß ihn ziehe der Vater, der mich gesandt hat; und ich werde ihn auferwecken am Jüngsten Tage." [ref=e211] [cursor=pointer]': 44 Es kann niemand zu mir kommen, es sei denn, daß ihn ziehe der Vater, der mich gesandt hat; und ich werde ihn auferwecken am Jüngsten Tage.
              - 'button "Vers 45: Es steht geschrieben in den Propheten: “Sie werden alle von Gott gelehrt sein.” Wer es nun hört vom Vater und lernt es, der kommt zu mir." [ref=e213] [cursor=pointer]': "45 Es steht geschrieben in den Propheten: “Sie werden alle von Gott gelehrt sein.” Wer es nun hört vom Vater und lernt es, der kommt zu mir."
            - paragraph [ref=e215]:
              - 'button "Vers 46: Nicht daß jemand den Vater habe gesehen, außer dem, der vom Vater ist; der hat den Vater gesehen." [ref=e217] [cursor=pointer]': 46 Nicht daß jemand den Vater habe gesehen, außer dem, der vom Vater ist; der hat den Vater gesehen.
              - 'button "Vers 47: Wahrlich, wahrlich ich sage euch: Wer an mich glaubt, der hat das ewige Leben." [ref=e219] [cursor=pointer]': "47 Wahrlich, wahrlich ich sage euch: Wer an mich glaubt, der hat das ewige Leben."
              - 'button "Vers 48: Ich bin das Brot des Lebens." [ref=e221] [cursor=pointer]': 48 Ich bin das Brot des Lebens.
              - 'button "Vers 49: Eure Väter haben Manna gegessen in der Wüste und sind gestorben." [ref=e223] [cursor=pointer]': 49 Eure Väter haben Manna gegessen in der Wüste und sind gestorben.
              - 'button "Vers 50: Dies ist das Brot, das vom Himmel kommt, auf daß, wer davon isset, nicht sterbe." [ref=e225] [cursor=pointer]': 50 Dies ist das Brot, das vom Himmel kommt, auf daß, wer davon isset, nicht sterbe.
            - paragraph [ref=e227]:
              - 'button "Vers 51: Ich bin das lebendige Brot, vom Himmel gekommen. Wer von diesem Brot essen wird, der wird leben in Ewigkeit. Und das Brot, daß ich geben werde, ist mein Fleisch, welches ich geben werde für das Leben der Welt." [ref=e229] [cursor=pointer]': 51 Ich bin das lebendige Brot, vom Himmel gekommen. Wer von diesem Brot essen wird, der wird leben in Ewigkeit. Und das Brot, daß ich geben werde, ist mein Fleisch, welches ich geben werde für das Leben der Welt.
              - 'button "Vers 52: Da zankten die Juden untereinander und sprachen: Wie kann dieser uns sein Fleisch zu essen geben?" [ref=e231] [cursor=pointer]': "52 Da zankten die Juden untereinander und sprachen: Wie kann dieser uns sein Fleisch zu essen geben?"
              - 'button "Vers 53: Jesus sprach zu ihnen: Wahrlich, wahrlich ich sage euch: Werdet ihr nicht essen das Fleisch des Menschensohnes und trinken sein Blut, so habt ihr kein Leben in euch." [ref=e233] [cursor=pointer]': "53 Jesus sprach zu ihnen: Wahrlich, wahrlich ich sage euch: Werdet ihr nicht essen das Fleisch des Menschensohnes und trinken sein Blut, so habt ihr kein Leben in euch."
              - 'button "Vers 54: Wer mein Fleisch isset und trinket mein Blut, der hat das ewige Leben, und ich werde ihn am Jüngsten Tage auferwecken." [ref=e235] [cursor=pointer]': 54 Wer mein Fleisch isset und trinket mein Blut, der hat das ewige Leben, und ich werde ihn am Jüngsten Tage auferwecken.
              - 'button "Vers 55: Denn mein Fleisch ist die rechte Speise, und mein Blut ist der rechte Trank." [ref=e237] [cursor=pointer]': 55 Denn mein Fleisch ist die rechte Speise, und mein Blut ist der rechte Trank.
            - paragraph [ref=e239]:
              - 'button "Vers 56: Wer mein Fleisch isset und trinket mein Blut, der bleibt in mir und ich in ihm." [ref=e241] [cursor=pointer]': 56 Wer mein Fleisch isset und trinket mein Blut, der bleibt in mir und ich in ihm.
              - 'button "Vers 57: Wie mich gesandt hat der lebendige Vater und ich lebe um des Vaters willen, also, wer mich isset, der wird auch leben um meinetwillen." [ref=e243] [cursor=pointer]': 57 Wie mich gesandt hat der lebendige Vater und ich lebe um des Vaters willen, also, wer mich isset, der wird auch leben um meinetwillen.
              - 'button "Vers 58: Dies ist das Brot, das vom Himmel gekommen ist; nicht, wie eure Väter haben Manna gegessen und sind gestorben: wer dies Brot isset, der wird leben in Ewigkeit." [ref=e245] [cursor=pointer]': "58 Dies ist das Brot, das vom Himmel gekommen ist; nicht, wie eure Väter haben Manna gegessen und sind gestorben: wer dies Brot isset, der wird leben in Ewigkeit."
              - 'button "Vers 59: Solches sagte er in der Schule, da er lehrte zu Kapernaum." [ref=e247] [cursor=pointer]': 59 Solches sagte er in der Schule, da er lehrte zu Kapernaum.
              - 'button "Vers 60: Viele nun seine Jünger, die das hörten, sprachen: Das ist eine harte Rede; wer kann sie hören?" [ref=e249] [cursor=pointer]': "60 Viele nun seine Jünger, die das hörten, sprachen: Das ist eine harte Rede; wer kann sie hören?"
            - paragraph [ref=e251]:
              - 'button "Vers 61: Da Jesus aber bei sich selbst merkte, daß seine Jünger darüber murrten, sprach er zu ihnen: Ärgert euch das?" [ref=e253] [cursor=pointer]': "61 Da Jesus aber bei sich selbst merkte, daß seine Jünger darüber murrten, sprach er zu ihnen: Ärgert euch das?"
              - 'button "Vers 62: Wie, wenn ihr denn sehen werdet des Menschen Sohn auffahren dahin, da er zuvor war?" [ref=e255] [cursor=pointer]': 62 Wie, wenn ihr denn sehen werdet des Menschen Sohn auffahren dahin, da er zuvor war?
              - 'button "Vers 63: Der Geist ist''s, der da lebendig macht; das Fleisch ist nichts nütze. Die Worte, die ich rede, die sind Geist und sind Leben." [ref=e257] [cursor=pointer]': 63 Der Geist ist's, der da lebendig macht; das Fleisch ist nichts nütze. Die Worte, die ich rede, die sind Geist und sind Leben.
              - 'button "Vers 64: Aber es sind etliche unter euch, die glauben nicht. (Denn Jesus wußte von Anfang wohl, welche nicht glaubend waren und welcher ihn verraten würde.)" [ref=e259] [cursor=pointer]': 64 Aber es sind etliche unter euch, die glauben nicht. (Denn Jesus wußte von Anfang wohl, welche nicht glaubend waren und welcher ihn verraten würde.)
              - 'button "Vers 65: Und er sprach: Darum habe ich euch gesagt: Niemand kann zu mir kommen, es sei ihm denn von meinem Vater gegeben." [ref=e261] [cursor=pointer]': "65 Und er sprach: Darum habe ich euch gesagt: Niemand kann zu mir kommen, es sei ihm denn von meinem Vater gegeben."
            - paragraph [ref=e263]:
              - 'button "Vers 66: Von dem an gingen seiner Jünger viele hinter sich und wandelten hinfort nicht mehr mit ihm." [ref=e265] [cursor=pointer]': 66 Von dem an gingen seiner Jünger viele hinter sich und wandelten hinfort nicht mehr mit ihm.
              - 'button "Vers 67: Da sprach Jesus zu den Zwölfen: Wollt ihr auch weggehen?" [ref=e267] [cursor=pointer]': "67 Da sprach Jesus zu den Zwölfen: Wollt ihr auch weggehen?"
              - 'button "Vers 68: Da antwortete ihm Simon Petrus: HERR, wohin sollen wir gehen? Du hast Worte des ewigen Lebens;" [ref=e269] [cursor=pointer]': "68 Da antwortete ihm Simon Petrus: HERR, wohin sollen wir gehen? Du hast Worte des ewigen Lebens;"
              - 'button "Vers 69: und wir haben geglaubt und erkannt, daß du bist Christus, der Sohn des lebendigen Gottes." [ref=e271] [cursor=pointer]': 69 und wir haben geglaubt und erkannt, daß du bist Christus, der Sohn des lebendigen Gottes.
              - 'button "Vers 70: Jesus antwortete ihnen: Habe ich nicht euch Zwölf erwählt? und-euer einer ist ein Teufel!" [ref=e273] [cursor=pointer]': "70 Jesus antwortete ihnen: Habe ich nicht euch Zwölf erwählt? und-euer einer ist ein Teufel!"
            - paragraph [ref=e275]:
              - 'button "Vers 71: Er redete aber von dem Judas, Simons Sohn, Ischariot; der verriet ihn hernach, und war der Zwölfe einer." [ref=e277] [cursor=pointer]': 71 Er redete aber von dem Judas, Simons Sohn, Ischariot; der verriet ihn hernach, und war der Zwölfe einer.
        - generic [ref=e279]:
          - generic [ref=e280]: Du bist am Ende dieses Kapitels.
          - button "Kapitel als gelesen bestätigen" [ref=e281] [cursor=pointer]
          - generic [ref=e286]:
            - button "Vorheriges Kapitel" [ref=e287] [cursor=pointer]
            - button "Nächstes Kapitel" [ref=e291] [cursor=pointer]
          - generic [ref=e295]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
        - generic [ref=e296]:
          - generic [ref=e297]: In Ruhe weiterdenken
          - generic [ref=e301]: Was ist dir im Text begegnet?
          - generic [ref=e302]: Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen. Du kannst jederzeit nachlesen oder pausieren.
          - button "Fragen zu Johannes 6 entdecken" [ref=e303] [cursor=pointer]
        - generic [ref=e307]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
  - generic [ref=e308]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  440 |       await button(page, "Leseeinstellungen").click();
  441 |       await button(page, "Einzelverse").click();
  442 |       await button(page, "Leseeinstellungen schließen").click();
  443 |       await expect(visible(page, "reader-single-verses")).toBeVisible();
  444 |     }
  445 |     const before = durableContent(await localData(page));
  446 |     await button(page, "Mehrere Verse auswählen").click();
  447 |     await expect(button(page, "Auswahl verwenden")).toBeDisabled();
  448 |     for (const [n, key] of [
  449 |       [35, "Enter"],
  450 |       [37, "Space"],
  451 |       [36, "Enter"],
  452 |     ] as const) {
  453 |       await verse(page, n).focus();
  454 |       await verse(page, n).press(key);
  455 |       await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
  456 |     }
  457 |     await openTools(page);
  458 |     await page.keyboard.press("Escape");
  459 |     await expect(tools(page)).toHaveCount(0);
  460 |     await expect(verse(page, 36)).toBeFocused();
  461 |     for (const n of [35, 36, 37])
  462 |       await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
  463 |     await page.keyboard.press("Escape");
  464 |     await expect(button(page, "Mehrere Verse auswählen")).toBeVisible();
  465 |     await expect(button(page, "Auswahl verwenden")).toHaveCount(0);
  466 |     await expect(verse(page, 36)).toBeFocused();
  467 |     for (const n of [35, 36, 37])
  468 |       await expect(verse(page, n)).toHaveAttribute("aria-pressed", "false");
  469 |     expect(durableContent(await localData(page))).toEqual(before);
  470 |     await report(
  471 |       page,
  472 |       `keyboard-${representation === "Fließtext" ? "flow" : "legacy"}`,
  473 |       {
  474 |         representation,
  475 |         explicitKeys: ["35:Enter", "37:Space", "36:Enter", "Escape", "Escape"],
  476 |         focusReturnedToLastAddedVerse: 36,
  477 |         selectionClearedExplicitly: true,
  478 |         unchangedDurableContent: true,
  479 |       },
  480 |     );
  481 |   });
  482 | }
  483 | 
  484 | for (const kind of ["verse", "passage"] as const) {
  485 |   test(`${kind === "verse" ? "Einzelvers" : "Bereich"}: ein echter Speicherfehler bewahrt den ungesicherten Entwurf über Sammlung und die genaue Wiederaufnahme`, async ({ page }) => {
  486 |     await page.goto("/lesen/JHN?chapter=6");
  487 |     await ready(page);
  488 |     const beforeProgress = progress(await localData(page));
  489 |     const expectedRef = { book: "JHN", chapter: 6, from: 35, to: kind === "verse" ? 35 : 37 };
  490 |     const key = kind === "verse" ? "capture:verse:JHN:6:35" : "capture:passage:JHN:6:35:37";
  491 |     const text = kind === "verse"
  492 |       ? "Meine ungesicherten Worte zu genau Vers 35."
  493 |       : "Meine ungesicherten Worte zum vollständigen Bereich 35 bis 37.";
  494 |     if (kind === "passage") {
  495 |       await button(page, "Mehrere Verse auswählen").click();
  496 |       for (const n of [35, 36, 37]) await verse(page, n).click();
  497 |       await openTools(page);
  498 |     } else await verse(page, 35).click();
  499 |     const field = kind === "passage" ? noteField(page) : page.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }).filter({ visible: true });
  500 |     await expect(field).toBeVisible();
  501 |     await page.evaluate(() => {
  502 |       const testWindow = window as Window & { failReaderWrites?: boolean };
  503 |       testWindow.failReaderWrites = true;
  504 |       const put = IDBObjectStore.prototype.put;
  505 |       IDBObjectStore.prototype.put = function (value, recordKey) {
  506 |         if (testWindow.failReaderWrites && recordKey === "main")
  507 |           throw new DOMException("Echter Test-Schreibfehler", "QuotaExceededError");
  508 |         return put.call(this, value, recordKey);
  509 |       };
  510 |     });
  511 |     await field.fill(text);
  512 |     await expect(page.getByText(/Entwurf konnte nicht gesichert werden/).filter({ visible: true })).toBeVisible();
  513 |     expect((await localData(page)).drafts.some(d => d.key === key)).toBe(false);
  514 |     expect((await localData(page)).notes).toEqual([]);
  515 |     if (kind === "passage") await closeTools(page);
  516 |     else await button(page, "Versaktionen schließen").click();
  517 |     // These are actual client-side navigation controls. A document reload would
  518 |     // intentionally lose session-only memory and cannot test held recovery.
  519 |     await button(page, "Zurück").click();
  520 |     await expect(page).toHaveURL(/\/bibel(?:\?|$)/);
  521 |     await button(page, "Sammlung").click();
  522 |     await button(page, "Entwürfe").click();
  523 |     await expect(page.getByText("Nur in dieser Sitzung erhalten", { exact: true })).toBeVisible();
  524 |     await expect(page.getByText(text, { exact: true }).filter({ visible: true })).toBeVisible();
  525 |     const download = page.waitForEvent("download");
  526 |     await button(page, "Ungesicherte Entwürfe exportieren").click();
  527 |     const exportedPath = await (await download).path();
  528 |     const exported = JSON.parse(readFileSync(exportedPath!, "utf8"));
  529 |     const held = exported.drafts.find((entry: { draft: { key: string } }) => entry.draft.key === key);
  530 |     expect(held).toMatchObject({ reason: "error", draft: { revision: 0, values: { text, source: { type: kind, ref: expectedRef } } } });
  531 |     const sourceId = held.draft.id as string;
  532 |     await button(page, `Entwurf fortsetzen: Notiz zu Johannes 6,${kind === "verse" ? "35" : "35–37"}`).click();
  533 |     await ready(page);
  534 |     if (kind === "passage") {
  535 |       await expect(tools(page)).toBeVisible();
  536 |       await selected(page, [35, 36, 37]);
  537 |     }
  538 |     const resumed = kind === "passage" ? noteField(page) : page.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }).filter({ visible: true });
  539 |     await expect(resumed).toHaveValue(text);
> 540 |     await expect(page.getByText(/Dieser Bibelentwurf ist nicht mehr vorhanden/)).toHaveCount(0);
      |                                                                                  ^ Error: expect(locator).toHaveCount(expected) failed
  541 |     expect((await localData(page)).drafts.some(d => d.key === key)).toBe(false);
  542 |     expect((await localData(page)).notes).toEqual([]);
  543 |     await page.evaluate(() => { (window as Window & { failReaderWrites?: boolean }).failReaderWrites = false; });
  544 |     await button(page, "Notiz speichern").click();
  545 |     await expect.poll(async () => (await localData(page)).notes.find(note => note.text === text)).toMatchObject({
  546 |       kind: "note", ref: expectedRef, captureSource: { type: kind, ref: expectedRef },
  547 |     });
  548 |     expect((await localData(page)).drafts.some(d => d.id === sourceId)).toBe(false);
  549 |     expect((await localData(page)).notes).toHaveLength(1);
  550 |     expect(progress(await localData(page))).toEqual(beforeProgress);
  551 |     await report(page, `held-${kind}-draft-source-recovery`, {
  552 |       sameSessionMemoryRecoveredThroughActualCollectionLink: true,
  553 |       originalDraftId: sourceId,
  554 |       exactKey: key,
  555 |       exactSource: expectedRef,
  556 |       exportPreservedOriginalWords: true,
  557 |       noDurableDraftOrNoteBeforeRecovery: true,
  558 |       oneExplicitlySavedNote: true,
  559 |       unchangedProgress: beforeProgress,
  560 |     });
  561 |   });
  562 | }
  563 | 
```