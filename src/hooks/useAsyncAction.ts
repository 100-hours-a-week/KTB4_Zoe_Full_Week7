import { useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

export function useAsyncAction() {
  const [isRunning, setIsRunning] = useState(false);
  const showLoading = useDelayedLoading(isRunning);

  async function run<T>(action: () => Promise<T>) {
    if (isRunning) return undefined;

    setIsRunning(true);
    try {
      return await action();
    } finally {
      setIsRunning(false);
    }
  }

  return { isRunning, showLoading, run };
}
