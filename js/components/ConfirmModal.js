export function createConfirmModal() {
  const modal = document.createElement("div");
  modal.className = "confirm-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="confirm-modal__backdrop" data-modal-close></div>
    <section class="confirm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <h2 id="confirm-modal-title" class="confirm-modal__title"></h2>
      <p class="confirm-modal__description"></p>
      <div class="confirm-modal__actions">
        <button class="confirm-modal__button confirm-modal__button--cancel" type="button" data-modal-close>취소</button>
        <button class="confirm-modal__button confirm-modal__button--confirm" type="button">확인</button>
      </div>
    </section>
  `;

  document.body.append(modal);

  const title = modal.querySelector(".confirm-modal__title");
  const description = modal.querySelector(".confirm-modal__description");
  const confirmButton = modal.querySelector(".confirm-modal__button--confirm");
  const closeButtons = modal.querySelectorAll("[data-modal-close]");

  let onConfirm = null;

  function close() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    onConfirm = null;
  }

  function open({ title: nextTitle, description: nextDescription, onConfirm: nextOnConfirm }) {
    title.textContent = nextTitle;
    description.textContent = nextDescription;
    onConfirm = nextOnConfirm;
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", close);
  });

  confirmButton.addEventListener("click", async () => {
    if (!onConfirm) return;

    await onConfirm();
    close();
  });

  return { open, close };
}
