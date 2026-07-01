import { ROUTES, navigateTo } from "../router.js";
import { getErrorMessage } from "./messages.js";

export function handlePostDetailError(error) {
  alert(getErrorMessage(error, "게시글을 불러오지 못했습니다."));
  navigateTo(ROUTES.posts);
}

export function handleCommentError(error, commentList) {
  commentList.innerHTML = `
    <p class="form__helper">${getErrorMessage(error, "댓글을 불러오지 못했습니다.")}</p>
  `;
}