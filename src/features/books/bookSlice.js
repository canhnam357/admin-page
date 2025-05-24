import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().books;
    const newRequestId = state.currentBooksRequestId + 1;
    dispatch(setBooksRequestId(newRequestId));
    try {
      const response = await api.get('/admin/books', {
        params: { index, size, keyword },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách sách');
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/books', bookData);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo sách');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ bookId, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/books/${bookId}`, formData);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật sách');
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    currentBooksRequestId: 0,
  },
  reducers: {
    resetBookState: (state) => {
      state.loading = false;
      state.error = null;
    },
    setBooksRequestId: (state, action) => {
      state.currentBooksRequestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('fetchBooks pending');
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentBooksRequestId) {
          state.loading = false;
          state.books = data;
          console.log('fetchBooks fulfilled - books:', state.books);
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.books = { content: [], totalPages: 0, totalElements: 0 };
        console.log('fetchBooks rejected - error:', state.error);
      })
      // Create Book
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('createBook pending');
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.content.push(action.payload);
        state.books.totalElements += 1;
        console.log('createBook fulfilled - payload:', action.payload);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('createBook rejected - error:', state.error);
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('updateBook pending');
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.content.findIndex((book) => book.bookId === action.payload.bookId);
        if (index !== -1) state.books.content[index] = action.payload;
        console.log('updateBook fulfilled - payload:', action.payload);
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('updateBook rejected - error:', state.error);
      });
  },
});

export const { resetBookState, setBooksRequestId } = bookSlice.actions;
export default bookSlice.reducer;