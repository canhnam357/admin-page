import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice'; // Import logoutUser

export const fetchBookTypes = createAsyncThunk(
  'bookTypes/fetchBookTypes',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/book-types');
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách loại sách');
    }
  }
);

export const createBookType = createAsyncThunk(
  'bookTypes/createBookType',
  async (bookTypeName, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/book-types', { bookTypeName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo loại sách');
    }
  }
);

export const updateBookType = createAsyncThunk(
  'bookTypes/updateBookType',
  async ({ bookTypeId, bookTypeName }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/book-types/${bookTypeId}`, { bookTypeName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi sửa loại sách');
    }
  }
);

export const deleteBookType = createAsyncThunk(
  'bookTypes/deleteBookType',
  async (bookTypeId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/book-types/${bookTypeId}`);
      return bookTypeId;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa loại sách');
    }
  }
);

const bookTypeSlice = createSlice({
  name: 'bookTypes',
  initialState: {
    bookTypes: [],
    loading: false,
    error: null,
    action: null,
  },
  reducers: {
    resetBookTypeState: (state) => {
      state.error = null;
      state.action = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'fetch';
      })
      .addCase(fetchBookTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes = action.payload;
        state.action = 'fetch';
      })
      .addCase(fetchBookTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'fetch';
      })
      .addCase(createBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'create';
      })
      .addCase(createBookType.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes.push(action.payload);
        state.action = 'create';
      })
      .addCase(createBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'create';
      })
      .addCase(updateBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'update';
      })
      .addCase(updateBookType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookTypes.findIndex(
          (bookType) => bookType.bookTypeId === action.payload.bookTypeId
        );
        if (index !== -1) state.bookTypes[index] = action.payload;
        state.action = 'update';
      })
      .addCase(updateBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'update';
      })
      .addCase(deleteBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'delete';
      })
      .addCase(deleteBookType.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes = state.bookTypes.filter(
          (bookType) => bookType.bookTypeId !== action.payload
        );
        state.action = 'delete';
      })
      .addCase(deleteBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'delete';
      });
  },
});

export const { resetBookTypeState } = bookTypeSlice.actions;
export default bookTypeSlice.reducer;