import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { validGameBuild } from '../src/player/core.mjs';

// Reads data literals only. Downloaded JavaScript is never evaluated or imported.
export function parseLiteral(text, offset = 0) {
  let pos = offset;
  const fail = () => { throw Error('Unsupported metadata literal at ' + pos); };
  const space = () => { while (/\s/.test(text[pos] || '') && pos < text.length) pos++; };
  function read(depth = 0) {
    if (depth > 16) fail();
    space();
    const quote = text[pos];
    if (['`', '"', "'"].includes(quote)) {
      pos++;
      let value = '';
      while (pos < text.length) {
        let char = text[pos++];
        if (char === quote) return value;
        if (quote === '`' && char === '$' && text[pos] === '{') fail();
        if (char === '\\') {
          char = text[pos++];
          const escapes = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };
          if (char === 'u' || char === 'x') {
            const length = char === 'u' ? 4 : 2;
            const hex = text.slice(pos, pos + length);
            if (!new RegExp('^[0-9a-fA-F]{' + length + '}$').test(hex)) fail();
            value += String.fromCharCode(parseInt(hex, 16)); pos += length;
          } else if (Object.hasOwn(escapes, char)) value += escapes[char];
          else if (['\\', '`', '"', "'", '$'].includes(char)) value += char;
          else fail();
        } else value += char;
      }
      fail();
    }
    if (quote === '[' || quote === '{') {
      const array = quote === '[';
      const value = array ? [] : {};
      const end = array ? ']' : '}';
      pos++; space();
      while (text[pos] !== end) {
        if (array) value.push(read(depth + 1));
        else {
          let key;
          if (['`', '"', "'"].includes(text[pos])) key = read(depth + 1);
          else { const match = text.slice(pos).match(/^[A-Za-z_$][\w$]*/); if (!match) fail(); key = match[0]; pos += key.length; }
          if (['__proto__', 'constructor', 'prototype'].includes(key) || Object.hasOwn(value, key)) fail();
          space(); if (text[pos++] !== ':') fail();
          value[key] = read(depth + 1);
        }
        space();
        if (text[pos] === end) break;
        if (text[pos++] !== ',') fail();
        space();
      }
      pos++; return value;
    }
    const token = text.slice(pos).match(/^(?:-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|true|false|null)(?![\w$.])/i)?.[0];
    if (!token) fail();
    pos += token.length;
    return JSON.parse(token);
  }
  const value = read();
  return { value, end: pos };
}

const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function matchCompatibleGame(game, games) {
  if (game.system === 'pc' && game.upstreamId === 'gta3') return games.find(item => item.id === 'gn-851' && item.platform === 'PC' && validGameBuild(item.buildURL));
  if (game.system !== 'flash') return;
  const candidates = games.filter(item => item.platform === 'Web' && normalized(item.name) === normalized(game.name) && validGameBuild(item.buildURL));
  return candidates.length === 1 ? candidates[0] : undefined;
}

