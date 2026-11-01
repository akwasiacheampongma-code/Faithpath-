import { CONFIG } from './motion-model.js';
import { PEAK_TIME } from './motion-info.js';
import { createLeafRenderer } from './leaf-renderer.js';
import { createMotionPlayer } from './motion-player.js';

const $ = s => document.querySelector(s),
  params = new URLSearchParams(location.search),
  themes = ['light', 'paper', 'atmospheric', 'night'];
const theme = themes.includes(params.get('theme')) ? params.get('theme') : 'light';
document.documentElement.dataset.theme = theme;
$('#theme').value = theme;
$('#theme').addEventListener('change', () => document.documentElement.dataset.theme = $('#theme').value);
if (params.get('size') === '200') $('#tree').style.width = '200px';

let renderer = null, player = null, resize = null, fallback = false;

function inspectionTime(t = renderer?.time || 0) {
  $('#scrub').value = t;
  $('#time').value = (t / 1000).toLocaleString('de-DE', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + ' s';
}

const status = t => {
  $('#status').textContent = t;
  $('#poses').disabled = fallback || Boolean(player?.running);
  if (!player?.running) inspectionTime(fallback ? 0 : renderer?.time || 0);
};

function staticFallback(message) {
  fallback = true;
  player?.stop();
  $('#plates').hidden = true;
  $('#rest-master').hidden = false;
  $('#play').disabled = $('#reset').disabled = $('#poses').disabled = true;
  inspectionTime(0);
  status(message + ' Die vollständige ruhende Illustration bleibt sichtbar.');
}

function show(ms) {
  if (!player || fallback) return;
  player.show(ms);
  inspectionTime();
}

const ready = (async () => {
  try {
    await Promise.all([$('#rest-master').decode(), $('#lower').decode()]);
    renderer = await createLeafRenderer(
      $('#crown'), 'assets/layers/K-continuous-crown-and-upper-wood.png',
      { onLost: () => staticFallback('Grafikdarstellung wurde unterbrochen.') }
    );
    player = createMotionPlayer($('#tree'), renderer, status);
    $('#plates').hidden = false;
    $('#rest-master').hidden = true;
    resize = new ResizeObserver(() => {
      if (!fallback) renderer.resize($('#tree').clientWidth * Math.min(devicePixelRatio || 1, 2));
    });
    resize.observe($('#tree'));
    renderer.resize($('#tree').clientWidth * Math.min(devicePixelRatio || 1, 2));
    $('#play').disabled = $('#reset').disabled = $('#poses').disabled = false;
    show(0);
    status(player.reduced ? 'Reduzierte Bewegung: ruhende Illustration.' : 'Bereit. Stamm und Wurzeln bleiben still.');
    return true;
  } catch {
    staticFallback('Bewegte Darstellung ist nicht verfügbar.');
    return false;
  }
})();

$('#play').addEventListener('click', () => {
  if (player && !fallback) player.play();
});
$('#reset').addEventListener('click', () => show(0));
$('#scrub').addEventListener('input', e => show(Number(e.target.value)));
for (const button of document.querySelectorAll('[data-time]'))
  button.addEventListener('click', () => show(Number(button.dataset.time)));
$('#maximum').addEventListener('click', () => show(PEAK_TIME));
window.addEventListener('pagehide', () => player?.stop());

window.A4_DEMO = {
  ready,
  get renderer() { return renderer; },
  get player() { return player; },
  get fallback() { return fallback; },
  show, peakTime: PEAK_TIME, duration: CONFIG.duration
};
