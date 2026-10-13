import fs from 'node:fs/promises';
const [template, fonts, core, playerUI, heroCover, catalogExport] = await Promise.all([
  fs.readFile('src/catalog.html', 'utf8'),
  fs.readFile('assets/fonts/embedded.css', 'utf8'),
  fs.readFile('src/player/core.mjs', 'utf8'),
  fs.readFile('src/player/ui.js', 'utf8'),
  fs.readFile('assets/covers/gta-v.webp'),
  fs.readFile('src/catalog-export.mjs', 'utf8'),
]);
const data = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
if (data.games.some(g => g.id.startsWith('gn-') && g.url !== 'https://gn-math.dev/?id=' + g.id.slice(3))) throw Error('GN source links must point to the launcher, never a raw build');
if (data.games.some(g => !g.cover)) throw Error('Missing covers');
const shell = template.replace('__FONTS__', fonts)
  .replace('__HERO_COVER__', 'data:image/webp;base64,' + heroCover.toString('base64'))
  .replace('__GAME_COUNT__', String(data.games.length))
  .replace('__PLAYER_CORE__', core.replace(/^export /gm, ''))
  .replace('__PLAYER_UI__', playerUI)
  .replace('__CATALOG_EXPORT__', catalogExport.replace(/^export /gm, ''));
const render = dataset => shell.replace('__DATA__', JSON.stringify(dataset).replace(/</g, '\\u003c'));
const html = render(data);
if (/__(?:FONTS|HERO_COVER|GAME_COUNT|PLAYER_CORE|PLAYER_UI|CATALOG_EXPORT|DATA)__/.test(html)) throw Error('Unresolved template placeholder');
await Promise.all(['outputs', 'publish'].map(dir => fs.mkdir(dir, { recursive: true })));
await fs.mkdir('publish/covers', { recursive: true });
const publishedData = structuredClone(data);
let assetCount = 0;
for (const game of publishedData.games.filter(game => game.collection === 'WASM Arcade' && game.coverSource?.startsWith('https://wasmarcade.com/') && game.cover.startsWith('data:image/webp;base64,'))) {
  if (!/^wasm-(?:pc|emu|flash)-[a-z0-9-]+$/.test(game.id)) throw Error('Invalid cover asset ID');
  const asset = 'covers/' + game.id + '.webp';
  await fs.writeFile('publish/' + asset, Buffer.from(game.cover.split(',')[1], 'base64'));
  game.cover = asset;
  assetCount++;
}
const publishedHTML = render(publishedData);
if (Buffer.byteLength(publishedHTML) > 25 * 1024 * 1024) throw Error('Published HTML exceeds static asset file limit');
await Promise.all([fs.writeFile('outputs/edy-games-catalogo.html', html), fs.writeFile('publish/index.html', publishedHTML)]);
console.log(JSON.stringify({ games: data.games.length, covers: data.games.filter(g => g.cover).length, portableBytes: Buffer.byteLength(html), publishedBytes: Buffer.byteLength(publishedHTML), coverAssets: assetCount }));
