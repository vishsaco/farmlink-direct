/* FarmLink Direct — API client with JWT auth */

import type {
  AuthResponse,
  User,
  Lot,
  LotSearchResult,
  Order,
  PriceGuidance,
  RevenueSimulationResult,
  RoutePlan,
  Timeline,
  Settlement,
} from "./types";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem("farmlink_custom_api_url");
    if (override) {
      let clean = override.trim().replace(/\/+$/, "");
      return clean.endsWith("/api") ? clean : `${clean}/api`;
    }
  }
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("farmlink_token");
    }
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("farmlink_token", token);
      } else {
        localStorage.removeItem("farmlink_token");
      }
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      let msg = errorData.error || errorData.detail;
      if (!msg && typeof errorData === "object") {
        const errorList = Object.entries(errorData).map(([key, val]) => {
          const valStr = Array.isArray(val) ? val.join(", ") : String(val);
          return key === "non_field_errors" ? valStr : `${key}: ${valStr}`;
        });
        if (errorList.length > 0) {
          msg = errorList.join(" | ");
        }
      }
      throw new Error(msg || `API Error: ${res.status}`);
    }

    return res.json();
  }

  // ─── Auth ───
  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.access);
    return data;
  }

  async register(data: {
    username: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone: string;
    role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
    organization_name?: string;
    location?: string;
    language?: "en" | "hi";
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access);
    return res;
  }

  async googleLogin(data: {
    email: string;
    name: string;
    role: "farmer" | "fpo" | "buyer" | "driver" | "ops";
    avatar_url?: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/google/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me/");
  }

  logout() {
    this.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("farmlink_refresh");
      localStorage.removeItem("farmlink_user");
    }
  }

  // ─── Lots ───
  async createLot(data: Partial<Lot>): Promise<Lot> {
    return this.request<Lot>("/lots/items/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyLots(): Promise<{ results: Lot[] }> {
    return this.request<{ results: Lot[] }>("/lots/items/");
  }

  async getLot(id: number): Promise<Lot> {
    return this.request<Lot>(`/lots/items/${id}/`);
  }

  async searchLots(params: {
    commodity?: string;
    grade?: string;
    latitude: number;
    longitude: number;
    radius_km?: number;
    sort_by?: string;
    min_qty?: number;
    max_price?: number;
  }): Promise<LotSearchResult> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.set(k, String(v));
      }
    });
    return this.request<LotSearchResult>(`/lots/search/?${query.toString()}`);
  }

  // ─── Farms ───
  async createFarm(data: {
    name: string;
    village: string;
    latitude: number;
    longitude: number;
    district?: string;
    total_area_acres?: number;
  }): Promise<any> {
    return this.request("/lots/farms/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyFarms(): Promise<any[]> {
    return this.request<any[]>("/lots/farms/");
  }

  // ─── Orders ───
  async createOrder(data: {
    lot_id: number;
    requested_qty: number;
    agreed_price: number;
    delivery_address?: string;
    delivery_lat?: number;
    delivery_lng?: number;
    notes?: string;
  }): Promise<Order> {
    return this.request<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/");
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}/`);
  }

  async transitionOrder(
    id: number,
    newStatus: string,
    note?: string
  ): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status/`, {
      method: "POST",
      body: JSON.stringify({ new_status: newStatus, note }),
    });
  }

  // ─── Forecasts & Agmarknet ───
  async getForecast(
    commodity: string,
    cluster = "Lucknow"
  ): Promise<PriceGuidance> {
    return this.request<PriceGuidance>(
      `/forecasts/${commodity}/?cluster=${cluster}`
    );
  }

  async simulateRevenue(
    commodity: string,
    quantityKg: number,
    storageType: "ambient" | "cold" = "ambient"
  ): Promise<RevenueSimulationResult> {
    return this.request<RevenueSimulationResult>("/forecasts/simulate/", {
      method: "POST",
      body: JSON.stringify({
        commodity,
        quantity_kg: quantityKg,
        storage_type: storageType,
      }),
    });
  }

  async syncMandi(commodity = "tomato", apiKey?: string): Promise<any> {
    return this.request("/forecasts/sync-mandi/", {
      method: "POST",
      body: JSON.stringify({ commodity, api_key: apiKey }),
    });
  }

  async setMandiApiKey(apiKey: string): Promise<any> {
    return this.request("/forecasts/config-key/", {
      method: "POST",
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  // ─── Routing ───
  async planRoute(orderIds: number[]): Promise<RoutePlan> {
    return this.request<RoutePlan>("/routing/plan/", {
      method: "POST",
      body: JSON.stringify({ order_ids: orderIds }),
    });
  }

  // ─── Fulfillment ───
  async submitDeliveryProof(
    orderId: number,
    data: {
      otp?: string;
      media_url?: string;
      latitude?: number;
      longitude?: number;
      note?: string;
    }
  ): Promise<unknown> {
    return this.request(`/fulfillment/orders/${orderId}/proof/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSettlement(orderId: number): Promise<Settlement> {
    return this.request<Settlement>(`/fulfillment/orders/${orderId}/settlement/`);
  }

  async getTimeline(orderId: number): Promise<Timeline> {
    return this.request<Timeline>(`/fulfillment/orders/${orderId}/timeline/`);
  }

  async getExceptions(): Promise<{ count: number; exceptions: unknown[] }> {
    return this.request<{ count: number; exceptions: unknown[] }>(
      "/fulfillment/exceptions/"
    );
  }
}

export const api = new ApiClient();
