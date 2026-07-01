import { apiClient } from "./client.js";

export function createComment(postId, content, parentId = null) {
  return apiClient(`/comments/posts/${postId}`, "POST", {
    content,
    parent_id: parentId,
  });
}

export function getComments(postId, page = 1, size = 20) {
  return apiClient(`/comments/posts/${postId}?page=${page}&size=${size}`);
}

export function updateComment(commentId, content) {
  return apiClient(`/comments/${commentId}`, "PUT", {
    content,
  });
}

export function deleteComment(commentId) {
  return apiClient(`/comments/${commentId}`, "DELETE");
}