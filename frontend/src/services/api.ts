const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.message === "string" ? data.message : "Request failed"
    );
  }

  return data as T;
}

export const api = {
  register(email: string, password: string) {
    return request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};
