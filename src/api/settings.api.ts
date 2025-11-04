import axiosInstance from "./axiosInstace.config";
import { useAuth } from "@/contexts/AuthContext";




const handleError = (error) => {
    console.error('get utility setting thershold amount API error:', error);
    if (error.response) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
    } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
    } else {
        throw new Error('An unexpected error occurred');
    }
}

export const getThresholdAmont = async (params: { page?: number; limit?: number } = {}) => {
    const { user } = useAuth();
    try {
        const response = await axiosInstance.get('/utilitySetting/getUtilitySetting', {
            params: {
                page: params.page || 1,
                limit: params.limit || 10,
                restaurantId: user?.role === "manager" ? user.restaurantId?._id : "",
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const addSetting = async (data) => {
    try {
        const response = await axiosInstance.post(`/utilitySetting/addUtilitySetting`, data);

        console.log("get utility setting thershold amount API Response:", response.data);

        return response.data;

    } catch (error) {
        handleError(error)
    }
}

export const updateSetting = async (data) => {
    try {
        const response = await axiosInstance.put(`/utilitySetting/updateUtilitySetting?id=${data.restaurantId}`, { expenseThresholdAmount: data.expenseThresholdAmount });

        console.log("get utility setting thershold amount API Response:", response.data);

        return response.data;

    } catch (error) {
        handleError(error)
    }
}