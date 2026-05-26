export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "failed";
export type PaymentMethod = "card" | "paypal" | "bank" | "applepay" | "googlepay" | "crypto" | "mpesa";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  shipping: {
    name: string; address: string; city: string; zip: string; country?: string;
  };
  createdAt: string;
}

export interface AuthPayload {
  sub: string;
  role: Role;
  email: string;
}
