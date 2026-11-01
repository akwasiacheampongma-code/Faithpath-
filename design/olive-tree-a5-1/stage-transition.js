/** Short opacity/height transition using a frozen old frame, not a wind engine.
 * Native compositor animations have no JavaScript RAF. Every owner can cancel. */
import { TRANSITION_MS } from './config.js';
export function createStageTransition(root, windowElement) {
  let animations = [],
    snapshot = null,
    currentCanvas = null,
    generation = 0,
    active = false;
  function cancel() {
    generation++;
    for (const animation of animations) animation.cancel();
    animations = [];
    snapshot?.remove();
    snapshot = null;
    if (currentCanvas) {
      currentCanvas.style.opacity = '';
      currentCanvas.style.mixBlendMode = '';
    }
    currentCanvas = null;
    root.style.height = '';
    active = false;
  }
  function run(previous, canvas, oldHeight, newHeight) {
    cancel();
    if (!previous || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const token = generation;
    active = true;
    snapshot = previous;
    currentCanvas = canvas;
    previous.className = 'tree-transition-layer';
    previous.setAttribute('aria-hidden', 'true');
    windowElement.append(previous);
    const blend = CSS.supports('mix-blend-mode', 'plus-lighter');
    previous.style.mixBlendMode = canvas.style.mixBlendMode = blend
      ? 'plus-lighter'
      : 'normal';
    const options = {
      duration: TRANSITION_MS,
      easing: 'cubic-bezier(.22,.65,.3,1)',
      fill: 'both',
    };
    animations = [
      previous.animate(
        blend
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, offset: 0 },
              { opacity: 0, offset: 0.5 },
              { opacity: 0, offset: 1 },
            ],
        options,
      ),
      canvas.animate(
        blend
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.5 },
              { opacity: 1, offset: 1 },
            ],
        options,
      ),
    ];
    if (Math.abs(oldHeight - newHeight) > 1) {
      root.style.height = newHeight + 'px';
      animations.push(
        root.animate(
          [{ height: oldHeight + 'px' }, { height: newHeight + 'px' }],
          options,
        ),
      );
    }
    Promise.all(
      animations.map((animation) => animation.finished.catch(() => {})),
    ).then(() => {
      if (token === generation) cancel();
    });
  }
  return {
    run,
    cancel,
    get active() {
      return active;
    },
    get metrics() {
      return {
        active,
        ownedAnimations: animations.length,
        snapshots: snapshot ? 1 : 0,
      };
    },
    dispose: cancel,
  };
}
