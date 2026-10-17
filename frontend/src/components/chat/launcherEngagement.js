// Presentation-only scheduler. Injected clock/storage keep timing tests deterministic.
export const launcherNudges = [
  'Looking for something in Dubai?',
  "Tell me your budget — I'll find options.",
  'Try searching by area or bedrooms.',
  'I can help you find properties in seconds.',
];
export const nudgeStorageKey = 'aura-advisor-nudges';
export const launcherTiming = { first: 6000, visible: 5000, gap: 18000, resume: 16000, bounce: 16000, bounceDuration: 650, maximum: 4 };

export function createLauncherEngagement({ storage, schedule = setTimeout, cancel = clearTimeout, canNudge = () => true, canBounce = () => true, reducedMotion = () => false } = {}) {
  let snapshot = { messageIndex: null, bouncing: false };
  let open = false;
  let running = false;
  let count = 0;
  const timers = new Set();
  const listeners = new Set();
  const publish = patch => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  function readCount() {
    try {
      const saved = Number(storage?.getItem(nudgeStorageKey));
      if (Number.isSafeInteger(saved) && saved >= 0) count = Math.max(count, saved);
    } catch { /* Keep the same limit in memory when sessionStorage is blocked. */ }
    return count;
  }
  function later(callback, delay) {
    const timer = schedule(() => {
      timers.delete(timer);
      if (running && !open) callback();
    }, delay);
    timers.add(timer);
  }
  function stop() {
    running = false;
    timers.forEach(cancel);
    timers.clear();
    publish({ messageIndex: null, bouncing: false });
  }
  function showNext() {
    if (readCount() >= launcherTiming.maximum) return;
    if (!canNudge()) {
      later(showNext, launcherTiming.gap);
      return;
    }
    const messageIndex = count % launcherNudges.length;
    count++;
    try { storage?.setItem(nudgeStorageKey, String(count)); } catch { /* In-memory fallback. */ }
    publish({ messageIndex });
    later(() => {
      publish({ messageIndex: null });
      if (readCount() < launcherTiming.maximum) later(showNext, launcherTiming.gap);
    }, launcherTiming.visible);
  }
  function bounce() {
    if (readCount() >= launcherTiming.maximum) return;
    if (!reducedMotion() && canBounce()) {
      publish({ bouncing: true });
      later(() => publish({ bouncing: false }), launcherTiming.bounceDuration);
    }
    later(bounce, launcherTiming.bounce);
  }
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    setOpen(next) {
      const wasOpen = open;
      stop();
      open = next;
      if (open || readCount() >= launcherTiming.maximum) return;
      running = true;
      later(showNext, wasOpen ? launcherTiming.resume : launcherTiming.first);
      later(bounce, launcherTiming.bounce);
    },
    // Called synchronously on launcher clicks, before the parent's open state updates.
    pause() { this.setOpen(true); },
    refresh() {
      if (!canNudge() && snapshot.messageIndex !== null) publish({ messageIndex: null });
      if ((!canBounce() || reducedMotion()) && snapshot.bouncing) publish({ bouncing: false });
    },
    stop,
  };
}
