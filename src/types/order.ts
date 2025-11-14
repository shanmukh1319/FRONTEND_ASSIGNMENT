export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface ProductSnapshot {
  name: string;
  price: number;
  sku: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderFormData {
  "Customer Name": string;
  Product: string;
  Quantity: string;
  Status: string;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerId?: string;
  items: CreateOrderItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "orderNumber" | "totalAmount" | "createdAt" | "updatedAt" | "status";
  sortOrder?: "ASC" | "DESC";
  search?: string;
  status?: OrderStatus;
}
