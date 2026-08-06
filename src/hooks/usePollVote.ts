import { useEffect, useState } from "react";
import { votePost } from "@/api/posts";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { AuthStatus, Poll } from "@/types/domain";

type UsePollVoteOptions = {
  postId: string | number | undefined;
  poll?: Poll;
  authStatus: AuthStatus;
  requireAuth: () => boolean;
  onSuccess?: (poll: Poll) => void;
};

export function usePollVote({ postId, poll, authStatus, requireAuth, onSuccess }: UsePollVoteOptions) {
  const [pollState, setPollState] = useState<Poll | undefined>(poll);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(poll?.selected_option_id ?? null);
  const action = useAsyncAction();
  const canShowResults = authStatus === "authenticated"
    && Boolean(pollState?.has_voted && pollState.result?.options.length);

  useEffect(() => {
    setPollState(poll);
    setSelectedOptionId(poll?.selected_option_id ?? null);
  }, [poll]);

  async function vote(optionId?: number | string | null) {
    const nextOptionId = optionId == null ? selectedOptionId : Number(optionId);
    if (!pollState || postId == null || nextOptionId == null || action.isRunning || !requireAuth()) return;

    await action.run(async () => {
      const response = await votePost(postId, nextOptionId);
      const nextPoll: Poll = {
        ...pollState,
        has_voted: true,
        selected_option_id: response.data.selected_option_id,
        total_vote_count: response.data.result.total_vote_count,
        result: response.data.result,
      };
      setSelectedOptionId(response.data.selected_option_id);
      setPollState(nextPoll);
      onSuccess?.(nextPoll);
    });
  }

  return {
    poll: pollState,
    selectedOptionId,
    setSelectedOptionId,
    canShowResults,
    vote,
    isRunning: action.isRunning,
  };
}
