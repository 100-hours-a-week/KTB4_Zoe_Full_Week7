import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { votePost } from "@/api/posts";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { AuthStatus, Post } from "@/types/domain";

type UsePostVoteOptions = {
  postId: string;
  post: Post | null;
  authStatus: AuthStatus;
  setPost: Dispatch<SetStateAction<Post | null>>;
  requireAuth: () => boolean;
};

export function usePostVote({ postId, post, authStatus, setPost, requireAuth }: UsePostVoteOptions) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const action = useAsyncAction();
  const poll = post?.poll;
  const canShowResults = authStatus === "authenticated" && Boolean(poll?.has_voted && poll.result?.options.length);

  useEffect(() => {
    setSelectedOptionId(poll?.selected_option_id ?? null);
  }, [poll]);

  async function vote(optionId?: number | string | null) {
    const nextOptionId = optionId == null ? selectedOptionId : Number(optionId);
    if (!poll || nextOptionId == null || action.isRunning || !requireAuth()) return;

    await action.run(async () => {
      const response = await votePost(postId, nextOptionId);
      setSelectedOptionId(response.data.selected_option_id);
      setPost((currentPost) =>
        currentPost?.poll
          ? {
              ...currentPost,
              poll: {
                ...currentPost.poll,
                has_voted: true,
                selected_option_id: response.data.selected_option_id,
                total_vote_count: response.data.result.total_vote_count,
                result: response.data.result,
              },
            }
          : currentPost,
      );
    });
  }

  return {
    selectedOptionId,
    setSelectedOptionId,
    canShowResults,
    vote,
    isRunning: action.isRunning,
  };
}
