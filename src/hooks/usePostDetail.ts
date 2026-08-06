import { useCallback, useEffect, useState } from "react";
import { getPost } from "@/api/posts";
import type { Post } from "@/types/domain";

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPost = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPost(postId);
      setPost(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return {
    post,
    setPost,
    isLoading,
    error,
    loadPost,
  };
}
