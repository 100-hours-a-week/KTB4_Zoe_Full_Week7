import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export type ValidationMessage = string | null;

type UseDebouncedValidationOptions = {
  delay?: number;
  enabled?: boolean;
  initialMessage?: ValidationMessage;
};

const DEFAULT_VALIDATION_DELAY = 400;

export function useDebouncedValidation(
  validate: () => string,
  dependencies: DependencyList,
  {
    delay = DEFAULT_VALIDATION_DELAY,
    enabled = true,
    initialMessage = null,
  }: UseDebouncedValidationOptions = {},
) {
  const validateRef = useRef(validate);
  const skipNextDebounceRef = useRef(false);
  const timerIdRef = useRef<number | null>(null);
  const [message, setMessage] = useState<ValidationMessage>(initialMessage);
  const [isPending, setIsPending] = useState(false);
  const [touched, setTouched] = useState(initialMessage !== null);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current == null) return;
    window.clearTimeout(timerIdRef.current);
    timerIdRef.current = null;
  }, []);

  useEffect(() => {
    validateRef.current = validate;
  }, [validate]);

  useEffect(() => {
    if (!enabled || !touched) return undefined;
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return undefined;
    }

    clearTimer();
    setIsPending(true);
    const timerId = window.setTimeout(() => {
      setMessage(validateRef.current());
      setIsPending(false);
      timerIdRef.current = null;
    }, delay);
    timerIdRef.current = timerId;

    return clearTimer;
  }, [clearTimer, delay, enabled, touched, ...dependencies]);

  const markChanged = useCallback(() => {
    skipNextDebounceRef.current = false;
    setTouched(true);
    setIsPending(true);
  }, []);

  const validateNow = useCallback(() => {
    clearTimer();
    skipNextDebounceRef.current = true;
    setTouched(true);
    const nextMessage = validateRef.current();
    setMessage(nextMessage);
    setIsPending(false);
    return nextMessage;
  }, [clearTimer]);

  const reset = useCallback((nextMessage: ValidationMessage = null) => {
    clearTimer();
    skipNextDebounceRef.current = true;
    setTouched(nextMessage !== null);
    setMessage(nextMessage);
    setIsPending(false);
  }, [clearTimer]);

  const setValidationMessage = useCallback((nextMessage: ValidationMessage) => {
    clearTimer();
    skipNextDebounceRef.current = true;
    setTouched(nextMessage !== null);
    setMessage(nextMessage);
    setIsPending(false);
  }, [clearTimer]);

  return {
    isPending,
    isValid: message === "" && !isPending,
    markChanged,
    message,
    reset,
    setMessage: setValidationMessage,
    touched,
    validateNow,
  };
}
