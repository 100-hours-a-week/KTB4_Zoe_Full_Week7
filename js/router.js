export const ROUTES = {
  login: "/index.html",
  signup: "/pages/signup.html",
  posts: "/pages/posts.html",
  postDetail: (id) => `/pages/post-detail.html?id=${id}`,
  postCreate: "/pages/post-create.html",
  postEdit: (id) => `/pages/post-edit.html?id=${id}`,
  profileEdit: "/pages/profile-edit.html",
  passwordEdit: "/pages/password-edit.html",
};

export function navigateTo(route) {
  window.location.href = route;
}

export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}