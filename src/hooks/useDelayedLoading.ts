import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delay = 1000) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }

    const timerId = window.setTimeout(() => setShowLoading(true), delay);
    return () => window.clearTimeout(timerId);
  }, [delay, isLoading]);

  return showLoading;
}
