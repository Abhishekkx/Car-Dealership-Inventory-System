const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface Purchase {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  vehicleId: string;
  make: string;
  model: string;
  category: string;
  price: number;
  purchasedAt: string;
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
  register(name: string, email: string, password: string) {
    return request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  listVehicles(token: string) {
    return request<{ vehicles: Vehicle[] }>("/vehicles", {}, token);
  },

  searchVehicles(token: string, params: SearchParams) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<{ vehicles: Vehicle[] }>(
      `/vehicles/search${suffix}`,
      {},
      token
    );
  },

  createVehicle(token: string, payload: VehicleInput) {
    return request<{ vehicle: Vehicle }>(
      "/vehicles",
      { method: "POST", body: JSON.stringify(payload) },
      token
    );
  },

  updateVehicle(token: string, id: string, payload: VehicleInput) {
    return request<{ vehicle: Vehicle }>(
      `/vehicles/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token
    );
  },

  deleteVehicle(token: string, id: string) {
    return request<{ message: string }>(
      `/vehicles/${id}`,
      { method: "DELETE" },
      token
    );
  },

  purchaseVehicle(token: string, id: string) {
    return request<{ vehicle: Vehicle }>(
      `/vehicles/${id}/purchase`,
      { method: "POST" },
      token
    );
  },

  restockVehicle(token: string, id: string, quantity: number) {
    return request<{ vehicle: Vehicle }>(
      `/vehicles/${id}/restock`,
      { method: "POST", body: JSON.stringify({ quantity }) },
      token
    );
  },

  listMyPurchases(token: string) {
    return request<{ purchases: Purchase[] }>("/purchases", {}, token);
  },
};
