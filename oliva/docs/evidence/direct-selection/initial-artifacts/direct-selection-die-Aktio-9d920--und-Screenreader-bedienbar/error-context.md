# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: direct-selection.spec.ts >> die Aktionsleiste bleibt schmal, dunkel und hell per Tastatur und Screenreader bedienbar
- Location: tests/e2e/direct-selection.spec.ts:87:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 35
Received: 32

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f2e4]:
  - main [ref=f2e11]:
    - generic [ref=f2e14]:
      - generic [ref=f2e15]:
        - generic [ref=f2e16]:
          - button "Zurück" [ref=f2e17] [cursor=pointer]
          - button "Johannes 6,35–37⌄" [ref=f2e20] [cursor=pointer]
        - generic [ref=f2e22]:
          - generic [ref=f2e23]: Luther 1912
          - button "Leseeinstellungen" [ref=f2e25] [cursor=pointer]
          - button "Hellen Modus aktivieren" [ref=f2e29] [cursor=pointer]
      - generic [ref=f2e33]:
        - generic [ref=f2e34]: NEUES TESTAMENT
        - heading "Johannes" [level=1] [ref=f2e35]
        - generic [ref=f2e36]: Johannes 6,35–37 · Bibeltext
        - generic [ref=f2e37]: Das ganze Kapitel bleibt lesbar. Der farbig hinterlegte Abschnitt ist dein Bezug; eine Bestätigung gilt nur für diesen Abschnitt.
        - button "Zum Abschnittsanfang" [ref=f2e38] [cursor=pointer]
        - generic [ref=f2e42]:
          - button "Einfach lesen" [pressed] [ref=f2e43] [cursor=pointer]
          - button "Tiefer verstehen" [ref=f2e45] [cursor=pointer]
        - button "Lesefokus starten" [ref=f2e47] [cursor=pointer]
      - generic [ref=f2e51]:
        - generic [ref=f2e52]: Tippe Verse an. Unten kannst du sie markieren, kopieren oder eine Notiz schreiben. Erneutes Antippen hebt die Auswahl auf.
        - button "Zu Vers springen" [ref=f2e54] [cursor=pointer]
        - generic [ref=f2e59]:
          - paragraph [ref=f2e61]:
            - 'button "Vers 1: Darnach fuhr Jesus weg über das Meer an der Stadt Tiberias in Galiläa." [ref=f2e63] [cursor=pointer]': 1 Darnach fuhr Jesus weg über das Meer an der Stadt Tiberias in Galiläa.
            - 'button "Vers 2: Und es zog ihm viel Volks nach, darum daß sie die Zeichen sahen, die er an den Kranken tat." [ref=f2e65] [cursor=pointer]': 2 Und es zog ihm viel Volks nach, darum daß sie die Zeichen sahen, die er an den Kranken tat.
            - 'button "Vers 3: Jesus aber ging hinauf auf einen Berg und setzte sich daselbst mit seinen Jüngern." [ref=f2e67] [cursor=pointer]': 3 Jesus aber ging hinauf auf einen Berg und setzte sich daselbst mit seinen Jüngern.
            - 'button "Vers 4: Es war aber nahe Ostern, der Juden Fest." [ref=f2e69] [cursor=pointer]': 4 Es war aber nahe Ostern, der Juden Fest.
            - 'button "Vers 5: Da hob Jesus seine Augen auf und sieht, daß viel Volks zu ihm kommt, und spricht zu Philippus: Wo kaufen wir Brot, daß diese essen?" [ref=f2e71] [cursor=pointer]': "5 Da hob Jesus seine Augen auf und sieht, daß viel Volks zu ihm kommt, und spricht zu Philippus: Wo kaufen wir Brot, daß diese essen?"
          - paragraph [ref=f2e73]:
            - 'button "Vers 6: (Das sagte er aber, ihn zu versuchen; denn er wußte wohl, was er tun wollte.)" [ref=f2e75] [cursor=pointer]': 6 (Das sagte er aber, ihn zu versuchen; denn er wußte wohl, was er tun wollte.)
            - 'button "Vers 7: Philippus antwortete ihm: Für zweihundert Groschen Brot ist nicht genug unter sie, daß ein jeglicher unter ihnen ein wenig nehme." [ref=f2e77] [cursor=pointer]': "7 Philippus antwortete ihm: Für zweihundert Groschen Brot ist nicht genug unter sie, daß ein jeglicher unter ihnen ein wenig nehme."
            - 'button "Vers 8: Spricht zu ihm einer seiner Jünger, Andreas, der Bruder des Simon Petrus:" [ref=f2e79] [cursor=pointer]': "8 Spricht zu ihm einer seiner Jünger, Andreas, der Bruder des Simon Petrus:"
            - 'button "Vers 9: Es ist ein Knabe hier, der hat fünf Gerstenbrote und zwei Fische; aber was ist das unter so viele?" [ref=f2e81] [cursor=pointer]': 9 Es ist ein Knabe hier, der hat fünf Gerstenbrote und zwei Fische; aber was ist das unter so viele?
            - 'button "Vers 10: Jesus aber sprach: Schaffet, daß sich das Volk lagert. Es war aber viel Gras an dem Ort. Da lagerten sich bei fünftausend Mann." [ref=f2e83] [cursor=pointer]': "10 Jesus aber sprach: Schaffet, daß sich das Volk lagert. Es war aber viel Gras an dem Ort. Da lagerten sich bei fünftausend Mann."
          - paragraph [ref=f2e85]:
            - 'button "Vers 11: Jesus aber nahm die Brote, dankte und gab sie den Jüngern, die Jünger aber denen, die sich gelagert hatten; desgleichen auch von den Fischen, wieviel sie wollten." [ref=f2e87] [cursor=pointer]': 11 Jesus aber nahm die Brote, dankte und gab sie den Jüngern, die Jünger aber denen, die sich gelagert hatten; desgleichen auch von den Fischen, wieviel sie wollten.
            - 'button "Vers 12: Da sie aber satt waren, sprach er zu seinen Jüngern: Sammelt die übrigen Brocken, daß nichts umkommt." [ref=f2e89] [cursor=pointer]': "12 Da sie aber satt waren, sprach er zu seinen Jüngern: Sammelt die übrigen Brocken, daß nichts umkommt."
            - 'button "Vers 13: Da sammelten sie und füllten zwölf Körbe mit Brocken von den fünf Gerstenbroten, die übrig blieben denen, die gespeist worden." [ref=f2e91] [cursor=pointer]': 13 Da sammelten sie und füllten zwölf Körbe mit Brocken von den fünf Gerstenbroten, die übrig blieben denen, die gespeist worden.
            - 'button "Vers 14: Da nun die Menschen das Zeichen sahen, das Jesus tat, sprachen sie: Das ist wahrlich der Prophet, der in die Welt kommen soll." [ref=f2e93] [cursor=pointer]': "14 Da nun die Menschen das Zeichen sahen, das Jesus tat, sprachen sie: Das ist wahrlich der Prophet, der in die Welt kommen soll."
            - 'button "Vers 15: Da Jesus nun merkte, daß sie kommen würden und ihn haschen, daß sie ihn zum König machten, entwich er abermals auf den Berg, er selbst allein." [ref=f2e95] [cursor=pointer]': 15 Da Jesus nun merkte, daß sie kommen würden und ihn haschen, daß sie ihn zum König machten, entwich er abermals auf den Berg, er selbst allein.
          - paragraph [ref=f2e97]:
            - 'button "Vers 16: Am Abend aber gingen die Jünger hinab an das Meer" [ref=f2e99] [cursor=pointer]': 16 Am Abend aber gingen die Jünger hinab an das Meer
            - 'button "Vers 17: und traten in das Schiff und kamen über das Meer gen Kapernaum. Und es war schon finster geworden, und Jesus war nicht zu ihnen gekommen." [ref=f2e101] [cursor=pointer]': 17 und traten in das Schiff und kamen über das Meer gen Kapernaum. Und es war schon finster geworden, und Jesus war nicht zu ihnen gekommen.
            - 'button "Vers 18: Und das Meer erhob sich von einem großen Winde." [ref=f2e103] [cursor=pointer]': 18 Und das Meer erhob sich von einem großen Winde.
            - 'button "Vers 19: Da sie nun gerudert hatten bei fünfundzwanzig oder dreißig Feld Wegs, sahen sie Jesum auf dem Meere dahergehen und nahe zum Schiff kommen; und sie fürchteten sich." [ref=f2e105] [cursor=pointer]': 19 Da sie nun gerudert hatten bei fünfundzwanzig oder dreißig Feld Wegs, sahen sie Jesum auf dem Meere dahergehen und nahe zum Schiff kommen; und sie fürchteten sich.
            - 'button "Vers 20: Er aber sprach zu ihnen: Ich bin''s; fürchtet euch nicht!" [ref=f2e107] [cursor=pointer]': "20 Er aber sprach zu ihnen: Ich bin's; fürchtet euch nicht!"
          - paragraph [ref=f2e109]:
            - 'button "Vers 21: Da wollten sie ihn in das Schiff nehmen; und alsbald war das Schiff am Lande, da sie hin fuhren." [ref=f2e111] [cursor=pointer]': 21 Da wollten sie ihn in das Schiff nehmen; und alsbald war das Schiff am Lande, da sie hin fuhren.
            - 'button "Vers 22: Des anderen Tages sah das Volk, das diesseit des Meeres stand, daß kein anderes Schiff daselbst war denn das eine, darin seine Jünger getreten waren, und daß Jesus nicht mit seinen Jüngern in das Schiff getreten war, sondern allein seine Jünger waren weggefahren." [ref=f2e113] [cursor=pointer]': 22 Des anderen Tages sah das Volk, das diesseit des Meeres stand, daß kein anderes Schiff daselbst war denn das eine, darin seine Jünger getreten waren, und daß Jesus nicht mit seinen Jüngern in das Schiff getreten war, sondern allein seine Jünger waren weggefahren.
            - 'button "Vers 23: Es kamen aber andere Schiffe von Tiberias nahe zur Stätte, da sie das Brot gegessen hatten durch des HERRN Danksagung." [ref=f2e115] [cursor=pointer]': 23 Es kamen aber andere Schiffe von Tiberias nahe zur Stätte, da sie das Brot gegessen hatten durch des HERRN Danksagung.
            - 'button "Vers 24: Da nun das Volk sah, daß Jesus nicht da war noch seine Jünger, traten sie auch in Schiffe und kamen gen Kapernaum und suchten Jesum." [ref=f2e117] [cursor=pointer]': 24 Da nun das Volk sah, daß Jesus nicht da war noch seine Jünger, traten sie auch in Schiffe und kamen gen Kapernaum und suchten Jesum.
            - 'button "Vers 25: Und da sie ihn fanden jenseit des Meeres, sprachen sie zu ihm: Rabbi, wann bist du hergekommen?" [ref=f2e119] [cursor=pointer]': "25 Und da sie ihn fanden jenseit des Meeres, sprachen sie zu ihm: Rabbi, wann bist du hergekommen?"
          - paragraph [ref=f2e121]:
            - 'button "Vers 26: Jesus antwortete ihnen und sprach: Wahrlich, wahrlich ich sage euch: Ihr suchet mich nicht darum, daß ihr Zeichen gesehen habt, sondern daß ihr von dem Brot gegessen habt und seid satt geworden." [ref=f2e123] [cursor=pointer]': "26 Jesus antwortete ihnen und sprach: Wahrlich, wahrlich ich sage euch: Ihr suchet mich nicht darum, daß ihr Zeichen gesehen habt, sondern daß ihr von dem Brot gegessen habt und seid satt geworden."
            - 'button "Vers 27: Wirket Speise, nicht, die vergänglich ist, sondern die da bleibt in das ewige Leben, welche euch des Menschen Sohn geben wird; denn den hat Gott der Vater versiegelt." [ref=f2e125] [cursor=pointer]': 27 Wirket Speise, nicht, die vergänglich ist, sondern die da bleibt in das ewige Leben, welche euch des Menschen Sohn geben wird; denn den hat Gott der Vater versiegelt.
            - 'button "Vers 28: Da sprachen sie zu ihm: Was sollen wir tun, daß wir Gottes Werke wirken?" [ref=f2e127] [cursor=pointer]': "28 Da sprachen sie zu ihm: Was sollen wir tun, daß wir Gottes Werke wirken?"
            - 'button "Vers 29: Jesus antwortete und sprach zu ihnen: Das ist Gottes Werk, daß ihr an den glaubt, den er gesandt hat." [ref=f2e129] [cursor=pointer]': "29 Jesus antwortete und sprach zu ihnen: Das ist Gottes Werk, daß ihr an den glaubt, den er gesandt hat."
            - 'button "Vers 30: Da sprachen sie zu ihm: Was tust du denn für ein Zeichen, auf daß wir sehen und glauben dir? Was wirkst du?" [ref=f2e131] [cursor=pointer]': "30 Da sprachen sie zu ihm: Was tust du denn für ein Zeichen, auf daß wir sehen und glauben dir? Was wirkst du?"
          - paragraph [ref=f2e133]:
            - 'button "Vers 31: Unsere Väter haben Manna gegessen in der Wüste, wie geschrieben steht: “Er gab ihnen Brot vom Himmel zu essen.”" [ref=f2e135] [cursor=pointer]': "31 Unsere Väter haben Manna gegessen in der Wüste, wie geschrieben steht: “Er gab ihnen Brot vom Himmel zu essen.”"
            - 'button "Vers 32: Da sprach Jesus zu ihnen: Wahrlich, wahrlich ich sage euch: Mose hat euch nicht das Brot vom Himmel gegeben, sondern mein Vater gibt euch das rechte Brot vom Himmel." [ref=f2e137] [cursor=pointer]': "32 Da sprach Jesus zu ihnen: Wahrlich, wahrlich ich sage euch: Mose hat euch nicht das Brot vom Himmel gegeben, sondern mein Vater gibt euch das rechte Brot vom Himmel."
            - 'button "Vers 33: Denn dies ist das Brot Gottes, das vom Himmel kommt und gibt der Welt das Leben." [ref=f2e139] [cursor=pointer]': 33 Denn dies ist das Brot Gottes, das vom Himmel kommt und gibt der Welt das Leben.
            - 'button "Vers 34: Da sprachen sie zu ihm: HERR, gib uns allewege solch Brot." [ref=f2e141] [cursor=pointer]': "34 Da sprachen sie zu ihm: HERR, gib uns allewege solch Brot."
            - 'button "Vers 35: Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten. · im Fokus" [ref=f2e143] [cursor=pointer]': "35 Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten."
          - paragraph [ref=f2e145]:
            - 'button "Vers 36: Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht. · im Fokus" [ref=f2e147] [cursor=pointer]': 36 Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht.
            - 'button "Vers 37: Alles, was mir mein Vater gibt, das kommt zu mir; und wer zu mir kommt, den werde ich nicht hinausstoßen. · im Fokus" [ref=f2e149] [cursor=pointer]': 37 Alles, was mir mein Vater gibt, das kommt zu mir; und wer zu mir kommt, den werde ich nicht hinausstoßen.
            - 'button "Vers 38: Denn ich bin vom Himmel gekommen, nicht daß ich meinen Willen tue, sondern den Willen des, der mich gesandt hat." [ref=f2e151] [cursor=pointer]': 38 Denn ich bin vom Himmel gekommen, nicht daß ich meinen Willen tue, sondern den Willen des, der mich gesandt hat.
            - 'button "Vers 39: Das ist aber der Wille des Vaters, der mich gesandt hat, daß ich nichts verliere von allem, was er mir gegeben hat, sondern daß ich''s auferwecke am Jüngsten Tage." [ref=f2e153] [cursor=pointer]': 39 Das ist aber der Wille des Vaters, der mich gesandt hat, daß ich nichts verliere von allem, was er mir gegeben hat, sondern daß ich's auferwecke am Jüngsten Tage.
            - 'button "Vers 40: Denn das ist der Wille des, der mich gesandt hat, daß, wer den Sohn sieht und glaubt an ihn, habe das ewige Leben; und ich werde ihn auferwecken am Jüngsten Tage." [ref=f2e155] [cursor=pointer]': 40 Denn das ist der Wille des, der mich gesandt hat, daß, wer den Sohn sieht und glaubt an ihn, habe das ewige Leben; und ich werde ihn auferwecken am Jüngsten Tage.
          - paragraph [ref=f2e157]:
            - 'button "Vers 41: Da murrten die Juden darüber, daß er sagte: Ich bin das Brot, daß vom Himmel gekommen ist," [ref=f2e159] [cursor=pointer]': "41 Da murrten die Juden darüber, daß er sagte: Ich bin das Brot, daß vom Himmel gekommen ist,"
            - 'button "Vers 42: und sprachen: Ist dieser nicht Jesus, Josephs Sohn, des Vater und Mutter wir kennen? Wie spricht er denn: Ich bin vom Himmel gekommen?" [ref=f2e161] [cursor=pointer]': "42 und sprachen: Ist dieser nicht Jesus, Josephs Sohn, des Vater und Mutter wir kennen? Wie spricht er denn: Ich bin vom Himmel gekommen?"
            - 'button "Vers 43: Jesus antwortete und sprach zu ihnen: Murret nicht untereinander." [ref=f2e163] [cursor=pointer]': "43 Jesus antwortete und sprach zu ihnen: Murret nicht untereinander."
            - 'button "Vers 44: Es kann niemand zu mir kommen, es sei denn, daß ihn ziehe der Vater, der mich gesandt hat; und ich werde ihn auferwecken am Jüngsten Tage." [ref=f2e165] [cursor=pointer]': 44 Es kann niemand zu mir kommen, es sei denn, daß ihn ziehe der Vater, der mich gesandt hat; und ich werde ihn auferwecken am Jüngsten Tage.
            - 'button "Vers 45: Es steht geschrieben in den Propheten: “Sie werden alle von Gott gelehrt sein.” Wer es nun hört vom Vater und lernt es, der kommt zu mir." [ref=f2e167] [cursor=pointer]': "45 Es steht geschrieben in den Propheten: “Sie werden alle von Gott gelehrt sein.” Wer es nun hört vom Vater und lernt es, der kommt zu mir."
          - paragraph [ref=f2e169]:
            - 'button "Vers 46: Nicht daß jemand den Vater habe gesehen, außer dem, der vom Vater ist; der hat den Vater gesehen." [ref=f2e171] [cursor=pointer]': 46 Nicht daß jemand den Vater habe gesehen, außer dem, der vom Vater ist; der hat den Vater gesehen.
            - 'button "Vers 47: Wahrlich, wahrlich ich sage euch: Wer an mich glaubt, der hat das ewige Leben." [ref=f2e173] [cursor=pointer]': "47 Wahrlich, wahrlich ich sage euch: Wer an mich glaubt, der hat das ewige Leben."
            - 'button "Vers 48: Ich bin das Brot des Lebens." [ref=f2e175] [cursor=pointer]': 48 Ich bin das Brot des Lebens.
            - 'button "Vers 49: Eure Väter haben Manna gegessen in der Wüste und sind gestorben." [ref=f2e177] [cursor=pointer]': 49 Eure Väter haben Manna gegessen in der Wüste und sind gestorben.
            - 'button "Vers 50: Dies ist das Brot, das vom Himmel kommt, auf daß, wer davon isset, nicht sterbe." [ref=f2e179] [cursor=pointer]': 50 Dies ist das Brot, das vom Himmel kommt, auf daß, wer davon isset, nicht sterbe.
          - paragraph [ref=f2e181]:
            - 'button "Vers 51: Ich bin das lebendige Brot, vom Himmel gekommen. Wer von diesem Brot essen wird, der wird leben in Ewigkeit. Und das Brot, daß ich geben werde, ist mein Fleisch, welches ich geben werde für das Leben der Welt." [ref=f2e183] [cursor=pointer]': 51 Ich bin das lebendige Brot, vom Himmel gekommen. Wer von diesem Brot essen wird, der wird leben in Ewigkeit. Und das Brot, daß ich geben werde, ist mein Fleisch, welches ich geben werde für das Leben der Welt.
            - 'button "Vers 52: Da zankten die Juden untereinander und sprachen: Wie kann dieser uns sein Fleisch zu essen geben?" [ref=f2e185] [cursor=pointer]': "52 Da zankten die Juden untereinander und sprachen: Wie kann dieser uns sein Fleisch zu essen geben?"
            - 'button "Vers 53: Jesus sprach zu ihnen: Wahrlich, wahrlich ich sage euch: Werdet ihr nicht essen das Fleisch des Menschensohnes und trinken sein Blut, so habt ihr kein Leben in euch." [ref=f2e187] [cursor=pointer]': "53 Jesus sprach zu ihnen: Wahrlich, wahrlich ich sage euch: Werdet ihr nicht essen das Fleisch des Menschensohnes und trinken sein Blut, so habt ihr kein Leben in euch."
            - 'button "Vers 54: Wer mein Fleisch isset und trinket mein Blut, der hat das ewige Leben, und ich werde ihn am Jüngsten Tage auferwecken." [ref=f2e189] [cursor=pointer]': 54 Wer mein Fleisch isset und trinket mein Blut, der hat das ewige Leben, und ich werde ihn am Jüngsten Tage auferwecken.
            - 'button "Vers 55: Denn mein Fleisch ist die rechte Speise, und mein Blut ist der rechte Trank." [ref=f2e191] [cursor=pointer]': 55 Denn mein Fleisch ist die rechte Speise, und mein Blut ist der rechte Trank.
          - paragraph [ref=f2e193]:
            - 'button "Vers 56: Wer mein Fleisch isset und trinket mein Blut, der bleibt in mir und ich in ihm." [ref=f2e195] [cursor=pointer]': 56 Wer mein Fleisch isset und trinket mein Blut, der bleibt in mir und ich in ihm.
            - 'button "Vers 57: Wie mich gesandt hat der lebendige Vater und ich lebe um des Vaters willen, also, wer mich isset, der wird auch leben um meinetwillen." [ref=f2e197] [cursor=pointer]': 57 Wie mich gesandt hat der lebendige Vater und ich lebe um des Vaters willen, also, wer mich isset, der wird auch leben um meinetwillen.
            - 'button "Vers 58: Dies ist das Brot, das vom Himmel gekommen ist; nicht, wie eure Väter haben Manna gegessen und sind gestorben: wer dies Brot isset, der wird leben in Ewigkeit." [ref=f2e199] [cursor=pointer]': "58 Dies ist das Brot, das vom Himmel gekommen ist; nicht, wie eure Väter haben Manna gegessen und sind gestorben: wer dies Brot isset, der wird leben in Ewigkeit."
            - 'button "Vers 59: Solches sagte er in der Schule, da er lehrte zu Kapernaum." [ref=f2e201] [cursor=pointer]': 59 Solches sagte er in der Schule, da er lehrte zu Kapernaum.
            - 'button "Vers 60: Viele nun seine Jünger, die das hörten, sprachen: Das ist eine harte Rede; wer kann sie hören?" [ref=f2e203] [cursor=pointer]': "60 Viele nun seine Jünger, die das hörten, sprachen: Das ist eine harte Rede; wer kann sie hören?"
          - paragraph [ref=f2e205]:
            - 'button "Vers 61: Da Jesus aber bei sich selbst merkte, daß seine Jünger darüber murrten, sprach er zu ihnen: Ärgert euch das?" [ref=f2e207] [cursor=pointer]': "61 Da Jesus aber bei sich selbst merkte, daß seine Jünger darüber murrten, sprach er zu ihnen: Ärgert euch das?"
            - 'button "Vers 62: Wie, wenn ihr denn sehen werdet des Menschen Sohn auffahren dahin, da er zuvor war?" [ref=f2e209] [cursor=pointer]': 62 Wie, wenn ihr denn sehen werdet des Menschen Sohn auffahren dahin, da er zuvor war?
            - 'button "Vers 63: Der Geist ist''s, der da lebendig macht; das Fleisch ist nichts nütze. Die Worte, die ich rede, die sind Geist und sind Leben." [ref=f2e211] [cursor=pointer]': 63 Der Geist ist's, der da lebendig macht; das Fleisch ist nichts nütze. Die Worte, die ich rede, die sind Geist und sind Leben.
            - 'button "Vers 64: Aber es sind etliche unter euch, die glauben nicht. (Denn Jesus wußte von Anfang wohl, welche nicht glaubend waren und welcher ihn verraten würde.)" [ref=f2e213] [cursor=pointer]': 64 Aber es sind etliche unter euch, die glauben nicht. (Denn Jesus wußte von Anfang wohl, welche nicht glaubend waren und welcher ihn verraten würde.)
            - 'button "Vers 65: Und er sprach: Darum habe ich euch gesagt: Niemand kann zu mir kommen, es sei ihm denn von meinem Vater gegeben." [ref=f2e215] [cursor=pointer]': "65 Und er sprach: Darum habe ich euch gesagt: Niemand kann zu mir kommen, es sei ihm denn von meinem Vater gegeben."
          - paragraph [ref=f2e217]:
            - 'button "Vers 66: Von dem an gingen seiner Jünger viele hinter sich und wandelten hinfort nicht mehr mit ihm." [ref=f2e219] [cursor=pointer]': 66 Von dem an gingen seiner Jünger viele hinter sich und wandelten hinfort nicht mehr mit ihm.
            - 'button "Vers 67: Da sprach Jesus zu den Zwölfen: Wollt ihr auch weggehen?" [ref=f2e221] [cursor=pointer]': "67 Da sprach Jesus zu den Zwölfen: Wollt ihr auch weggehen?"
            - 'button "Vers 68: Da antwortete ihm Simon Petrus: HERR, wohin sollen wir gehen? Du hast Worte des ewigen Lebens;" [ref=f2e223] [cursor=pointer]': "68 Da antwortete ihm Simon Petrus: HERR, wohin sollen wir gehen? Du hast Worte des ewigen Lebens;"
            - 'button "Vers 69: und wir haben geglaubt und erkannt, daß du bist Christus, der Sohn des lebendigen Gottes." [ref=f2e225] [cursor=pointer]': 69 und wir haben geglaubt und erkannt, daß du bist Christus, der Sohn des lebendigen Gottes.
            - 'button "Vers 70: Jesus antwortete ihnen: Habe ich nicht euch Zwölf erwählt? und-euer einer ist ein Teufel!" [ref=f2e227] [cursor=pointer]': "70 Jesus antwortete ihnen: Habe ich nicht euch Zwölf erwählt? und-euer einer ist ein Teufel!"
          - paragraph [ref=f2e229]:
            - 'button "Vers 71: Er redete aber von dem Judas, Simons Sohn, Ischariot; der verriet ihn hernach, und war der Zwölfe einer." [ref=f2e231] [cursor=pointer]': 71 Er redete aber von dem Judas, Simons Sohn, Ischariot; der verriet ihn hernach, und war der Zwölfe einer.
      - generic [ref=f2e233]:
        - generic [ref=f2e234]: Ein kleiner Abschnitt. Ein neuer Gedanke.
        - button "Abschnitt als gelesen bestätigen" [ref=f2e235] [cursor=pointer]
        - button "Ganzes Kapitel als Lesebereich öffnen" [ref=f2e240] [cursor=pointer]
        - generic [ref=f2e244]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
      - generic [ref=f2e245]:
        - generic [ref=f2e246]: In Ruhe weiterdenken
        - generic [ref=f2e250]: Was ist dir im Text begegnet?
        - generic [ref=f2e251]: Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen. Du kannst jederzeit nachlesen oder pausieren.
        - button "Fragen zu Johannes 6 entdecken" [ref=f2e252] [cursor=pointer]
      - generic [ref=f2e256]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
  - generic [ref=f2e257]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { readFileSync } from "node:fs";
  4   | import { localData } from "./persistence";
  5   | 
  6   | const bible = JSON.parse(readFileSync("src/data/bible.json", "utf8"));
  7   | const verse = (page: Page, n: number) => page.getByRole("button", { name: new RegExp(`^Vers ${n}:`) }).filter({ visible: true });
  8   | const bar = (page: Page) => page.getByRole("toolbar", { name: "Versauswahl", exact: true });
  9   | const dialog = (page: Page) => page.getByRole("dialog").filter({ visible: true });
  10  | const progress = (data: any) => ({ readChapters: data.readChapters, readPassages: data.readPassages, readSteps: data.readSteps, completedSteps: data.completedSteps, growthStage: data.growthStage, notes: data.notes, drafts: data.drafts, ntStudy: data.ntStudy });
  11  | async function ready(page: Page) {
  12  |   await page.goto("/lesen/JHN?chapter=6&from=35&to=37");
  13  |   await expect(page.getByTestId("reader-flow")).toBeVisible();
  14  |   await page.evaluate(() => document.fonts.ready.then(() => undefined));
> 15  |   await expect.poll(async () => (await localData(page))?.readingPosition?.verse).toBe(35);
      |                                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  16  | }
  17  | function copy(numbers: number[], label: string) {
  18  |   return [label, ...numbers.map((n) => `${n} ${bible.JHN["6"].find((v: any) => v.n === n).text}`), "Lutherbibel 1912"].join("\n");
  19  | }
  20  | 
  21  | test("direktes Antippen öffnet die kleine Leiste und verändert weder Textlayout noch persönliche Inhalte", async ({ page }) => {
  22  |   await ready(page);
  23  |   const before = progress(await localData(page));
  24  |   await expect(bar(page)).toHaveCount(0);
  25  |   await expect(page.getByRole("button", { name: "Mehrere Verse auswählen", exact: true })).toHaveCount(0);
  26  |   const y = await verse(page, 35).evaluate(node => node.getClientRects()[0]!.top);
  27  |   await verse(page, 35).click();
  28  |   await expect(bar(page)).toBeVisible();
  29  |   await expect(bar(page)).toContainText("Johannes 6,35");
  30  |   await expect(dialog(page)).toHaveCount(0);
  31  |   await expect(page.getByTestId("verse-actions-35")).toHaveCount(0);
  32  |   expect(Math.abs(await verse(page, 35).evaluate(node => node.getClientRects()[0]!.top) - y)).toBeLessThan(2);
  33  |   await verse(page, 36).click();
  34  |   await expect(bar(page)).toContainText("Johannes 6,35–36");
  35  |   await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "true");
  36  |   await expect(verse(page, 36)).toHaveAttribute("aria-pressed", "true");
  37  |   await verse(page, 35).click();
  38  |   await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "false");
  39  |   await expect(bar(page)).toContainText("Johannes 6,36");
  40  |   await bar(page).getByRole("button", { name: "Auswahl aufheben", exact: true }).click();
  41  |   await expect(bar(page)).toHaveCount(0);
  42  |   expect(progress(await localData(page))).toEqual(before);
  43  | });
  44  | 
  45  | test("auch getrennte Verse lassen sich direkt kopieren, markieren und merken ohne Zwischenverse zu verändern", async ({ page, context }) => {
  46  |   await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  47  |   await ready(page);
  48  |   const before = progress(await localData(page));
  49  |   await verse(page, 35).click(); await verse(page, 37).click();
  50  |   await expect(bar(page)).toContainText("Johannes 6,35.37");
  51  |   await expect(bar(page).getByRole("button", { name: "Notiz", exact: true })).toBeDisabled();
  52  |   await bar(page).getByRole("button", { name: "Bibeltext kopieren", exact: true }).click();
  53  |   await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(copy([35, 37], "Johannes 6,35.37"));
  54  |   await bar(page).getByRole("button", { name: "Markieren", exact: true }).click();
  55  |   await bar(page).getByRole("button", { name: "Terrakotta markieren", exact: true }).click();
  56  |   await expect.poll(async () => (await localData(page)).highlights).toMatchObject({ "JHN:6:35": "terra", "JHN:6:37": "terra" });
  57  |   expect((await localData(page)).highlights["JHN:6:36"]).toBeUndefined();
  58  |   await bar(page).getByRole("button", { name: "Mehr", exact: true }).click();
  59  |   await expect(dialog(page).getByRole("textbox")).toHaveCount(0);
  60  |   await dialog(page).getByRole("button", { name: "Merken", exact: true }).click();
  61  |   await expect.poll(async () => (await localData(page)).bookmarks).toEqual(["JHN:6:35", "JHN:6:37"]);
  62  |   await dialog(page).getByRole("button", { name: "Schließen", exact: true }).click();
  63  |   await verse(page, 36).click();
  64  |   await expect(bar(page).getByRole("button", { name: "Notiz", exact: true })).toBeEnabled();
  65  |   expect(progress(await localData(page))).toEqual(before);
  66  | });
  67  | 
  68  | test("Notizen öffnen erst auf Wunsch und bewahren getrennte Vers- und Bereichsentwürfe", async ({ page }) => {
  69  |   await ready(page);
  70  |   await verse(page, 35).click(); await verse(page, 36).click();
  71  |   await expect(page.getByRole("textbox")).toHaveCount(0);
  72  |   await bar(page).getByRole("button", { name: "Notiz", exact: true }).click();
  73  |   const range = dialog(page).getByRole("textbox", { name: "Deine Notiz zu dieser Auswahl", exact: true });
  74  |   await expect(range).toBeFocused(); await range.fill("Ein Gedanke zu genau zwei Versen.");
  75  |   await expect.poll(async () => (await localData(page)).drafts.some((d) => d.key === "capture:passage:JHN:6:35:36" && d.type === "capture" && d.values.text === "Ein Gedanke zu genau zwei Versen.")).toBe(true);
  76  |   await dialog(page).getByRole("button", { name: "Schließen", exact: true }).click();
  77  |   await verse(page, 36).click();
  78  |   await bar(page).getByRole("button", { name: "Notiz", exact: true }).click();
  79  |   const single = dialog(page).getByRole("textbox", { name: "Notiz zu Vers 35", exact: true });
  80  |   await single.fill("Ein eigener Gedanke nur zum ersten Vers.");
  81  |   await expect.poll(async () => (await localData(page)).drafts.filter((d) => d.type === "capture").length).toBe(2);
  82  |   await dialog(page).getByRole("button", { name: "Schließen", exact: true }).click();
  83  |   await page.reload();
  84  |   expect((await localData(page)).drafts.filter((d) => d.type === "capture").map(d => d.key).sort()).toEqual(["capture:passage:JHN:6:35:36", "capture:verse:JHN:6:35"].sort());
  85  | });
  86  | 
  87  | test("die Aktionsleiste bleibt schmal, dunkel und hell per Tastatur und Screenreader bedienbar", async ({ page }, info) => {
  88  |   for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "dark"]] as const) {
  89  |     await page.setViewportSize({ width, height: 844 });
  90  |     await ready(page);
  91  |     const toggle = page.getByRole("button", { name: theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren", exact: true });
  92  |     if (await toggle.count()) await toggle.click();
  93  |     await verse(page, 35).focus(); await page.keyboard.press("Enter");
  94  |     await expect(bar(page)).toBeVisible();
  95  |     await expect(verse(page, 35)).toBeFocused();
  96  |     for (const name of ["Markieren", "Bibeltext kopieren", "Notiz", "Mehr", "Auswahl aufheben"]) {
  97  |       const b = bar(page).getByRole("button", { name, exact: true });
  98  |       await expect(b).toBeInViewport({ ratio: 1 });
  99  |       expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  100 |     }
  101 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  102 |     expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  103 |     await page.screenshot({ path: info.outputPath(`direct-selection-${width}-${theme}.png`) });
  104 |     await page.keyboard.press("Escape"); await expect(bar(page)).toHaveCount(0);
  105 |   }
  106 | });
  107 | 
```