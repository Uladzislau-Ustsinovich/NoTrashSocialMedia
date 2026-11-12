import { Platform } from 'react-native';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

/**
 * Sites treat embedded browsers differently from real ones (Google refuses sign-in
 * when the user agent carries the Android "wv" marker), so present as the stock
 * mobile browser of each OS.
 */
export const USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
});

/**
 * Send every URL to `shouldStartLoad`. With the default whitelist, react-native-webview hands
 * non-http URLs straight to the OS, and X uses that to escape embedded browsers by redirecting
 * to `x-safari-https://…`, which launches Safari.
 */
export const ORIGIN_WHITELIST = ['*'];

const WEB_URL = /^https?:/i;

export function isWebUrl(url: string): boolean {
  return WEB_URL.test(url);
}

/**
 * Only web pages load in the main frame; app deep links (instagram://, intent://,
 * x-safari-https://) would leave the app. Sub-frames are left alone: sites use blob: and data:
 * frames for media and checks.
 */
export function shouldStartLoad(request: ShouldStartLoadRequest): boolean {
  if (request.isTopFrame === false) return true;
  return isWebUrl(request.url) || /^about:/i.test(request.url);
}

/** Script for `injectJavaScript` that sends the open page to `url`. */
export function navigateScript(url: string): string {
  return `window.location.href = ${JSON.stringify(url)}; true;`;
}

/** `https://host` of one of our own URLs. Not for untrusted input. */
export function originOf(url: string): string {
  return /^https:\/\/[^/?#]+/.exec(url)?.[0] ?? '';
}

/**
 * The page to open first: `requested` if it is an https page on the same site as `homeUrl`,
 * otherwise `homeUrl`.
 *
 * The check is a literal prefix match on purpose. `requested` can come from a deep link sent by
 * another app, and React Native's `URL` parses hosts loosely enough to be fooled
 * (`https://evil.example/@www.instagram.com` reports the host as www.instagram.com).
 */
export function resolveStartUrl(requested: string | undefined, homeUrl: string): string {
  const origin = originOf(homeUrl);
  if (!requested || !origin) return homeUrl;
  return requested === origin || requested.startsWith(`${origin}/`) ? requested : homeUrl;
}
