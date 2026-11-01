/** Finite, manually started study animation. No background loop while idle. */
import { CONFIG } from './motion-model.js';

export function createMotionPlayer(root, renderer, onStatus = () => {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let running = false, visible = true, frame = 0, start = 0, last = -Infinity;

  function stop(message = 'Bewegung beendet.') {
    cancelAnimationFrame(frame);
    frame = 0;
    running = false;
    renderer.draw(0);
    onStatus(reduced.matches ? 'Reduzierte Bewegung: ruhende Illustration.' : message);
  }

  function tick(now) {
    if (!running) return;
    const elapsed = now - start;
    if (elapsed >= CONFIG.duration) {
      stop();
      return;
    }
    if (now - last >= 1000 / 30) {
      renderer.draw(elapsed);
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (reduced.matches || !visible || document.hidden || renderer.lost) {
      stop();
      return false;
    }
    stop('');
    running = true;
    start = performance.now();
    last = -Infinity;
    frame = requestAnimationFrame(tick);
    onStatus('Dezente Blattbewegung · einmalig acht Sekunden.');
    return true;
  }

  function show(ms) {
    stop('Prüfposition, keine laufende Animation.');
    renderer.draw(reduced.matches ? 0 : Math.max(0, Math.min(CONFIG.duration, ms)));
  }

  const observer = new IntersectionObserver(entries => {
    visible = entries.some(x => x.isIntersecting);
    if (!visible && running) stop('Außerhalb der sichtbaren Ansicht gestoppt.');
  }, { threshold: .1 });
  observer.observe(root);

  const changed = () => {
    if (reduced.matches) stop();
  }, visibility = () => {
    if (document.hidden && running) stop('Im Hintergrund gestoppt.');
  };
  reduced.addEventListener('change', changed);
  document.addEventListener('visibilitychange', visibility);

  return {
    play, stop, show,
    get running() { return running; },
    get reduced() { return reduced.matches; },
    dispose() {
      stop();
      observer.disconnect();
      reduced.removeEventListener('change', changed);
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}
