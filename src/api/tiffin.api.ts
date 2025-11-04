    import axiosInstance from "./axiosInstace.config";

    export interface MealCount {
      breakfast: number;
      lunch: number;
      dinner: number;
      totalMeal: number;
      date?: string;
      restaurantId?: string;
    }

    export interface CustomerSummary {
    id: string;
    name: string;
    phone: string;
    address: string;
    breakfast: MealItem | null;
    lunch: MealItem | null;
    dinner: MealItem | null;
    status: 'pending' | 'delivered' | 'out-for-delivery';
    }

    export interface MealItem {
    meal: string;
    quantity: number;
    deliveryTime: string;
    }

    export interface CustomerSummaryResponse {
    items: CustomerSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    }

    export interface GetCustomerSummaryParams {
    page?: number;
    limit?: number;
    date: string;
    restaurantId: string;
    type?: string;
    areaId?: string;
    search?: string;
    }

    // Get daily meal counts
    export const getDailyMealCounts = async (restaurantId: string, date: string): Promise<MealCount> => {
    try {
        const response = await axiosInstance.get(`/tiffin/meals-count`, {
        params: { restaurantId, date }
        });
        return response.data.payload;
    } catch (error) {
        console.error('getDailyMealCounts API error:', error);
        if (error.response) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
        } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
        } else {
        throw new Error('An unexpected error occurred');
        }
    }
    };

    // Get customer summary with pagination
    export const getCustomerSummary = async (params: GetCustomerSummaryParams): Promise<{ items: CustomerSummary[], total: number }> => {
    try {
        const { date, restaurantId, page = 1, limit = 10, type, areaId, search } = params;
        const response = await axiosInstance.get(`/tiffin/coustomer-summary/${restaurantId}`, {
        params: {
            page,
            limit,
            date,
            ...(type && type !== 'all' && { type }),
            ...(areaId && { areaId }),
            ...(search && { search })
        }
        });

        const originalArray = response.data.payload.data;

        return {
        items: originalArray,
        total: response.data.payload.totalRecord || 0,
      };
    } catch (error) {
        console.error('getCustomerSummary API error:', error);
        if (error.response) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
        } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
        } else {
        throw new Error('An unexpected error occurred');
        }
    }
    };

// Create tiffin
export const createTiffin = async (tiffinData: any) => {
  try {
    const response = await axiosInstance.post(`/tiffin`, tiffinData);
    return response.data;
  } catch (error) {
    console.error('createTiffin API error:', error);
    if (error.response) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const exportCustomerSummary = async (params: {
  date: string;
  type: string;
  areaId?: string;
  search?: string;
  restaurantId: string;
}) => {
  try {
    const response = await axiosInstance.get(`/tiffin/export-coustomer-summary/${params.restaurantId}`, {
      params: {
        date: params.date,
        ...(params.type && params.type !== 'all' && { type: params.type }),
        ...(params.areaId && { areaId: params.areaId }),
        ...(params.search && { search: params.search })
      },
      responseType: 'blob' // Important for file downloads
    });
    return response.data;
  } catch (error) {
    console.error('exportCustomerSummary API error:', error);
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Failed to export data';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};
