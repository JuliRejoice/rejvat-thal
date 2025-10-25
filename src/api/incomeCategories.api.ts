import axiosInstance from "./axiosInstace.config"
import { useAuth } from "@/contexts/AuthContext";

export const getAllIncomeCategory = async ({ search, page, limit, status, restaurantId }: {
    search?: string
    page?: number
    limit?: number
    status?: boolean
    restaurantId?: string
} = {}) => {
    const { user } = useAuth();
    try {

        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (page !== undefined) queryParams.append("page", String(page));
        if (limit !== undefined) queryParams.append("limit", String(limit));
        if (status !== undefined) queryParams.append("isActive", String(status));
        const finalRestaurantId = restaurantId || user?.restaurantId?._id;
        if (finalRestaurantId) {
            queryParams.append("restaurantId", finalRestaurantId);
        }

        const url = `incomeCategory/getAllIncomeCate${queryParams.toString ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get all income category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all income category API error:', error);

        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}