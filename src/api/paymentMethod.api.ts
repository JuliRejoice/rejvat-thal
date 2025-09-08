import axiosInstance from "./axiosInstace.config";

export const getPaymentMethods = async () => {
    try {
        const response = await axiosInstance.get(`/paymentMethod/getAllMethod`);

        console.log("get all payment method API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all payment method API error:', error);

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