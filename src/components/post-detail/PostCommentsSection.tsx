import type React from "react";
import { useState } from "react";
import { createComment, deleteComment, updateComment } from "@/api/comments";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { CommentItem } from "@/components/CommentItem";
import { CommentListSkeleton } from "@/components/skeletons/Skeletons";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { usePostComments } from "@/hooks/usePostComments";
import { useAuth } from "@/contexts/AuthContext";
import type { Comment, CurrentUser } from "@/types/domain";

type PostCommentsSectionProps = {
  postId: string;
  commentCount?: number;
  currentUser: CurrentUser | null;
  onRequireAuth: () => boolean;
  onCommentCountChange: (delta: number) => void;
};

export function PostCommentsSection({
  postId,
  commentCount,
  currentUser,
  onRequireAuth,
  onCommentCountChange,
}: PostCommentsSectionProps) {
  const { authStatus, user } = useAuth();
  const {
    comments,
    sentinelRef,
    isLoading,
    showLoading,
    showNextLoading,
    error,
    loadComments,
  } = usePostComments(postId);
  const [commentInput, setCommentInput] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const commentAction = useAsyncAction();
  const deleteAction = useAsyncAction();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!commentInput.trim() || !onRequireAuth()) return;

    await commentAction.run(async () => {
      if (editingComment) {
        await updateComment(editingComment.comment_id ?? editingComment.id ?? "", commentInput.trim());
        setEditingComment(null);
      } else {
        await createComment(postId, commentInput.trim());
        onCommentCountChange(1);
      }
      setCommentInput("");
      await loadComments(1, { showLoading: false });
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    await deleteAction.run(async () => {
      await deleteComment(deleteTarget.comment_id ?? deleteTarget.id ?? "");
      onCommentCountChange(-1);
      setDeleteTarget(null);
      await loadComments(1, { showLoading: false });
    });
  }

  return (
    <>
      <section className="comments-section">
        <h2>댓글 {commentCount ?? comments.length}</h2>
        {authStatus === "authenticated" ? (
          <form className="comment-form" onSubmit={handleSubmit}>
            <Avatar src={user?.profileImage} nickname={user?.nickname} />
            <textarea
              value={commentInput}
              placeholder="따뜻한 한마디를 남겨주세요"
              onChange={(event) => setCommentInput(event.target.value)}
            />
            <Button
              type="submit"
              disabled={!commentInput.trim() || commentAction.isRunning}
              isLoading={commentAction.showLoading}
              loadingLabel="댓글 처리 중"
            >
              {editingComment ? "댓글 수정" : "등록"}
            </Button>
          </form>
        ) : (
          <section className="login-comment-prompt">
            <p>댓글을 남기려면 로그인이 필요해요</p>
            <button type="button" onClick={onRequireAuth}>
              로그인하고 댓글쓰기
            </button>
          </section>
        )}

        {showLoading ? <CommentListSkeleton /> : null}
        {!isLoading && error ? (
          <section className="error-state" role="alert">
            <p>{error}</p>
            <Button type="button" variant="ghost" onClick={() => loadComments(1)}>다시 시도</Button>
          </section>
        ) : null}
        {!isLoading && !error ? (
          <div className="comment-list">
            {comments.map((comment) => (
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                key={`${comment.comment_id ?? comment.id}`}
                onEdit={(target) => {
                  setEditingComment(target);
                  setCommentInput(target.content);
                }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : null}
        {showNextLoading ? <CommentListSkeleton count={1} /> : null}
        <div ref={sentinelRef} />
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 되돌릴 수 없어요."
        confirmText="삭제하기"
        danger
        isLoading={deleteAction.showLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
