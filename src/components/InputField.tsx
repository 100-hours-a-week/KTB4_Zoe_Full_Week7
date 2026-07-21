import type React from "react";
import { Icon } from "@/components/Icon";

type InputFieldProps = {
  label: string;
  helper?: string;
  success?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function InputField({ label, helper, success, id, ...props }: InputFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="form-input" {...props} />
      {helper ? <p className="helper helper--error">{helper}</p> : null}
      {!helper && success ? (
        <p className="helper helper--success">
          <Icon name="successCheck" size="sm" />
          <span>{success}</span>
        </p>
      ) : null}
    </div>
  );
}
