// client/src/api.js
<<<<<<< HEAD
export const API_BASE = "http://localhost:5000/api";
=======
export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // ← Your backend URL
>>>>>>> e9844e68a7547adcf8fc2755139475ad24c264c9

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

<<<<<<< HEAD
  const url = `${API_BASE}${endpoint}`;
  
  console.log("🚀 API Request:", {
    url,
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.parse(options.body) : null
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));
    
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
=======
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
>>>>>>> e9844e68a7547adcf8fc2755139475ad24c264c9
