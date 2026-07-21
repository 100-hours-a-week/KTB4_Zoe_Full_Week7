import type { CurrentUser } from "@/types/domain";

const USER_ID_KEY = "user_id";
const NICKNAME_KEY = "nickname";
const EMAIL_KEY = "email";
const PROFILE_IMAGE_KEY = "profile_image";

export function saveCurrentUser(user: Partial<CurrentUser> & Record<string, unknown>) {
  const userId = user.userId ?? user.user_id ?? user.id;
  if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
  if (user.nickname != null) localStorage.setItem(NICKNAME_KEY, String(user.nickname));
  if (user.email != null) localStorage.setItem(EMAIL_KEY, String(user.email));
  const profileImage = user.profileImage ?? user.profile_image;
  if (profileImage != null) localStorage.setItem(PROFILE_IMAGE_KEY, String(profileImage));
}

export function getCurrentUser(): CurrentUser | null {
  const userId = localStorage.getItem(USER_ID_KEY);
  const nickname = localStorage.getItem(NICKNAME_KEY);
  const email = localStorage.getItem(EMAIL_KEY);

  if (!userId || !nickname || !email) return null;

  return {
    userId: Number(userId),
    nickname,
    email,
    profileImage: localStorage.getItem(PROFILE_IMAGE_KEY),
  };
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(PROFILE_IMAGE_KEY);
}
