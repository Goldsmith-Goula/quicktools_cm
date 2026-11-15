# QuickTools CM

An offline-first toolkit for mobile users in Cameroon.

- **USSD Smart Hub:** MTN, Orange and Camtel codes for airtime, data and more, sorted by category, with favourites and space to add your own codes.
- **WhatsApp Quick Chat:** start a WhatsApp chat with any number without saving it as a contact. Keeps your recent chats and can show a QR code.
- **AI code suggestions (optional):** type what you want to do and Google Gemini suggests a USSD code.

The repo holds two versions of the app:

| Folder | What it is |
|---|---|
| `app/` | Native Android app (Kotlin, Jetpack Compose, Room) |
| `reactnative/` | React Native (Expo) version of the same screens |

---

## No API keys are included

This repository does **not** contain any API key, and it never should.

The app works without one. If no Gemini key is set, the AI suggestion feature falls back to a small set of built-in suggestions instead of calling Gemini. Everything else (the USSD hub, Quick Chat, favourites) works fully offline with no key at all.

If you want real AI suggestions, use **your own** key, as shown below.

---

## Run the Android app

**You need:** [Android Studio](https://developer.android.com/studio) (latest stable) and an Android phone or emulator on Android 7.0 (API 24) or newer.

1. Clone the repo:
   ```bash
   git clone https://github.com/Goldsmith-Goula/quicktools_cm.git
   ```
2. In Android Studio, choose **File > Open** and pick the `quicktools_cm` folder. Wait for Gradle to finish syncing.
3. *(Optional, only for AI suggestions)* Add your own Gemini key. See the next section.
4. Press **Run** to install the app on your phone or emulator.

If the build fails on `signingConfig = signingConfigs.getByName("debugConfig")` in `app/build.gradle.kts`, delete that line and build again. Android Studio will use its own debug signing instead.

### Get and add your own Gemini API key (optional)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with a Google account.
2. Click **Create API key** and copy it.
3. In the project's root folder (next to `settings.gradle.kts`), create a file named **`.env`** with one line:
   ```
   GEMINI_API_KEY=paste_your_key_here
   ```
4. Rebuild the app. The key is read from `.env` when the app is built.

`.env` is listed in `.gitignore`, so Git will not upload it. **Never** paste a key into a `.kt`, `.js` or any other code file, and never commit a `.env` file.

### Keep your key safe

Anyone who has your key can use it, and the bill goes to your Google account.

- **Restrict it.** In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), open the key and:
  - under *API restrictions*, allow only the **Generative Language API** (Gemini);
  - under *Application restrictions*, choose **Android apps** and add the app's package name and your signing certificate's SHA-1 fingerprint.
- **Set a budget alert** under *Billing > Budgets & alerts*, so you hear about unusual use quickly.
- **Don't share an APK built with your personal key.** A key built into an app can be pulled out of the APK file. For an app other people will install, call Gemini from your own small server and keep the key there.
- **If a key leaks, delete it** in Google AI Studio or the Cloud Console and create a new one. Removing the file from GitHub is not enough, because old commits stay reachable.

---

## Run the React Native version

**You need:** [Node.js](https://nodejs.org) 18 or newer and the [Expo Go](https://expo.dev/go) app on your phone.

```bash
cd reactnative
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone). This version needs no API key.

---

## Security notice

This is a personal project. **Only the most basic security checks have been run on it** (see [SECURITY.md](SECURITY.md)). It has not had a professional security review or penetration test.

- Use it at your own risk, and be careful before relying on it with real personal data or money.
- Check any USSD code before you dial it. Codes change, and AI suggestions can be wrong. A wrong code could buy a bundle or start a transfer you did not mean to make.
- Keep your own API keys private, as explained above.

Found a security problem? Please don't post the details in a public issue. Email goldsmithgoula@gmail.com instead.

---

## Signing release builds (maintainers only)

Release builds read their signing details from environment variables, never from the code:

| Variable | Meaning |
|---|---|
| `KEYSTORE_PATH` | Path to your upload keystore (`.jks`) |
| `STORE_PASSWORD` | Keystore password |
| `KEY_PASSWORD` | Key password |

Never commit a real keystore or its passwords.

---

Built by [Goldsmith Goula](https://goldsmith-goula.vercel.app).
