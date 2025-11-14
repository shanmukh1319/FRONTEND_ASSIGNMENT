export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  currency?: string;
  inventoryCount: string | number;
  status: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  Name: string;
  Description?: string;
  Price: string;
  Currency?: string;
  "Inventory Count"?: string;
  Status?: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: string | number;
  currency?: string;
  inventoryCount: string | number;
  status: string;
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

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt" | "inventoryCount";
  sortOrder?: "ASC" | "DESC";
  search?: string;
  status?: "1" | "0";
}
