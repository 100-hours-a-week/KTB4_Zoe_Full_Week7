import { apiClient } from "../api/client.js";
import { ROUTES, navigateTo } from "../router.js";
import { createFormData } from "../utils/formData.js";
import { validateEmail, validateNickname, validatePassword, validatePasswordConfirm, validateProfileImage } from "../utils/validators.js";
import { validateField } from "../utils/validateField.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { handleSignupError } from "../errors/authErrors.js";
import { renderHeader } from "../components/Header.js";

renderHeader({
  backHref: "../index.html",
  backLabel: "이전 페이지로 이동",
});

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("password-confirm");
const nicknameInput = document.getElementById("nickname");

const profileImageInput = document.getElementById("profile-image");
const profilePlaceholder = document.getElementById("profile-placeholder");
const preview = document.getElementById("profile-preview");

const emailHelper = document.getElementById("email-helper");
const passwordHelper = document.getElementById("password-helper");
const passwordConfirmHelper = document.getElementById("passwordConfirm-helper");
const nicknameHelper = document.getElementById("nickname-helper");
const profileHelper = document.getElementById("profile-helper");

const signupButton = document.getElementById("signup-button");
const signupForm = document.getElementById("signup-form");

//유효성검사 필드 객체
const fields = {
  email: {
    input: emailInput,
    helper: emailHelper,
    validator: () => validateEmail(emailInput.value),
  },
  password: {
    input: passwordInput,
    helper: passwordHelper,
    validator: () => validatePassword(passwordInput.value),
  },
  passwordConfirm: {
    input: passwordConfirmInput,
    helper: passwordConfirmHelper,
    validator: () =>
      validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value),
  },
  nickname: {
    input: nicknameInput,
    helper: nicknameHelper,
    validator: () => validateNickname(nicknameInput.value),
  },
  profileImage: {
    input: profileImageInput,
    helper: profileHelper,
    validator: () => validateProfileImage(profileImageInput.files[0]),
  },
};

//모든 필드에 대해 유효성 검사하는 함수
function validateSignupForm() {
  return Object.values(fields).every((field) => validateField(field));
}

//전체 유효성검사 통과여부 확인
function isSignupFormValid() {
  return Object.values(fields).every((field) => !field.validator());
}

//각 필드에 대한 유효성 검사 후 helper text 상태 업데이트
Object.values(fields).forEach((field) => {
  field.input.addEventListener("blur", () => {
    validateField(field);
    updateSignupButtonState();
  });
});

// 유효성 검사 후 버튼 상태 업데이트
const updateSignupButtonState = bindInputsToButton(
  [emailInput, passwordInput, passwordConfirmInput, nicknameInput],
  signupButton,
  isSignupFormValid
);


passwordInput.addEventListener("input", () => {
  updateSignupButtonState();

  if (passwordConfirmInput.value) {
    validateField(fields.passwordConfirm);
  }
});

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];

  if (!file) {
    preview.hidden = true;
    profilePlaceholder.hidden = false;
    validateField(fields.profileImage);
    updateSignupButtonState();
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  profileHelper.hidden = true;
  profilePlaceholder.hidden = true;

  validateField(fields.profileImage);
  updateSignupButtonState();
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateSignupForm()) {
        updateSignupButtonState();
        return;
    }

    const formData = createFormData({
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        nickname: nicknameInput.value.trim(),
        profileImage: profileImageInput.files[0],
    });

    try {
        await apiClient("/auth/signup", "POST", formData);
        navigateTo(ROUTES.login);
    } catch (error) {
        handleSignupError(error, {
            emailHelper,
            nicknameHelper,
            passwordHelper,
        });
        updateSignupButtonState();
    }
});
