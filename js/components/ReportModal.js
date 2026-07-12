export function createReportModal() {
  const modal = document.createElement("div");
  modal.className = "confirm-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="confirm-modal__backdrop" data-modal-close></div>
    <section class="confirm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div class="confirm-modal__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
      </div>
      <h2 id="report-modal-title" class="confirm-modal__title">이 게시글을 신고할까요?</h2>
      <p class="confirm-modal__description">운영 정책을 위반한 게시글인지 확인 후 처리합니다.</p>
      <div class="confirm-modal__actions">
        <button class="confirm-modal__button confirm-modal__button--cancel" type="button" data-modal-close>취소</button>
        <button class="confirm-modal__button confirm-modal__button--danger" type="button" data-report-confirm>신고하기</button>
      </div>
    </section>
  `;

  document.body.append(modal);
  let onConfirm = null;

  function close() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    onConfirm = null;
  }

  function open({ onConfirm: nextOnConfirm } = {}) {
    onConfirm = nextOnConfirm;
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
  }

  modal.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", close);
  });

  modal.querySelector("[data-report-confirm]").addEventListener("click", async () => {
    if (onConfirm) await onConfirm();
    close();
  });

  return { open, close };
}
