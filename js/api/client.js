import { BASE_URL } from "../config.js";
import { getCsrfHeaders } from "./csrf.js";
import { createRequestBody } from "./requestBody.js";

export async function apiClient(path, method = "GET", body = null) {
  const requestBody = createRequestBody(body);
  const csrfHeaders = await getCsrfHeaders(method);

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...requestBody.headers,
      ...csrfHeaders,
    },
    body: requestBody.body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const text = response.status === 204 ? "" : await response.text();
  const data = text && contentType.includes("application/json")
    ? JSON.parse(text)
    : null;

  if (!response.ok) {
    const error = new Error(data?.message ?? response.statusText);
    error.status = response.status;
    error.data = data?.data;
    throw error;
  }

  return data;
}
