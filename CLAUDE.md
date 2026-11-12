# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

NoTrashSocialMedia is a React Native (Expo) app that loads Instagram, YouTube and X in in-app WebViews and hides doomscrolling surfaces (Reels, Shorts, Stories, Explore, For You) through injected CSS/JS. Overview and open items in `README.md`.

## Commands

- Install packages with `npx expo install <package>`, never `npm install`, so versions match the SDK.
- Run `npm run typecheck` before calling a task done. There are no tests or lint config yet.

## Expo notes

- Expo APIs change between SDKs: check `https://docs.expo.dev/versions/v58.0.0/` rather than relying on memory.
- Type the WebView ref as `useRef<WebView<{}>>`; the default type parameter makes every prop `never`.

## Decisions

- iOS first, then Android.
- Filtering is controlled only by a list of switches per platform. No tap-to-hide element picker.
- A store release is planned: keep branding neutral (no Instagram, YouTube or X logos or names in the app icon or name) and collect no user data.

## Architecture

- Adding or fixing a filter means editing a manifest in `src/platforms/`, not the engine.
- Route files in `src/app/` only re-export a screen from `src/screens/`; anything else placed in `src/app/` becomes a route.
- Styles live next to their component or screen in `<Name>.styles.ts`, never inline in the `.tsx`.
- Stateful logic goes in `src/hooks/`, pure helpers in `src/utils/`; screens compose them.
- Platforms are shown as monogram tiles, never logos.
- No backend, no analytics.

## Verifying filters

In development the page posts a report 4 seconds after each navigation, logged by Metro as `[filters] {"counts": {...}}`: how many elements each enabled toggle matched. A count of 0 on a page where the element should exist means the selector is stale.

To drive the simulator without tapping (Xcode is at `/Applications/Xcode.app`, but `xcode-select` points at the command line tools, so set `DEVELOPER_DIR`):

```bash
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
npx expo start --ios
xcrun simctl openurl booted "exp://<host>:8081/--/browser/youtube?url=<encoded url>"
xcrun simctl io booted screenshot out.png
```

## Rules

- Never apply filters on login, signup, two-factor or challenge pages; doing so causes login loops. List those paths in the manifest's `authPaths`.
- Keep `originWhitelist={['*']}` on the WebView. Without it, X's `x-safari-https://` redirect opens Safari.
- Injected code runs inside the third-party page. Keep it self-contained (no imports at runtime), wrap it in an IIFE, and make it safe to run more than once.
- Prefer stable selectors (`href`, `aria-label`, `role`, `data-*`) over generated class names.
- Do not copy code from the reference repos: `AlexMatter1512/justagram` has no licence and `Ujwal223/FocusGram` is AGPL-3.0. Reading them for technique is fine.
- Do not add network calls that send user data anywhere.
- Animate only `transform` and `opacity`, with Reanimated. Entrance animations use `FadeInDown`; reduced-motion users get a shortened hello screen.
- Instagram bottom-bar wrappers sit at different depths per link (see `barItem` in `instagram.ts`). A `:has()` selector that reaches one level too far hides the whole bar; check the bar is still there after any change.
- When probing a signed-in page, log structure only (tags, roles, `data-testid`, UI labels). Never log post text, usernames or message content.
- On X, `data-testid="placementTracking"` also wraps ordinary videos; ads are identified by `*-impression-pixel`.
- Hiding most of Instagram's "For you" feed leaves it stuck on a spinner, which is why "Following feed only" is on by default.
