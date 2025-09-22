import { CreateMonthlyMenuPayload } from "@/types/menu.types";
import axiosInstance from "./axiosInstace.config";



type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export const getMonthlyMenu = async (restaurantId: string, startDate: string, endDate: string) => {
    try {
        const response = await axiosInstance.get(`/monthlyMenu/getAllMonthlyMenu?restaurantId=${restaurantId}&startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    } catch (error) {
        console.error("get monthly menu API error:", error);

        if (error.response) {
            const errorMessage = error.response.data?.message || "Request failed";
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error("Network error. Please check your connection.");
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}

export const createMonthlyMenu = async (
    payload: CreateMonthlyMenuPayload
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.post(`/monthlyMenu/createMonthlyMenu`, payload);
        return response.data;
    } catch (error: any) {
        console.error("create monthly menu API error:", error);

        if (error.response) {
            const errorMessage = error.response.data?.message || "Request failed";
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error("Network error. Please check your connection.");
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};


export const updateMonthlyMenu = async (
    payload: CreateMonthlyMenuPayload,
    id: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.put(`/monthlyMenu/updateMonthlyMenu?id=${id}`, payload);
        return response.data;
    } catch (error: any) {
        console.error("update monthly menu API error:", error);

        if (error.response) {
            const errorMessage = error.response.data?.message || "Request failed";
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error("Network error. Please check your connection.");
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};
