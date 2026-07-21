import { apiClient } from "@/api/client";
import type { ApiEnvelope, CommentsPageData } from "@/types/domain";

export function getComments(postId: string | number, page = 1, size = 20) {
  return apiClient<ApiEnvelope<CommentsPageData>>(
    `/comments/posts/${postId}?page=${page}&size=${size}`,
  );
}

export function createComment(postId: string | number, content: string, parentId: number | null = null) {
  return apiClient<unknown>(`/comments/posts/${postId}`, {
    method: "POST",
    body: { content, parent_id: parentId },
  });
}

export function updateComment(commentId: string | number, content: string) {
  return apiClient<unknown>(`/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });
}

export function deleteComment(commentId: string | number) {
  return apiClient<null>(`/comments/${commentId}`, {
    method: "DELETE",
  });
}
