import type { Platform } from './types';

export const x: Platform = {
  id: 'x',
  name: 'X',
  tagline: 'Your Following timeline, without the noise',
  monogram: 'X',
  tint: '#E7E9EA',
  homeUrl: 'https://x.com/home',
  authPaths: ['/i/flow', '/i/jf', '/login', '/account'],
  toggles: [
    {
      id: 'x.forYou',
      label: 'For You',
      description: 'Removes the For You tab and keeps the home timeline on Following.',
      group: 'Feed',
      defaultOn: true,
      // Scoped to the home timeline; Explore has a tab bar with the same structure.
      css: [
        'html[data-nt-path="/home"] nav[role="navigation"] [role="tablist"] > [role="presentation"]:first-child:has(+ [role="presentation"])',
      ],
      autoClick: [
        {
          paths: ['/home'],
          when: 'nav[role="navigation"] [role="tablist"] > [role="presentation"]:first-child [role="tab"][aria-selected="true"]',
          click: 'nav[role="navigation"] [role="tablist"] > [role="presentation"]:nth-child(2) [role="tab"]',
        },
      ],
    },
    {
      id: 'x.ads',
      label: 'Ads',
      description: 'Removes promoted posts from timelines.',
      group: 'Feed',
      defaultOn: true,
      // Promoted posts carry impression pixels. `placementTracking` alone also wraps ordinary videos.
      css: ['[data-testid="cellInnerDiv"]:has([data-testid$="-impression-pixel"])'],
    },
    {
      // Not yet checked against the signed-in Explore page.
      id: 'x.trending',
      label: 'Trending',
      description: 'Removes trending topics from search and timelines.',
      group: 'Navigation',
      defaultOn: true,
      css: ['[data-testid="cellInnerDiv"]:has([data-testid="trend"])'],
    },
    {
      id: 'x.grok',
      label: 'Grok',
      description: 'Removes Grok buttons and blocks the Grok page.',
      group: 'Navigation',
      defaultOn: true,
      css: ['a[href="/i/grok"]', '[data-testid="GrokDrawer"]', 'button[aria-label="Grok actions"]'],
      blockRoutes: ['/i/grok'],
    },
  ],
};
