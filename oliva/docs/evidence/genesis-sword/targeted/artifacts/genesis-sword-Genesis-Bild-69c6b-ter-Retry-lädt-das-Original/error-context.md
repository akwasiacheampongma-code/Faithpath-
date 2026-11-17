# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: genesis-sword.spec.ts >> Genesis-Bildfehler mit blockiertem Service-Worker >> drei echte Bildfehler erhalten das Symbol und ein bewusster Retry lädt das Original
- Location: tests/e2e/genesis-sword.spec.ts:162:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:4173/einstellungen", waiting until "load"

```

```
Error: write EPIPE
```