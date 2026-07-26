import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Interview Focus & Anti-Cheating Guard Hook
 *
 * Activated when `isActive` is true (interview in progress).
 * Features:
 *   1. beforeunload — warns on tab close / page refresh
 *   2. visibilitychange — detects tab switches / minimizing
 *   3. popstate — intercepts browser back/forward navigation
 *   4. paste detection — blocks pasting text into viva answer fields
 *   5. Hard Warning System — tracks violations (max 3), triggers modal, auto-terminates on 3rd violation.
 */
export default function useInterviewGuard(isActive, onHardTerminate) {
  const [tabAwayCount, setTabAwayCount] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationReason, setLastViolationReason] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isHardTerminated, setIsHardTerminated] = useState(false);

  const guardActiveRef = useRef(isActive);
  guardActiveRef.current = isActive;

  const onHardTerminateRef = useRef(onHardTerminate);
  onHardTerminateRef.current = onHardTerminate;

  /**
   * Triggers a violation check & hard warning modal.
   * If violation count reaches 3, triggers hard termination.
   */
  const recordViolation = useCallback((reason) => {
    if (!guardActiveRef.current) return;

    setViolationCount((prev) => {
      const nextCount = prev + 1;
      setLastViolationReason(reason);

      if (nextCount >= 3) {
        setIsHardTerminated(true);
        setShowWarningModal(false);
        if (onHardTerminateRef.current) {
          onHardTerminateRef.current(reason, nextCount);
        }
      } else {
        setShowWarningModal(true);
      }
      return nextCount;
    });
  }, []);

  // --- 1. beforeunload: warn on tab close / page refresh ---
  useEffect(() => {
    if (!isActive || isHardTerminated) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, isHardTerminated]);

  // --- 2. visibilitychange: detect tab switches / window blur ---
  useEffect(() => {
    if (!isActive || isHardTerminated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabAwayCount((prev) => prev + 1);
        recordViolation('Tab switch or window minimization detected.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, isHardTerminated, recordViolation]);

  // --- 3. popstate: intercept browser back/forward ---
  useEffect(() => {
    if (!isActive || isHardTerminated) return;

    const currentPath = window.location.pathname + window.location.search;
    window.history.pushState({ interviewGuard: true }, '', currentPath);

    const handlePopState = () => {
      if (!guardActiveRef.current || isHardTerminated) return;

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
  }, [isActive, isHardTerminated]);

  /**
   * Event handler for answer textarea onPaste
   */
  const handlePasteAttempt = useCallback((e) => {
    if (!isActive || isHardTerminated) return;
    e.preventDefault();
    recordViolation('Pasting copied text into viva answer field is strictly prohibited.');
  }, [isActive, isHardTerminated, recordViolation]);

  const dismissWarningModal = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  return {
    tabAwayCount,
    violationCount,
    maxViolations: 3,
    lastViolationReason,
    showWarningModal,
    isHardTerminated,
    handlePasteAttempt,
    dismissWarningModal,
  };
}
