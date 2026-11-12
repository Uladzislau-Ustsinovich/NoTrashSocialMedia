# Releasing to the App Store

What is already in the repo: app name, bundle identifier, icon and splash (`app.json`, `assets/`), the build profiles (`eas.json`), the privacy policy (`PRIVACY.md`), the listing text (`docs/store-listing.md`) and the licence.

What needs you, because it uses your accounts:

1. **Apple Developer Program.** Enrol at developer.apple.com (99 USD a year). The app itself can be free.
2. **Check the identifiers** in `app.json`: `expo.name` and `expo.ios.bundleIdentifier`. The bundle identifier cannot be changed after the first upload.
3. **Sign in to Expo:** `npx eas-cli@latest login`, then `npx eas-cli@latest init` to link the project (this adds a project id to `app.json`).
4. **Build:** `npx eas-cli@latest build --platform ios --profile production`. EAS creates the signing certificate and provisioning profile the first time and asks for your Apple ID.
5. **Create the app in App Store Connect** with the same bundle identifier, and paste the text from `docs/store-listing.md`.
6. **Host the privacy policy** at a public address. This repository is private, so GitHub will not serve `PRIVACY.md` to Apple or to users. Options: make the repository public, or publish the file with GitHub Pages or any static host. Then put that address, and a public support address, in `src/utils/about.ts` (the About screen links) and in the Contact section of `PRIVACY.md`.
7. **Try a real build on a phone before submitting.** Development so far has been in Expo Go and the simulator. Register your phone with `npx eas-cli@latest device:create`, build with `--profile preview`, install it, and check sign-in, photo upload (camera and library prompts) and the filters.
8. **Screenshots:** App Store Connect needs iPhone 6.9" screenshots. Take them in the simulator with `xcrun simctl io booted screenshot`. Do not show other people's posts or third-party logos.
9. **Demo account:** App Review needs to sign in. Add test account details for each site to the review notes.
10. **Upload:** `npx eas-cli@latest submit --platform ios --profile production`. This only uploads the build.
11. **TestFlight:** once the build has processed, test it through TestFlight.
12. **App Store Connect forms:** App Privacy ("Data Not Collected"), age rating, the content-rights question (the app displays third-party content it does not own), and, for distribution in the EU, your trader status under the Digital Services Act.
13. **Submit for review** from App Store Connect.

## Review risks

- Apple can reject apps that mainly wrap a website (guideline 4.2) or that use third-party services against their terms (5.2.2). The focus tools and the review notes are there to answer the first; the second is a judgement call by the reviewer.
- iPhone-only apps are still reviewed on iPad in compatibility mode; check the app there in the simulator.
- The app can hide ads on the sites it opens. The listing does not advertise this, because promoting ad removal on third-party services invites a 5.2.2 rejection.
- If rejected, reply in the Resolution Center pointing at the on-device focus features and at comparable approved apps.

## Regenerating the icon

`python3 scripts/make_icons.py assets` redraws every icon and splash image from code.
