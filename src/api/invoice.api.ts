import axiosInstance from "./axiosInstace.config";

export interface InvoiceItem {
_id: string;
  invoiceNo: string;
  description: string;
  customerId: Customer;
  restaurantId: Restaurant;
  items: InvoiceItem[];
  subTotal: number;
  taxPercentage: number;
  additionalAmount: number;
  advancePayment: number;
  discount: number;
  roundOffAmount: string; // string because example has "0"
  finalAmmount: number;
  invoiceStatus: "unpaid" | "paid" | "pending" | string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  [key: string]: any; // optional for extra fields
}


interface Restaurant {
  _id: string;
  name: string;
  email: string;
  address: string;
  [key: string]: any; // optional extra fields
}

// interface InvoiceItem {
//   // As items array is empty in your example, define as needed
//   id?: string;
//   name?: string;
//   price?: number;
//   quantity?: number;
//   [key: string]: any;
// }

export interface Invoice {
  _id: string;
  invoiceNo: string;
  description: string;
  customerId: Customer;
  restaurantId: Restaurant;
  items: InvoiceItem[];
  subTotal: number;
  taxPercentage: number;
  additionalAmount: number;
  advancePayment: number;
  discount: number;
  roundOffAmount: string; // string because example has "0"
  finalAmmount: number;
  invoiceStatus: "unpaid" | "paid" | "pending" | string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  [key: string]: any; // optional for extra fields
}


// export interface Invoice {
//   id: string;
//   invoiceNumber: string;
//   customerName: string;
//   customerPhone: string;
//   date: string | Date;
//   items: InvoiceItem[];
//   subtotal: number;
//   tax: number;
//   discount: number;
//   additionalAmount: number;
//   roundingOff: number;
//   total: number;
//   paymentMethod: string;
//   status: "paid" | "pending" | "cancelled";
//   notes?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

export interface CreateInvoicePayload {
  customerName: string;
  customerPhone: string;
  items: Omit<InvoiceItem, 'id'>[];
  subtotal: number;
  tax: number;
  discount: number;
  additionalAmount: number;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {
  id: string;
  status?: "paid" | "pending" | "cancelled";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: "paid" | "pending" | "cancelled";
  startDate?: string;
  endDate?: string;
  search?: string;
  restaurantId?: string;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  averageInvoiceValue: number;
}

export const invoiceApi = {
  // Create a new invoice
  createInvoice: async (data: CreateInvoicePayload): Promise<Invoice> => {
    try {
      const response = await axiosInstance.post("/invoice", data);
      return response.data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  // Update an existing invoice
  updateInvoice: async (data: UpdateInvoicePayload): Promise<Invoice> => {
    try {
      const { id, ...updateData } = data;
      const response = await axiosInstance.put(`/invoice/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  // Get all invoices with pagination and filters
  getInvoices: async (params: GetInvoicesParams = {}): Promise<{ items: Invoice[], total: number }> => {
    try {
      const response = await axiosInstance.get("/invoice", { params });
      const originalArray = response.data.payload.data;

// const result = [
//   ...originalArray,          // first spread: original array
//   ...[...originalArray].reverse() // second spread: reversed copy
// ];
      return {
        items: originalArray,
        total: response.data.payload.count || 0
      };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  // Get a single invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const response = await axiosInstance.get(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  },

  // Delete an invoice
  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    try {
      await axiosInstance.delete(`/invoice/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStatistics: async (): Promise<InvoiceStatistics> => {
    try {
      const response = await axiosInstance.get("/invoice/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice statistics:", error);
      throw error;
    }
  }
};

export default invoiceApi;