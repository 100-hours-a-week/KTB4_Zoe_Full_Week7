import { apiClient } from "@/api/client";
import type { ApiEnvelope, MyPageActivityData, MyPageData, MyPageTab } from "@/types/domain";

export function getMyPage() {
  return apiClient<ApiEnvelope<MyPageData>>("/users/me/mypage");
}

export function getMyPageActivities(tab: MyPageTab, cursor?: string | null) {
  const params = new URLSearchParams({ tab });
  if (cursor != null) params.set("cursor", cursor);
  return apiClient<ApiEnvelope<MyPageActivityData>>(`/users/me/mypage/activities?${params.toString()}`);
}

export function updateUser(formData: FormData) {
  return apiClient<ApiEnvelope<Record<string, unknown>>>("/users", {
    method: "PUT",
    body: formData,
  });
}

export function deleteUser() {
  return apiClient<null>("/users", {
    method: "DELETE",
  });
}
