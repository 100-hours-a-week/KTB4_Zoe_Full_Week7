import { apiClient } from "./client.js";
import { getCookie } from "../utils/getCookie.js";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

function isUnsafeMethod(method) {
  return !SAFE_METHODS.includes(method.toUpperCase());
}

export async function getCsrfHeaders(method) {
  if (!isUnsafeMethod(method)) {
    return {};
  }

  let csrfToken = getCookie(CSRF_COOKIE_NAME);

  if (!csrfToken) {
    await apiClient("/csrf");

    csrfToken = getCookie(CSRF_COOKIE_NAME);
  }

  return {
    [CSRF_HEADER_NAME]: csrfToken,
  };
}

export function clearCsrfToken() {}
