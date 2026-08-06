import { Modal } from "@/components/Modal";

type PostDeleteModalProps = {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PostDeleteModal({ open, isLoading, onClose, onConfirm }: PostDeleteModalProps) {
  return (
    <Modal
      open={open}
      title="이 글을 삭제할까요?"
      description="삭제한 글은 되돌릴 수 없어요."
      confirmText="삭제하기"
      danger
      isLoading={isLoading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
