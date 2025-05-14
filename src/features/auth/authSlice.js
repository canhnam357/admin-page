import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { toast } from 'react-toastify';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, username } = response.data.result;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { username };
      }
      throw new Error(response.data.message || 'Đăng nhập thất bại!');
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại!';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      const statusCode = error.response?.data?.statusCode;
      return rejectWithValue({ message, statusCode });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/logout', null, { params: { refreshToken } });
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast.dismiss();
        toast.success("Đăng xuất thành công!");
        return true;
      }
      throw new Error('Đăng xuất thất bại!');
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng xuất thất bại!';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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