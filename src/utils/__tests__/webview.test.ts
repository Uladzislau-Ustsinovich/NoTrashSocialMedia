import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import { navigateScript, resolveStartUrl, shouldStartLoad } from '@/utils/webview';

const request = (url: string, isTopFrame = true) => ({ url, isTopFrame }) as ShouldStartLoadRequest;

describe('shouldStartLoad', () => {
  it.each(['https://x.com/home', 'http://example.com', 'about:blank'])('allows %s', (url) => {
    expect(shouldStartLoad(request(url))).toBe(true);
  });

  it.each([
    'x-safari-https://redirect.x.com/',
    'instagram://user',
    'intent://foo',
    'javascript:alert(1)',
  ])('blocks %s', (url) => {
    expect(shouldStartLoad(request(url))).toBe(false);
  });
});

describe('shouldStartLoad in sub-frames', () => {
  it('does not veto frame content', () => {
    expect(shouldStartLoad(request('blob:https://x.com/abc', false))).toBe(true);
    expect(shouldStartLoad(request('data:text/html,hi', false))).toBe(true);
  });
});

describe('resolveStartUrl', () => {
  const home = 'https://www.instagram.com/';

  it('uses the requested page on the same site', () => {
    expect(resolveStartUrl('https://www.instagram.com/explore/', home)).toBe(
      'https://www.instagram.com/explore/',
    );
    expect(resolveStartUrl('https://www.instagram.com/?next=http://a:80/', home)).toBe(
      'https://www.instagram.com/?next=http://a:80/',
    );
  });

  it('falls back to home for a missing or malformed value', () => {
    expect(resolveStartUrl(undefined, home)).toBe(home);
    expect(resolveStartUrl('not a url', home)).toBe(home);
  });

  it.each([
    'https://evil.example/',
    'https://evil.example/@www.instagram.com',
    'https://www.instagram.com@evil.example/',
    'https://www.instagram.com.evil.example/',
    'https://www.instagram.com:8443/',
    'http://www.instagram.com/',
    'javascript:alert(1)',
    ' https://www.instagram.com/',
  ])('rejects %s', (url) => {
    expect(resolveStartUrl(url, home)).toBe(home);
  });
});

describe('navigateScript', () => {
  it('escapes the URL so it cannot break out of the string', () => {
    const script = navigateScript('https://a.test/"; alert(1); "');
    expect(script).toContain(JSON.stringify('https://a.test/"; alert(1); "'));
  });
});
