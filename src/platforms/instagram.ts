import type { Platform } from './types';

/**
 * A bottom-bar link plus the item that wraps it, so the bar re-spaces instead of leaving a gap.
 * The wrapper sits at a different depth per link; a selector that reaches too far up hides the whole bar.
 */
const barItem = (link: string, wrapper: string) => [link, `div:has(${wrapper} ${link})`];
const SHALLOW = '> span > div >';
const DEEP = '> div > div > span > div >';

export const instagram: Platform = {
  id: 'instagram',
  name: 'Instagram',
  tagline: 'Posts and messages from people you follow',
  monogram: 'Ig',
  tint: '#FF5C93',
  homeUrl: 'https://www.instagram.com/',
  authPaths: ['/accounts', '/challenge', '/two_factor'],
  toggles: [
    {
      id: 'ig.following',
      label: 'Following feed only',
      description: 'Opens home on Following (people you follow, newest first) instead of For you.',
      group: 'Feed',
      defaultOn: true,
      redirects: [{ path: '/', unlessSearch: 'variant=following', to: '/?variant=following' }],
    },
    {
      id: 'ig.feedReels',
      label: 'Reels in feed',
      description: 'Removes Reels that appear between posts.',
      group: 'Feed',
      defaultOn: true,
      // Reel links look like /<user>/reel/<id>/.
      css: ['article:has(a[href*="/reel/"])'],
    },
    {
      id: 'ig.suggested',
      label: 'Suggested posts',
      description: 'Removes "Suggested for you" posts from accounts you do not follow.',
      group: 'Feed',
      defaultOn: true,
      hideByText: [{ within: 'article', text: ['Suggested for you'] }],
    },
    {
      id: 'ig.ads',
      label: 'Ads',
      description: 'Removes sponsored posts.',
      group: 'Feed',
      defaultOn: true,
      hideByText: [{ within: 'article', text: ['Ad', 'Sponsored'] }],
    },
    {
      id: 'ig.stories',
      label: 'Stories',
      description: 'Removes the Stories row at the top of home.',
      group: 'Feed',
      defaultOn: false,
      css: ['div[data-pagelet="story_tray"]'],
    },
    {
      id: 'ig.posts',
      label: 'All posts',
      description: 'Empties the home feed completely, for a messages-only Instagram.',
      group: 'Feed',
      defaultOn: false,
      css: ['html[data-nt-path="/"] article'],
    },
    {
      id: 'ig.reels',
      label: 'Reels tab',
      description:
        'Removes the Reels button and blocks the Reels feed. Reels sent in messages still open.',
      group: 'Navigation',
      defaultOn: true,
      css: barItem('a[href="/reels/"]', SHALLOW),
      blockRoutes: ['/reels'],
    },
    {
      id: 'ig.exploreGrid',
      label: 'Explore grid',
      description: 'Removes the recommended posts on the search page. Search keeps working.',
      group: 'Navigation',
      defaultOn: true,
      // The page is a search bar (nav) followed by the grid.
      css: ['html[data-nt-path="/explore/"] main[role="main"] > div'],
    },
    {
      id: 'ig.explore',
      label: 'Search tab',
      description: 'Removes the search button and blocks the search page.',
      group: 'Navigation',
      defaultOn: false,
      css: barItem('a[href="/explore/"]', SHALLOW),
      blockRoutes: ['/explore'],
    },
    {
      id: 'ig.messages',
      label: 'Messages tab',
      description: 'Removes the messages button from the bottom bar.',
      group: 'Navigation',
      defaultOn: false,
      css: barItem('a[href^="/direct/"]', DEEP),
    },
    {
      id: 'ig.notifications',
      label: 'Notifications',
      description: 'Removes the heart button at the top of home.',
      group: 'Navigation',
      defaultOn: false,
      css: ['a[href="/notifications/"]'],
    },
  ],
};
