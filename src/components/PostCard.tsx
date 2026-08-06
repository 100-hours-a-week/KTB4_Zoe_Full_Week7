import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { votePost } from "@/api/posts";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { VoteCard } from "@/components/VoteCard";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { Post } from "@/types/domain";
import { countFormat, getPostId } from "@/utils/format";

function getWriter(post: Post) {
  return post.writer ?? {};
}

export function PostCard({ post }: { post: Post }) {
  const { authStatus } = useAuth();
  const [pollState, setPollState] = useState(post.poll);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(post.poll?.selected_option_id ?? null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const voteAction = useAsyncAction();
  const writer = getWriter(post);
  const postId = getPostId(post);
  const createdAt = post.created_at ?? post.createdAt ?? "";
  const likeCount = post.like_count ?? post.likeCount ?? 0;
  const commentCount = post.comment_count ?? post.commentCount ?? 0;
  const viewCount = post.view_count ?? post.viewCount ?? 0;
  const poll = pollState;
  const canShowResults = authStatus === "authenticated" && Boolean(poll?.has_voted && poll.result?.options.length);

  useEffect(() => {
    setPollState(post.poll);
    setSelectedOptionId(post.poll?.selected_option_id ?? null);
  }, [post.poll]);

  async function handleVoteSubmit(optionId?: number | string | null) {
    const nextOptionId = optionId == null ? selectedOptionId : Number(optionId);
    if (!poll || postId == null || nextOptionId == null || voteAction.isRunning) return;
    if (authStatus !== "authenticated") {
      setLoginPromptOpen(true);
      return;
    }

    await voteAction.run(async () => {
      const response = await votePost(postId, nextOptionId);
      setSelectedOptionId(response.data.selected_option_id);
      setPollState((currentPoll) =>
        currentPoll
          ? {
              ...currentPoll,
              has_voted: true,
              selected_option_id: response.data.selected_option_id,
              total_vote_count: response.data.result.total_vote_count,
              result: response.data.result,
            }
          : currentPoll,
      );
    });
  }

  return (
    <>
      <Link className="post-card" to={`/posts/${postId}`}>
        <div className="post-card-head">
          <Avatar src={writer.profile_image ?? writer.profileImage} nickname={writer.nickname} size="sm" />
          <div className="post-author">
            <strong>{writer.nickname ?? "사용자"}</strong>
            <span>{createdAt}</span>
          </div>
          {poll ? (
            <span className={`status-badge ${poll.has_voted ? "status-badge--completed" : "status-badge--unvoted"}`}>
              {poll.has_voted ? "투표완료" : "미참여"}
            </span>
          ) : null}
        </div>
        <h2>{post.title}</h2>
        <p>{post.content ?? ""}</p>
        {poll?.options.length ? (
          <VoteCard
            variant="list"
            showSubmit={!canShowResults}
            options={poll.options.map((option) => ({ id: option.option_id, label: option.content }))}
            selectedOptionId={canShowResults ? poll.selected_option_id : selectedOptionId}
            onSelect={(optionId) => setSelectedOptionId(Number(optionId))}
            onSubmit={handleVoteSubmit}
            onResultSelect={handleVoteSubmit}
            submitDisabled={selectedOptionId == null || voteAction.isRunning}
            submitLoading={voteAction.isRunning}
            results={canShowResults
              ? poll.result?.options.map((result) => ({
                  optionId: result.option_id,
                  voteRate: result.vote_rate,
                  voteCount: result.vote_count,
                }))
              : undefined}
          />
        ) : null}
        <div className="post-stats">
          <span><Icon name="heart" size="sm" /> {countFormat(likeCount)}</span>
          <span><Icon name="comment" size="sm" /> {countFormat(commentCount)}</span>
          <span><Icon name="eye" size="sm" /> {countFormat(viewCount)}</span>
          {poll ? (
            <strong><Icon name="participationActive" size="sm" /> {countFormat(poll.total_vote_count)}명 참여</strong>
          ) : null}
        </div>
      </Link>
      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </>
  );
}
