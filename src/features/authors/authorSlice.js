import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice'; // Import logoutUser

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/admin/authors', {
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
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách tác giả');
    }
  }
);

export const createAuthor = createAsyncThunk(
  'authors/createAuthor',
  async (authorName, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/authors', { authorName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo tác giả');
    }
  }
);

export const updateAuthor = createAsyncThunk(
  'authors/updateAuthor',
  async ({ authorId, authorName }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/authors/${authorId}`, { authorName });
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi sửa tác giả');
    }
  }
);

export const deleteAuthor = createAsyncThunk(
  'authors/deleteAuthor',
  async (authorId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/authors/${authorId}`);
      return authorId;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa tác giả');
    }
  }
);

export const fetchAuthorBooks = createAsyncThunk(
  'authors/fetchAuthorBooks',
  async ({ authorId, index = 1, size = 10 }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/admin/books/author_books/${authorId}`, {
        params: { index, size },
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

const authorSlice = createSlice({
  name: 'authors',
  initialState: {
    authors: { content: [], totalPages: 0, totalElements: 0 },
    authorBooks: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    action: null,
  },
  reducers: {
    resetAuthorState: (state) => {
      state.error = null;
      state.action = null;
    },
    resetAuthorBooks: (state) => {
      state.authorBooks = { content: [], totalPages: 0, totalElements: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'fetch';
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.loading = false;
        state.authors = action.payload;
        state.action = 'fetch';
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'fetch';
      })
      .addCase(createAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'create';
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors.content.push(action.payload);
        state.authors.totalElements += 1;
        state.action = 'create';
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'create';
      })
      .addCase(updateAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'update';
      })
      .addCase(updateAuthor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.authors.content.findIndex(
          (author) => author.authorId === action.payload.authorId
        );
        if (index !== -1) state.authors.content[index] = action.payload;
        state.action = 'update';
      })
      .addCase(updateAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'update';
      })
      .addCase(deleteAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'delete';
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors.content = state.authors.content.filter(
          (author) => author.authorId !== action.payload
        );
        state.authors.totalElements -= 1;
        state.action = 'delete';
      })
      .addCase(deleteAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'delete';
      })
      .addCase(fetchAuthorBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.action = 'fetchBooks';
      })
      .addCase(fetchAuthorBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.authorBooks = action.payload;
        state.action = 'fetchBooks';
      })
      .addCase(fetchAuthorBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.action = 'fetchBooks';
      });
  },
});

export const { resetAuthorState, resetAuthorBooks } = authorSlice.actions;
export default authorSlice.reducer;