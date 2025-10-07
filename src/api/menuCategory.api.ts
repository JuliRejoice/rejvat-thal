import axiosInstance from "./axiosInstace.config";

export const createMenuCategory = async (menuCategoryData) => {
    try {
        const response = await axiosInstance.post(`/menuCategory/addMenuCategory`, menuCategoryData);

        console.log("create menu category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('create menu category API error:', error);

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

export const updateMenuCategory = async (menuCategoryData, id) => {
    try {
        const response = await axiosInstance.put(`/menuCategory/updateMenuCategory?id=${id}`, menuCategoryData);

        console.log("update menu category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('update menu category API error:', error);

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

export const getAllMenuCategory = async ({ search, page, limit, status, restaurantId }: {
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
        if(limit !== undefined) queryParams.append("limit", String(limit));
        if(status !== undefined) queryParams.append("isActive", String(status));
        if(restaurantId) queryParams.append("restaurantId", restaurantId);

        const url = `menuCategory/getAllCategory${queryParams.toString ? `?${queryParams.toString()}` : ""}`

        const response = await axiosInstance.get(url);

        console.log("get all menu category API Response:", response.data);

        return response.data;

    } catch (error) {
        console.error('get all menu category API error:', error);

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