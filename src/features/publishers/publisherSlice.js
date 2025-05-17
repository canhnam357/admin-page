import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

export const fetchPublishers = createAsyncThunk(
  'publishers/fetchPublishers',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().publishers;
    const newRequestId = state.currentPublishersRequestId + 1;
    dispatch(setPublishersRequestId(newRequestId));
    try {
      const response = await api.get('/admin/publishers', {
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

export const fetchPublisherBooks = createAsyncThunk(
  'publishers/fetchPublisherBooks',
  async ({ publisherId, index = 1, size = 10 }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().publishers;
    const newRequestId = state.currentBooksRequestId + 1;
    dispatch(setBooksRequestId(newRequestId));
    try {
      const response = await api.get(`/admin/books/publisher_book/${publisherId}`, {
        params: { index, size },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách sách');
    }
  }
);

const publisherSlice = createSlice({
  name: 'publishers',
  initialState: {
    publishers: { content: [], totalPages: 0, totalElements: 0 },
    publisherBooks: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    currentPublishersRequestId: 0,
    currentBooksRequestId: 0,
  },
  reducers: {
    setPublishersRequestId: (state, action) => {
      state.currentPublishersRequestId = action.payload;
    },
    setBooksRequestId: (state, action) => {
      state.currentBooksRequestId = action.payload;
    },
    resetPublisherBooks: (state) => {
      state.publisherBooks = { content: [], totalPages: 0, totalElements: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentPublishersRequestId) {
          state.loading = false;
          state.publishers = data;
          state.error = null;
        }
      })
      .addCase(fetchPublishers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.publishers = { content: [], totalPages: 0, totalElements: 0 };
      })
      .addCase(createPublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPublisher.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers.content.push(action.payload);
        state.publishers.totalElements += 1;
        state.error = null;
      })
      .addCase(createPublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePublisher.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.publishers.content.findIndex(
          (publisher) => publisher.publisherId === action.payload.publisherId
        );
        if (index !== -1) state.publishers.content[index] = action.payload;
        state.error = null;
      })
      .addCase(updatePublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePublisher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePublisher.fulfilled, (state, action) => {
        state.loading = false;
        state.publishers.content = state.publishers.content.filter(
          (publisher) => publisher.publisherId !== action.payload
        );
        state.publishers.totalElements -= 1;
        state.error = null;
      })
      .addCase(deletePublisher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPublisherBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublisherBooks.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentBooksRequestId) {
          state.loading = false;
          state.publisherBooks = data;
          state.error = null;
        }
      })
      .addCase(fetchPublisherBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.publisherBooks = { content: [], totalPages: 0, totalElements: 0 };
      });
  },
});

export const { setPublishersRequestId, setBooksRequestId, resetPublisherBooks } = publisherSlice.actions;
export default publisherSlice.reducer;