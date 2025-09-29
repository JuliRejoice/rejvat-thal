import axiosInstance from "./axiosInstace.config";

export interface MenuItem {
  status: string;
  id: string;
  _id: string;
  name: string;
  categoryId: any;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemPayload {
  name: string;
  categoryId: string;
  price: number;
  description?: string;
}

export interface UpdateMenuItemPayload extends Partial<CreateMenuItemPayload> {
  id: string;
  isActive?: boolean;
}

export interface MenuStatistics {
  totalMenuItems: number;
  totalActiveItems: number;
  totalUniqueCategories: number;
  averagePrice: number;
}

export interface GetMenuItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: string;
}

export const menuApi = {
  // Add a new menu item
  createMenuItem: async (data: CreateMenuItemPayload): Promise<MenuItem> => {
    try {
      const response = await axiosInstance.post("/menu/addMenuItem", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update a menu item
  updateMenuItem: async (data: UpdateMenuItemPayload): Promise<MenuItem> => {
    try {
      const { id, ...updateData } = data;
      const response = await axiosInstance.put(`/menu/updateMenuItem?id=${id}`, updateData);
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get all menu items with pagination and filters
  getMenuItems: async (params: GetMenuItemsParams = {}): Promise<{ items: MenuItem[]; total: number }> => {
    try {
      const response = await axiosInstance.get("/menu/getAllItems", { params });
      return { items: response.data.payload.data, total: response.data.payload.count }
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete a menu item (soft delete)
  deleteMenuItem: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.delete(`/menu/deleteMenuItem/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get a single menu item by ID
  getMenuItem: async (id: string): Promise<MenuItem> => {
    try {
      const response = await axiosInstance.get(`/menu/getMenuItem/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get all menu categories
  getAllCategories: async (): Promise<Array<{_id: string, name: string}>> => {
    try {
      const response = await axiosInstance.get('/menuCategory/getAllCategory');
      return response.data.payload.data || [];
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get menu statistics
  getMenuStatistics: async (): Promise<MenuStatistics> => {
    try {
      const response = await axiosInstance.get('/menu/statistics');
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
