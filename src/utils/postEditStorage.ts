import type { Post } from "@/types/domain";
import { getPostId } from "@/utils/format";

const POST_EDIT_STORAGE_PREFIX = "votle:post-edit:";

function getStorageKey(postId: string | number) {
  return `${POST_EDIT_STORAGE_PREFIX}${postId}`;
}

export function savePostForEdit(post: Post) {
  const postId = getPostId(post);
  if (!postId) return;
  sessionStorage.setItem(getStorageKey(postId), JSON.stringify(post));
}

export function getSavedPostForEdit(postId: string | number) {
  const storedPost = sessionStorage.getItem(getStorageKey(postId));
  if (!storedPost) return null;

  try {
    return JSON.parse(storedPost) as Post;
  } catch {
    sessionStorage.removeItem(getStorageKey(postId));
    return null;
  }
}

export function clearSavedPostForEdit(postId: string | number) {
  sessionStorage.removeItem(getStorageKey(postId));
}
