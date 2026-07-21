import type React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "kakao";
  block?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
};

export function Button({
  variant = "primary",
  block = false,
  isLoading = false,
  loadingLabel = "처리 중",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "button",
        `button--${variant}`,
        block ? "button--block" : "",
        isLoading ? "button--loading" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {children}
      {isLoading ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  );
}
