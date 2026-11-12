# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

NoTrashSocialMedia is a React Native (Expo) app that loads Instagram, YouTube and X in in-app WebViews and hides doomscrolling surfaces (Reels, Shorts, Stories, Explore, For You) through injected CSS/JS. Overview in `README.md`, phased roadmap in `PLAN.md`.

**Current state:** Instagram and X are offered in the app, with filters verified against signed-in pages in the iOS simulator. YouTube's manifest exists but is `hidden: true` until sign-in is sorted out. The app has a hello animation on launch, a home screen with platform cards, a browser screen and a grouped filters screen.

## Commands

```bash
npx expo start              # dev server; the app runs in Expo Go (react-native-webview is bundled there)
npm run typecheck           # tsc --noEmit
npx expo-doctor             # dependency and config check
npx expo install <package>  # always use this instead of npm install, so versions match the SDK
```

Run the typecheck before calling a task done. There are no tests or lint config yet.

## Expo notes

- Expo SDK 58, React Native 0.88. Expo APIs change between SDKs: check `https://docs.expo.dev/versions/v58.0.0/` rather than relying on memory.
- Routes live in `src/app/` (Expo Router). Keep non-route code outside it. `@/` maps to `src/`.
- There are no `ios/` or `android/` folders; native config goes in `app.json` and config plugins.
- Type the WebView ref as `useRef<WebView<{}>>`; the default type parameter makes every prop `never`.

## Decisions

- iOS first, then Android.
- Filtering is controlled only by a list of switches per platform. No tap-to-hide element picker.
- A store release is planned: keep branding neutral (no Instagram, YouTube or X logos or names in the app icon or name) and collect no user data.

## Architecture

- `src/platforms/<site>.ts`: one manifest per site. A toggle can use `css` selectors (hidden with `display: none`), `blockRoutes` (paths redirected to the site's home), `hideByText` (containers identified by an English UI label such as "Suggested for you"), `redirects` (an exact path sent to a preferred variant) and `autoClick` (leave a view the switch removes). Adding or fixing a filter means editing a manifest, not the engine.
- `src/engine/runtime.ts`: ES5 script, kept as a string, that runs inside the site before its own scripts. It keeps a `<style>` element in sync, runs the text and click rules from a debounced `MutationObserver`, sets `html[data-nt-path]` so selectors can be scoped to one page, patches `history.pushState`/`replaceState` to catch in-page navigation, and skips everything on `authPaths`.
- `src/engine/buildInjection.ts`: turns a manifest plus the enabled switches into the config the runtime applies, on page load and again live when a switch changes.
- `src/components/`: `WelcomeOverlay` (hello animation, once per launch; the home screen mounts its content when `src/store/welcome.ts` reports it finished), `PressableScale` (press feedback), `PlatformCard`.
- `src/theme.ts`: colours, radii and spacing. The accent is lime `#C6F45D`; platforms are shown as monogram tiles, never logos.
- `src/store/toggles.ts`: switches saved in AsyncStorage. Only changed switches are stored; the rest follow `defaultOn`.
- `src/app/browser/[platform].tsx`: the WebView. Accepts an optional `url` param for a start page on the same site.
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

## Skills

`vercel-react-native-skills` is installed in `.claude/skills/`. Use it when writing React Native or Expo code (lists, animations, navigation, native modules).
