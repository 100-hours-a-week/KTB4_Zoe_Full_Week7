import { getAssetUrl, getInitial } from "@/utils/format";

type AvatarProps = {
  src?: string | null;
  nickname?: string | null;
  size?: "sm" | "md" | "lg";
};

const avatarSizeClassName = {
  sm: "avatar--sm",
  md: "avatar--md",
  lg: "avatar--lg",
};

export function Avatar({ src, nickname, size = "md" }: AvatarProps) {
  const resolvedSrc = getAssetUrl(src);
  const className = `avatar ${avatarSizeClassName[size]}`;

  if (resolvedSrc) {
    return <img className={className} src={resolvedSrc} alt={`${nickname ?? "사용자"} 프로필 이미지`} />;
  }

  return (
    <span className={className} aria-hidden="true">
      {getInitial(nickname)}
    </span>
  );
}
