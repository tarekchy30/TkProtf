export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;

  console.log("API REQUEST:", {
    url,
    method: options.method || "GET",
    body: options.body,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        message: text,
      };
    }

    console.log("API RESPONSE:", {
      url,
      status: response.status,
      data,
    });

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", {
      url,
      message: error.message,
    });

    throw error;
  }
}