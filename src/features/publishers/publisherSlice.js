import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice'; // Import logoutUser

export const fetchPublishers = createAsyncThunk(
  'publishers/fetchPublishers',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/publishers', {
        params: { index, size, keyword },
      });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách nhà xuất bản');
    }
  }
);

export const createPublisher = createAsyncThunk(
  'publishers/createPublisher',
  async (publisherName, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/publishers', { publisherName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo nhà xuất bản');
    }
  }
);

export const updatePublisher = createAsyncThunk(
  'publishers/updatePublisher',
  async ({ publisherId, publisherName }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/publishers/${publisherId}`, { publisherName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi sửa nhà xuất bản');
    }
  }
);

export const deletePublisher = createAsyncThunk(
  'publishers/deletePublisher',
  async (publisherId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/publishers/${publisherId}`);
      return publisherId;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhà xuất bản');
    }
  }
);

const publisherSlice = createSlice({
  name: 'publishers',
  initialState: {
    publishers: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    action: null,
  },
  reducers: {
    resetPublisherState: (state) => {
      state.error = null;
      state.action = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'fetch';
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers = action.payload;
        state.action = 'fetch';
      })
      .addCase(fetchPublishers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'fetch';
      })
      .addCase(createPublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'create';
      })
      .addCase(createPublisher.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers.content.push(action.payload);
        state.publishers.totalElements += 1;
        state.action = 'create';
      })
      .addCase(createPublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'create';
      })
      .addCase(updatePublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'update';
      })
      .addCase(updatePublisher.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.publishers.content.findIndex(
          (publisher) => publisher.publisherId === action.payload.publisherId
        );
        if (index !== -1) state.publishers.content[index] = action.payload;
        state.action = 'update';
      })
      .addCase(updatePublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'update';
      })
      .addCase(deletePublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'delete';
      })
      .addCase(deletePublisher.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers.content = state.publishers.content.filter(
          (publisher) => publisher.publisherId !== action.payload
        );
        state.publishers.totalElements -= 1;
        state.action = 'delete';
      })
      .addCase(deletePublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'delete';
      });
  },
});

export const { resetPublisherState } = publisherSlice.actions;
export default publisherSlice.reducer;