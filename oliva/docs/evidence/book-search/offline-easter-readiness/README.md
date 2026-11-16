# Offline-Bildbereitschaft nach Neustart

Im ersten vollständigen 0.12.1-Lauf prüfte der bestehende Ostergeschichtenfall `img.complete`/`naturalWidth` einmal unmittelbar nach dem Wiedererscheinen des Textes. Die Momentaufnahme zeigte die echte Ladeanzeige „Illustration wird geladen“; die unmittelbare Boolesche Prüfung war false. Das ist kein Beleg für einen dauerhaften Assetfehler.

Die Testkorrektur erwartet denselben tatsächlichen Zustand nun mit Playwright `expect.poll`: mindestens ein Osterbild und alle vollständigen Bilder mit positiver natürlicher Breite. Keine Runtime-, Bild-, Cache- oder Buildänderung, keine beliebige Pause, kein aufgeweichtes Kriterium. Der alte Gesamtbericht bleibt erhalten; ein vollständiger neuer Lauf wird separat berichtet. Ein späterer Erfolg macht den ersten Lauf nicht grün.
