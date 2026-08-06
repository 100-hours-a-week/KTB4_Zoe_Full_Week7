import { useCallback, useEffect, useRef, useState } from "react";
import { getComments } from "@/api/comments";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Comment } from "@/types/domain";

const COMMENT_PAGE_SIZE = 20;

type LoadCommentsOptions = {
  append?: boolean;
  showLoading?: boolean;
};

export function usePostComments(postId: string) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(0);
  const [hasNextComment, setHasNextComment] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [error, setError] = useState("");
  const showLoading = useDelayedLoading(isLoading);
  const showNextLoading = useDelayedLoading(isNextLoading);

  const loadComments = useCallback(async (page = 1, options: LoadCommentsOptions = {}) => {
    const { append = false, showLoading: shouldShowLoading = true } = options;
    if (append) setIsNextLoading(true);
    else if (shouldShowLoading) setIsLoading(true);
    if (shouldShowLoading) setError("");

    try {
      const response = await getComments(postId, page, COMMENT_PAGE_SIZE);
      setComments((prev) => (append ? [...prev, ...response.data.comments] : response.data.comments));
      setCommentPage(response.data.pagination.page ?? page);
      setHasNextComment(Boolean(response.data.pagination.has_next));
    } catch (loadError) {
      if (!append && shouldShowLoading) {
        setError(loadError instanceof Error ? loadError.message : "댓글을 불러오지 못했습니다.");
      }
    } finally {
      if (append) setIsNextLoading(false);
      else if (shouldShowLoading) setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const loadNextComments = useCallback(() => {
    if (hasNextComment && !isNextLoading) {
      loadComments(commentPage + 1, { append: true });
    }
  }, [commentPage, hasNextComment, isNextLoading, loadComments]);

  useInfiniteScroll(sentinelRef, loadNextComments, hasNextComment && !isLoading);

  return {
    comments,
    sentinelRef,
    isLoading,
    isNextLoading,
    showLoading,
    showNextLoading,
    error,
    loadComments,
  };
}
