import { renderHeader } from "../components/Header.js";
import { apiClient } from "../api/client.js";
import { showToast } from "../components/Toast.js";
import { handlePasswordEditError } from "../errors/passwordErrors.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { validateField } from "../utils/validateField.js";
import { validatePassword, validatePasswordConfirm } from "../utils/validators.js";

renderHeader({
  backHref: "./posts.html",
  backLabel: "게시글 목록으로 이동",
  showProfile: true,
});

const passwordEditForm = document.getElementById("password-edit-form");
const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("password-confirm");
const passwordHelper = document.getElementById("password-helper");
const passwordConfirmHelper = document.getElementById("password-confirm-helper");
const passwordEditButton = document.getElementById("password-edit-button");
const passwordToast = document.getElementById("password-toast");

const fields = {
  password: {
    input: passwordInput,
    helper: passwordHelper,
    validator: () => validatePassword(passwordInput.value),
  },
  passwordConfirm: {
    input: passwordConfirmInput,
    helper: passwordConfirmHelper,
    validator: () => validatePasswordConfirm(passwordInput.value, passwordConfirmInput.value),
  },
};

function validatePasswordEditForm() {
  return Object.values(fields).every((field) => validateField(field));
}

function isPasswordEditFormValid() {
  return Object.values(fields).every((field) => !field.validator());
}

const updatePasswordEditButtonState = bindInputsToButton(
  [passwordInput, passwordConfirmInput],
  passwordEditButton,
  isPasswordEditFormValid
);

Object.values(fields).forEach((field) => {
  field.input.addEventListener("blur", () => {
    validateField(field);
    updatePasswordEditButtonState();
  });
});

passwordEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validatePasswordEditForm()) {
    updatePasswordEditButtonState();
    return;
  }

  try {
    await apiClient("/auth/password", "PUT", {
      password: passwordInput.value.trim(),
    });

    passwordEditForm.reset();
    updatePasswordEditButtonState();
    showToast("수정 완료", { toast: passwordToast });
  } catch (error) {
    handlePasswordEditError(error, {
      passwordHelper,
      passwordConfirmHelper,
    });
    updatePasswordEditButtonState();
  }
});
