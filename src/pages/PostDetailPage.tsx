import { useCallback, useState } from "react";
import { deletePost } from "@/api/posts";
import { Button } from "@/components/Button";
import { Layout } from "@/components/Layout";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { PostCommentsSection } from "@/components/post-detail/PostCommentsSection";
import { PostDeleteModal } from "@/components/post-detail/PostDeleteModal";
import { PostDetailHeader } from "@/components/post-detail/PostDetailHeader";
import { PostLikeControl } from "@/components/post-detail/PostLikeControl";
import { VoteCard } from "@/components/VoteCard";
import { PostDetailSkeleton } from "@/components/skeletons/Skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { usePostDetail } from "@/hooks/usePostDetail";
import { usePostLike } from "@/hooks/usePostLike";
import { usePollVote } from "@/hooks/usePollVote";
import type { Poll } from "@/types/domain";
import { useNavigate, useParams } from "react-router-dom";
import { getAssetUrl } from "@/utils/format";

function getWriterId(post: { writer?: { user_id?: number; id?: number }; user_id?: number; userId?: number; author_id?: number; authorId?: number }) {
  return post.writer?.user_id ?? post.writer?.id ?? post.user_id ?? post.userId ?? post.author_id ?? post.authorId;
}

export function PostDetailPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const { authStatus, user } = useAuth();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [deletePostOpen, setDeletePostOpen] = useState(false);
  const deleteAction = useAsyncAction();
  const { post, setPost, isLoading: isPostLoading, error: postError, loadPost } = usePostDetail(postId);
  const showPostSkeleton = useDelayedLoading(isPostLoading);

  const requireAuth = useCallback(() => {
    if (authStatus === "authenticated") return true;
    if (authStatus === "guest") setLoginPromptOpen(true);
    return false;
  }, [authStatus]);

  const { likeCount, isLiked, toggleLike, isRunning: isLikeRunning, showLoading: showLikeLoading } = usePostLike({
    postId,
    post,
    setPost,
    requireAuth,
  });
  const handlePollSuccess = useCallback((nextPoll: Poll) => {
    setPost((currentPost) => currentPost ? { ...currentPost, poll: nextPoll } : currentPost);
  }, [setPost]);
  const {
    poll,
    selectedOptionId,
    setSelectedOptionId,
    canShowResults,
    vote,
    isRunning: isVoteRunning,
  } = usePollVote({
    postId,
    poll: post?.poll,
    authStatus,
    requireAuth,
    onSuccess: handlePollSuccess,
  });

  const updateCommentCount = useCallback((delta: number) => {
    setPost((currentPost) => {
      if (!currentPost) return currentPost;
      const nextCommentCount = Math.max((currentPost.comment_count ?? currentPost.commentCount ?? 0) + delta, 0);
      return {
        ...currentPost,
        comment_count: nextCommentCount,
        commentCount: nextCommentCount,
      };
    });
  }, [setPost]);

  const handleDeletePost = async () => {
    await deleteAction.run(async () => {
      await deletePost(postId);
      navigate("/posts");
    });
  };

  const writerId = post ? getWriterId(post) : undefined;
  const isOwner = Boolean(user?.userId && writerId === user.userId);
  const viewCount = post?.view_count ?? post?.viewCount ?? 0;

  return (
    <Layout narrow>
      <section className="detail-section">
        {showPostSkeleton ? <PostDetailSkeleton /> : null}
        {!isPostLoading && postError ? (
          <section className="error-state" role="alert">
            <p>{postError}</p>
            <Button type="button" variant="ghost" onClick={loadPost}>다시 시도</Button>
          </section>
        ) : null}
        {!isPostLoading && post ? (
          <div className="detail-card-layout">
            <article className="detail-card">
              <PostDetailHeader post={post} isOwner={isOwner} onDelete={() => setDeletePostOpen(true)} />

              <h1>{post.title}</h1>
              <p className="detail-content">{post.content}</p>
              {(post.image_urls ?? post.imageUrls ?? []).map((imageUrl) => (
                <img className="detail-image" src={getAssetUrl(imageUrl)} alt="" key={imageUrl} />
              ))}

              {poll?.options.length ? (
                <VoteCard
                  options={poll.options.map((option) => ({ id: option.option_id, label: option.content }))}
                  selectedOptionId={canShowResults ? poll.selected_option_id : selectedOptionId}
                  onSelect={(optionId) => setSelectedOptionId(Number(optionId))}
                  onSubmit={vote}
                  onResultSelect={vote}
                  submitDisabled={selectedOptionId == null || isVoteRunning}
                  submitLoading={isVoteRunning}
                  participationCount={poll.total_vote_count}
                  viewCount={viewCount}
                  showSubmit={!canShowResults}
                  results={canShowResults
                    ? poll.result?.options.map((result) => ({
                        optionId: result.option_id,
                        voteRate: result.vote_rate,
                        voteCount: result.vote_count,
                      }))
                    : undefined}
                />
              ) : null}

              <PostCommentsSection
                postId={postId}
                commentCount={post.comment_count ?? post.commentCount}
                currentUser={user}
                onRequireAuth={requireAuth}
                onCommentCountChange={updateCommentCount}
              />
            </article>

            <PostLikeControl
              likeCount={likeCount}
              isLiked={isLiked}
              isRunning={isLikeRunning}
              showLoading={showLikeLoading}
              onLike={toggleLike}
            />
          </div>
        ) : null}
      </section>

      <PostDeleteModal
        open={deletePostOpen}
        isLoading={deleteAction.showLoading}
        onClose={() => setDeletePostOpen(false)}
        onConfirm={handleDeletePost}
      />
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </Layout>
  );
}
