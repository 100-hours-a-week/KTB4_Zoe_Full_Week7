import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deletePost,
  getPost,
  likePost,
  unlikePost,
} from "@/api/posts";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/api/comments";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { CommentItem } from "@/components/CommentItem";
import { Icon } from "@/components/Icon";
import { Layout } from "@/components/Layout";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { Modal } from "@/components/Modal";
import { CommentListSkeleton, PostDetailSkeleton } from "@/components/skeletons/Skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Comment, Post } from "@/types/domain";
import { countFormat, getAssetUrl, getPostId } from "@/utils/format";
import { savePostForEdit } from "@/utils/postEditStorage";

const COMMENT_PAGE_SIZE = 20;

type LoadCommentsOptions = {
  append?: boolean;
  showLoading?: boolean;
};

function getWriterId(post: Post) {
  return post.writer?.user_id ?? post.writer?.id ?? post.user_id ?? post.userId ?? post.author_id ?? post.authorId;
}

export function PostDetailPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const { authStatus, user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(0);
  const [hasNextComment, setHasNextComment] = useState(true);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(true);
  const [isNextCommentLoading, setIsNextCommentLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<"post" | Comment | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const showPostSkeleton = useDelayedLoading(isPostLoading);
  const showCommentSkeleton = useDelayedLoading(isCommentLoading);
  const showNextCommentSkeleton = useDelayedLoading(isNextCommentLoading);
  const likeAction = useAsyncAction();
  const commentAction = useAsyncAction();
  const deleteAction = useAsyncAction();

  const loadComments = useCallback(async (page = 1, options: LoadCommentsOptions = {}) => {
    const { append = false, showLoading = true } = options;
    if (append) setIsNextCommentLoading(true);
    else if (showLoading) setIsCommentLoading(true);
    if (showLoading) setCommentError("");

    try {
      const response = await getComments(postId, page, COMMENT_PAGE_SIZE);
      setComments((prev) => (append ? [...prev, ...response.data.comments] : response.data.comments));
      setCommentPage(response.data.pagination.page ?? page);
      setHasNextComment(Boolean(response.data.pagination.has_next));
    } catch (error) {
      if (!append && showLoading) {
        setCommentError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
      }
    } finally {
      if (append) setIsNextCommentLoading(false);
      else if (showLoading) setIsCommentLoading(false);
    }
  }, [postId]);

  const loadDetail = useCallback(async () => {
    setIsPostLoading(true);
    setPostError("");

    const [postResult] = await Promise.allSettled([
      getPost(postId),
      loadComments(1),
    ]);

    if (postResult.status === "fulfilled") {
      setPost(postResult.value.data);
    } else {
      setPostError(postResult.reason instanceof Error ? postResult.reason.message : "게시글을 불러오지 못했습니다.");
    }
    setIsPostLoading(false);
  }, [loadComments, postId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useInfiniteScroll(
    sentinelRef,
    () => {
      if (hasNextComment && !isNextCommentLoading) loadComments(commentPage + 1, { append: true });
    },
    hasNextComment && !isCommentLoading,
  );

  const writer = post?.writer ?? {};
  const isOwner = Boolean(user?.userId && post && getWriterId(post) === user.userId);
  const likeCount = post?.like_count ?? post?.likeCount ?? 0;
  const isLiked = Boolean(post?.is_liked ?? post?.liked);

  function requireAuth() {
    if (authStatus === "authenticated") return true;
    if (authStatus === "guest") setLoginPromptOpen(true);
    return false;
  }

  function updateCommentCount(delta: number) {
    setPost((prev) => {
      if (!prev) return prev;
      const nextCommentCount = Math.max((prev.comment_count ?? prev.commentCount ?? comments.length) + delta, 0);
      return {
        ...prev,
        comment_count: nextCommentCount,
        commentCount: nextCommentCount,
      };
    });
  }

  async function handleLike() {
    if (!post || likeAction.isRunning || !requireAuth()) return;

    const previousPost = post;
    const nextLiked = !isLiked;
    const nextLikeCount = Math.max(likeCount + (nextLiked ? 1 : -1), 0);
    setPost({
      ...post,
      is_liked: nextLiked,
      liked: nextLiked,
      like_count: nextLikeCount,
      likeCount: nextLikeCount,
    });

    await likeAction.run(async () => {
      try {
        const response = isLiked ? await unlikePost(postId) : await likePost(postId);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                is_liked: response.data.is_liked ?? response.data.liked ?? nextLiked,
                liked: response.data.is_liked ?? response.data.liked ?? nextLiked,
                like_count: response.data.like_count ?? response.data.likeCount ?? nextLikeCount,
                likeCount: response.data.like_count ?? response.data.likeCount ?? nextLikeCount,
              }
            : prev,
        );
      } catch {
        setPost(previousPost);
      }
    });
  }

  async function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!commentInput.trim() || !requireAuth()) return;

    await commentAction.run(async () => {
      if (editingComment) {
        await updateComment(editingComment.comment_id ?? editingComment.id ?? "", commentInput.trim());
        setEditingComment(null);
      } else {
        await createComment(postId, commentInput.trim());
        updateCommentCount(1);
      }
      setCommentInput("");
      await loadComments(1, { showLoading: false });
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    await deleteAction.run(async () => {
      if (deleteTarget === "post") {
        await deletePost(postId);
        navigate("/posts");
        return;
      }

      await deleteComment(deleteTarget.comment_id ?? deleteTarget.id ?? "");
      updateCommentCount(-1);
      setDeleteTarget(null);
      await loadComments(1, { showLoading: false });
    });
  }

  return (
    <Layout narrow>
      <section className="detail-section">
        {showPostSkeleton ? <PostDetailSkeleton /> : null}
        {!isPostLoading && postError ? (
          <section className="error-state" role="alert">
            <p>{postError}</p>
            <Button type="button" variant="ghost" onClick={loadDetail}>다시 시도</Button>
          </section>
        ) : null}
        {!isPostLoading && post ? (
          <>
            <article className="detail-card">
              <header className="detail-author">
                <Avatar src={writer.profile_image ?? writer.profileImage} nickname={writer.nickname} size="lg" />
                <div>
                  <strong>{writer.nickname ?? "사용자"}</strong>
                  <span>{post.created_at ?? post.createdAt ?? ""}</span>
                </div>
                <div className="detail-actions">
                  <button className="detail-menu-trigger" type="button" aria-label="게시글 메뉴">
                    <Icon name="more" size="lg" />
                  </button>
                  {isOwner ? (
                    <div className="detail-menu-panel">
                      <Link
                        to={`/posts/${getPostId(post)}/edit`}
                        state={{ post }}
                        onClick={() => savePostForEdit(post)}
                      >
                        <Icon name="edit" size="sm" />
                        수정
                      </Link>
                      <button type="button" onClick={() => setDeleteTarget("post")}>
                        <Icon name="trash" size="sm" />
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>
              </header>

              <h1>{post.title}</h1>
              <p className="detail-content">{post.content}</p>
              {(post.image_urls ?? post.imageUrls ?? []).map((imageUrl) => (
                <img className="detail-image" src={getAssetUrl(imageUrl)} alt="" key={imageUrl} />
              ))}

              <section className="vote-result" aria-label="투표 결과">
                <div className="vote-result-head">
                  <strong>최종 결과</strong>
                  <span>마감됨</span>
                </div>
                {[
                  ["코랄 핑크", 46, true],
                  ["민트 그린", 33, false],
                  ["투명 글리터", 21, false],
                ].map(([label, percent, active]) => (
                  <div className="vote-option" key={String(label)}>
                    <div>
                      <strong className={active ? "active" : ""}>
                        {active ? <Icon name="check" size="sm" /> : null}
                        {label}
                      </strong>
                      <b>{percent}%</b>
                    </div>
                    <span>
                      <i style={{ width: `${percent}%` }} />
                    </span>
                  </div>
                ))}
                <p>총 340명 참여 · 2026년 7월 11일 마감</p>
              </section>

              <div className="like-row">
                <Button
                  type="button"
                  variant="ghost"
                  isLoading={likeAction.showLoading}
                  loadingLabel="좋아요 처리 중"
                  onClick={handleLike}
                  aria-label={`좋아요 ${countFormat(likeCount)}개`}
                  aria-pressed={isLiked}
                  className={isLiked ? "like-button like-button--liked" : "like-button"}
                >
                  <Icon name={isLiked ? "heartDetailFilled" : "heartDetail"} size="lg" />
                  {countFormat(likeCount)}
                </Button>
              </div>

              <section className="comments-section">
                <h2>댓글 {post.comment_count ?? post.commentCount ?? comments.length}</h2>
                {authStatus === "authenticated" ? (
                  <form className="comment-form" onSubmit={handleCommentSubmit}>
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
                    <button type="button" onClick={() => setLoginPromptOpen(true)}>
                      로그인하고 댓글쓰기
                    </button>
                  </section>
                )}

                {showCommentSkeleton ? <CommentListSkeleton /> : null}
                {!isCommentLoading && commentError ? (
                  <section className="error-state" role="alert">
                    <p>{commentError}</p>
                    <Button type="button" variant="ghost" onClick={() => loadComments(1)}>다시 시도</Button>
                  </section>
                ) : null}
                {!isCommentLoading && !commentError ? (
                  <div className="comment-list">
                    {comments.map((comment) => (
                      <CommentItem
                        comment={comment}
                        currentUser={user}
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
                {showNextCommentSkeleton ? <CommentListSkeleton count={1} /> : null}
                <div ref={sentinelRef} />
              </section>
            </article>
          </>
        ) : null}
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        title={deleteTarget === "post" ? "이 글을 삭제할까요?" : "댓글을 삭제할까요?"}
        description={deleteTarget === "post" ? "삭제한 글과 투표 결과는 되돌릴 수 없어요." : "삭제한 댓글은 되돌릴 수 없어요."}
        confirmText="삭제하기"
        danger
        isLoading={deleteAction.showLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </Layout>
  );
}
