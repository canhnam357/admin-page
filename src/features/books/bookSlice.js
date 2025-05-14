import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice'; // Import logoutUser để dispatch

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/books', {
        params: { index, size, keyword },
      });
      toast.dismiss();
      toast.success("Lấy danh sách sách thành công!");
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser()); // Dispatch logoutUser khi gặp 401
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/login';
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
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/login';
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
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/login';
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
    books: [],
    loading: false,
    error: null,
    notification: null,
  },
  reducers: {
    resetBookState: (state) => {
      state.loading = false;
      state.error = null;
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.books = [];
        toast.error(action.payload);
      })
      // Create Book
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(createBook.fulfilled, (state) => {
        state.loading = false;
        state.notification = { type: 'success', message: 'Tạo sách thành công' };
        toast.success('Tạo sách thành công');
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notification = null;
      })
      .addCase(updateBook.fulfilled, (state) => {
        state.loading = false;
        state.notification = { type: 'success', message: 'Cập nhật sách thành công' };
        toast.success('Cập nhật sách thành công');
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetBookState } = bookSlice.actions;
export default bookSlice.reducer;