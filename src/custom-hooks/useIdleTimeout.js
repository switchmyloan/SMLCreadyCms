import { useEffect, useRef, useCallback } from 'react';

// User interactions that count as "activity" and keep the session alive.
const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

/**
 * Auto-logout on inactivity.
 * Invokes `onIdle` after `timeout` ms with no user activity. Any tracked
 * interaction resets the countdown.
 *
 * @param {() => void} onIdle - called when the user has been idle for `timeout` ms
 * @param {number} timeout - inactivity period in ms (default 2 minutes)
 */
export function useIdleTimeout(onIdle, timeout = 2 * 60 * 1000) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Keep the latest callback without re-binding the activity listeners.
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdleRef.current?.();
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    resetTimer(); // start the countdown on mount

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);
}

export default useIdleTimeout;
