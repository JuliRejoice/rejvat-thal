import axiosInstance from "./axiosInstace.config";

export const AddInventoryOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post(`/inventory`, orderData, { headers: { 'Content-Type': 'multipart/form-data' } });

        console.log("create inventory order API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create inventory order API error:', error);

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


export const getInventoryList = async (data) =>{
    try {
        const params = new URLSearchParams()
        params.append('page', data.page)
        params.append('limit', data.limit)
        params.append('isActive', data.isActive)
        params.append('restaurantId', data.restaurantId)
        if(data.vendorId){
            params.append('vendorId', data.vendorId)
        }
        if(data.search){
            params.append('search', data.search)
        }
        try {
            const response = await axiosInstance.get(`/inventory?`, {params});
    
            console.log("create inventory order API Response:", response.data);
    
            return response.data;
    
        } catch (error) {
            console.error('create inventory order API error:', error);
    
            if (error.response) {
                const errorMessage = error.response.data.message;
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error('Network error. Please check your connection.');
            } else {
                throw new Error('An unexpected error occurred');
            }
        }
    } catch (error) {
        
    }
}

export const getInventoryOverview = async (params: { restaurantId: string, vendorExpCatId: string }) => {
    try {
      const response = await axiosInstance.get('/inventory/overview', { params });
      return response.data;
    } catch (error) {
      console.error('getInventoryOverview API error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch inventory overview');
      }
      throw new Error('Failed to fetch inventory overview');
    }
  };