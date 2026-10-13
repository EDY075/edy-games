function gameLink(game) {
  const link = directPlayURL(game, location.href);
  return link !== game.url ? link : safeURL(link);
}

function initDirectPlayer() {
  const id = new URLSearchParams(location.search).get('play');
  const game = games.find(item => item.id === id && (validGameBuild(item.buildURL) || item.availability === 'blocked'));
  const root = $('#direct-player');
  const frame = $('#direct-game-frame');
  const status = $('#player-status');
  const cleanURL = new URL(location.href);
  cleanURL.searchParams.delete('play');
  cleanURL.hash = '';
  $('#player-back').href = cleanURL.href;
  root.hidden = false;
  document.body.classList.add('player-mode');
  document.documentElement.dataset.motion = 'paused';
  try { document.documentElement.dataset.theme = localStorage.getItem('edy-games-theme') === 'light' ? 'light' : 'dark'; } catch {}
  if (!game) {
    $('#player-title').textContent = 'Jogo não encontrado';
    status.textContent = 'Volte ao catálogo e escolha um jogo disponível.';
    $('#player-retry').hidden = true;
    $('#player-fullscreen').hidden = true;
    $('#player-source').hidden = true;
    return;
  }
  document.title = game.name + ' · Edy Games';
  $('#player-title').textContent = game.name;
  frame.title = game.name;
  $('#player-source').href = safeURL(game.url);
  if (game.availability === 'blocked') {
    status.textContent = 'Aguardando integração';
    frame.hidden = true;
    $('#player-retry').hidden = true;
    $('#player-fullscreen').hidden = true;
    $('#player-source').hidden = true;
    root.querySelector('.player-note').hidden = true;
    const message = document.createElement('div');
    message.className = 'player-unavailable';
    const title = document.createElement('h2');
    title.textContent = 'Este jogo ainda não tem acesso direto disponível';
    const detail = document.createElement('p');
    detail.textContent = game.requirements;
    const back = document.createElement('a');
    back.className = 'button';
    back.href = cleanURL.href;
    back.textContent = 'Escolher outro jogo';
    message.append(title, detail, back);
    root.append(message);
    return;
  }
  let controller;
  let request = 0;
  async function loadGame() {
    controller?.abort();
    controller = new AbortController();
    const currentController = controller;
    const currentRequest = ++request;
    const timeout = setTimeout(() => currentController.abort(), 30000);
    frame.removeAttribute('srcdoc');
    status.textContent = 'Carregando o jogo…';
    $('#player-retry').disabled = true;
    try {
      const response = await fetch(game.buildURL, { signal: currentController.signal, credentials: 'omit', redirect: 'error' });
      if (!response.ok) throw new Error('Game unavailable');
      const declaredLength = Number(response.headers.get('content-length'));
      if (declaredLength > 25 * 1024 * 1024) throw new Error('Game document too large');
      const html = await response.text();
      if (currentRequest !== request) return;
      frame.srcdoc = prepareGameDocument(html, game.buildURL);
      status.textContent = 'Conteúdo recebido. O jogo carrega os dados pela internet.';
    } catch {
      if (currentRequest !== request) return;
      status.textContent = 'Não foi possível carregar. Tente novamente ou abra o site de origem.';
    } finally {
      clearTimeout(timeout);
      if (currentRequest === request) $('#player-retry').disabled = false;
    }
  }
  $('#player-retry').addEventListener('click', loadGame);
  $('#player-fullscreen').addEventListener('click', async () => {
    try { await frame.requestFullscreen(); } catch { status.textContent = 'O navegador não permitiu tela cheia.'; }
  });
  window.addEventListener('pagehide', () => controller?.abort(), { once: true });
  loadGame();
}