export function sourcePlayURL(game) {
  const url = new URL(game.source);
  if (url.origin !== 'https://wasmarcade.com' || !/^\/(?:vice-city|gta3|simpsons|minecraft|gta-5|flash-games\/[a-z0-9-]+|retro-games\/[a-z0-9-]+)$/.test(url.pathname)) throw Error('Unsupported source game page');
  url.hash = game.system === 'pc' || game.system === 'flash' ? 'game-surface' : 'game';
  return url.href;
}

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), credentials: 'omit' });
  if (!response.ok) throw Error('Metadata unavailable: ' + url);
  return response.text();
}
function literalAfter(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw Error('Metadata format changed: ' + marker);
  return parseLiteral(text, start + marker.length).value;
}
function titleCover(name, system) {
  const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  const words = name.split(/\s+/); const lines = []; let line = '';
  for (const word of words) { if ((line + ' ' + word).trim().length > 25 && line) { lines.push(line); line = word; } else line = (line + ' ' + word).trim(); }
  lines.push(line);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="384" height="288" viewBox="0 0 384 288"><rect width="384" height="288" fill="#25262c"/><path d="M28 54h328M28 238h328" stroke="#777276"/><text x="28" y="36" fill="#bcb9b5" font-family="Arial" font-size="13">' + escape(system) + '</text>' + lines.slice(0, 5).map((part, index) => '<text x="28" y="' + (100 + index * 26) + '" fill="#f5f1eb" font-family="Arial" font-size="21">' + escape(part) + '</text>').join('') + '<text x="28" y="263" fill="#bcb9b5" font-family="Arial" font-size="12">Identificação do título · Edy Games</text></svg>';
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

export async function importWasmArcade() {
  const base = 'https://wasmarcade.com';
  const home = await download(base + '/');
  const asset = prefix => {
    const found = home.match(new RegExp('/assets/' + prefix + '-[A-Za-z0-9_-]+\\.js'))?.[0];
    if (!found) throw Error('Metadata asset missing: ' + prefix);
    return base + found;
  };
  const [pcText, flashPage] = await Promise.all([download(asset('games')), download(base + '/flash-games')]);
  const linkedAsset = (page, prefix) => {
    const found = page.match(new RegExp('/assets/' + prefix + '-[A-Za-z0-9_-]+\\.js'))?.[0];
    if (!found) throw Error('Metadata asset missing: ' + prefix);
    return base + found;
  };
  const mainAsset = home.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!mainAsset) throw Error('Application metadata index missing');
  const mainModule = await download(base + mainAsset);
  const emuAsset = mainModule.match(/\.\/emu-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!emuAsset) throw Error('Emulation metadata asset missing');
  const urls = [asset('games'), linkedAsset(flashPage, 'flash'), base + '/assets/' + emuAsset.slice(2)];
  const [flashText, emuText] = await Promise.all(urls.slice(1).map(download));
  const pc = literalAfter(pcText, 'var e=');
  const flash = literalAfter(flashText, ',t=');
  const emu = literalAfter(emuText, 'var r=');
  if (pc.length !== 5 || flash.length !== 850 || emu.length !== 227) throw Error('Upstream catalog changed; review counts before updating');
  const systems = { pc: 'PC', flash: 'Flash', neogeo: 'Neo Geo', cps1: 'Capcom CPS1', cps2: 'Capcom CPS2', cps3: 'Capcom CPS3', arcade: 'Arcade' };
  const categories = { action: 'Ação e luta', shooter: 'Tiro', platformer: 'Plataforma', adventure: 'Aventura', arcade: 'Arcade e outros', puzzle: 'Puzzle', logic: 'Puzzle', strategy: 'Estratégia', simulation: 'Simulação e sandbox', sports: 'Esportes', racing: 'Corrida', rpg: 'RPG' };
  const entries = [
    ...pc.map(item => ({ id: 'wasm-pc-' + item.id, upstreamId: item.id, name: item.name, system: 'pc', source: base + item.href, directURL: item.id === 'minecraft' ? base + '/eaglercraft/1.8.8/app.html' : item.external?.url, category: item.id === 'minecraft' ? 'Simulação e sandbox' : 'Aventura' })),
    ...flash.map(item => ({ id: 'wasm-flash-' + item.id, upstreamId: item.id, name: item.title, system: 'flash', source: base + '/flash-games/' + item.id, assetURL: base + '/flash/swf/' + item.id + '.swf', category: categories[item.cats[0]] || 'Arcade e outros' })),
    ...emu.map(item => ({ id: 'wasm-emu-' + item.id, upstreamId: item.id, name: item.title, system: item.sys, source: base + '/retro-games/' + item.slug, assetURL: base + '/emulation/roms/' + item.id + '.zip', category: 'Arcade e outros' })),
  ];
  if (new Set(entries.map(item => item.id)).size !== 1082) throw Error('Duplicate upstream IDs');
  const catalog = JSON.parse(await fs.readFile('data/catalog.json', 'utf8'));
  const savedCovers = new Map(catalog.games.filter(item => item.id.startsWith('wasm-') && item.coverKind !== 'title-card').map(item => [item.id, { cover: item.cover, coverKind: item.coverKind, coverSource: item.coverSource }]));
  for (const item of entries) if (savedCovers.get(item.id)?.coverSource) item.coverSource = savedCovers.get(item.id).coverSource;
  const existing = catalog.games.filter(item => !item.id.startsWith('wasm-'));
  const now = new Date().toISOString();
  const imported = entries.map(item => {
    const compatible = matchCompatibleGame(item, existing);
    const external = ['https://gta.deloskiyt.pl/', 'https://wasmarcade.com/eaglercraft/1.8.8/app.html'].includes(item.directURL);
    const platform = systems[item.system] || 'Arcade';
    return {
      id: item.id, name: item.name, franchise: compatible?.franchise || (item.id.startsWith('wasm-pc-gta') || item.id === 'wasm-pc-vice-city' ? 'GTA' : item.name), category: item.category, platform,
      type: compatible ? 'Versão compatível para browser' : external ? 'Port para browser' : 'Jogo na página de origem',
      collection: 'WASM Arcade', source: item.source, url: external ? item.directURL : compatible?.url || sourcePlayURL(item),
      ...(compatible ? { buildURL: compatible.buildURL, compatibleGameID: compatible.id } : {}),
      availability: compatible || external ? 'available' : 'source', mode: compatible || external ? 'direct' : 'external',
      verified: false, gameplayStatus: 'not_tested', checkedAt: now,
      ...(savedCovers.get(item.id) || { cover: compatible?.cover || titleCover(item.name, platform), coverKind: compatible ? 'source-art' : 'title-card' }),
      requirements: compatible ? 'Esta entrada abre a versão compatível já cadastrada no player Edy Games. A edição pode diferir da hospedada no WASM Arcade.' : external ? item.upstreamId === 'minecraft' ? 'Abre somente o jogador EaglercraftX 1.8.8 WASM-GC, ocupando a página. Requer navegador recente compatível com WebAssembly GC; carregamento grande. Partida não validada.' : 'Abre diretamente o jogador de GTA V. Requer navegador de desktop com WebGPU; carregamento grande. O responsável pode exibir anúncios. Partida não validada.' : 'Abre a página deste jogo no WASM Arcade, posicionada na área do jogador. Use Play para iniciar e o botão de tela cheia do próprio jogo. O navegador exige uma ação nessa página para entrar em tela cheia.',
      evidence: compatible ? 'Correspondência única de nome com uma build Web do catálogo existente; partida não testada.' : external ? 'Destino de execução extraído dos metadados públicos; HTML com canvas e carregador, HTTP 200. Partida não testada.' : 'Página específica do jogo identificada no catálogo público. Abre o jogador na origem, que não permite incorporação em outros sites. Partida não testada.',
    };
  });
  catalog.games = [...existing, ...imported].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  catalog.updated = '13/10/2026';
  catalog.platforms = [...new Set([...catalog.platforms, ...imported.map(item => item.platform)])];
  const summary = { source: base, checkedAt: now, total: entries.length, compatible: imported.filter(item => item.compatibleGameID).length, external: imported.filter(item => item.availability === 'available' && !item.compatibleGameID).length, sourcePages: imported.filter(item => item.availability === 'source').length, blocked: 0 };
  catalog.wasmArcade = summary;
  await fs.writeFile('data/wasm-arcade.json', JSON.stringify({ ...summary, metadataAssets: urls, games: entries }, null, 2) + '\n');
  await fs.writeFile('data/catalog.json', JSON.stringify(catalog));
  console.log(JSON.stringify(summary));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await importWasmArcade();
