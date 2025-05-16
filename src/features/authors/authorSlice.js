import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async ({ index = 1, size = 10, keyword = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().authors;
    const newRequestId = state.currentAuthorsRequestId + 1;
    dispatch(setAuthorsRequestId(newRequestId));
    try {
      const response = await api.get('/admin/authors', {
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
  async ({ authorId, index = 1, size = 10 }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().authors;
    const newRequestId = state.currentBooksRequestId + 1;
    dispatch(setBooksRequestId(newRequestId));
    try {
      const response = await api.get(`/admin/books/author_books/${authorId}`, {
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

const authorSlice = createSlice({
  name: 'authors',
  initialState: {
    authors: { content: [], totalPages: 0, totalElements: 0 },
    authorBooks: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    currentAuthorsRequestId: 0,
    currentBooksRequestId: 0,
  },
  reducers: {
    setAuthorsRequestId: (state, action) => {
      state.currentAuthorsRequestId = action.payload;
    },
    setBooksRequestId: (state, action) => {
      state.currentBooksRequestId = action.payload;
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
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentAuthorsRequestId) {
          state.loading = false;
          state.authors = data;
          state.error = null;
        }
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authors = { content: [], totalPages: 0, totalElements: 0 };
      })
      .addCase(createAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors.content.push(action.payload);
        state.authors.totalElements += 1;
        state.error = null;
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAuthor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.authors.content.findIndex(
          (author) => author.authorId === action.payload.authorId
        );
        if (index !== -1) state.authors.content[index] = action.payload;
        state.error = null;
      })
      .addCase(updateAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors.content = state.authors.content.filter(
          (author) => author.authorId !== action.payload
        );
        state.authors.totalElements -= 1;
        state.error = null;
      })
      .addCase(deleteAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuthorBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthorBooks.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentBooksRequestId) {
          state.loading = false;
          state.authorBooks = data;
          state.error = null;
        }
      })
      .addCase(fetchAuthorBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authorBooks = { content: [], totalPages: 0, totalElements: 0 };
      });
  },
});

export const { setAuthorsRequestId, setBooksRequestId, resetAuthorBooks } = authorSlice.actions;
export default authorSlice.reducer;