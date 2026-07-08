import { apiClient } from "./client.js";
import { getCookie } from "../utils/getCookie.js";

let csrfToken = null;
let csrfHeaderName = "X-XSRF-TOKEN";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];

function isUnsafeMethod(method) {
  return !SAFE_METHODS.includes(method.toUpperCase());
}

export async function getCsrfHeaders(method) {
  if (!isUnsafeMethod(method)) {
    return {};
  }

  if (!csrfToken) {
    await apiClient("/csrf");

    csrfToken = getCookie("XSRF-TOKEN");
    console.log(csrfToken);
    csrfHeaderName = "X-XSRF-TOKEN";
  }

  return {
    [csrfHeaderName]: csrfToken,
  };
}

export function clearCsrfToken() {
  csrfToken = null;
}