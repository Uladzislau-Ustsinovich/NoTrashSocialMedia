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

/** Only web pages load; app deep links (instagram://, intent://) would leave the app. */
export function shouldStartLoad(request: ShouldStartLoadRequest): boolean {
  return isWebUrl(request.url) || /^about:/i.test(request.url);
}

/** Script for `injectJavaScript` that sends the open page to `url`. */
export function navigateScript(url: string): string {
  return `window.location.href = ${JSON.stringify(url)}; true;`;
}

/** The page to open first: `requested` if it is on the same site as `homeUrl`, otherwise `homeUrl`. */
export function resolveStartUrl(requested: string | undefined, homeUrl: string): string {
  if (!requested) return homeUrl;
  try {
    return new URL(requested).host === new URL(homeUrl).host ? requested : homeUrl;
  } catch {
    return homeUrl;
  }
}
