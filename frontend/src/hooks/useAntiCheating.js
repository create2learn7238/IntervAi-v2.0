import { useEffect, useRef } from 'react';

export default function useAntiCheating({ onViolation }) {
  const hiddenTimeStart = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimeStart.current = Date.now();
      } else {
        const duration = hiddenTimeStart.current ? Date.now() - hiddenTimeStart.current : 0;
        hiddenTimeStart.current = null;
        if (onViolation) onViolation('TAB_SWITCH', 'Switched to another tab or minimized browser', duration);
      }
    };

    const handleBlur = () => {
      if (!document.hidden && onViolation) {
        onViolation('WINDOW_HIDDEN', 'Window lost focus');
      }
    };

    const handleResize = () => {
      // Basic resize tracking, heavily throttled
      if (!document.fullscreenElement && onViolation) {
        // onViolation('BROWSER_RESIZE', 'Browser window was resized'); // Commented out to avoid spamming unless required
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
    };
  }, [onViolation]);
}
