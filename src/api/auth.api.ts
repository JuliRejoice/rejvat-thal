import axiosInstance from "./axiosInstace.config"

export const signUp = async (formData) => {
    try {
        const data = new FormData();
        
        // Add all the required fields from your form
        data.append('email', formData.email);
        data.append('name', formData.name);
        data.append('password', formData.password);
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        data.append('restaurantId', formData.restaurantId);
        data.append('position', formData.position || 'staff');
        data.append('isUserType', formData.isUserType || 'staff');
        data.append('salary', formData.salary);
        data.append('description', formData.description);
        data.append('timingShift', formData.timingShift);
        data.append('lunchTime', formData.lunchTime);
        if (formData.passport) {
            data.append('passport', formData.passport);
        }
        if (formData.visaId) {
            data.append('visaId', formData.visaId);
        }
        if (formData.otherDoc) {
            data.append('otherDoc', formData.otherDoc);
        }

        // Add file if exists
        if (formData.file) {
            data.append('file', formData.file);
        }

        // Fixed URL construction - use the endpoint path, not the full URL
        const response = await axiosInstance.post('/user/signup', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log("API Response:", response.data);
        
        // Return the response data
        return response.data;
        
    } catch (error) {
        console.error('Sign up API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || 'Failed to create manager');
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your connection.');
        } else {
            // Other error
            throw new Error('An unexpected error occurred');
        }
    }
}

export const signIn = async (userData) => {
    try {
        const requestData = {
            email: userData.email,
            password: userData.password
        };

        const response = await axiosInstance.post('/user/signin', requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("SignIn API Response:", response.data);
        
        // Return the response data
        return response.data;
        
    } catch (error) {
        console.error('Sign in API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data.message || 'Invalid email or password';
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

export const forgetPassword = async (email) => {
    try {
        const requestData = email;

        const response = await axiosInstance.post('/user/forgot', requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("Forget Paasword API Response:", response.data);
        
        // Return the response data
        return response.data;
        
    } catch (error) {
        console.error('Forget Paasword API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data.message || 'Invalid email or password';
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

export const resetPassword = async (userData) => {
    try {
        const requestData = {
            email: userData.email,
            password: userData.password,
        };

        const response = await axiosInstance.post('/user/afterOtpVerify', requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("Reset Password API Response:", response.data);
        
        // Return the response data
        return response.data;
        
    } catch (error) {
        console.error('Reset Password API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data.message || 'Password reset failed';
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

export const otpVerification = async (userData) => {
    try {
        const requestData = {
            email: userData.email,
            otp: userData.otp
        };

        const response = await axiosInstance.post('/user/verifyOtp', requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("OTP Verifcation API Response:", response.data);
        
        // Return the response data
        return response.data;
        
    } catch (error) {
        console.error('OTP Verifcation API error:', error);
        
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data.message || 'Invalid email or password';
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