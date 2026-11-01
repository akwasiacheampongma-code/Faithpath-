/** The only RAF owner. No DOM observers, loading, storage or stage transitions. */
import { RESUME_MS } from './config.js';
import { restPose, mixPose } from './motion-model.js';
export function createWindPlayer({
  sample,
  draw,
  allowed,
  onGuardStop,
  onQuality,
  onStatic,
}) {
  let policy = null,
    raf = 0,
    running = false,
    disposed = false,
    elapsed = 0,
    start = 0,
    deadline = 0,
    resumeAt = 0,
    lastPose = restPose(),
    resumePose = lastPose;
  const times = [],
    costs = [];
  function stop() {
    if (running) elapsed += Math.max(0, performance.now() - start);
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
    policy?.pause();
  }
  function tick(now) {
    if (!running || disposed) return;
    if (!allowed()) {
      stop();
      onGuardStop();
      return;
    }
    if (now >= deadline) {
      const period = 1000 / policy.settings.fps;
      deadline += period;
      if (deadline < now - period) deadline = now + period;
      lastPose = mixPose(
        resumePose,
        sample(elapsed + now - start),
        Math.min(1, (now - resumeAt) / RESUME_MS),
      );
      const cost = draw(lastPose);
      times.push(now);
      costs.push(cost);
      if (times.length > 1200) {
        times.shift();
        costs.shift();
      }
      const change = policy.frame(now, cost);
      if (change) {
        if (policy.level === 'static') {
          stop();
          onStatic(change);
          return;
        }
        onQuality(change, lastPose);
      }
    }
    raf = requestAnimationFrame(tick);
  }
  return {
    start() {
      if (
        disposed ||
        running ||
        !policy ||
        policy.settings.fps === 0 ||
        !allowed()
      )
        return;
      resumePose = lastPose;
      resumeAt = start = performance.now();
      deadline = start;
      policy.resume(start);
      running = true;
      raf = requestAnimationFrame(tick);
    },
    stop,
    setPolicy(next) {
      const wasRunning = running;
      stop();
      policy = next;
      if (wasRunning) this.start();
    },
    setPose(pose) {
      lastPose = pose;
      resumePose = pose;
    },
    get pose() {
      return lastPose;
    },
    get time() {
      return elapsed + (running ? performance.now() - start : 0);
    },
    get metrics() {
      return {
        running,
        rafPending: Boolean(raf),
        activeMs: this.time,
        renderTimes: times.slice(),
        submitTimes: costs.slice(),
      };
    },
    dispose() {
      stop();
      disposed = true;
    },
  };
}
