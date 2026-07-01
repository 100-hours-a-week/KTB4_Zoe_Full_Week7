let toastTimer = null;

function getToastElement(toast) {
  if (toast) return toast;

  const existingToast = document.getElementById("toast");
  if (existingToast) return existingToast;

  const nextToast = document.createElement("p");
  nextToast.id = "toast";
  nextToast.className = "toast";
  nextToast.setAttribute("role", "status");
  nextToast.setAttribute("aria-live", "polite");
  nextToast.hidden = true;
  document.body.append(nextToast);

  return nextToast;
}

export function showToast(message, { toast = null, duration = 2000 } = {}) {
  const toastElement = getToastElement(toast);

  toastElement.textContent = message;
  toastElement.hidden = false;

  if (toastTimer) clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastElement.hidden = true;
  }, duration);
}
