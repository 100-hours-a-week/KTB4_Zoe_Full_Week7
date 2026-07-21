import { apiClient } from "@/api/client";
import type { ApiEnvelope } from "@/types/domain";

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
