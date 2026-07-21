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
