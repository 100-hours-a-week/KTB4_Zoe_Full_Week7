import { apiClient } from "@/api/client";
import type { ApiEnvelope } from "@/types/domain";

export function login(email: string, password: string) {
  return apiClient<ApiEnvelope<Record<string, unknown>>>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function signup(formData: FormData) {
  return apiClient<ApiEnvelope<null>>("/auth/signup", {
    method: "POST",
    body: formData,
  });
}

export function logout() {
  return apiClient<null>("/auth/logout", {
    method: "POST",
  });
}

export function updatePassword(password: string) {
  return apiClient<null>("/auth/password", {
    method: "PUT",
    body: { password },
  });
}
