import { apiClient } from "../api/client.js";
import { ROUTES, navigateTo } from "../router.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import { validateField } from "../utils/validateField.js";
import { bindInputsToButton } from "../utils/bindInputsToButton.js";
import { handleLoginError } from "../errors/authErrors.js";
import { saveCurrentUser } from "../utils/authStorage.js";
import { renderHeader } from "../components/Header.js";

renderHeader();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginForm = document.getElementById("login-form");

const emailHelper = document.getElementById("email-helper");
const passwordHelper = document.getElementById("password-helper");

const loginButton = document.getElementById("login-button");

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
  }
};

//모든 필드에 대해 유효성 검사하는 함수
function validateLoginForm() {
  return Object.values(fields).every((field) => validateField(field));
}

//전체 유효성검사 통과여부 확인
function isLoginFormValid() {
  return Object.values(fields).every((field) => !field.validator());
}

//유효성결과에 따른 버튼 활성화
const updateLoginButtonState = bindInputsToButton(
  [emailInput, passwordInput],
  loginButton,
  isLoginFormValid
);

//각 필드에 대한 유효성 검사 후 상태 업데이트
Object.values(fields).forEach((field) => {
  field.input.addEventListener("blur", () => {
    validateField(field);
    updateLoginButtonState();
  });
});

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!validateLoginForm()) {
        updateLoginButtonState();
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    try{
        const response = await apiClient("/auth/login", "POST", {email, password});
        console.log(response.data);
        saveCurrentUser(response.data);

        navigateTo(ROUTES.posts);

    } catch(error) {
        handleLoginError(error, { passwordHelper });
    }
   
});
