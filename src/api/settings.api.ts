import axiosInstance from "./axiosInstace.config";

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

export const getThresholdAmont = async () => {
    try {
        const response = await axiosInstance.get(`/utilitySetting/getUtilitySetting`);
        return response.data;
    } catch (error) {
        handleError(error)
    }
}

export const updateSetting = async (id: string, data) => {
    try {
        const response = await axiosInstance.put(`/utilitySetting/updateUtilitySetting?id=${id}`, data);

        console.log("get utility setting thershold amount API Response:", response.data);

        return response.data;

    } catch (error) {
        handleError(error)
    }
}