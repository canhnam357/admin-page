import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1]; // Lấy phần Payload
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Thay thế ký tự
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload); // Trả về object payload
    } catch (error) {
        console.error('Lỗi giải mã JWT:', error);
        return null;
    }
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password }, {withCredentials: true});
      if (response.data.success) {
        const { accessToken, username } = response.data.result;
        const decode = decodeJWT(accessToken);
        if (decode.user_role !== "ADMIN") {
          const message = 'Bạn không có quyền truy cập';
          const statusCode = response?.data?.statusCode;
          return rejectWithValue({message, statusCode});
        }
        localStorage.setItem('accessToken', accessToken);
        return { username };
      }
      throw new Error(response.data.message || 'Đăng nhập thất bại!');
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại!';
      localStorage.removeItem('accessToken');
      const statusCode = error.response?.data?.statusCode;
      return rejectWithValue({ message, statusCode });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/logout', null, {withCredentials: true});
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        toast.dismiss();
        toast.success("Đăng xuất thành công!");
        return true;
      }
      throw new Error('Đăng xuất thất bại!');
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng xuất thất bại!';
      localStorage.removeItem('accessToken');
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
    notification: null,
  },
  reducers: {
    clearNotification: (state) => {
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.notification = { type: 'success', message: 'Đăng nhập thành công!' };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.statusCode === 404) {
          state.notification = { type: 'error', message: 'Email không tồn tại!' };
        } else if (action.payload.statusCode === 403) {
          state.notification = { type: 'error', message: 'Chỉ ADMIN mới được phép đăng nhập!' };
        } else if (action.payload.statusCode === 401) {
          state.notification = { type: 'error', message: 'Mật khẩu không đúng!' };
        } else {
          state.notification = { type: 'error', message: action.payload.message };
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.notification = { type: 'success', message: 'Đăng xuất thành công!' };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
      });
  },
});

export const { clearNotification } = authSlice.actions;
export default authSlice.reducer;