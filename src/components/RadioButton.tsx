type RadioButtonProps = {
  checked: boolean;
};

export function RadioButton({ checked }: RadioButtonProps) {
  return (
    <span className={checked ? "radio-button is-checked" : "radio-button"} aria-hidden="true">
      {checked ? <span /> : null}
    </span>
  );
}
