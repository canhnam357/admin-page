import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

export const fetchDistributors = createAsyncThunk(
  'distributors/fetchDistributors',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().distributors;
    const newRequestId = state.currentDistributorsRequestId + 1;
    dispatch(setDistributorsRequestId(newRequestId));
    try {
      const response = await api.get('/admin/distributors', {
        params: { index, size, keyword },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách nhà phát hành');
    }
  }
);

export const createDistributor = createAsyncThunk(
  'distributors/createDistributor',
  async (distributorName, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/distributors', { distributorName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo nhà phát hành');
    }
  }
);

export const updateDistributor = createAsyncThunk(
  'distributors/updateDistributor',
  async ({ distributorId, distributorName }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/distributors/${distributorId}`, { distributorName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi sửa nhà phát hành');
    }
  }
);

export const deleteDistributor = createAsyncThunk(
  'distributors/deleteDistributor',
  async (distributorId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/distributors/${distributorId}`);
      return distributorId;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhà phát hành');
    }
  }
);

const distributorSlice = createSlice({
  name: 'distributors',
  initialState: {
    distributors: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    currentDistributorsRequestId: 0,
  },
  reducers: {
    setDistributorsRequestId: (state, action) => {
      state.currentDistributorsRequestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributors.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentDistributorsRequestId) {
          state.loading = false;
          state.distributors = data;
          state.error = null;
        }
      })
      .addCase(fetchDistributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.distributors = { content: [], totalPages: 0, totalElements: 0 };
      })
      .addCase(createDistributor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDistributor.fulfilled, (state, action) => {
        state.loading = false;
        state.distributors.content.push(action.payload);
        state.distributors.totalElements += 1;
        state.error = null;
      })
      .addCase(createDistributor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDistributor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDistributor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.distributors.content.findIndex(
          (distributor) => distributor.distributorId === action.payload.distributorId
        );
        if (index !== -1) state.distributors.content[index] = action.payload;
        state.error = null;
      })
      .addCase(updateDistributor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDistributor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDistributor.fulfilled, (state, action) => {
        state.loading = false;
        state.distributors.content = state.distributors.content.filter(
          (distributor) => distributor.distributorId !== action.payload
        );
        state.distributors.totalElements -= 1;
        state.error = null;
      })
      .addCase(deleteDistributor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDistributorsRequestId } = distributorSlice.actions;
export default distributorSlice.reducer;