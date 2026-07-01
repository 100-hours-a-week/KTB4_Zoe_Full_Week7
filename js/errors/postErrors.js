import { showHelper } from "../utils/helperText.js";
import { getErrorMessage } from "./messages.js";

export function handleCreatePostError(error, { postHelper, updateButtonState }) {
  if (error.message === "validation_failed" && error.data) {
    const message = Object.values(error.data).join("\n");

    if (postHelper) {
      showHelper(postHelper, message);
    } else {
      alert(message);
    }

    updateButtonState();
    return;
  }

  alert(getErrorMessage(error, "게시글 작성 중 오류가 발생했습니다."));
  updateButtonState();
}
