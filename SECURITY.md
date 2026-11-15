# Security notes

**Scope:** a basic, self-run check of the code in this repository (November 2026). It is not a professional audit or a penetration test. Treat the app as unaudited.

## What was checked and fixed

| Area | Finding | Status |
|---|---|---|
| Secrets in the repo | An old test file in an earlier commit contained a Google API key. That key has been revoked. No keys are in the current code. | Fixed: key revoked; `.gitignore` now blocks `.env`, keystores and `test-*.js` files |
| How the API key is sent | The Gemini key was sent in the web address (`?key=...`), where it can end up in logs. | Fixed: now sent in the `x-goog-api-key` header |
| Error logging | Errors were printed in full, which could include request details. | Fixed: only the error type is logged |
| Trusting AI answers | The app accepted whatever text the AI returned as a "USSD code". | Fixed: suggestions must look like a real USSD code (for example `*126#` or `*157*1#`), otherwise they are ignored |
| Phone backups | `allowBackup` was on, so saved numbers and recent chats could be copied into device backups. | Fixed: backups turned off |
| Dialing codes (React Native) | Codes are URL-encoded before being passed to the dialer. | OK |

## Known gaps (not fixed yet)

- **Key inside the app:** if you build the app with your own Gemini key, the key is inside the APK and can be extracted. The safe setup is a small backend that holds the key.
- **Release code shrinking:** `isMinifyEnabled` is off for release builds. Turning it on needs ProGuard/R8 rules for Moshi first, so it was left as is.
- **Debug keystore:** `debug.keystore.base64` is the standard Android debug key (password `android`). It can't publish to the Play Store, but it shouldn't be used for anything real.
- **No automated tests** cover the security fixes above.

## Reporting a problem

Email goldsmithgoula@gmail.com. Please don't post security details in a public issue.
