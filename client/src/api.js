// client/src/api.js

export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // ← Your backend URL

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  
  // Logging for debugging
  console.log("🚀 API Request:", {
    url,
    method: options.method || "GET",
    headers,
    body: options.body ? options.body : null // Removed JSON.parse to avoid errors on non-json bodies
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Safely parse JSON, handling empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    console.log("📥 API Response:", {
      status: response.status,
      ok: response.ok,
      data
    });

    if (!response.ok) {
      throw new Error(data.message || `API request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
}