import { Link } from "react-router-dom";
import votleCheck from "@/assets/votle-check.svg";

type LogoProps = {
  size?: "header" | "large";
  to?: string;
  ariaLabel?: string;
};

export function Logo({ size = "header", to, ariaLabel = "Votle" }: LogoProps) {
  const sizeClassName = size === "large" ? "logo--large" : "logo--header";
  const content = (
    <>
      <img className="logo-mark" src={votleCheck} alt="" aria-hidden="true" />
      <span className="logo-text">otle</span>
    </>
  );
  const className = `logo ${sizeClassName}`;

  if (to) {
    return (
      <Link className={className} to={to} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
