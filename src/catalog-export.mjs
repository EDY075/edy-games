export async function preparePortableCatalogData(data, baseURL, fetcher = fetch) {
  const copy = structuredClone(data);
  const base = new URL(baseURL);
  const pending = copy.games.filter(game => !game.cover.startsWith('data:'));
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < pending.length) {
      const game = pending[cursor++];
      const url = new URL(game.cover, base);
      if (!/^https?:$/.test(url.protocol) || url.origin !== base.origin || !/\/covers\/wasm-(?:pc|emu|flash)-[a-z0-9-]+\.webp$/.test(url.pathname)) throw Error('Unsupported cover source');
      const response = await fetcher(url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/webp')) throw Error('Cover unavailable');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 2 * 1024 * 1024) throw Error('Invalid cover size');
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
      game.cover = 'data:image/webp;base64,' + btoa(binary);
    }
  }));
  return copy;
}
