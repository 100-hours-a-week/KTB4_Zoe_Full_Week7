const BASE_URL = "http://localhost:8080";

export async function apiClient( path, method = "GET", body = null,) {
    
    const isFormData = body instanceof FormData;
 
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: "include",
        headers: isFormData ? { } : { "Content-Type" : "application/json" },
        body: isFormData ? body : body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
        const error =  new Error(data.message);
        error.status = response.status;
        error.data = data.data;
        throw error;
    }

    return data;

}