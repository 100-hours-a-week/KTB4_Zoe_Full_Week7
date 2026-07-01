import { BASE_URL } from "../config.js";
import { clearCurrentUser, getCurrentUser } from "../utils/authStorage.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getProfileImageSrc(profileImage) {
  if (!profileImage) return "";
  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }

  return `${BASE_URL}${profileImage}`;
}

function getAvatarMarkup(user) {
  const nickname = user.nickname || "사용자";
  const profileImageSrc = getProfileImageSrc(user.profileImage);

  if (profileImageSrc) {
    return `<img class="avatar" src="${escapeHtml(profileImageSrc)}" alt="${escapeHtml(nickname)} 프로필 이미지" />`;
  }

  return `<span class="avatar">${escapeHtml(nickname[0] ?? "U")}</span>`;
}

function getBackMarkup({ backHref, backLabel, backId }) {
  if (!backHref) return "";

  const id = backId ? ` id="${escapeHtml(backId)}"` : "";

  return `<a${id} class="site-header__back" href="${escapeHtml(backHref)}" aria-label="${escapeHtml(backLabel)}">&lt;</a>`;
}

function getProfileMarkup({ showProfile, showProfileMenu }) {
  if (!showProfile) return "";

  const user = getCurrentUser();
  if (!user.userId) return "";

  const avatar = getAvatarMarkup(user);

  if (!showProfileMenu) {
    return `<div class="site-header__profile">${avatar}</div>`;
  }

  return `
    <div class="site-header__profile profile-menu">
      <button class="profile-menu__button" type="button" aria-label="프로필 메뉴 열기">
        ${avatar}
      </button>
      <nav class="profile-menu__panel" aria-label="프로필 메뉴">
        <a class="profile-menu__link" href="./profile-edit.html">회원정보수정</a>
        <a class="profile-menu__link" href="./password-edit.html">비밀번호수정</a>
        <a class="profile-menu__link" href="../index.html" data-header-logout>로그아웃</a>
      </nav>
    </div>
  `;
}

export function renderHeader({
  root = document.getElementById("header-root"),
  backHref = "",
  backLabel = "이전 페이지로 이동",
  backId = "",
  showProfile = false,
  showProfileMenu = false,
} = {}) {
  if (!root) return;

  root.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        ${getBackMarkup({ backHref, backLabel, backId })}
        <h1 class="site-header__title">아무 말 대잔치</h1>
        ${getProfileMarkup({ showProfile, showProfileMenu })}
      </div>
    </header>
  `;

  root.querySelector("[data-header-logout]")?.addEventListener("click", () => {
    clearCurrentUser();
  });
}
