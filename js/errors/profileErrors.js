import { showHelper } from "../utils/helperText.js";
import { getErrorMessage } from "./messages.js";

function isDuplicateNicknameError(error) {
  return [
    "nickname_duplicated",
    "nickname_duplicate",
    "duplicate_nickname",
    "duplicated_nickname",
    "nickname_already_exists",
  ].includes(error.message);
}

export function handleProfileEditError(error, { nicknameHelper }) {
  if (isDuplicateNicknameError(error)) {
    showHelper(nicknameHelper, "중복된 닉네임 입니다.");
    return;
  }

  if (error.message === "validation_failed" && error.data?.nickname) {
    showHelper(nicknameHelper, error.data.nickname);
    return;
  }

  alert(getErrorMessage(error, "회원정보 수정 중 오류가 발생했습니다."));
}

export function handleWithdrawError(error) {
  alert(getErrorMessage(error, "회원 탈퇴 중 오류가 발생했습니다."));
}
