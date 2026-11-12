/**
 * Script that runs inside the third-party page, before its own scripts. It is plain ES5 in a
 * string because it executes in the site's context, not in the app bundle.
 *
 * It exposes `window.__NT.apply(config)`, which the app calls on every page load and again
 * whenever a switch changes.
 */
export const RUNTIME = `(function () {
  if (window.__NT) return;

  var STYLE_ID = 'nt-style';
  var cfg = { css: '', blockRoutes: [], authPaths: [], home: '/', selectors: {}, textRules: [], clickRules: [], redirects: [], debug: false };
  var rulesTimer = null;
  var lastClick = 0;
  var reportTimer = null;

  function under(routes, path) {
    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      var prefix = route.charAt(route.length - 1) === '/' ? route : route + '/';
      if (path === route || path + '/' === prefix || path.indexOf(prefix) === 0) return true;
    }
    return false;
  }

  function isAuthPage() {
    return under(cfg.authPaths, location.pathname);
  }

  function syncStyle() {
    var css = isAuthPage() ? '' : cfg.css;
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }

  // Marks containers whose label text identifies them (for example "Suggested for you"), since
  // CSS cannot match on text. The stylesheet hides anything carrying the mark.
  function applyTextRules() {
    var marks = [];
    var nodes = [];
    for (var r = 0; r < cfg.textRules.length; r++) {
      var rule = cfg.textRules[r];
      var containers = document.querySelectorAll(rule.within);
      for (var c = 0; c < containers.length; c++) {
        var labels = containers[c].querySelectorAll('span');
        for (var l = 0; l < labels.length; l++) {
          if (labels[l].children.length === 0 && rule.text.indexOf((labels[l].textContent || '').trim()) !== -1) {
            var at = nodes.indexOf(containers[c]);
            if (at === -1) { nodes.push(containers[c]); marks.push(rule.id); }
            else if ((' ' + marks[at] + ' ').indexOf(' ' + rule.id + ' ') === -1) marks[at] += ' ' + rule.id;
            break;
          }
        }
      }
    }
    var stale = document.querySelectorAll('[data-nt-hide]');
    for (var s = 0; s < stale.length; s++) {
      if (nodes.indexOf(stale[s]) === -1) stale[s].removeAttribute('data-nt-hide');
    }
    for (var n = 0; n < nodes.length; n++) {
      if (nodes[n].getAttribute('data-nt-hide') !== marks[n]) nodes[n].setAttribute('data-nt-hide', marks[n]);
    }
  }

  // Moves the user off a view that a switch removes (for example X's "For you" tab).
  function applyClickRules() {
    if (Date.now() - lastClick < 1500) return;
    for (var r = 0; r < cfg.clickRules.length; r++) {
      var rule = cfg.clickRules[r];
      if (!under(rule.paths, location.pathname) || !document.querySelector(rule.when)) continue;
      var target = document.querySelector(rule.click);
      if (target) { lastClick = Date.now(); target.click(); return; }
    }
  }

  function runRules() {
    if (isAuthPage()) return;
    try { applyTextRules(); applyClickRules(); } catch (e) {}
  }

  function scheduleRules() {
    if (!cfg.textRules.length && !cfg.clickRules.length) return;
    clearTimeout(rulesTimer);
    rulesTimer = setTimeout(runRules, 200);
  }

  // Sends an exact path to a preferred variant of the same page (for example Instagram's
  // Following feed). The timestamp stops a loop if the site drops the query string.
  function redirect() {
    for (var r = 0; r < cfg.redirects.length; r++) {
      var rule = cfg.redirects[r];
      if (location.pathname !== rule.path || location.search.indexOf(rule.unlessSearch) !== -1) continue;
      var last = 0;
      try { last = Number(sessionStorage.getItem('nt-redirect')) || 0; } catch (e) {}
      if (Date.now() - last < 5000) return false;
      try { sessionStorage.setItem('nt-redirect', String(Date.now())); } catch (e) {}
      location.replace(rule.to);
      return true;
    }
    return false;
  }

  function report() {
    if (!cfg.debug || !window.ReactNativeWebView) return;
    var counts = {};
    for (var id in cfg.selectors) {
      var total = 0;
      var list = cfg.selectors[id];
      for (var i = 0; i < list.length; i++) {
        try { total += document.querySelectorAll(list[i]).length; } catch (e) { total = -1; break; }
      }
      counts[id] = total;
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'nt-report', path: location.pathname, auth: isAuthPage(), counts: counts })
    );
  }

  function scheduleReport() {
    if (!cfg.debug) return;
    clearTimeout(reportTimer);
    reportTimer = setTimeout(report, 4000);
  }

  function check() {
    if (!isAuthPage() && under(cfg.blockRoutes, location.pathname)) {
      location.replace(cfg.home);
      return;
    }
    if (!isAuthPage() && redirect()) return;
    // Lets a manifest scope a selector to one page: html[data-nt-path="/home"] …
    document.documentElement.setAttribute('data-nt-path', location.pathname);
    syncStyle();
    runRules();
    scheduleReport();
  }

  // Single-page navigation never reaches the native side, so watch the history API.
  ['pushState', 'replaceState'].forEach(function (name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      setTimeout(check, 0);
      return result;
    };
  });
  window.addEventListener('popstate', function () { setTimeout(check, 0); });
  document.addEventListener('DOMContentLoaded', check);
  // Feeds load more items as you scroll; child-list changes do not include our own attribute marks.
  new MutationObserver(scheduleRules).observe(document.documentElement, { childList: true, subtree: true });

  window.__NT = {
    apply: function (next) { cfg = next; check(); },
    report: report
  };
})();`;
