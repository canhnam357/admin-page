import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ keyword = '' }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().categories;
    const newRequestId = state.currentCategoriesRequestId + 1;
    dispatch(setCategoriesRequestId(newRequestId));
    try {
      const response = await api.get('/admin/categories', {
        params: { keyword },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách thể loại');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryName, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/admin/categories', { categoryName });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo thể loại');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, categoryName }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/admin/categories/${categoryId}`, { categoryName });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi sửa thể loại');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/categories/${categoryId}`);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa thể loại');
    }
  }
);

export const fetchCategoryBooks = createAsyncThunk(
  'categories/fetchCategoryBooks',
  async ({ categoryId, index = 1, size = 5 }, { rejectWithValue, dispatch, getState }) => {
    const state = getState().categories;
    const newRequestId = state.currentBooksRequestId + 1;
    dispatch(setBooksRequestId(newRequestId));
    try {
      const response = await api.get(`/admin/books/category_books/${categoryId}`, {
        params: { index, size },
      });
      return { data: response.data.result, requestId: newRequestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách sách');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    categoryBooks: { content: [], totalPages: 0, totalElements: 0 },
    loading: false,
    error: null,
    currentCategoriesRequestId: 0,
    currentBooksRequestId: 0,
  },
  reducers: {
    setCategoriesRequestId: (state, action) => {
      state.currentCategoriesRequestId = action.payload;
    },
    setBooksRequestId: (state, action) => {
      state.currentBooksRequestId = action.payload;
    },
    resetCategoryBooks: (state) => {
      state.categoryBooks = { content: [], totalPages: 0, totalElements: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentCategoriesRequestId) {
          state.loading = false;
          state.categories = data;
          state.error = null;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.categories = [];
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (category) => category.categoryId === action.payload.categoryId
        );
        if (index !== -1) state.categories[index] = action.payload;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (category) => category.categoryId !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategoryBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBooks.fulfilled, (state, action) => {
        const { data, requestId } = action.payload;
        if (requestId === state.currentBooksRequestId) {
          state.loading = false;
          state.categoryBooks = data;
          state.error = null;
        }
      })
      .addCase(fetchCategoryBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.categoryBooks = { content: [], totalPages: 0, totalElements: 0 };
      });
  },
});

export const { setCategoriesRequestId, setBooksRequestId, resetCategoryBooks } = categorySlice.actions;
export default categorySlice.reducer;