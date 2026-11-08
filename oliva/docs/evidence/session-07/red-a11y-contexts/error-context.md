# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews.spec.ts >> Rückblickeditor bleibt auf kleinen und großen Displays sowie in Hell und Dunkel lesbar
- Location: tests/e2e/reviews.spec.ts:391:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 583

- Array []
+ Array [
+   Object {
+     "description": "Ensure that elements labelled through their content must have their visible text as part of their accessible name",
+     "help": "Elements must have their visible text as part of their accessible name",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/label-content-name-mismatch?application=playwright",
+     "id": "label-content-name-mismatch",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "label-content-name-mismatch",
+             "impact": "serious",
+             "message": "Text inside the element is not included in the accessible name",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Text inside the element is not included in the accessible name",
+         "html": "<button aria-label=\"Profil und Einstellu...\" role=\"button\" tabindex=\"0\" class=\"css-g5y9jx r-1loqt21...\" type=\"button\" style=\"width: 35px; height:...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .css-g5y9jx:nth-child(1) > .css-g5y9jx > .r-1loqt21.r-1otgn73[aria-label=\"Profil und Einstellungen\"]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "wcag21a",
+       "wcag253",
+       "EN-301-549",
+       "EN-9.2.5.3",
+       "RGAAv4",
+       "RGAA-6.1.5",
+     ],
+   },
+   Object {
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"css-g5y9jx\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(1) > .css-g5y9jx:nth-child(1) > .css-g5y9jx:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; letter-spacing: 1.8px; line-height: 18px; font-weight: 600; font-size: 9px; color: rgb(92, 103, 91); margin-left: 18px; margin-bottom: 15px;\">DEIN PERSÖNLICHER ORT</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(1) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; font-size: 21px; line-height: 27px;\">Glaube darf wachsen.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(1) > .css-g5y9jx:nth-child(6) > .css-146c3p1[dir=\"auto\"]:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 19px; color: rgb(92, 103, 91); font-size: 11px;\">In deinem Tempo. Ohne Druck.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(1) > .css-g5y9jx:nth-child(6) > .css-146c3p1[dir=\"auto\"]:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; letter-spacing: 1.8px; line-height: 18px; font-weight: 600; font-size: 9px; color: rgb(92, 103, 91);\">LESEN. VERSTEHEN. WACHSEN.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .css-g5y9jx:nth-child(1) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"css-g5y9jx\" style=\"flex-direction: row; align-items: center; gap: 7px;\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .css-g5y9jx:nth-child(1) > .css-g5y9jx > .css-g5y9jx:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 19px; font-size: 10px; color: rgb(38, 60, 48);\">Dein persönliches Vorhaben</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-150rngu.r-eqz5dr.r-16y2uox > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<h1 dir=\"auto\" role=\"heading\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; line-height: 40px; font-size: 42px;\">In Ruhe zuhören</h1>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .r-150rngu.r-eqz5dr.r-16y2uox > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx > h1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 14px; color: rgb(92, 103, 91);\">Mein ursprünglicher Anlass.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-150rngu.r-eqz5dr.r-16y2uox > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx > .css-146c3p1[dir=\"auto\"]:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 19px; font-size: 10px; color: rgb(38, 60, 48);\">Deine Rückblickbearbeitung</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-1p0dtai.r-1d2f490.r-u8s1d:nth-child(2) > .r-13awgt0.css-g5y9jx > .r-13awgt0.css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(2) > .r-150rngu.r-eqz5dr.r-16y2uox > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(7) > .css-g5y9jx:nth-child(1) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; font-size: 28px; line-height: 33px;\">Deine Worte dürfen sich weiterentwickeln.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".r-150rngu.r-eqz5dr.r-16y2uox > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(7) > .css-146c3p1[dir=\"auto\"]:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 12px; color: rgb(92, 103, 91);\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(7) > .css-146c3p1[dir=\"auto\"]:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"css-g5y9jx\" style=\"flex-direction: row; align-items: center; gap: 6px; border-radius: 99px; padding: 5px 10px; background-color: rgb(239, 238, 229); align-self: flex-start;\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(7) > .css-g5y9jx:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"css-g5y9jx\" style=\"gap: 7px;\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(7) > .css-g5y9jx:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; font-size: 28px; line-height: 33px;\">Deine kleinen Schritte</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(8) > .css-146c3p1[dir=\"auto\"]:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 11px; color: rgb(92, 103, 91);\">Ein Häkchen hält fest, was du ausprobiert hast. Es ist kein Nachweis geistlicher Entwicklung.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(8) > .css-146c3p1[dir=\"auto\"]:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; color: rgb(38, 60, 48); line-height: 24px; font-size: 14px;\">Eine offene Frage stellen.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(8) > .css-g5y9jx > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; font-size: 28px; line-height: 33px;\">Deine Rückblicke</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(9) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 19px; font-size: 10px; color: rgb(38, 60, 48);\">7.11.2026 · dein eigener Rückblick</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(9) > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(1) > .css-146c3p1[dir=\"auto\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"color: rgb(38, 60, 48); font-family: Cormorant; font-size: 25px; line-height: 34px;\">Heute war Raum für meine offene Frage.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(9) > .css-g5y9jx > .css-g5y9jx > .css-146c3p1[dir=\"auto\"]:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 11px; color: rgb(92, 103, 91);\">Für diesen Rückblick liegt eine Bearbeitung vor. Sichere oder verwirf den Entwurf ausdrücklich, bevor du ihn löschst.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(9) > .css-g5y9jx > .css-g5y9jx > .css-146c3p1[dir=\"auto\"]:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"css-g5y9jx\" style=\"background-color: rgb(239, 238, 229); padding: 17px; border-radius: 12px; gap: 8px;\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(9) > .css-g5y9jx > .css-g5y9jx > .css-g5y9jx:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 12px; color: rgb(92, 103, 91);\">Du darfst Vorhaben ruhen lassen. Im Archiv bleiben alle bisherigen Worte und Rückblicke erhalten.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(10) > .css-146c3p1[dir=\"auto\"]:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div dir=\"auto\" class=\"css-146c3p1\" style=\"font-family: DMSans; line-height: 24px; font-size: 11px; color: rgb(92, 103, 91);\">Schließe zuerst deinen Entwurf ab oder verwirf ihn ausdrücklich.</div>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".css-g5y9jx:nth-child(10) > .css-146c3p1[dir=\"auto\"]:nth-child(3)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-9.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e16]:
        - generic [ref=e17]: OLIVA
        - generic [ref=e18]: RAUM FÜR DEINEN GLAUBEN
      - generic [ref=e20]: DEIN PERSÖNLICHER ORT
      - generic [ref=e21]:
        - button "Heute" [ref=e22] [cursor=pointer]
        - button "Bibel" [ref=e26] [cursor=pointer]
        - button "Wege" [ref=e30] [cursor=pointer]
        - button "Mein Garten" [ref=e36] [cursor=pointer]
        - button "Sammlung" [ref=e41] [cursor=pointer]
      - generic [ref=e46]:
        - generic [ref=e50]: Glaube darf wachsen.
        - generic [ref=e51]: In deinem Tempo. Ohne Druck.
      - button "Einstellungen" [ref=e52] [cursor=pointer]
    - generic [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]: LESEN. VERSTEHEN. WACHSEN.
        - generic [ref=e60]:
          - generic [ref=e61]: Dein Raum. Ganz bei dir.
          - button "Dunklen Modus aktivieren" [active] [ref=e64] [cursor=pointer]
          - button "Profil und Einstellungen" [ref=e67] [cursor=pointer]:
            - generic [ref=e68]: Du
      - generic [ref=e72]:
        - button "Zurück zu deinen Vorhaben" [ref=e74] [cursor=pointer]
        - generic [ref=e77]: Dein persönliches Vorhaben
        - heading "In Ruhe zuhören" [level=1] [ref=e82]
        - generic [ref=e83]: Mein ursprünglicher Anlass.
        - generic [ref=e84]:
          - button "Entwurf fortsetzen" [ref=e85] [cursor=pointer]
          - button "Schritt hinzufügen" [disabled]
          - button "Freiwilligen Rückblick schreiben" [disabled]
        - button "Editor schließen und Entwurf behalten" [ref=e97] [cursor=pointer]
        - generic [ref=e101]:
          - generic [ref=e102]: Deine Rückblickbearbeitung
          - generic [ref=e107]: Deine Worte dürfen sich weiterentwickeln.
          - generic [ref=e108]: Du änderst nur den Text. Der ursprüngliche Zeitpunkt, der bewahrte Stand und deine damalige Einschätzung einer Erfahrung bleiben erhalten. Diese Bearbeitung verändert deinen Baum nicht.
          - generic [ref=e109]: "Damals: In Ruhe zuhören"
          - generic [ref=e111]:
            - generic [ref=e112]: Deine überarbeiteten Worte
            - textbox "Deine überarbeiteten Worte" [ref=e113]: Meine neue Frage darf auch auf einem kleinen Bildschirm Platz haben.
          - generic [ref=e114]:
            - generic [ref=e115]: Entwurf auf diesem Gerät gesichert.
            - button "Rückblickänderung speichern" [ref=e116] [cursor=pointer]
            - button "Entwurf verwerfen" [ref=e120] [cursor=pointer]
          - button "Bearbeitungsentwurf exportieren" [ref=e124] [cursor=pointer]
        - generic [ref=e128]:
          - generic [ref=e129]: Deine kleinen Schritte
          - generic [ref=e130]: Ein Häkchen hält fest, was du ausprobiert hast. Es ist kein Nachweis geistlicher Entwicklung.
          - generic [ref=e131]:
            - generic [ref=e132]: Eine offene Frage stellen.
            - generic [ref=e133]:
              - button "Als ausprobiert festhalten" [disabled]
              - button "Schritt bearbeiten" [disabled]
        - generic [ref=e142]:
          - generic [ref=e143]: Deine Rückblicke
          - generic [ref=e145]:
            - generic [ref=e146]: 7.11.2026 · dein eigener Rückblick
            - generic [ref=e150]: Heute war Raum für meine offene Frage.
            - generic [ref=e151]:
              - button "Rückblick bearbeiten" [disabled]
              - button "Rückblick löschen" [disabled]
            - generic [ref=e159]: Für diesen Rückblick liegt eine Bearbeitung vor. Sichere oder verwirf den Entwurf ausdrücklich, bevor du ihn löschst.
            - generic [ref=e160]:
              - generic [ref=e161]: BEWAHRTER STAND BEIM BEGINN DIESES RÜCKBLICKS
              - generic [ref=e162]: In Ruhe zuhören
              - generic [ref=e163]: Mein ursprünglicher Anlass.
              - generic [ref=e164]: ○ Eine offene Frage stellen.
        - generic [ref=e165]:
          - generic [ref=e166]: Du darfst Vorhaben ruhen lassen. Im Archiv bleiben alle bisherigen Worte und Rückblicke erhalten.
          - button "Vorhaben ins Archiv legen" [disabled]
          - generic [ref=e170]: Schließe zuerst deinen Entwurf ab oder verwirf ihn ausdrücklich.
  - generic [ref=e171]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  329 |   expect((await localData(page)).growthStage).toBe(seed.growth);
  330 | });
  331 | 
  332 | test("archivierte und fehlende Ziele lassen eigene Entwurfsworte lesbar, exportierbar und verwerfbar", async ({
  333 |   page,
  334 | }) => {
  335 |   const seed = await create(page),
  336 |     text = "Diese offenen Worte sollen bleiben.";
  337 |   await startEdit(page, seed.review.id, text);
  338 |   await externalChange(page, (d) => {
  339 |     d.goals[0]!.archivedAt = new Date().toISOString();
  340 |     d.goals[0]!.revision++;
  341 |   });
  342 |   await page.reload();
  343 |   await resume(page);
  344 |   await expect(
  345 |     page.getByRole("textbox", {
  346 |       name: "Deine überarbeiteten Worte",
  347 |       exact: true,
  348 |     }),
  349 |   ).toHaveValue(text);
  350 |   await expect(
  351 |     page.getByRole("button", {
  352 |       name: "Rückblickänderung speichern",
  353 |       exact: true,
  354 |     }),
  355 |   ).toBeDisabled();
  356 |   await externalChange(page, (d) => {
  357 |     d.goals = [];
  358 |   });
  359 |   await page.reload();
  360 |   await expect(
  361 |     page.getByRole("textbox", {
  362 |       name: "Deine überarbeiteten Worte",
  363 |       exact: true,
  364 |     }),
  365 |   ).toHaveValue(text);
  366 |   await expect(
  367 |     page.getByText(/Der zugehörige Rückblick ist nicht mehr vorhanden/),
  368 |   ).toBeVisible();
  369 |   const download = page.waitForEvent("download");
  370 |   await page
  371 |     .getByRole("button", {
  372 |       name: "Bearbeitungsentwurf exportieren",
  373 |       exact: true,
  374 |     })
  375 |     .click();
  376 |   const path = await (await download).path();
  377 |   expect(JSON.parse(await readFile(path!, "utf8")).draft.values.text).toBe(
  378 |     text,
  379 |   );
  380 |   await page
  381 |     .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  382 |     .click();
  383 |   await page
  384 |     .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  385 |     .click();
  386 |   await expect.poll(async () => (await localData(page)).drafts.length).toBe(0);
  387 |   expect((await localData(page)).goals).toEqual([]);
  388 |   expect((await localData(page)).growthStage).toBe(seed.growth);
  389 | });
  390 | 
  391 | test("Rückblickeditor bleibt auf kleinen und großen Displays sowie in Hell und Dunkel lesbar", async ({
  392 |   page,
  393 | }) => {
  394 |   const seed = await create(page),
  395 |     text =
  396 |       "Meine neue Frage darf auch auf einem kleinen Bildschirm Platz haben.";
  397 |   await startEdit(page, seed.review.id, text);
  398 |   const output = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/screens`;
  399 |   await mkdir(output, { recursive: true });
  400 |   for (const [width, theme, name] of [
  401 |     [320, "light", "review-edit-mobile-light"],
  402 |     [390, "dark", "review-edit-mobile-dark"],
  403 |     [1440, "light", "review-edit-desktop"],
  404 |   ] as const) {
  405 |     await page.setViewportSize({ width, height: 844 });
  406 |     const toggle = page.getByRole("button", {
  407 |       name:
  408 |         theme === "dark"
  409 |           ? "Dunklen Modus aktivieren"
  410 |           : "Hellen Modus aktivieren",
  411 |       exact: true,
  412 |     });
  413 |     if (await toggle.count()) await toggle.click();
  414 |       await expect.poll(async () => (await localData(page)).settings.theme).toBe(theme);
  415 |     await expect(
  416 |       page.getByRole("textbox", {
  417 |         name: "Deine überarbeiteten Worte",
  418 |         exact: true,
  419 |       }),
  420 |     ).toHaveValue(text);
  421 |     await expect
  422 |       .poll(() =>
  423 |         page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  424 |       )
  425 |       .toBe(true);
  426 |     await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  427 |   }
  428 |   const axe = await new AxeBuilder({ page }).analyze();
> 429 |   expect(axe.violations).toEqual([]);
      |                          ^ Error: expect(received).toEqual(expected) // deep equality
  430 |   await page
  431 |     .getByRole("button", { name: "Rückblickänderung speichern", exact: true })
  432 |     .click();
  433 |   await expect
  434 |     .poll(async () => (await localData(page)).goals[0]!.reviews[0]!.text)
  435 |     .toBe(text);
  436 |   await page.setViewportSize({ width: 390, height: 844 });
  437 |   await reviewCard(page, seed.review.id)
  438 |     .getByRole("button", { name: "Rückblick löschen", exact: true })
  439 |     .click();
  440 |   await page.screenshot({
  441 |     path: `${output}/review-delete-mobile.png`,
  442 |     fullPage: true,
  443 |   });
  444 |   expect((await localData(page)).growthStage).toBe(seed.growth);
  445 | });
  446 | 
```