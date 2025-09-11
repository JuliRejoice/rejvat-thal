import axiosInstance from "./axiosInstace.config";

export const createVendor = async (vendorData) => {
    try {
        const response = await axiosInstance.post(`/vendor/addNewVendor`, vendorData);

        console.log("create vendor API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create vendor API error:', error);

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

export const updateVendor = async (vendorData, id) => {
    try {
        const response = await axiosInstance.put(`/vendor/updateVendor?id=${id}`, vendorData);

        console.log("update vendor API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update vendor API error:', error);

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

export const updateVendorStatus = async (isActive, id) => {
    try {
        const response = await axiosInstance.put(`/vendor/updateVendorStatus?id=${id}`, {
            isActive: isActive
        });

        console.log("update vendor status API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update vendor status API error:', error);

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

export const getAllVendors = async ({
    page,
    limit
}) => {
    try {
        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", String(page));
        if (limit !== undefined) queryParams.append("limit", String(limit));
        
        const url = `/vendor/getAllVendor${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        const response = await axiosInstance.get(url);

        console.log("get all vendor API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all vendor API error:', error);

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