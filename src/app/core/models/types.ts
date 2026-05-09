export type UserRole = 'client' | 'master';

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
  created_at: string;
}

export interface MasterRate {
  id: string;
  master_id: string;
  work_type_id: string;
  rate_per_sqm: number;
  work_types?: WorkType;
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
  work_types?: WorkType;
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
  created_at: string;
  profiles?: { name: string };
}

export interface ResponseOrder {
  id: string;
  area_sqm: number;
  address: string;
  status: OrderStatus;
  selected_master_id: string | null;
  work_types?: WorkType;
}

export interface Response {
  id: string;
  order_id: string;
  master_id: string;
  proposed_price: number;
  comment: string | null;
  estimated_days: number | null;
  created_at: string;
  profiles?: Profile;
  orders?: ResponseOrder;
}
