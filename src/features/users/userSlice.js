import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ index = 1, size = 10, email = '', isActive = 2, isVerified = 2 }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/users', {
        params: { index, size, email, isActive, isVerified },
      });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ userId, active, verified, role }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, { active, verified, role });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: { content: [], totalPages: 1, totalElements: 0 },
    loading: false,
    error: null,
    action: null,
  },
  reducers: {
    resetUserState: (state) => {
      state.error = null;
      state.action = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.action = 'fetch';
        console.log('fetchUsers pending - action:', state.action); // Debug
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
        state.action = 'fetch'; // Đặt action để đảm bảo toast hiển thị
        console.log('fetchUsers fulfilled - action:', state.action, 'users:', state.users); // Debug
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'fetch';
        console.log('fetchUsers rejected - error:', state.error, 'action:', state.action); // Debug
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.action = 'update';
        console.log('updateUserStatus pending - action:', state.action); // Debug
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.action = 'update'; // Đặt action để đảm bảo toast hiển thị
        console.log('updateUserStatus fulfilled - action:', state.action); // Debug
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'update';
        console.log('updateUserStatus rejected - error:', state.error, 'action:', state.action); // Debug
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;