import axiosInstance from "./axiosInstace.config";


export const createTiffin = async (tiffinData) => {
    try {
        const response = await axiosInstance.post(`/tiffin`, tiffinData);

        console.log("create tiffin API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create tiffin API error:', error);

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
