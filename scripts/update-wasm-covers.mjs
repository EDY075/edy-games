import fs from 'node:fs/promises';

const catalog = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('data/wasm-arcade.json', 'utf8'));
const pcCovers = { gta5: 'gta-v', 'vice-city': 'vice-city', gta3: 'gta3', simpsons: 'hit-and-run', minecraft: 'minecraft' };
const pending = catalog.games.filter(game => game.collection === 'WASM Arcade' && game.coverKind === 'title-card');
const records = new Map(manifest.games.map(game => [game.id, game]));
const failures = [];
let cursor = 0;
let updated = 0;
let bytes = 0;

function coverURL(game) {
  const record = records.get(game.id);
  if (!record || !/^[a-z0-9-]+$/.test(record.upstreamId)) throw Error('Invalid cover identifier');
  const suffix = record.system === 'pc' ? '/covers/' + pcCovers[record.upstreamId] + '-896.webp'
    : record.system === 'flash' ? '/flash/thumbs/' + record.upstreamId + '-450.webp'
    : '/emulation/boxart-v2/' + record.upstreamId + '-450.webp';
  return 'https://wasmarcade.com' + suffix;
}

async function getCover(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/webp')) throw Error('Image HTTP ' + response.status);
      const image = Buffer.from(await response.arrayBuffer());
      if (image.length < 32 || image.length > 2 * 1024 * 1024 || image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP') throw Error('Invalid WebP image');
      return image;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < pending.length) {
    const game = pending[cursor++];
    try {
      const source = coverURL(game);
      const image = await getCover(source);
      game.cover = 'data:image/webp;base64,' + image.toString('base64');
      game.coverKind = game.platform === 'Flash' ? 'source-screenshot' : 'source-art';
      game.coverSource = source;
      records.get(game.id).coverSource = source;
      bytes += image.length;
      updated++;
      if (updated % 100 === 0) console.log('Capas recebidas: ' + updated + '/' + pending.length);
    } catch (error) { failures.push({ id: game.id, reason: error.message }); }
  }
}));

await fs.writeFile('data/catalog.json', JSON.stringify(catalog));
await fs.writeFile('data/wasm-arcade.json', JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile('docs/wasm-cover-checks.json', JSON.stringify({ checkedAt: new Date().toISOString(), requested: pending.length, updated, bytes, failures, remainingTitleCards: catalog.games.filter(game => game.coverKind === 'title-card').length }, null, 2) + '\n');
console.log(JSON.stringify({ updated, bytes, failures, remaining: catalog.games.filter(game => game.coverKind === 'title-card').length }));
if (failures.length) process.exitCode = 1;
