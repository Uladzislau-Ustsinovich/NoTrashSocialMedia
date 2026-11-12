# NoTrashSocialMedia

A free React Native app for using Instagram and X without the doomscrolling parts. YouTube support is written but switched off for now.

It opens the mobile web version of each site in an in-app browser and hides the pieces you switch off: Reels, Shorts, Stories, Explore, "For You", suggested posts and so on. Messages, profiles, search and subscriptions keep working.

It is a free alternative to paid apps such as SocialLite, ScrollGuard, BackToLife and Dull.

> **Status:** Instagram and X work with filters verified on signed-in pages. YouTube is hidden in the app until sign-in is sorted out. See [PLAN.md](PLAN.md).

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

## How it works

- Each platform loads in its own `react-native-webview` with a persistent login session.
- A per-platform filter manifest lists toggles. Each toggle carries CSS selectors and blocked URL paths.
- CSS is injected before the page renders, so hidden parts never flash on screen.
- Navigation to blocked routes (`/reels/`, `/shorts/`, `/explore/`) is redirected to the home page.
- Filters are switched off on login and verification pages.

Nothing leaves the device: there is no backend, no account and no analytics.

## Filters

| Platform | Switches |
|---|---|
| Instagram | Feed: Following feed only, Reels in feed, Suggested posts, Ads, Stories, All posts. Navigation: Reels tab, Explore grid, Search tab, Messages tab, Notifications |
| YouTube (hidden) | Shorts tab, Shorts in feeds, Shorts player, Home feed, Comments |
| X | For You, Ads, Trending, Grok |

Each switch is defined in `src/platforms/`. Suggested posts and ads on Instagram are recognised by their English labels, so they need the site language set to English.

## Known limitations

- No push notifications; those only come from the native apps.
- Features missing from the mobile web versions stay missing (for example posting Stories or voice notes on Instagram).
- Filters depend on each site's page structure and break when the sites change it.
- The sites' terms of service do not welcome wrappers, and app stores sometimes reject them. A store release is planned (iOS first, then Android), so the app ships native features of its own on top of the filtering.

## Stack

Expo, TypeScript, Expo Router, `react-native-webview`, `react-native-reanimated` for animations, on-device storage for settings.

## Prior art

- [AlexMatter1512/justagram](https://github.com/AlexMatter1512/justagram): Capacitor wrapper for Instagram (no licence; reference only).
- [Ujwal223/FocusGram](https://github.com/Ujwal223/FocusGram): Android GeckoView wrapper for Instagram (AGPL-3.0; reference only).
- [duartebarbosadev/Scrolless](https://github.com/duartebarbosadev/Scrolless): Android accessibility-service blocker for native apps.
