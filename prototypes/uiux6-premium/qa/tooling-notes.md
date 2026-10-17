# Grenzen der Ausführungsumgebung

Direkter file://-Aufruf wird in diesem verwalteten Chromium mit ERR_BLOCKED_BY_ADMINISTRATOR verhindert. Der vollständige lokale HTTP-Aufruf besteht. Das Paket nutzt klassische lokale Skripte; direkte Dateiöffnung ist vorbereitet, aber hier nicht unabhängig bestätigt. Dies ist keine verweigerte Erlaubnis zum Webdeployment; es wurde kein Deployment versucht.

37 Prototyp-Unit-Tests wurden mit --test-isolation=none ausgeführt, weil der Default-Sandbox-Workerprozess zeitweise spawnSync EPERM lieferte. Die vorhandenen188 App-Tests liefen mit passenden Umgebungsrechten erfolgreich.

Upstream-OFL-Texte werden bewusst unverändert mit ursprünglichen CRLF-/Leerzeichenbytes verteilt. Git diff --check meldet dies als Whitespace; keine Formatanpassung an fremden Lizenztexten. Quellcodeprüfung ohne Lizenzkopien ist sauber.
