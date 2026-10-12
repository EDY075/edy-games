const PINNED_GAME_BUILDS = new Set([
  'https://raw.githubusercontent.com/gn-math/html/a64911a67f5d995a6500c5d07795cd3e506739c3/203-fix2.html',
  'https://raw.githubusercontent.com/gn-math/html/48c0631289237dd2e9e202fde532edfae4ed2acf/741-fix3.html',
]);
const GAME_ASSET_ORIGINS = [
  'https://gn-math.dev', 'https://cdn.jsdelivr.net', 'https://unpkg.com',
  'https://cdnjs.cloudflare.com', 'https://raw.githubusercontent.com',
  'https://cdn.glitch.global', 'https://cdn.scummvm.org', 'https://code.jquery.com',
];

export function validGameBuild(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.port || url.username || url.password || url.search || url.hash) return false;
    return PINNED_GAME_BUILDS.has(url.href) || (url.hostname === 'gn-math.dev' && /^\/s\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.html(?:-[A-Za-z0-9_-]+)?$/.test(url.pathname));
  } catch { return false; }
}

export function directPlayURL(game, catalogURL) {
  if (!/^gn-\d+$/.test(game.id) || !validGameBuild(game.buildURL)) return game.url;
  const url = new URL(catalogURL);
  if (!['http:', 'https:', 'file:'].includes(url.protocol)) return game.url;
  url.search = '';
  url.hash = '';
  url.searchParams.set('play', game.id);
  return url.href;
}

export function createTransientStorage() {
  const entries = new Map();
  return {
    get length() { return entries.size; },
    key(index) { return [...entries.keys()][index] ?? null; },
    getItem(key) { return entries.get(String(key)) ?? null; },
    setItem(key, value) { entries.set(String(key), String(value)); },
    removeItem(key) { entries.delete(String(key)); },
    clear() { entries.clear(); },
  };
}

export function createTransientCaches(fetcher = fetch) {
  const stores = new Map();
  const keyOf = request => typeof request === 'string' ? request : request.url;
  async function open(name) {
    name = String(name);
    if (!stores.has(name)) {
      const responses = new Map();
      const cache = {
        async match(request) { return responses.get(keyOf(request))?.clone(); },
        async matchAll(request) { return [...responses.entries()].filter(([key]) => !request || key === keyOf(request)).map(([,response]) => response.clone()); },
        async put(request, response) { responses.set(keyOf(request), response.clone()); },
        async delete(request) { return responses.delete(keyOf(request)); },
        async keys() { return [...responses.keys()].map(key => new Request(new URL(key, typeof document === 'object' ? document.baseURI : 'https://gn-math.dev/'))); },
        async add(request) { const response = await fetcher(request); if (!response.ok) throw new Error('Asset unavailable'); await cache.put(request, response); },
        async addAll(requests) { await Promise.all(requests.map(request => cache.add(request))); },
      };
      stores.set(name, cache);
    }
    return stores.get(name);
  }
  return {
    open,
    async keys() { return [...stores.keys()]; },
    async has(name) { return stores.has(String(name)); },
    async delete(name) { return stores.delete(String(name)); },
    async match(request) { for (const cache of stores.values()) { const response = await cache.match(request); if (response) return response; } },
  };
}

export function installSandboxStorage(target = window) {
  for (const name of ['localStorage', 'sessionStorage']) {
    try { target[name].getItem('__edy_probe__'); }
    catch { Object.defineProperty(target, name, {value:createTransientStorage(), configurable:true}); }
  }
  try { if (!target.caches) throw new Error('Cache storage unavailable'); }
  catch { Object.defineProperty(target, 'caches', {value:createTransientCaches(), configurable:true}); }
}

// The pinned DOS loader misses its memory fallback when IndexedDB is unavailable.
export function installDoomTransientFS(target = window) {
  target.deltaFS = new target.BrowserFS.FileSystem.InMemory();
  target.BrowserFS.FileSystem.IndexedDB.isAvailable = () => false;
}

export function prepareGameDocument(html, buildURL) {
  if (!validGameBuild(buildURL)) throw new Error('Unsupported game source');
  if (typeof html !== 'string' || html.length > 25 * 1024 * 1024 || !/<(?:html|canvas|script|body|iframe)\b/i.test(html)) throw new Error('Invalid game document');
  const match = html.match(/<base\b[^>]*href\s*=\s*["']([^"']+)["']/i);
  const base = new URL(match ? match[1] : '.', buildURL);
  if (base.protocol !== 'https:' || !GAME_ASSET_ORIGINS.includes(base.origin) || base.username || base.password || base.port) throw new Error('Unsupported game base');
  const assets = GAME_ASSET_ORIGINS.join(' ');
  const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: " + assets + "; connect-src https: blob: data:; img-src https: data: blob:; style-src 'unsafe-inline' https:; font-src https: data:; media-src https: blob: data:; worker-src blob: https:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri " + assets;
  const escapeAttribute = value => value.replace(/[&"<>]/g, c => ({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));
  let content = html.replace(/<base\b[^>]*>/gi, '').replace(/<!doctype[^>]*>/gi, '');
  if (new URL(buildURL).href === [...PINNED_GAME_BUILDS][0]) {
    const browserFS = /<script\b[^>]*src=["']js\/browserfs\.min\.js["'][^>]*><\/script>/i;
    if (!browserFS.test(content)) throw new Error('Pinned DOS storage dependency missing');
    content = content.replace(browserFS, tag => tag + '<script>(' + installDoomTransientFS.toString() + ')();<\/script>');
  }
  const compatibility = '<script>' + createTransientStorage.toString() + '\n' + createTransientCaches.toString() + '\n(' + installSandboxStorage.toString() + ')();<\/script>';
  return '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + escapeAttribute(policy) + '"><base href="' + escapeAttribute(base.href) + '">' + compatibility + content;
}
