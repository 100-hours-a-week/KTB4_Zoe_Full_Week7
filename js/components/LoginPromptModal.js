import { ROUTES } from "../router.js";

export function createLoginPromptModal() {
  const modal = document.createElement("div");
  modal.className = "confirm-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="confirm-modal__backdrop" data-modal-close></div>
    <section class="confirm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title">
      <div class="confirm-modal__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M9 10h.01M15 10h.01M8.5 15a5 5 0 0 1 7 0"/></svg>
      </div>
      <h2 id="login-prompt-title" class="confirm-modal__title">로그인이 필요해요</h2>
      <p class="confirm-modal__description">로그인하고 Votle의 이야기에 참여해보세요.</p>
      <div class="confirm-modal__actions">
        <button class="confirm-modal__button confirm-modal__button--cancel" type="button" data-modal-close>다음에</button>
        <a class="confirm-modal__button confirm-modal__button--confirm" href="${ROUTES.login}">로그인</a>
      </div>
    </section>
  `;

  document.body.append(modal);

  function close() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
  }

  function open() {
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
  }

  modal.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", close);
  });

  return { open, close };
}
