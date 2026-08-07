import { API_BASE_URL } from "@/api/config";

export function countFormat(value?: number | null) {
  const count = Number(value ?? 0);
  return count.toLocaleString("ko-KR");
}

export function getAssetUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("blob:")) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
}

export function getPostId(post: { post_id?: number; id?: number }) {
  return post.post_id ?? post.id;
}

export function getInitial(nickname?: string | null) {
  return nickname?.trim().slice(0, 1) || "U";
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  const elapsedMs = Date.now() - date.getTime();
  if (elapsedMs <= 60_000) return "방금 전";

  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간 전`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) return `${elapsedDays}일 전`;

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return `${elapsedMonths}개월 전`;

  return `${Math.floor(elapsedMonths / 12)}년 전`;
}
