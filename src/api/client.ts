import { API_BASE_URL } from "@/api/config";
import type { ApiError } from "@/types/domain";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const NETWORK_ERROR_MESSAGE = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

let refreshPromise: Promise<void> | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function isUnsafeMethod(method: string) {
  return !SAFE_METHODS.includes(method.toUpperCase());
}

function createApiError(message: string, status?: number, code?: string) {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
}

async function request(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        ["Failed to fetch", "Load failed", "NetworkError when attempting to fetch resource."].includes(error.message))
    ) {
      throw createApiError(NETWORK_ERROR_MESSAGE, 0, "network_error");
    }

    throw error;
  }
}

async function fetchCsrfToken() {
  await request(`${API_BASE_URL}/csrf`, {
    method: "GET",
    credentials: "include",
  });
}

async function getCsrfHeaders(method: string): Promise<Record<string, string>> {
  if (!isUnsafeMethod(method)) return {};

  let csrfToken = getCookie(CSRF_COOKIE_NAME);
  if (!csrfToken) {
    await fetchCsrfToken();
    csrfToken = getCookie(CSRF_COOKIE_NAME);
  }

  return csrfToken ? { [CSRF_HEADER_NAME]: decodeURIComponent(csrfToken) } : {};
}

function createRequestBody(body?: unknown) {
  if (body == null) return { headers: {} as Record<string, string>, body: undefined };
  if (body instanceof FormData) return { headers: {} as Record<string, string>, body };
  return {
    headers: { "Content-Type": "application/json" } as Record<string, string>,
    body: JSON.stringify(body),
  };
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? JSON.parse(text) : text;
}

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = request(`${API_BASE_URL}/auth/reissue`, {
      method: "POST",
      credentials: "include",
      headers: await getCsrfHeaders("POST"),
    }).then(async (response) => {
      if (!response.ok) throw createApiError("로그인이 만료되었습니다. 다시 로그인해주세요.", response.status, "refresh_failed");
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  options: { method?: string; body?: unknown; retry?: boolean } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const requestBody = createRequestBody(options.body);
  const csrfHeaders = await getCsrfHeaders(method);

  const response = await request(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...requestBody.headers,
      ...csrfHeaders,
    },
    body: requestBody.body,
  });

  const payload = await parseResponse(response);

  if (response.status === 401 && options.retry !== false) {
    try {
      await refreshToken();
      return apiClient<T>(path, { ...options, retry: false });
    } catch {
      onUnauthorized?.();
    }
  }

  if (!response.ok) {
    const error = createApiError(
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : response.statusText,
      response.status,
      typeof payload === "object" && payload && "code" in payload ? String(payload.code) : undefined,
    );
    if (typeof payload === "object" && payload && "data" in payload) {
      error.data = payload.data as ApiError["data"];
    }
    throw error;
  }

  return payload as T;
}
