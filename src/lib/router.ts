const entities = ['customers', 'contacts', 'leads', 'opportunities', 'orders', 'products', 'quotes'];
const pages = ['login', 'forgot-password', 'reset-password', 'users', 'roles', 'dashboard', ...entities];

export function resolveRoute(pathname: string) {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  const [entity, id, action, ...rest] = path.split('/');
  if (pages.includes(path)) return path;
  if (entities.includes(entity) && id && rest.length === 0 && ((id === 'new' && !action) || action === 'edit'))
    return path;
  return 'login';
}

export function getLocation() {
  return window.location.pathname + window.location.search;
}

export function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href);
    return;
  }
  const path = url.pathname + url.search + url.hash;
  if (path === window.location.pathname + window.location.search + window.location.hash && !replace) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
