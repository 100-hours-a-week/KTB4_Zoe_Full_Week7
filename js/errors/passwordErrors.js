import { showHelper } from "../utils/helperText.js";
import { getErrorMessage } from "./messages.js";

export function handlePasswordEditError(error, { passwordHelper, passwordConfirmHelper }) {
  if (error.message === "validation_failed" && error.data) {
    if (error.data.password) showHelper(passwordHelper, error.data.password);
    if (error.data.passwordConfirm) showHelper(passwordConfirmHelper, error.data.passwordConfirm);
    return;
  }

  alert(getErrorMessage(error, "비밀번호 수정 중 오류가 발생했습니다."));
}
