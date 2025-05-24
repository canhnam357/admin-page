import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api/api';

export const fetchRefundStatuses = createAsyncThunk(
  'refundStatuses/fetchRefundStatuses',
  async ({ index = 1, size = 10, orderId = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/refund-status', {
        params: { index, size, orderId },
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách trạng thái hoàn tiền');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'refundStatuses/fetchUserById',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng');
    }
  }
);

const refundStatusSlice = createSlice({
  name: 'refundStatuses',
  initialState: {
    refundStatuses: [],
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
      .addCase(fetchRefundStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchRefundStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.refundStatuses = action.payload;
        state.notification = { type: 'success', message: 'Lấy danh sách trạng thái hoàn tiền thành công' };
        toast.dismiss();
        toast.success('Lấy danh sách trạng thái hoàn tiền thành công');
      })
      .addCase(fetchRefundStatuses.rejected, (state, action) => {
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

export const { clearSelectedUser } = refundStatusSlice.actions;
export default refundStatusSlice.reducer;