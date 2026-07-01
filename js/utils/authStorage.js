const USER_ID_KEY = "user_id";
const NICKNAME_KEY = "nickname";
const EMAIL_KEY = "email";
const PROFILE_IMAGE_KEY = "profile_image";

export function saveCurrentUser(user) {
  if (!user) return;

  saveCurrentUserId(user.user_id ?? user.id);
  saveCurrentNickname(user.nickname);
  saveCurrentEmail(user.email);
  saveCurrentProfileImage(user.profile_image ?? user.profileImage);
}

export function saveCurrentUserId(userId) {
  if (userId == null) return;

  localStorage.setItem(USER_ID_KEY, String(userId));
}

export function saveCurrentNickname(nickname) {
  if (nickname == null) return;

  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function saveCurrentEmail(email) {
  if (email == null) return;

  localStorage.setItem(EMAIL_KEY, email);
}

export function saveCurrentProfileImage(profileImage) {
  if (profileImage == null) return;

  localStorage.setItem(PROFILE_IMAGE_KEY, profileImage);
}

export function getCurrentUser() {
  return {
    userId: getCurrentUserId(),
    nickname: getCurrentNickname(),
    email: getCurrentEmail(),
    profileImage: getCurrentProfileImage(),
  };
}

export function getCurrentUserId() {
  const userId = localStorage.getItem(USER_ID_KEY);

  return userId ? Number(userId) : null;
}

export function getCurrentNickname() {
  return localStorage.getItem(NICKNAME_KEY);
}

export function getCurrentEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getCurrentProfileImage() {
  return localStorage.getItem(PROFILE_IMAGE_KEY);
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(PROFILE_IMAGE_KEY);
}

export function clearCurrentUserId() {
  clearCurrentUser();
}

export function isOwner(ownerId) {
  const currentUserId = getCurrentUserId();

  return currentUserId !== null && currentUserId === Number(ownerId);
}
