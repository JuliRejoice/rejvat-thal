import axiosInstance from "./axiosInstace.config";

export const getStaffManager = async ({ type, search="", page, limit, status }) => {
    try {
        const response = await axiosInstance.get(
            `/user/getManagAndSta?type=${type}${search ? `&search=${search}` : ""}&page=${page}&limit=${limit}
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

export const updateStatusStaffManager = async (id, isActive) => {
    try {
        const response = await axiosInstance.put(`/user/updateUserStatus?id=${id}`, {
            isActive: isActive
        });
        
        console.log("update manager and staff status API Response:", response.data);
        
        return response.data;
        
    } catch (error) {
        console.error('update manager and staff status API error:', error);
        
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

export const updateStaffManager = async (userData, id) => {
    try {
        const data = new FormData();
        
        data.append('email', userData.email);
        data.append('name', userData.name);
        data.append('phone', userData.phone);
        data.append('address', userData.address);
        data.append('restaurantId', userData.restaurantId);
        data.append('joiningDate', userData.joiningDate);
        data.append('position', userData.position || 'staff');
        data.append('isUserType', userData.isUserType || 'staff');
        
        if (userData.salary) {
            data.append('salary', userData.salary);
        }
        if (userData.file) {
            data.append('file', userData.file);
        }
        const response = await axiosInstance.put(`/user/update?id=${id}`, data);
        
        console.log("update manager and staff status API Response:", response.data);
        
        return response.data;
        
    } catch (error) {
        console.error('update manager and staff status API error:', error);
        
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

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await axiosInstance.post('/user/upload-image', formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log("upload image API Response:", response.data);
        
        return response.data;
        
    } catch (error) {
        console.error('upload image API error:', error);
        
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