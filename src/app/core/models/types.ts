export type UserRole = 'client' | 'master' | 'carrier' | 'store';

export type OrderStatus = 'new' | 'master_selected' | 'completed';

export interface WorkType {
  id: string;
  name: string;
  slug: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  city_district: string | null;
  is_admin: boolean;
  created_at: string;
  user?: { email: string };
}

export interface MasterRate {
  id: string;
  master_id: string;
  work_type_id: string;
  rate_per_sqm: number;
  work_type?: WorkType;
}

export interface Order {
  id: string;
  client_id: string;
  work_type_id: string;
  area_sqm: number;
  address: string;
  description: string | null;
  photo_urls: string[];
  status: OrderStatus;
  selected_master_id: string | null;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  work_type?: WorkType;
  profiles?: Profile;
}

export interface MasterStats {
  master_id: string;
  reviews_count: number;
  avg_rating: number | null;
}

export interface Message {
  id: string;
  order_id: string;
  master_id: string;
  sender_id: string;
  content: string;
  read_at?: string | null;
  created_at: string;
  sender?: { id: string; name: string; role: string };
}

export type VehicleType = 'car' | 'minivan' | 'gazelle' | 'truck';

export type TransportOrderStatus = 'new' | 'carrier_selected' | 'completed' | 'cancelled';

export interface CarrierProfile {
  carrier_id: string;
  vehicle_type: VehicleType;
  price_per_km: number | null;
  min_price: number | null;
  max_weight_kg: number | null;
}

export interface TransportOrder {
  id: string;
  client_id: string;
  from_address: string;
  to_address: string;
  cargo_description: string;
  cargo_weight_kg: number | null;
  cargo_volume_m3: number | null;
  transport_date: string | null;
  budget: number | null;
  status: TransportOrderStatus;
  selected_carrier_id: string | null;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface TransportResponse {
  id: string;
  order_id: string;
  carrier_id: string;
  proposed_price: number;
  comment: string | null;
  vehicle_type: VehicleType | null;
  status: 'new' | 'selected' | 'rejected';
  created_at: string;
  profiles?: Profile;
  transport_orders?: Pick<TransportOrder, 'id' | 'from_address' | 'to_address' | 'status' | 'selected_carrier_id'>;
}

export type ProductUnit = 'шт' | 'м²' | 'кг' | 'л' | 'уп';

export interface StoreProfile {
  store_id: string;
  store_name: string;
  address: string | null;
  description: string | null;
  created_at: string;
  profiles?: Profile;
  store?: { phone?: string | null; cityDistrict?: string | null };
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  unit: ProductUnit;
  category: string | null;
  in_stock: boolean;
  created_at: string;
}

export interface ResponseOrder {
  id: string;
  area_sqm: number;
  address: string;
  status: OrderStatus;
  selected_master_id: string | null;
  work_type?: WorkType;
}

export interface Response {
  id: string;
  order_id: string;
  master_id: string;
  proposed_price: number;
  comment: string | null;
  estimated_days: number | null;
  created_at: string;
  master?: { id: string; name: string; phone: string | null };
  order?: ResponseOrder;
}
