//helperText 보이기 , 숨기기 함수

export function showHelper(helper, message) {
  helper.textContent = `*${message}`;
  helper.hidden = false;
}

export function hideHelper(helper) {
  helper.textContent = "";
  helper.hidden = true;
}