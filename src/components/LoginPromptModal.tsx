import { Link } from "react-router-dom";
import { Button } from "@/components/Button";

export function LoginPromptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="modal" role="presentation">
      <button className="modal-backdrop" aria-label="모달 닫기" onClick={onClose} />
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title">
        <h2 id="login-prompt-title" className="modal-title">
          로그인이 필요해요
        </h2>
        <p className="modal-description">로그인하고 Votle의 이야기에 참여해보세요.</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            다음에
          </Button>
          <Link className="button button--primary" to="/login">
            로그인
          </Link>
        </div>
      </section>
    </div>
  );
}
