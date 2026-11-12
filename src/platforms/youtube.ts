import type { Platform } from './types';

export const youtube: Platform = {
  id: 'youtube',
  name: 'YouTube',
  tagline: 'Subscriptions, search and videos',
  monogram: 'Yt',
  tint: '#FF5A4F',
  // Hidden until sign-in is sorted out.
  hidden: true,
  homeUrl: 'https://m.youtube.com/',
  authPaths: ['/signin', '/ServiceLogin'],
  toggles: [
    {
      id: 'yt.shortsTab',
      label: 'Shorts tab',
      description: 'Removes the Shorts button from the bottom bar.',
      group: 'Feed',
      defaultOn: true,
      css: ['ytm-pivot-bar-item-renderer:has(.pivot-shorts)'],
    },
    {
      id: 'yt.shortsShelves',
      label: 'Shorts in feeds',
      description: 'Removes Shorts rows from home, search and channel pages.',
      group: 'Feed',
      defaultOn: true,
      css: [
        'ytm-reel-shelf-renderer',
        'ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model)',
        'grid-shelf-view-model:has(ytm-shorts-lockup-view-model)',
        'ytm-shorts-lockup-view-model',
        'ytm-video-with-context-renderer:has(a[href^="/shorts/"])',
      ],
    },
    {
      id: 'yt.shortsPlayer',
      label: 'Shorts player',
      description: 'Opening any Shorts link sends you back to the home page.',
      group: 'Feed',
      defaultOn: true,
      blockRoutes: ['/shorts'],
    },
    {
      id: 'yt.homeFeed',
      label: 'Home feed',
      description: 'Empties the recommended videos on the home page.',
      group: 'Feed',
      defaultOn: false,
      css: ['ytm-browse[page-subtype="home"] ytm-rich-grid-renderer'],
    },
    {
      id: 'yt.comments',
      label: 'Comments',
      description: 'Removes the comments section under videos.',
      group: 'Feed',
      defaultOn: false,
      css: [
        'ytm-item-section-renderer:has(comments-entry-point-teaser-view-model)',
        'comments-entry-point-teaser-view-model',
        'ytm-comments-entry-point-header-renderer',
        'ytm-comment-section-renderer',
      ],
    },
  ],
};
