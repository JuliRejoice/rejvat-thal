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

export const vendorPayment = async (data:any) => {
    try {
        const response = await axiosInstance.post(`/vendor-payment`,data,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("vendor payment API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('vendor payment API error:', error);

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

export const getVendorPayment = async (data:any) => {
    try {
        const params = new URLSearchParams();

        params.append('page', data.page);
        params.append('limit', data.limit);

        if(data.search){
            params.append('search', data.search);
        }

        if(data.isActive){
            params.append('isActive', data.isActive);
        }

        if(data.expenseCategoryId){
            params.append('expenseCategoryId', data.expenseCategoryId);
        }

        if(data.restaurantId){
            params.append('restaurantId', data.restaurantId);
        }

        const response = await axiosInstance.get(`/vendor-payment`,{params});

        console.log("get vendor payment API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get vendor payment API error:', error);

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