import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Login menggunakan API route yang akan handle cookie
 * Token akan disimpan secara otomatis di HTTP-only cookie
 */
export async function loginRequest(payload: LoginPayload) {
  try {
    // Call Next.js API route (bukan langsung ke backend)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Penting: include cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh access token menggunakan refresh token dari cookie
 */
export async function refreshAccessToken() {
  try {
    const res = await api.post("/api/users/refresh");
    return res.data;
  } catch (error) {
    console.warn("API Error (refreshAccessToken), failing gracefully for static mode");
    return { token: "mock-refreshed-token" };
  }
}

/**
 * Logout dan clear semua cookies
 */
export async function logoutRequest() {
  try {
    // Clear cookies via API route
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
