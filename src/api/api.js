import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL_BASE,
});

// Hàm để cấu hình interceptor với store (chỉ thêm token vào header)
export const configureApiInterceptors = (store) => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      console.log('Response intercepted:', response); // Log để theo dõi
      return response;
    },
    async (error) => {
      console.log('Error intercepted:', error); // Log để theo dõi
      return Promise.reject(error); // Truyền lỗi trực tiếp đến slice
    }
  );
};

export default api;