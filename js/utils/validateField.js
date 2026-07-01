/** 필드가 유효성검사를 통과했는지 여부 boolean을 return하는 함수*/

import { showHelper, hideHelper } from "./helperText.js";

export function validateField({helper, validator }) {
  const error = validator();

  if (error) {
    showHelper(helper, error);
    return false;
  }

  hideHelper(helper);
  return true;
}