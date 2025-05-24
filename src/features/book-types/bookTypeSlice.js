import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchBookTypes = createAsyncThunk(
  'bookTypes/fetchBookTypes',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/book-types');
      return response.data.result;
    } catch (error) {
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
        console.log('fetchBookTypes pending - action:', state.action); // Debug
      })
      .addCase(fetchBookTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes = action.payload;
        state.action = null; // Reset action
        console.log('fetchBookTypes fulfilled - action:', state.action, 'bookTypes:', state.bookTypes); // Debug
      })
      .addCase(fetchBookTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = null; // Reset action
        console.log('fetchBookTypes rejected - error:', state.error, 'action:', state.action); // Debug
      })
      .addCase(createBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'create';
        console.log('createBookType pending - action:', state.action); // Debug
      })
      .addCase(createBookType.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes.push(action.payload);
        state.action = null; // Reset action
        console.log('createBookType fulfilled - action:', state.action, 'payload:', action.payload); // Debug
      })
      .addCase(createBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = null; // Reset action
        console.log('createBookType rejected - error:', state.error, 'action:', state.action); // Debug
      })
      .addCase(updateBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'update';
        console.log('updateBookType pending - action:', state.action); // Debug
      })
      .addCase(updateBookType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookTypes.findIndex(
          (bookType) => bookType.bookTypeId === action.payload.bookTypeId
        );
        if (index !== -1) state.bookTypes[index] = action.payload;
        state.action = null; // Reset action
        console.log('updateBookType fulfilled - action:', state.action, 'payload:', action.payload); // Debug
      })
      .addCase(updateBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = null; // Reset action
        console.log('updateBookType rejected - error:', state.error, 'action:', state.action); // Debug
      })
      .addCase(deleteBookType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'delete';
        console.log('deleteBookType pending - action:', state.action); // Debug
      })
      .addCase(deleteBookType.fulfilled, (state, action) => {
        state.loading = false;
        state.bookTypes = state.bookTypes.filter(
          (bookType) => bookType.bookTypeId !== action.payload
        );
        state.action = null; // Reset action
        console.log('deleteBookType fulfilled - action:', state.action, 'payload:', action.payload); // Debug
      })
      .addCase(deleteBookType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = null; // Reset action
        console.log('deleteBookType rejected - error:', state.error, 'action:', state.action); // Debug
      });
  },
});

export const { resetBookTypeState } = bookTypeSlice.actions;
export default bookTypeSlice.reducer;