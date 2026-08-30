/* FarmLink Direct — TypeScript interfaces matching Django models */

// ─── Users & Auth ───────────────────────────────────────────

export type UserRole = "farmer" | "fpo" | "buyer" | "ops" | "driver";
export type Language = "en" | "hi";

export interface Organization {
  id: number;
  name: string;
  org_type: "fpo" | "buyer_org" | "logistics";
  location: string;
  phone: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone: string;
  organization: number | null;
  organization_detail: Organization | null;
  language: Language;
  is_verified: boolean;
  avatar_url: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type Commodity =
  | "tomato"
  | "onion"
  | "potato"
  | "mango"
  | "chilli"
  | "garlic"
  | "ginger"
  | "spinach"
  | "cauliflower"
  | "wheat";
export type Grade = "A" | "B" | "C";
export type LotStatus = "draft" | "listed" | "partially_reserved" | "fully_reserved" | "exhausted";

export interface Farm {
  id: number;
  owner: number;
  owner_name: string;
  name: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
}

export interface Lot {
  id: number;
  farm: number;
  farm_detail: Farm;
  created_by: number;
  created_by_name: string;
  commodity: Commodity;
  commodity_display: string;
  grade: Grade;
  grade_display: string;
  available_qty: number;
  reserved_qty: number;
  remaining_qty: number;
  unit: string;
  asking_price: number;
  harvest_at: string;
  pickup_window_start: string;
  pickup_window_end: string;
  quality_notes: string;
  photo_url: string;
  status: LotStatus;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

export interface LotSearchResult {
  count: number;
  center: { latitude: number; longitude: number };
  radius_km: number;
  results: Lot[];
}

// ─── Orders ─────────────────────────────────────────────────

export type OrderStatus =
  | "reserved"
  | "confirmed"
  | "pickup_scheduled"
  | "picked_up"
  | "delivered"
  | "settlement_ready"
  | "settled"
  | "cancelled"
  | "exception";

export interface Order {
  id: number;
  buyer: number;
  buyer_name: string;
  buyer_phone?: string;
  buyer_org?: string;
  lot: number;
  lot_detail: Lot;
  farmer_name: string;
  farmer_phone?: string;
  farmer_village?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_info?: string;
  delivery_otp?: string;
  total_amount?: number;
  requested_qty: number;
  agreed_price: number;
  status: OrderStatus;
  status_display: string;
  valid_transitions: OrderStatus[];
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ─── Forecasts ──────────────────────────────────────────────

export interface ForecastDay {
  date: string;
  low: number;
  base: number;
  high: number;
  confidence: "low" | "medium" | "high";
}

export interface PriceGuidance {
  commodity: Commodity;
  market_cluster: string;
  today: ForecastDay;
  seven_day: ForecastDay[];
  trend: "rising" | "falling" | "stable";
  avg_price: number;
  explanation: string;
  source_version?: string;
  source_meta?: {
    source: string;
    is_live_api: boolean;
    market_name?: string;
    arrival_date?: string;
    message?: string;
  };
}

// ─── Routing ────────────────────────────────────────────────

export interface RouteStop {
  sequence: number;
  type: "pickup" | "delivery";
  location: string;
  latitude: number;
  longitude: number;
  eta: string;
  load_kg: number;
  order_id: number;
  status: string;
}

export interface RoutePlan {
  route_id: number;
  vehicle: {
    id: string;
    name: string;
    max_capacity_kg: number;
  };
  summary: {
    total_distance_km: number;
    total_load_kg: number;
    load_utilization: number;
    estimated_duration_mins: number;
    stop_count: number;
    planned_date: string;
  };
  stops: RouteStop[];
}

// ─── Fulfillment & Settlement ───────────────────────────────

export interface FulfillmentEvent {
  id: number;
  event_type: string;
  event_display: string;
  actor: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  media_url: string;
  has_otp: boolean;
  note: string;
}

export interface Settlement {
  order_id: number;
  gross_amount: number;
  logistics_fee: number;
  logistics_fee_percent: number;
  platform_fee: number;
  platform_fee_percent: number;
  net_farmer_amount: number;
  status: string;
  status_display: string;
  reference: string;
  note: string;
  created_at: string;
}

export interface Timeline {
  order_id: number;
  event_count: number;
  timeline: FulfillmentEvent[];
}
