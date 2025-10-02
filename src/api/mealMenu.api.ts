import axiosInstance from "./axiosInstace.config";

export interface MealMenuItem {
  quantity: any;
  itemId: any;
  qty: number;
  name?: string; // This will be populated from the menu item
  price?: number; // This will be populated from the menu item
}

export interface MealMenu {
  status: string;
  id: string;
  _id: string;
  name: string;
  restaurantId: any;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  description: string;
  items: MealMenuItem[];
  price: number;
  itemPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealMenuPayload {
  name: string;
  restaurantId: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  description: string;
  items: Array<{
    itemId: string;
    qty: number;
  }>;
  price: number;
  itemPrice: number;
}

export interface UpdateMealMenuPayload extends Partial<CreateMealMenuPayload> {
  id: string;
  isActive?: boolean;
}

export interface MealMenuStatistics {
  totalMealMenus: number;
  totalActiveMealMenus: number;
  averagePrice: number;
}

export interface GetMealMenusParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const mealMenuApi = {
  // Create a new meal menu
  createMealMenu: async (data: CreateMealMenuPayload): Promise<MealMenu> => {
    try {
      const response = await axiosInstance.post("/mealMenu/createMealMenu", data);
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get meal menu statistics
  getMealMenuStatistics: async (): Promise<MealMenuStatistics> => {
    try {
      const response = await axiosInstance.get('/mealMenu/statistics');
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update an existing meal menu
  updateMealMenu: async (data: UpdateMealMenuPayload): Promise<MealMenu> => {
    try {
      const { id, ...updateData } = data;
      const response = await axiosInstance.put(`/mealMenu/updateMealMenu?id=${id}`, updateData);
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get all meal menus with pagination and filters
  getMealMenus: async (params: GetMealMenusParams = {}): Promise<{ items: MealMenu[], total: number }> => {
    try {
      const response = await axiosInstance.get("/mealMenu/getAllMealMenu", { params });
      return { 
        items: response.data.payload.data, 
        total: response.data.payload.count 
      };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get a single meal menu by ID
  getMealMenu: async (id: string): Promise<MealMenu> => {
    try {
      const response = await axiosInstance.get(`/mealMenu/getMealMenu/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete a meal menu (soft delete)
  deleteMealMenu: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.delete(`/mealMenu/deleteMealMenu?id=${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Toggle meal menu active status
  toggleMealMenuStatus: async (id: string, isActive: boolean): Promise<MealMenu> => {
    try {
      const response = await axiosInstance.put(`/mealMenu/updateMealMenu?id=${id}`, { isActive });
      return response.data.payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get meal menu types
  getMealMenuTypes: (): Array<{ value: string; label: string }> => {
    return [
      { value: 'BREAKFAST', label: 'Breakfast' },
      { value: 'LUNCH', label: 'Lunch' },
      { value: 'DINNER', label: 'Dinner' },
    ];
  },
};
