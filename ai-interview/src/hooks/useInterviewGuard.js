import { useEffect, useRef, useState } from 'react';

/**
 * Interview Focus Guard Hook
 *
 * Activated when `isActive` is true (interview in progress).
 * Handles three browser-level concerns:
 *   1. beforeunload — warns on tab close / refresh
 *   2. visibilitychange — detects tab switches, counts them
 *   3. popstate — intercepts browser back/forward button
 *
 * Returns:
 *   - tabAwayCount: number of times user switched away
 */
export default function useInterviewGuard(isActive) {
  const [tabAwayCount, setTabAwayCount] = useState(0);
  const guardActiveRef = useRef(isActive);
  guardActiveRef.current = isActive;

  // --- 1. beforeunload: warn on tab close / page refresh ---
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  // --- 2. visibilitychange: detect tab switches ---
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabAwayCount((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  // --- 3. popstate: intercept browser back/forward ---
  useEffect(() => {
    if (!isActive) return;

    const currentPath = window.location.pathname + window.location.search;
    window.history.pushState({ interviewGuard: true }, '', currentPath);

    const handlePopState = () => {
      if (!guardActiveRef.current) return;

      window.history.pushState({ interviewGuard: true }, '', currentPath);

      const shouldLeave = window.confirm(
        'Interview in progress!\n\nYour progress is saved and you can resume later from the Dashboard.\n\nLeave interview?'
      );

      if (shouldLeave) {
        guardActiveRef.current = false;
        window.history.go(-2);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isActive]);

  return { tabAwayCount };
}
