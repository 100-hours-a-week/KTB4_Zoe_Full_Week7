type ToastProps = {
  message: string | null;
  variant?: "default" | "error";
};

export function Toast({ message, variant = "default" }: ToastProps) {
  if (!message) return null;
  return (
    <div className={`toast toast--${variant}`} role={variant === "error" ? "alert" : "status"}>
      {message}
    </div>
  );
}
