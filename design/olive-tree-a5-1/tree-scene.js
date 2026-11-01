/** Owns the component lifecycle, not the wind clock or image decoder.
 * No app imports, storage, migrations or progression events. */
import {
  SIZE,
  PAD_CSS,
  ANCHOR,
  QUALITY,
  MAX_DIAGNOSTIC_WINDOWS,
} from './config.js';
import { STAGES, windPose, a5Pose, restPose } from './motion-model.js';
import { loadStageAsset } from './asset-loader.js';
import { createLeafRenderer } from './leaf-renderer.js';
import { createPerformancePolicy } from './performance-policy.js';
import { createWindPlayer } from './wind-player.js';
import { createStageTransition } from './stage-transition.js';

/** @param {HTMLElement} root @param {{stage?:number,profile?:'a51'|'a5',autoplay?:boolean,onStatus?:(text:string)=>void,onStage?:(index:number)=>void}} options */
export function createTreeScene(
  root,
  {
    stage: initial = 6,
    profile = 'a51',
    autoplay = true,
    onStatus = () => {},
    onStage = () => {},
  } = {},
) {
  const windowElement = document.createElement('div');
  windowElement.className = 'tree-art-window';
  root.append(windowElement);
  root.classList.add('tree-scene');
  root.style.setProperty('--tree-motion-pad', PAD_CSS + 'px');
  root.setAttribute('role', 'img');
  let canvas = document.createElement('canvas');
  canvas.className = 'tree-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  windowElement.append(canvas);
  canvas.hidden = true;
  const transitions = createStageTransition(root, windowElement),
    reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let desired = STAGES[initial],
    current = null,
    asset = null,
    renderer = null,
    policy = createPerformancePolicy(initial === 0),
    generation = 0,
    abort = null,
    loading = false,
    disposed = false;
  function label(stage) {
    root.setAttribute(
      'aria-label',
      stage.name +
        ' – Bild deiner ausdrücklich festgehaltenen persönlichen Entwicklung. Keine Glaubensbewertung.',
    );
  }
  // Lazy loading must not leave an offscreen role=img without a name.
  label(desired);
  let visible = false,
    foreground = !document.hidden,
    enabled = true,
    paused = !autoplay,
    graphicsFailed = false,
    reducedState = reduced.matches,
    reason = 'Baumbild wird bei Sichtbarkeit geladen.',
    lastWidth = 0,
    error = null;
  let resolveReady;
  let readyPromise = new Promise((resolve) => (resolveReady = resolve));
  const changes = [];
  function recordChange(change) {
    changes.push(change);
    if (changes.length > MAX_DIAGNOSTIC_WINDOWS) changes.shift();
  }
  const sourceDPR = () =>
    Math.min(devicePixelRatio || 1, desired.index === 0 ? 1 : QUALITY.high.dpr);
  const width = () => root.clientWidth || lastWidth || 280;
  const sample = (ms) =>
    profile === 'a5'
      ? a5Pose(ms, width())
      : windPose(ms, current?.index ?? desired.index);
  const allowed = () =>
    !disposed &&
    enabled &&
    visible &&
    foreground &&
    !document.hidden &&
    !reduced.matches &&
    !paused &&
    !graphicsFailed &&
    Boolean(renderer && current) &&
    policy.level !== 'static' &&
    root.isConnected;
  const player = createWindPlayer({
    sample,
    draw: (pose) => renderer?.draw(pose) || 0,
    allowed,
    onGuardStop: () => reconcile(),
    onQuality: (change, pose) => {
      recordChange(change);
      renderer.setQuality(policy.settings);
      renderer.draw(pose, { full: true });
      status('Lebendiger Wind · angepasste Grafikqualität.');
    },
    onStatic: (change) => {
      recordChange(change);
      showStatic(
        'Geringe Bildrate: ruhendes Baumbild. Du kannst die Bewegung erneut prüfen.',
      );
    },
  });
  player.setPolicy(policy);
  function status(text) {
    reason = text;
    onStatus(text);
  }
  function layout(stage) {
    root.style.aspectRatio = `${SIZE} / ${SIZE - stage.art.cropTop}`;
    label(stage);
    if (!asset) return;
    const w = width(),
      scale = stage.art.scale,
      img = asset.image;
    img.style.width = img.style.height = w + 'px';
    img.style.transformOrigin = '0 0';
    img.style.transform = `matrix(${scale},0,0,${scale},${((1 - scale) * ANCHOR[0] * w) / SIZE},${((1 - scale) * ANCHOR[1] * w) / SIZE})`;
  }
  function showStatic(text) {
    player.stop();
    transitions.cancel();
    canvas.hidden = true;
    if (asset) asset.image.hidden = false;
    if (text) status(text);
  }
  function failGraphics() {
    graphicsFailed = true;
    showStatic(
      'Grafikdarstellung unterbrochen. Das vollständige Baumbild bleibt sichtbar.',
    );
  }
  function materialize() {
    if (!current || !asset || !visible || !foreground || !enabled || disposed)
      return false;
    if (reduced.matches || graphicsFailed || policy.level === 'static') {
      showStatic(
        reduced.matches ? 'Reduzierte Bewegung: ruhendes Baumbild.' : reason,
      );
      return false;
    }
    try {
      if (!renderer) {
        renderer = createLeafRenderer(canvas, {
          profile,
          onLost: failGraphics,
        });
        renderer.setStage(current, asset.image, policy.settings);
        renderer.resize(width(), policy.settings.dpr);
        player.setPose(restPose());
        renderer.draw(restPose(), { full: true });
      } else {
        const resized = renderer.resize(width(), policy.settings.dpr);
        // Returning from a rest-image fallback must start from that same rest
        // pose, rather than expose the old displaced canvas for one frame.
        if (canvas.hidden) player.setPose(restPose());
        if (resized || canvas.hidden)
          renderer.draw(player.pose, { full: true });
      }
      // Size is corrected BEFORE the paused branch. This also protects a scene
      // which became visible without a second ResizeObserver notification.
      asset.image.hidden = true;
      canvas.hidden = false;
      return true;
    } catch {
      graphicsFailed = true;
      showStatic(
        'Bewegte Grafik nicht verfügbar. Das vollständige Baumbild bleibt sichtbar.',
      );
      return false;
    }
  }
  function pauseForVisibility(text) {
    player.stop();
    transitions.cancel();
    status(text);
  }
  function reconcile() {
    if (disposed) return;
    reducedState = reduced.matches;
    if (!enabled || !root.isConnected) {
      pauseForVisibility('Baumansicht deaktiviert.');
      return;
    }
    if (!foreground || document.hidden) {
      pauseForVisibility('Im Hintergrund pausiert.');
      return;
    }
    if (!visible) {
      pauseForVisibility('Außerhalb des sichtbaren Bereichs pausiert.');
      return;
    }
    if (!asset || desired.index !== current?.index) {
      if (!loading) void loadDesired();
    }
    if (!current) return;
    layout(current);
    if (!materialize()) return;
    if (paused) {
      player.stop();
      status('Bewegung angehalten.');
      return;
    }
    if (!player.metrics.running) {
      player.start();
      status(
        profile === 'a5'
          ? 'A5-Vergleichsprofil · gleiche Darstellung.'
          : 'Lebendiger Wind · Stamm und tragende Äste bleiben stabil.',
      );
    }
  }
  function captureStatic() {
    if (!asset) return null;
    if (renderer && !graphicsFailed && !canvas.hidden)
      return renderer.snapshot();
    const w = width(),
      display = w + 2 * PAD_CSS,
      dpr = Math.min(devicePixelRatio || 1, 1.5),
      copy = document.createElement('canvas');
    copy.width = copy.height = Math.round(display * dpr);
    copy.style.width = copy.style.height = display + 'px';
    const ctx = copy.getContext('2d');
    if (!ctx) return null;
    const s = current.art.scale;
    ctx.setTransform(
      dpr * s,
      0,
      0,
      dpr * s,
      dpr * (PAD_CSS + ((1 - s) * ANCHOR[0] * w) / SIZE),
      dpr * (PAD_CSS + ((1 - s) * ANCHOR[1] * w) / SIZE),
    );
    ctx.drawImage(asset.image, 0, 0, w, w);
    return copy;
  }
  async function loadDesired() {
    if (loading || disposed || !visible || !foreground || !enabled) return;
    const token = generation,
      target = desired;
    loading = true;
    abort = new AbortController();
    status('Baumbild wird geladen …');
    try {
      const next = await loadStageAsset(target, width(), sourceDPR(), {
        signal: abort.signal,
      });
      if (disposed || token !== generation) return;
      const canTransition =
        current &&
        target.index !== current.index &&
        visible &&
        foreground &&
        enabled &&
        !paused &&
        !reduced.matches &&
        policy.level !== 'static';
      const oldHeight = root.getBoundingClientRect().height;
      transitions.cancel();
      let snapshot = null;
      if (canTransition) {
        try {
          snapshot = captureStatic();
        } catch {
          /* A snapshot is optional; the complete new image is not. */
        }
      }
      player.stop();
      asset?.image.remove();
      asset = next;
      current = target;
      error = null;
      loading = false;
      abort = null;
      const img = next.image;
      img.className = 'tree-fallback';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      windowElement.prepend(img);
      img.hidden = false;
      policy = createPerformancePolicy(current.index === 0);
      player.setPolicy(policy);
      player.setPose(restPose());
      layout(current);
      if (renderer && !graphicsFailed) {
        try {
          renderer.setStage(current, img, policy.settings);
          renderer.resize(width(), policy.settings.dpr);
          renderer.draw(restPose(), { full: true });
        } catch {
          failGraphics();
        }
      }
      reconcile();
      onStage(current.index);
      resolveReady(true);
      if (
        snapshot &&
        !canvas.hidden &&
        !disposed &&
        visible &&
        !paused &&
        !reduced.matches
      )
        transitions.run(
          snapshot,
          canvas,
          oldHeight,
          (width() * (SIZE - current.art.cropTop)) / SIZE,
        );
    } catch (e) {
      if (disposed || token !== generation) return;
      loading = false;
      abort = null;
      if (e.name === 'AbortError') return;
      error = 'Baumbild konnte nicht geladen werden. Bitte erneut versuchen.';
      status(error);
      resolveReady(false);
      // Keep the previous complete stage and its correct label on failure.
      if (current) {
        desired = current;
        onStage(current.index);
      } else root.setAttribute('aria-label', error);
    }
  }
  function cancelLoad() {
    generation++;
    abort?.abort();
    abort = null;
    loading = false;
  }
  function setStage(index) {
    if (disposed || !Number.isInteger(index) || !STAGES[index])
      return Promise.resolve(false);
    cancelLoad();
    resolveReady(false);
    desired = STAGES[index];
    error = null;
    readyPromise = new Promise((resolve) => (resolveReady = resolve));
    if (current?.index === index) {
      desired = current;
      resolveReady(true);
      reconcile();
      return readyPromise;
    }
    if (visible && foreground && enabled) void loadDesired();
    return readyPromise;
  }
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = Boolean(
        entries[0]?.isIntersecting && entries[0].intersectionRatio >= 0.01,
      );
      if (!visible) cancelLoad();
      reconcile();
    },
    { threshold: [0, 0.01] },
  );
  intersection.observe(root);
  const resize = new ResizeObserver(() => {
    const w = root.clientWidth;
    if (w > 0 && w !== lastWidth) {
      lastWidth = w;
      transitions.cancel();
      if (visible && foreground && enabled) reconcile();
    }
  });
  resize.observe(root);
  const visibility = () => {
    foreground = !document.hidden;
    if (!foreground) cancelLoad();
    reconcile();
  };
  const pagehide = () => {
      foreground = false;
      cancelLoad();
      reconcile();
    },
    pageshow = () => {
      foreground = !document.hidden;
      reconcile();
    },
    media = () => reconcile();
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pagehide);
  window.addEventListener('pageshow', pageshow);
  reduced.addEventListener('change', media);
  return {
    get ready() {
      return readyPromise;
    },
    setStage,
    pause() {
      paused = true;
      player.stop();
      transitions.cancel();
      status('Bewegung angehalten.');
    },
    play() {
      paused = false;
      reconcile();
    },
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) cancelLoad();
      reconcile();
    },
    retry() {
      if (disposed) return Promise.resolve(false);
      error = null;
      policy.reset();
      graphicsFailed = false;
      renderer?.dispose();
      renderer = null;
      canvas.remove();
      canvas = document.createElement('canvas');
      canvas.className = 'tree-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      windowElement.append(canvas);
      canvas.hidden = true;
      paused = false;
      if ((!current || desired.index !== current.index) && !loading) {
        // Offscreen/deactivated loading may also own an unsettled request.
        // Settle that caller before replacing the readiness handle.
        resolveReady(false);
        readyPromise = new Promise((resolve) => (resolveReady = resolve));
      }
      reconcile();
      return readyPromise;
    },
    inspect(ms, { full = false } = {}) {
      paused = true;
      player.stop();
      transitions.cancel();
      if (!materialize()) return;
      const pose = reduced.matches
        ? restPose()
        : profile === 'a5'
          ? a5Pose(ms, width())
          : windPose(ms, current.index);
      player.setPose(pose);
      renderer.draw(pose, { full });
    },
    get renderer() {
      return renderer;
    },
    get stage() {
      return current;
    },
    get metrics() {
      return {
        requestedStage: desired.index,
        stage: current?.index ?? null,
        ready: Boolean(current && current.index === desired.index),
        loading,
        error,
        visible,
        foreground,
        enabled,
        paused,
        reduced: reducedState,
        graphicsFailed,
        profile,
        reason,
        quality: policy.level,
        qualityChanges: changes.slice(),
        performanceSamples: policy.samples,
        variant: asset?.variant ?? null,
        transition: transitions.metrics,
        disposed,
        ...renderer?.metrics,
        ...player.metrics,
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelLoad();
      resolveReady(false);
      player.dispose();
      transitions.dispose();
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide);
      window.removeEventListener('pageshow', pageshow);
      reduced.removeEventListener('change', media);
      renderer?.dispose();
      asset = null;
      root.replaceChildren();
    },
  };
}
