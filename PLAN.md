# Plan

## Goal

A free app that lets you use Instagram, YouTube and X while the doomscrolling parts are hidden, with a switch for each part.

## Decisions

| Question | Decision |
|---|---|
| Target platform | iOS first, then Android, from one Expo codebase |
| "Manually remove" | A list of switches per platform that enable or disable elements and features. No tap-to-hide picker. |
| Distribution | Store release is planned (App Store first, Google Play after) |

## Research summary

Existing paid apps (SocialLite, ScrollGuard, BackToLife, Dull) all load each site's mobile web version in an in-app browser and inject CSS/JS. None modify the native apps. No open-source React Native app covers several platforms; the closest references are `justagram` (Capacitor, Instagram only, no licence) and `FocusGram` (Android GeckoView, Instagram only, AGPL-3.0).

Complaints those apps receive, which this app inherits:

- No push notifications.
- Mobile web versions lack some features (posting Stories, voice notes, close friends).
- Login problems in embedded browsers, mainly X re-login and login loops when filters run on the login page.
- Filters break when a site changes its page structure.

## Architecture

```
src/
  app/                      Expo Router screens
    index.tsx               platform picker (Instagram, YouTube, X)
    browser/[platform].tsx  WebView screen
    settings/[platform].tsx switches for one platform
  platforms/                one manifest per platform
    instagram.ts
    youtube.ts
    x.ts
  engine/
    runtime.ts              script that runs inside the page: style sync, history patch, auth guard
    buildInjection.ts       manifest + enabled switches -> config for the runtime
  store/
    toggles.ts              saved switches
```

Manifest shape:

```ts
type Toggle = {
  id: string;               // "ig.reels"
  label: string;
  description?: string;
  defaultOn: boolean;
  css?: string[];           // selectors hidden with display: none
  blockRoutes?: string[];   // paths redirected to home
};

type Platform = {
  id: "instagram" | "youtube" | "x";
  name: string;
  tagline: string;
  homeUrl: string;
  authPaths: string[];      // filters are off on these
  toggles: Toggle[];
};
```

How a page is filtered:

1. CSS for enabled toggles is injected before content loads.
2. Elements that need structural matching (a Reel inside the feed, a Shorts shelf) use CSS `:has()`, so no observer script is needed.
3. Blocked routes are redirected to home by the injected script, on page load and on in-page navigation (history patch).
4. Changing a switch re-injects the stylesheet without reloading the page.

## Phases

Status: phases 1 to 3 are built, and the Instagram and X switches are verified on signed-in pages. Open items:

- YouTube is hidden in the app. Before re-enabling: sign-in (Google is the main risk) and the "Home feed" switch, which needs a signed-in feed.
- Instagram "Create" button and the "Use the app" banner have no switch yet; no stable marker found.
- Instagram "Suggested posts" and "Ads" match English labels only; find a language-independent marker.
- X Explore still shows "Who to follow" and "Posts For You".
- Instagram's "For you" feed sticks on a spinner when most of it is hidden; only the Following feed is usable with the filters on.
- Unit tests for `buildConfig` and the route matching.

### Phase 1: skeleton

- Scaffold Expo + TypeScript + Expo Router, add `react-native-webview`.
- Platform picker and a browser screen with back, reload and home.
- Persistent sessions and a mobile Safari user agent.
- **Exit check:** log in to all three sites and stay logged in after restarting the app. Google sign-in for YouTube is the main risk, because Google blocks some embedded browsers.

### Phase 2: filter engine and first toggles

- Manifest types, `buildInjection`, the injected runtime.
- Instagram: Reels tab, Reels in feed, Stories, Explore, suggested posts.
- YouTube: Shorts tab, Shorts shelves, Shorts URLs, home feed, comments.
- X: For You, trending, Grok, ads.
- **Exit check:** each toggle hides its target with no flash on load and survives in-page navigation.

### Phase 3: settings

- Settings screen with switches per platform, persisted on device.
- Live apply without reload.
- Unit tests for `buildConfig` and the route matching (not written yet).

### Phase 4: native features that make it more than a wrapper

Apple often rejects apps that only wrap someone else's website, so the store build needs functionality of its own.

- Grayscale per platform.
- Daily time limit and a short pause before opening a platform.
- Usage stats (time per platform per day).
- Health check that flags toggles whose selectors match nothing.
- Filter manifests fetched from the GitHub repo, so fixes do not wait for store review.

### Phase 5: iOS store release

- App name, bundle identifier, icon and splash screen that use no Instagram, YouTube or X branding.
- Privacy policy page and App Store privacy answers (no data collected).
- Open-source licence for the repo.
- EAS build, TestFlight round, then App Store submission.
- Review notes explaining that the app is a focus tool and that logins go directly to each site.

### Phase 6: Android

- Test and fix all three platforms on Android WebView (cookies, user agent, file uploads, back button).
- Google Play listing and submission.

### Later, if wanted

- YouTube background audio and picture-in-picture.
- More platforms (Facebook, Reddit, LinkedIn, TikTok).

## Risks

| Risk | Mitigation |
|---|---|
| Google blocks sign-in in the WebView | Test in phase 1 before building anything else; fall back to signed-out YouTube or a system browser sign-in |
| Selectors break after site updates | Stable attributes over class names, health check, remote manifests in phase 4 |
| App Store rejection as a "website wrapper", or for using third-party services against their terms | Native features in phase 4, neutral branding, clear review notes. Rejection is still possible; SocialLite, BackToLife and Dull show that approval is achievable. |
| Login loops | Filters disabled on auth paths from the first version |
