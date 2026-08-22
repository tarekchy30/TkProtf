// Use relative URL since frontend and backend are on same domain
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "/api";  // ← This will call https://tkprotf-1.onrender.com/api

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Request failed: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
