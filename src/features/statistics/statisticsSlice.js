import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchMonthlyRevenue = createAsyncThunk(
  'statistics/fetchMonthlyRevenue',
  async (year, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/admin/statistics/monthly-revenue?year=${year}`);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy doanh thu theo tháng');
    }
  }
);

export const fetchNewUsersCount = createAsyncThunk(
  'statistics/fetchNewUsersCount',
  async (year, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/admin/statistics/count-verified-user?year=${year}`);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy số lượng người dùng mới');
    }
  }
);

export const fetchOrdersByStatus = createAsyncThunk(
  'statistics/fetchOrdersByStatus',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/statistics/order-by-status');
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy số lượng đơn hàng theo trạng thái');
    }
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState: {
    monthlyRevenue: null,
    newUsersCount: null,
    ordersByStatus: null,
    loading: false,
    error: null,
    notification: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyRevenue = action.payload;
        state.notification = { type: 'success', message: 'Lấy doanh thu theo tháng thành công' };
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
      })
      .addCase(fetchNewUsersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchNewUsersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.newUsersCount = action.payload;
        state.notification = { type: 'success', message: 'Lấy số lượng người dùng mới thành công' };
      })
      .addCase(fetchNewUsersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
      })
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersByStatus = action.payload;
        state.notification = { type: 'success', message: 'Lấy số lượng đơn hàng theo trạng thái thành công' };
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notification = { type: 'error', message: action.payload };
      });
  },
});

export default statisticsSlice.reducer;