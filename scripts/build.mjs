import fs from 'node:fs/promises';
const [template, fonts, core, playerUI] = await Promise.all([
  fs.readFile('src/catalog.html', 'utf8'),
  fs.readFile('assets/fonts/embedded.css', 'utf8'),
  fs.readFile('src/player/core.mjs', 'utf8'),
  fs.readFile('src/player/ui.js', 'utf8'),
]);
const data = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
if (data.games.some(g => g.id.startsWith('gn-') && g.url !== 'https://gn-math.dev/?id=' + g.id.slice(3))) throw Error('GN source links must point to the launcher, never a raw build');
if (data.games.some(g => !g.cover)) throw Error('Missing covers');
const html = template.replace('__FONTS__', fonts)
  .replace('__GAME_COUNT__', String(data.games.length))
  .replace('__PLAYER_CORE__', core.replace(/^export /gm, ''))
  .replace('__PLAYER_UI__', playerUI)
  .replace('__DATA__', JSON.stringify(data).replace(/</g, '\\u003c'));
if (/__(?:FONTS|GAME_COUNT|PLAYER_CORE|PLAYER_UI|DATA)__/.test(html)) throw Error('Unresolved template placeholder');
await Promise.all(['outputs', 'publish'].map(dir => fs.mkdir(dir, { recursive: true })));
await Promise.all([fs.writeFile('outputs/edy-games-catalogo.html', html), fs.writeFile('publish/index.html', html)]);
console.log(JSON.stringify({ games: data.games.length, covers: data.games.filter(g => g.cover).length, bytes: Buffer.byteLength(html) }));
