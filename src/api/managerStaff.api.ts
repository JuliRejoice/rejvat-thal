import axiosInstance from "./axiosInstace.config";

export const getStaffManager = async ({ type, search="", page, limit, status }) => {
    try {
        const response = await axiosInstance.get(
            `/user/getManagAndSta
            ?type=${type}
            ${search ? `&search=${search}` : ""}
            &page=${page}
            &limit=${limit}
            ${status !== undefined ? `&isActive=${status}`: ""}`
        );          
        
        console.log("Get manager and staff API Response:", response.data);
        
        return response.data;
        
    } catch (error) {
        console.error('Get manager and staff API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage);
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your connection.');
        } else {
            // Other error
            throw new Error('An unexpected error occurred');
        }
    }
}