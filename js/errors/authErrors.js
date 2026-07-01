import { showHelper } from "../utils/helperText.js";
import { getErrorMessage } from "./messages.js";

export function handleLoginError(error, { passwordHelper }) {
  if (error.status === 401 || error.message === "authentication_failed") {
    showHelper(passwordHelper, "아이디 또는 비밀번호를 확인해주세요");
    return;
  }

  if (error.message === "validation_failed" && error.data) {
    alert(Object.values(error.data).join("\n"));
    return;
  }

  alert(getErrorMessage(error, "로그인 중 오류가 발생했습니다."));
}

export function handleSignupError(error, helpers) {
  const { emailHelper, nicknameHelper, passwordHelper } = helpers;

  if (error.message === "email_already_exists") {
    showHelper(emailHelper, getErrorMessage(error));
    return;
  }

  if (error.message === "nickname_already_exists") {
    showHelper(nicknameHelper, getErrorMessage(error));
    return;
  }

  if (error.message === "validation_failed" && error.data) {
    if (error.data.email) showHelper(emailHelper, error.data.email);
    if (error.data.nickname) showHelper(nicknameHelper, error.data.nickname);
    if (error.data.password) showHelper(passwordHelper, error.data.password);
    return;
  }

  alert(getErrorMessage(error, "회원가입 중 오류가 발생했습니다."));
}
