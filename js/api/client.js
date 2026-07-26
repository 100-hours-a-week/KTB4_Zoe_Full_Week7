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

  const data = await response.json();

  if (response.status === 401){
    try{
      await fetch(`${BASE_URL}/auth/reissue`,{
        method: "POST",
        credentials: "include",
        headers: {
      ...requestBody.headers,
      ...csrfHeaders,
    },
      });
    }catch(e){
      console.error(e);
    }
  }

  if (!response.ok) {
    const error = new Error(data.message);
    error.status = response.status;
    error.data = data.data;
    throw error;
  }

  return data;
}