import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  danger?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

export function Modal({
  open,
  title,
  description,
  confirmText = "확인",
  danger = false,
  isLoading = false,
  onClose,
  onConfirm,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal" role="presentation">
      <button className="modal-backdrop" aria-label="모달 닫기" onClick={onClose} />
      <section
        className={`modal-panel ${danger ? "modal-panel--danger" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {danger ? (
          <div className="modal-icon-badge" aria-hidden="true">
            <Icon name="deleteModal" size="xl" />
          </div>
        ) : null}
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-description">{description}</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          {onConfirm ? (
            <Button
              variant={danger ? "danger" : "primary"}
              isLoading={isLoading}
              loadingLabel={`${confirmText} 처리 중`}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
