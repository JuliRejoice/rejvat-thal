import axiosInstance from './axiosInstace.config';

type Overview = {
  income: number;
  expense: number;
  totalBalance: number;
};

type RestaurantOverview = Overview & {
  restaurantId: string;
  restaurant: string;
  isActive: boolean;
};

export type DashboardResponse = {
  overall: Overview;
  byRestaurant?: RestaurantOverview[];
};

export type ApiResponse<T> = {
  success: boolean;
  messages?: string;
  payload: T;
};
export type OverviewCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

export const getDashboardOverview = async (url: string): Promise<ApiResponse<DashboardResponse>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DashboardResponse>>(url);
    return response.data;
  } catch (error: any) {
    console.error("Dashboard Overview API error:", error);
    if (error.response) {
      const errorMessage = error.response.data.message || "Server error.";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
