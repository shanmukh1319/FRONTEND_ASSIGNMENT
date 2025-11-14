import axios from "axios";
import { VITE_API_BASE_URL_PRODUCTS } from "../config/env";
import type {
  Product,
  ProductPayload,
  PaginatedResponse,
  ProductQueryParams,
} from "../types/product";

const api = axios.create({
  baseURL: `${VITE_API_BASE_URL_PRODUCTS}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Transform payload to Product format
// const transformPayloadToProduct = (
//   payload: ProductPayload,
//   id?: string
// ): Partial<Product> => {
//   return {
//     ...(id && { id }),
//     name: payload.name,
//     description: payload.description || "",
//     price: payload.price,
//     currency: payload.currency || "",
//     inventoryCount: payload.inventoryCount,
//     status: payload.status,
//   };
// };

export const productApi = {
  // Get all products with pagination, search, sort, and filter
  getAll: async (
    params?: ProductQueryParams
  ): Promise<PaginatedResponse<Product>> => {
    try {
      const response = await api.get<PaginatedResponse<Product>>("/products", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Create product
  create: async (payload: ProductPayload): Promise<any> => {
    try {
      const response = await api.post<any>("/products", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update product
  update: async (id: string, payload: ProductPayload): Promise<Product> => {
    try {
      const response = await api.patch<Product>(`/products/${id}`, payload);
      return response?.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);

      // Update localStorage as fallback
      const localProducts = localStorage.getItem("products");
      if (localProducts) {
        const products: Product[] = JSON.parse(localProducts);
        const filtered = products.filter((p) => p.id !== id);
        localStorage.setItem("products", JSON.stringify(filtered));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};
