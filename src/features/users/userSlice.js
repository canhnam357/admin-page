import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ index = 1, size = 10, email = '', isActive = 2, isVerified = 2, role = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().users;
    const newRequestId = state.currentUsersRequestId + 1;
    dispatch(setUsersRequestId(newRequestId));
    try {
      const response = await api.get('/admin/users', {
        params: { index, size, email, isActive, isVerified, role },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
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
    currentUsersRequestId: 0,
  },
  reducers: {
    setUsersRequestId: (state, action) => {
      state.currentUsersRequestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentUsersRequestId) {
          state.loading = false;
          state.users = data;
          state.error = null;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = { content: [], totalPages: 0, totalElements: 0 };
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUsersRequestId } = userSlice.actions;
export default userSlice.reducer;