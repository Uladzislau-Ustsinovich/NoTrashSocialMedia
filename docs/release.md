# Releasing to the App Store

What is already in the repo: app name, bundle identifier, icon and splash (`app.json`, `assets/`), the build profiles (`eas.json`), the privacy policy (`PRIVACY.md`), the listing text (`docs/store-listing.md`) and the licence.

What needs you, because it uses your accounts:

1. **Apple Developer Program.** Enrol at developer.apple.com (99 USD a year). The app itself can be free.
2. **Check the identifiers** in `app.json`: `expo.name` and `expo.ios.bundleIdentifier`. The bundle identifier cannot be changed after the first upload.
3. **Sign in to Expo:** `npx eas-cli@latest login`, then `npx eas-cli@latest init` to link the project (this adds a project id to `app.json`).
4. **Build:** `npx eas-cli@latest build --platform ios --profile production`. EAS creates the signing certificate and provisioning profile the first time and asks for your Apple ID.
5. **Create the app in App Store Connect** with the same bundle identifier, and paste the text from `docs/store-listing.md`.
6. **Host the privacy policy** at a public address. This repository is private, so GitHub will not serve `PRIVACY.md` to Apple. Options: make the repository public, or publish the file with GitHub Pages or any static host.
7. **Screenshots:** App Store Connect needs iPhone 6.9" screenshots. Take them in the simulator with `xcrun simctl io booted screenshot`. Do not show other people's posts or third-party logos.
8. **Demo account:** App Review needs to sign in. Add test account details for each site to the review notes.
9. **Submit:** `npx eas-cli@latest submit --platform ios --profile production`, then send the build to TestFlight testers before submitting for review.

## Review risks

- Apple can reject apps that mainly wrap a website (guideline 4.2) or that use third-party services against their terms (5.2.2). The focus tools and the review notes are there to answer the first; the second is a judgement call by the reviewer.
- If rejected, reply in the Resolution Center pointing at the on-device focus features and at comparable approved apps.

## Regenerating the icon

`python3 scripts/make_icons.py assets` redraws every icon and splash image from code.
