import { BASE_URL } from "../config.js";
import { renderHeader } from "../components/Header.js";
import { getCurrentUser } from "../utils/authStorage.js";

renderHeader({
  showProfile: true,
  showProfileMenu: true,
});

const user = getCurrentUser();
const avatar = document.getElementById("mypage-avatar");
const nickname = document.getElementById("mypage-nickname");
const email = document.getElementById("mypage-email");

if (user.nickname) {
  nickname.textContent = user.nickname;
  avatar.textContent = user.nickname.slice(0, 1);
}

if (user.email) email.textContent = user.email;

if (user.profileImage) {
  const image = document.createElement("img");
  image.id = avatar.id;
  image.className = avatar.className;
  image.alt = `${user.nickname || "사용자"} 프로필 이미지`;
  image.src = user.profileImage.startsWith("http")
    ? user.profileImage
    : `${BASE_URL}${user.profileImage}`;
  avatar.replaceWith(image);
}
