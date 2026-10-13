import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { preparePortableCatalogData } from '../src/catalog-export.mjs';

const webp = Buffer.from('RIFFtestWEBPVP8 test-image');
const data = { games: [{ id: 'wasm-emu-mslug', cover: 'covers/wasm-emu-mslug.webp' }, { id: 'gn-1', cover: 'data:image/webp;base64,existing' }] };
const portable = await preparePortableCatalogData(data, 'https://edy.example/', async url => {
  assert.equal(url.href, 'https://edy.example/covers/wasm-emu-mslug.webp');
  return new Response(webp, { headers: { 'Content-Type': 'image/webp' } });
});
assert.equal(portable.games[0].cover, 'data:image/webp;base64,' + webp.toString('base64'));
assert.equal(portable.games[1].cover, data.games[1].cover);
assert.equal(data.games[0].cover, 'covers/wasm-emu-mslug.webp');
await assert.rejects(() => preparePortableCatalogData({ games: [{ cover: 'https://evil.test/image.webp' }] }, 'https://edy.example/'));
await assert.rejects(() => preparePortableCatalogData(data, 'https://edy.example/', async () => new Response('not an image', { status: 404 })));

const catalog = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
assert.equal(catalog.games.filter(game => game.coverKind === 'title-card').length, 0);
for (const game of catalog.games.filter(game => game.collection === 'WASM Arcade')) assert.match(game.cover, /^data:image\/(?:webp|png|jpeg);base64,/);
const published = await fs.readFile('publish/index.html', 'utf8');
assert.ok(Buffer.byteLength(published) <= 25 * 1024 * 1024, 'Published HTML must fit the host file limit');
assert.match(published, /aria-label="Jogar GTA V diretamente no navegador"/);
const built = JSON.parse(published.match(/<script id="catalog-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
for (const game of built.games.filter(game => game.cover.startsWith('covers/'))) {
  const image = await fs.readFile('publish/' + game.cover);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF', game.id);
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', game.id);
}
console.log('Real covers, portable export, hero and published assets: passed');
