import { apiClient } from "../api/client.js";
import { createConfirmModal } from "../components/ConfirmModal.js";
import { BASE_URL } from "../config.js";
import { ROUTES, navigateTo } from "../router.js";
import { clearCurrentUserId, getCurrentUser, saveCurrentUser } from "../utils/authStorage.js";
import { createFormData } from "../utils/formData.js";
import { hideHelper, showHelper } from "../utils/helperText.js";
import { renderHeader } from "../components/Header.js";
import { handleProfileEditError, handleWithdrawError } from "../errors/profileErrors.js";
import { showToast } from "../components/Toast.js";

renderHeader({
  backHref: "./posts.html",
  backLabel: "게시글 목록으로 이동",
  showProfile: true,
  showProfileMenu: true
});

const profileEditForm = document.getElementById("profile-edit-form");
let profileAvatar = document.getElementById("profile-avatar");
const profileImageInput = document.getElementById("profile-image");
const profileEmail = document.getElementById("profile-email");
const nicknameInput = document.getElementById("nickname");
const nicknameHelper = document.getElementById("nickname-helper");
const updateButton = document.getElementById("profile-update-button");
const withdrawButton = document.getElementById("withdraw-button");
const toast = document.getElementById("profile-toast");


const confirmModal = createConfirmModal();
let previewObjectUrl = null;

function getProfileImageSrc(profileImage) {
  if (!profileImage) return "";
  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }

  return `${BASE_URL}${profileImage}`;
}

function fillProfileForm() {
  const user = getCurrentUser();

  profileEmail.textContent = user.email ?? "";
  nicknameInput.value = user.nickname ?? "";

  renderProfileAvatar({
    src: getProfileImageSrc(user.profileImage),
    nickname: user.nickname,
  });
}

function renderProfileAvatar({ src = "", nickname = "" }) {
  const nextProfileAvatar = src
    ? document.createElement("img")
    : document.createElement("span");

  nextProfileAvatar.id = "profile-avatar";
  nextProfileAvatar.className = "avatar avatar--large";

  if (src) {
    nextProfileAvatar.src = src;
    nextProfileAvatar.alt = `${nickname || "사용자"} 프로필 이미지`;
  } else {
    nextProfileAvatar.textContent = nickname?.[0] ?? "U";
  }

  profileAvatar.replaceWith(nextProfileAvatar);
  profileAvatar = nextProfileAvatar;
}

fillProfileForm();

function validateNickname() {
  const nickname = nicknameInput.value.trim();

  if (!nickname) return "닉네임을 입력해주세요.";
  if (nickname.length > 10) return "닉네임은 최대 10자 까지 작성 가능합니다.";

  return "";
}

profileEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

nicknameInput.addEventListener("input", () => {
  hideHelper(nicknameHelper);
});

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];

  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

  if (!file) {
    const user = getCurrentUser();
    renderProfileAvatar({
      src: getProfileImageSrc(user.profileImage),
      nickname: user.nickname,
    });
    return;
  }

  previewObjectUrl = URL.createObjectURL(file);
  renderProfileAvatar({
    src: previewObjectUrl,
    nickname: nicknameInput.value.trim(),
  });
});

updateButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const nicknameError = validateNickname();

  if (nicknameError) {
    showHelper(nicknameHelper, nicknameError);
    return;
  }

  try {
    const formData = createFormData({
      nickname: nicknameInput.value.trim(),
      profileImage: profileImageInput.files[0],
    });

    const response = await apiClient("/users", "PUT", formData);

    saveCurrentUser(response.data);
    renderProfileAvatar({
      src: getProfileImageSrc(response.data?.profile_image ?? response.data?.profileImage),
      nickname: response.data?.nickname ?? nicknameInput.value.trim(),
    });

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }

    hideHelper(nicknameHelper);
    showToast("수정 완료", { toast });
  } catch (error) {
    handleProfileEditError(error, { nicknameHelper });
  }
});

withdrawButton.addEventListener("click", () => {
  confirmModal.open({
    title: "회원탈퇴 하시겠습니까?",
    description: "작성된 게시글과 댓글은 삭제됩니다.",
    onConfirm: async () => {
      try {
        await apiClient("/users", "DELETE");
        clearCurrentUserId();
        navigateTo(ROUTES.login);
      } catch (error) {
        handleWithdrawError(error);
      }
    },
  });
});
