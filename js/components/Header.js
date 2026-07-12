import { BASE_URL } from "../config.js";
import { ROUTES, navigateTo } from "../router.js";
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

  return `
    <a${id} class="site-header__back" href="${escapeHtml(backHref)}" aria-label="${escapeHtml(backLabel)}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    </a>
  `;
}

function getProfileMarkup({ showProfile, showProfileMenu }) {
  if (!showProfile) return "";

  const user = getCurrentUser();
  if (!user.userId) {
    return `
      <nav class="site-header__auth" aria-label="회원 메뉴">
        <a class="site-header__auth-link" href="${ROUTES.login}">로그인</a>
        <a class="site-header__auth-link site-header__auth-link--primary" href="${ROUTES.signup}">회원가입</a>
      </nav>
    `;
  }

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
        <div class="profile-menu__header">
          ${avatar}
          <div>
            <div class="profile-menu__header-name">${escapeHtml(user.nickname || "사용자")}</div>
            <div class="profile-menu__header-email">${escapeHtml(user.email || "")}</div>
          </div>
        </div>
        <a class="profile-menu__link" href="${ROUTES.mypage}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
          마이페이지
        </a>
        <a class="profile-menu__link" href="${ROUTES.profileEdit}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          정보 수정
        </a>
        <a class="profile-menu__link profile-menu__link--muted" href="${ROUTES.login}" data-header-logout>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>
          로그아웃
        </a>
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
  showSearch = true,
} = {}) {
  if (!root) return;

  root.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        <div class="site-header__leading">
          ${getBackMarkup({ backHref, backLabel, backId })}
          <a class="site-header__brand" href="${ROUTES.posts}" aria-label="Votle 게시글 목록">
            <span class="site-header__logo" aria-hidden="true"></span>
            <span>Votle</span>
          </a>
        </div>
        <div class="site-header__actions">
          ${showSearch ? `
            <form class="site-header__search" role="search" data-header-search>
              <button class="site-header__search-submit" type="submit" aria-label="검색">
                <svg class="site-header__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </button>
              <input class="site-header__search-input" type="search" name="q" placeholder="검색" aria-label="게시글 검색" />
            </form>
          ` : ""}
          ${getProfileMarkup({ showProfile, showProfileMenu })}
        </div>
      </div>
    </header>
  `;

  root.querySelector("[data-header-logout]")?.addEventListener("click", () => {
    clearCurrentUser();
  });

  const searchForm = root.querySelector("[data-header-search]");
  const searchInput = searchForm?.querySelector('input[name="q"]');
  const currentQuery = new URLSearchParams(window.location.search).get("q");

  if (searchInput && currentQuery) searchInput.value = currentQuery;

  function submitSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) navigateTo(ROUTES.search(query));
  }

  searchForm?.addEventListener("submit", submitSearch);
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitSearch(event);
  });
}
