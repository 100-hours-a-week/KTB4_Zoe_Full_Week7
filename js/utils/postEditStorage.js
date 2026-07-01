const POST_EDIT_DATA_KEY = "post_edit_data";

export function savePostEditData(post) {
  sessionStorage.setItem(POST_EDIT_DATA_KEY, JSON.stringify(post));
}

export function getPostEditData(postId) {
  const savedPost = sessionStorage.getItem(POST_EDIT_DATA_KEY);

  if (!savedPost) return null;

  const post = JSON.parse(savedPost);
  const savedPostId = post.post_id ?? post.id;

  if (String(savedPostId) !== String(postId)) return null;

  return post;
}

export function clearPostEditData() {
  sessionStorage.removeItem(POST_EDIT_DATA_KEY);
}
