import { Avatar } from "@/components/Avatar";
import type { Comment, CurrentUser } from "@/types/domain";

type CommentItemProps = {
  comment: Comment;
  currentUser: CurrentUser | null;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
};

export function CommentItem({ comment, currentUser, onEdit, onDelete }: CommentItemProps) {
  const commentUserId = comment.user_id ?? comment.userId;
  const canEdit = currentUser?.userId != null && commentUserId === currentUser.userId;

  return (
    <article className="comment-row">
      <Avatar src={comment.profile_image ?? comment.profileImage} nickname={comment.nickname} />
      <div className="comment-bubble">
        <div className="comment-meta">
          <strong>{comment.nickname ?? "사용자"}</strong>
          <span>{comment.created_at ?? comment.createdAt ?? ""}</span>
          {canEdit ? (
            <span className="comment-actions">
              <button type="button" onClick={() => onEdit(comment)}>수정</button>
              <button type="button" onClick={() => onDelete(comment)}>삭제</button>
            </span>
          ) : null}
        </div>
        <p>{comment.content}</p>
      </div>
    </article>
  );
}
