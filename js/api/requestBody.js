export function createRequestBody(body) {
  if (body == null) {
    return {
      headers: {},
      body: undefined,
    };
  }

  if (body instanceof FormData) {
    return {
      headers: {},
      body,
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}