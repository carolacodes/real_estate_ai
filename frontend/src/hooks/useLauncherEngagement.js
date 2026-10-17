import { useEffect, useState, useSyncExternalStore } from 'react';
import { createLauncherEngagement } from '../components/chat/launcherEngagement.js';

export default function useLauncherEngagement(open, launcherId) {
  const [engagement] = useState(() => {
    let storage;
    try { storage = globalThis.sessionStorage; } catch { /* Storage can be unavailable. */ }
    const visible = () => !document.hidden;
    const launcher = () => document.getElementById(launcherId);
    return createLauncherEngagement({
      storage,
      canNudge: () => visible() && window.innerWidth >= 300 && window.innerHeight >= 480
        && (window.visualViewport?.height ?? window.innerHeight) >= 480
        && (launcher()?.getBoundingClientRect().top ?? 0) >= 100
        && !document.activeElement?.matches('input, textarea, select, [contenteditable="true"]'),
      canBounce: () => visible() && !launcher()?.matches(':hover, :focus-within'),
      reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  });
  const snapshot = useSyncExternalStore(engagement.subscribe, engagement.getSnapshot, engagement.getSnapshot);
  useEffect(() => {
    engagement.setOpen(open);
    return engagement.stop;
  }, [engagement, open]);
  useEffect(() => {
    const refresh = () => engagement.refresh();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.addEventListener('visibilitychange', refresh);
    document.addEventListener('focusin', refresh);
    window.addEventListener('resize', refresh);
    window.visualViewport?.addEventListener('resize', refresh);
    motion.addEventListener('change', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      document.removeEventListener('focusin', refresh);
      window.removeEventListener('resize', refresh);
      window.visualViewport?.removeEventListener('resize', refresh);
      motion.removeEventListener('change', refresh);
    };
  }, [engagement]);
  return { ...snapshot, pause: () => engagement.pause() };
}
