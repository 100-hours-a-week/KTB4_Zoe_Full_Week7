/** 인풋 유효성 검사 결과에 따라 버튼 상태를 업데이트하는 유틸 함수 */
export function bindInputsToButton(inputs, button, validator) {
  function defaultValidator() {
    return inputs.every((input) => input.value.trim());
  }

  function updateButtonState() {
    const isValid = validator ? validator() : defaultValidator();

    button.disabled = !isValid;
  }

  inputs.forEach((input) => {
    input.addEventListener("input", updateButtonState);
  });

  updateButtonState();

  return updateButtonState;
}