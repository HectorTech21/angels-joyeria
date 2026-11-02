// Browser-native hash navigation: direct links and reloads need no server rewrites.
// A document anchor must never prevent the first page from mounting.
export function readRoute(hash = '') {
  const fragment = hash.replace(/^#/, '');
  if (!fragment.startsWith('/')) {
    let anchor;
    try { anchor = decodeURIComponent(fragment); } catch { anchor = fragment; }
    return { path: '/', params: new URLSearchParams(), anchor };
  }
  const queryStart = fragment.indexOf('?');
  return {
    path: queryStart < 0 ? fragment : fragment.slice(0, queryStart),
    params: new URLSearchParams(queryStart < 0 ? '' : fragment.slice(queryStart + 1)),
    anchor: '',
  };
}
