# Bekannte Einschränkungen

1. Die sieben Baumgrafiken bleiben statische Entwicklungsstufen. V4 simuliert keine technisch falsche Ast-Zuordnung.
2. Die 1.300 Kapitelquizfragen sind text-extraktiv und sollten vor einem großen kommerziellen Launch redaktionell weiter verbessert werden.
3. Physische Multi-Device-Tests (mehrere iPhone-Größen, iPad, Android) und vollständiger VoiceOver-Test stehen noch aus.
4. LocalStorage ist bewusst einfach und offline-first, aber nicht für sehr große Datenmengen oder geräteübergreifenden Sync gedacht.
5. Der Branch-Upload über GitHub Actions funktioniert. Ein echtes automatisches Netlify-Continuous-Deployment direkt aus GitHub ist noch nicht als eigener Release-Prozess dokumentiert.
6. Airtable wird nur als redaktionelle Quelle betrachtet; V4 hat absichtlich keine Airtable-Runtime-Abhängigkeit.
