import { apiClient } from "@/api/client";
import type { ApiEnvelope, LikeResponse, Post, PostsPageData } from "@/types/domain";

export function getPosts(size = 20, cursor?: string | number | null) {
  const params = new URLSearchParams({ size: String(size) });
  if (cursor != null) params.set("cursor", String(cursor));
  return apiClient<ApiEnvelope<PostsPageData>>(`/posts?${params.toString()}`);
}

export function getPost(postId: string | number) {
  return apiClient<ApiEnvelope<Post>>(`/posts/${postId}`);
}

export function createPost(formData: FormData) {
  return apiClient<ApiEnvelope<Post>>("/posts", {
    method: "POST",
    body: formData,
  });
}

export function updatePost(postId: string | number, formData: FormData) {
  return apiClient<ApiEnvelope<Post>>(`/posts/${postId}`, {
    method: "PUT",
    body: formData,
  });
}

export function deletePost(postId: string | number) {
  return apiClient<null>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export function savePostDraft(formData: FormData) {
  return apiClient<null>("/posts/drafts", {
    method: "PUT",
    body: formData,
  });
}

export function likePost(postId: string | number) {
  return apiClient<ApiEnvelope<LikeResponse>>(`/likes/posts/${postId}`, {
    method: "POST",
  });
}

export function unlikePost(postId: string | number) {
  return apiClient<ApiEnvelope<LikeResponse>>(`/likes/posts/${postId}`, {
    method: "DELETE",
  });
}
