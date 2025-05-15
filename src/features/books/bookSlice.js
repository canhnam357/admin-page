import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/books', {
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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      if (error.response?.status === 422) {
        if (error.response.data.message.includes('bookName')) {
          return rejectWithValue('Tên sách không được rỗng hoặc đã tồn tại!');
        } else if (error.response.data.message.includes('inStock')) {
          return rejectWithValue('Số lượng phải lớn hơn hoặc bằng 0!');
        } else if (error.response.data.message.includes('price')) {
          return rejectWithValue('Giá phải lớn hơn 0!');
        } else if (error.response.data.message.includes('numberOfPage')) {
          return rejectWithValue('Số trang phải lớn hơn 0!');
        } else if (error.response.data.message.includes('weight')) {
          return rejectWithValue('Cân nặng phải lớn hơn 0!');
        } else if (error.response.data.message.includes('authorId')) {
          return rejectWithValue('Vui lòng chọn tác giả hợp lệ!');
        } else if (error.response.data.message.includes('publisherId')) {
          return rejectWithValue('Vui lòng chọn nhà xuất bản hợp lệ!');
        } else if (error.response.data.message.includes('distributorId')) {
          return rejectWithValue('Vui lòng chọn nhà phát hành hợp lệ!');
        } else if (error.response.data.message.includes('bookTypeId')) {
          return rejectWithValue('Vui lòng chọn loại sách hợp lệ!');
        }
      }
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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      if (error.response?.status === 404) {
        return rejectWithValue('Sách không tồn tại!');
      }
      if (error.response?.status === 422) {
        if (error.response.data.message.includes('bookName')) {
          return rejectWithValue('Tên sách không được rỗng hoặc đã tồn tại!');
        } else if (error.response.data.message.includes('inStock')) {
          return rejectWithValue('Số lượng phải lớn hơn hoặc bằng 0!');
        } else if (error.response.data.message.includes('price')) {
          return rejectWithValue('Giá phải lớn hơn 0!');
        } else if (error.response.data.message.includes('numberOfPage')) {
          return rejectWithValue('Số trang phải lớn hơn 0!');
        } else if (error.response.data.message.includes('weight')) {
          return rejectWithValue('Cân nặng phải lớn hơn 0!');
        } else if (error.response.data.message.includes('authorId')) {
          return rejectWithValue('Vui lòng chọn tác giả hợp lệ!');
        } else if (error.response.data.message.includes('publisherId')) {
          return rejectWithValue('Vui lòng chọn nhà xuất bản hợp lệ!');
        } else if (error.response.data.message.includes('distributorId')) {
          return rejectWithValue('Vui lòng chọn nhà phát hành hợp lệ!');
        } else if (error.response.data.message.includes('bookTypeId')) {
          return rejectWithValue('Vui lòng chọn loại sách hợp lệ!');
        }
      }
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
  },
  reducers: {
    resetBookState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('fetchBooks pending'); // Debug
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
        console.log('fetchBooks fulfilled - books:', state.books); // Debug
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.books = { content: [], totalPages: 0, totalElements: 0 };
        console.log('fetchBooks rejected - error:', state.error); // Debug
      })
      // Create Book
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('createBook pending'); // Debug
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.content.push(action.payload); // Thêm sách mới vào state
        state.books.totalElements += 1; // Tăng tổng số phần tử
        console.log('createBook fulfilled - payload:', action.payload); // Debug
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('createBook rejected - error:', state.error); // Debug
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('updateBook pending'); // Debug
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.content.findIndex((book) => book.bookId === action.payload.bookId);
        if (index !== -1) state.books.content[index] = action.payload; // Cập nhật sách trong state
        console.log('updateBook fulfilled - payload:', action.payload); // Debug
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('updateBook rejected - error:', state.error); // Debug
      });
  },
});

export const { resetBookState } = bookSlice.actions;
export default bookSlice.reducer;