import axios from "axios";
import { VITE_API_BASE_URL_ORDERS } from "../config/env";
import type {
  Order,
  CreateOrderPayload,
  OrderStatus,
  PaginatedResponse,
  OrderQueryParams,
} from "../types/order";

const api = axios.create({
  baseURL: `${VITE_API_BASE_URL_ORDERS}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const orderApi = {
  // Get all orders with pagination, search, sort, and filter
  getAll: async (
    params?: OrderQueryParams
  ): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await api.get<PaginatedResponse<Order>>("/orders", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // Get order by ID
  getById: async (id: string): Promise<Order> => {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create order
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      const response = await api.post<Order>("/orders", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      // Re-throw error so handleSubmitOrder can catch it and keep modal open
      throw error;
    }
  },

  // Update order status
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    try {
      const response = await api.patch<Order>(`/orders/${id}/status`, {
        status,
      });

      // Update localStorage as fallback
      const localOrders = localStorage.getItem("orders");
      if (localOrders) {
        const orders: Order[] = JSON.parse(localOrders);
        const index = orders.findIndex((o) => o.id === id);
        if (index !== -1) {
          orders[index] = {
            ...orders[index],
            ...response.data,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem("orders", JSON.stringify(orders));
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Cancel order (soft delete)
  cancel: async (id: string): Promise<void> => {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },
};
