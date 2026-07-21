const DEFAULT_DELAY = 1000;

export function createDelayedLoading({
  delay = DEFAULT_DELAY,
  onShow,
  onHide,
} = {}) {
  let timerId = null;
  let isVisible = false;

  function clearTimer() {
    if (!timerId) return;

    window.clearTimeout(timerId);
    timerId = null;
  }

  function start() {
    clearTimer();

    timerId = window.setTimeout(() => {
      timerId = null;
      isVisible = true;
      onShow?.();
    }, delay);
  }

  function stop() {
    clearTimer();

    if (!isVisible) return;

    isVisible = false;
    onHide?.();
  }

  return {
    start,
    stop,
    isVisible: () => isVisible,
  };
}

export function createButtonLoading(button, {
  delay = DEFAULT_DELAY,
  label = "처리 중",
} = {}) {
  let loadingText = null;

  const delayedLoading = createDelayedLoading({
    delay,
    onShow: () => {
      button.classList.add("button--loading");
      button.setAttribute("aria-busy", "true");

      loadingText = document.createElement("span");
      loadingText.className = "sr-only button__loading-text";
      loadingText.textContent = label;
      button.append(loadingText);
    },
    onHide: () => {
      button.classList.remove("button--loading");
      button.removeAttribute("aria-busy");
      loadingText?.remove();
      loadingText = null;
    },
  });

  function start() {
    button.disabled = true;
    delayedLoading.start();
  }

  function stop({ disabled = false } = {}) {
    delayedLoading.stop();
    button.disabled = disabled;
  }

  return {
    start,
    stop,
  };
}
