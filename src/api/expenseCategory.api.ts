import axiosInstance from "./axiosInstace.config";
import { useAuth } from "@/contexts/AuthContext";

export const createExpenseCategory = async (expenseCategoryData) => {
    try {
        const response = await axiosInstance.post(`/expenseCategory/createExpenseCate`, expenseCategoryData);

        console.log("create expense category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create expense category API error:', error);

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

export const updateExpenseCategory = async (expenseCategoryData, id) => {
    try {
        const response = await axiosInstance.put(`/expenseCategory/updateExpenseCate?id=${id}`, expenseCategoryData);

        console.log("update expense category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update expense category API error:', error);

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

export const getAllExpenseCategory = async ({ search, page, limit, status, restaurantId }: {
    search?: string
    page?: number
    limit?: number
    status?: boolean
    restaurantId?: string
  } = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if(search) queryParams.append("search", search);
        if(page !== undefined) queryParams.append("page", String(page));
        if (limit !== undefined) queryParams.append("limit", String(limit));
        if (status !== undefined) queryParams.append("isActive", String(status));
        if (restaurantId) queryParams.append("restaurantId", restaurantId);

        const { user } = useAuth();
        const finalRestaurantId = restaurantId || user?.restaurantId?._id;
        if (finalRestaurantId) {
            queryParams.append("restaurantId", finalRestaurantId);
        }
        const url = `expenseCategory/getAllExpenseCate${queryParams.toString ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get all expense category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all expense category API error:', error);

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