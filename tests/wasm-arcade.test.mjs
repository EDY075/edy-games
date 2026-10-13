import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { parseLiteral, matchCompatibleGame } from '../scripts/import-wasm-arcade.mjs';
import { directPlayURL } from '../src/player/core.mjs';

assert.deepEqual(parseLiteral('[{id:`game`,year:2e3,cats:[`action`]}]').value, [{ id: 'game', year: 2000, cats: ['action'] }]);
for (const input of ['[{id:process.exit()}]', '[`${danger()}`]', '[...other]', '[{__proto__:{}}]']) assert.throws(() => parseLiteral(input));
const buildURL = 'https://gn-math.dev/s/token/719.html';
const original = { id: 'gn-719', name: 'Canabalt', platform: 'Web', buildURL };
assert.equal(matchCompatibleGame({ name: 'Canabalt', system: 'flash' }, [original]), original);
assert.equal(matchCompatibleGame({ name: 'Canabalt 2', system: 'flash' }, [original]), undefined);
assert.equal(matchCompatibleGame({ name: 'Canabalt', system: 'neogeo' }, [original]), undefined);
assert.equal(matchCompatibleGame({ name: 'Canabalt', system: 'flash' }, [{ ...original, buildURL: 'https://evil.test/game.html' }]), undefined);
const gta3 = { id: 'gn-851', name: 'Grand Theft Auto 3', platform: 'PC', buildURL };
assert.equal(matchCompatibleGame({ upstreamId: 'gta3', system: 'pc' }, [gta3]), gta3);
assert.equal(directPlayURL({ id: 'wasm-flash-canabalt', buildURL, url: 'https://wasmarcade.com/flash-games/canabalt' }, 'http://localhost/#catalogo'), 'http://localhost/?play=wasm-flash-canabalt');
assert.equal(directPlayURL({ id: 'wasm-emu-mslug', availability: 'blocked', url: 'https://wasmarcade.com/retro-games/metal-slug' }, 'file:///D:/catalog.html'), 'file:///D:/catalog.html?play=wasm-emu-mslug');
const catalog = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('data/wasm-arcade.json', 'utf8'));
const imported = catalog.games.filter(game => game.collection === 'WASM Arcade');
assert.equal(imported.length, 1082);
assert.equal(new Set(catalog.games.map(game => game.id)).size, catalog.games.length);
assert.deepEqual(imported.map(game => game.id).sort(), manifest.games.map(game => game.id).sort());
assert.equal(imported.filter(game => game.availability === 'blocked').length, manifest.blocked);
for (const game of imported) {
  const destination = new URL(directPlayURL(game, 'https://edy.example/catalog.html'));
  assert.notEqual(destination.hostname, 'wasmarcade.com', game.id + ' must never launch the upstream catalog');
  assert.equal(game.verified, false);
  if (game.compatibleGameID) assert.equal(game.buildURL, catalog.games.find(item => item.id === game.compatibleGameID).buildURL);
}
assert.equal(imported.find(game => game.id === 'wasm-pc-gta5').url, 'https://gta.deloskiyt.pl/');
const built = await fs.readFile('publish/index.html', 'utf8');
for (const script of built.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  if (!script[0].startsWith('<script id="catalog-data"')) new vm.Script(script[1]);
}
console.log('WASM metadata parsing, conservative matching and local availability routes: passed');
