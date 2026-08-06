import type { Dispatch, SetStateAction } from "react";
import { likePost, unlikePost } from "@/api/posts";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { Post } from "@/types/domain";

type UsePostLikeOptions = {
  postId: string;
  post: Post | null;
  setPost: Dispatch<SetStateAction<Post | null>>;
  requireAuth: () => boolean;
};

export function usePostLike({ postId, post, setPost, requireAuth }: UsePostLikeOptions) {
  const action = useAsyncAction();
  const likeCount = post?.like_count ?? post?.likeCount ?? 0;
  const isLiked = Boolean(post?.is_liked ?? post?.liked);

  async function toggleLike() {
    if (!post || action.isRunning || !requireAuth()) return;

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

    await action.run(async () => {
      try {
        const response = isLiked ? await unlikePost(postId) : await likePost(postId);
        setPost((currentPost) =>
          currentPost
            ? {
                ...currentPost,
                is_liked: response.data.is_liked ?? response.data.liked ?? nextLiked,
                liked: response.data.is_liked ?? response.data.liked ?? nextLiked,
                like_count: response.data.like_count ?? response.data.likeCount ?? nextLikeCount,
                likeCount: response.data.like_count ?? response.data.likeCount ?? nextLikeCount,
              }
            : currentPost,
        );
      } catch {
        setPost(previousPost);
      }
    });
  }

  return {
    likeCount,
    isLiked,
    toggleLike,
    isRunning: action.isRunning,
    showLoading: action.showLoading,
  };
}
