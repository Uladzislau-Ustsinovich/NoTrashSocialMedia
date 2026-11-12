import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import { navigateScript, resolveStartUrl, shouldStartLoad } from '../webview';

const request = (url: string) => ({ url }) as ShouldStartLoadRequest;

describe('shouldStartLoad', () => {
  it.each(['https://x.com/home', 'http://example.com', 'about:blank'])('allows %s', (url) => {
    expect(shouldStartLoad(request(url))).toBe(true);
  });

  it.each(['x-safari-https://redirect.x.com/', 'instagram://user', 'intent://foo', 'javascript:alert(1)'])(
    'blocks %s',
    (url) => {
      expect(shouldStartLoad(request(url))).toBe(false);
    },
  );
});

describe('resolveStartUrl', () => {
  const home = 'https://www.instagram.com/';

  it('uses the requested page on the same site', () => {
    expect(resolveStartUrl('https://www.instagram.com/explore/', home)).toBe('https://www.instagram.com/explore/');
  });

  it('falls back to home for another site, a missing value or a malformed one', () => {
    expect(resolveStartUrl('https://evil.example/', home)).toBe(home);
    expect(resolveStartUrl(undefined, home)).toBe(home);
    expect(resolveStartUrl('not a url', home)).toBe(home);
  });
});

describe('navigateScript', () => {
  it('escapes the URL so it cannot break out of the string', () => {
    const script = navigateScript('https://a.test/"; alert(1); "');
    expect(script).toContain(JSON.stringify('https://a.test/"; alert(1); "'));
  });
});
