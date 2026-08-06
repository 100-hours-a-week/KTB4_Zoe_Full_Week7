import { Icon, type IconName } from "@/components/Icon";

type ToastProps = {
  message: string | null;
  variant?: "default" | "error";
  icon?: IconName;
  className?: string;
};

export function Toast({ message, variant = "default", icon, className = "" }: ToastProps) {
  if (!message) return null;
  return (
    <div className={`toast toast--${variant} ${className}`.trim()} role={variant === "error" ? "alert" : "status"}>
      {icon ? <Icon name={icon} size="sm" /> : null}
      <span>{message}</span>
    </div>
  );
}
