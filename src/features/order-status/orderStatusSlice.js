import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api/api';

export const fetchOrderStatuses = createAsyncThunk(
  'orderStatuses/fetchOrderStatuses',
  async ({ index = 1, size = 10, orderId = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/order-status', {
        params: { index, size, orderId },
      });
      console.log(response.data.result);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách trạng thái đơn hàng');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'orderStatuses/fetchUserById',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng');
    }
  }
);

const orderStatusSlice = createSlice({
  name: 'orderStatuses',
  initialState: {
    orderStatuses: [],
    selectedUser: null,
    loading: false,
    error: null,
    notification: null,
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchOrderStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.orderStatuses = action.payload;
        state.notification = { type: 'success', message: 'Lấy danh sách trạng thái đơn hàng thành công' };
        toast.dismiss();
        toast.success('Lấy danh sách trạng thái đơn hàng thành công');
      })
      .addCase(fetchOrderStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
        toast.dismiss();
        toast.error(action.payload);
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.notification = { type: 'success', message: 'Lấy thông tin người dùng thành công' };
        toast.dismiss();
        toast.success('Lấy thông tin người dùng thành công');
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
        toast.dismiss();
        toast.error(action.payload);
      });
  },
});

export const { clearSelectedUser } = orderStatusSlice.actions;
export default orderStatusSlice.reducer;