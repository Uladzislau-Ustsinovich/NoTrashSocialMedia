type PlatformId = 'instagram' | 'youtube' | 'x';

/** Section a switch is listed under on the filters screen. */
export type ToggleGroup = 'Feed' | 'Navigation';

/** One switch in the settings list. When on, the listed parts of the site are removed. */
export type Toggle = {
  id: string;
  label: string;
  /** One line under the label explaining what disappears. */
  description?: string;
  group: ToggleGroup;
  defaultOn: boolean;
  /**
   * Selectors hidden with `display: none`. Each becomes its own rule, so one bad selector cannot break the rest.
   * Prefix with `html[data-nt-path="/some/path"]` to limit a selector to one page.
   */
  css?: string[];
  /** Paths (and everything under them) that are redirected to the platform home. */
  blockRoutes?: string[];
  /**
   * Hides each `within` element that contains a label whose text is exactly one of `text`.
   * For items CSS cannot identify. The strings are the site's English UI labels.
   */
  hideByText?: { within: string; text: string[] }[];
  /** Sends the exact `path` to `to`, unless the URL's query already contains `unlessSearch`. */
  redirects?: { path: string; unlessSearch: string; to: string }[];
  /** On `paths`, when `when` matches, clicks `click`. Used to leave a view the switch removes. */
  autoClick?: { paths: string[]; when: string; click: string }[];
};

export type Platform = {
  id: PlatformId;
  name: string;
  /** Short line shown under the name on the picker. */
  tagline: string;
  /** One or two letters shown on the platform's tile. The app uses no third-party logos. */
  monogram: string;
  /** Tile colour for this platform. */
  tint: string;
  /** Not offered in the app yet. The manifest stays so the work is not lost. */
  hidden?: boolean;
  homeUrl: string;
  /** Other hostnames of the same site where filters should also run. The home host is always included. */
  extraHosts?: string[];
  /** Paths (and everything under them) where filters must never run: login, 2FA, challenges. */
  authPaths: string[];
  toggles: Toggle[];
};
