import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { logoutUser } from '../auth/authSlice';

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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
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
      if (error.response?.status === 401) {
        dispatch(logoutUser());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa thể loại');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
    currentCategoriesRequestId: 0,
  },
  reducers: {
    setCategoriesRequestId: (state, action) => {
      state.currentCategoriesRequestId = action.payload;
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
      });
  },
});

export const { setCategoriesRequestId } = categorySlice.actions;
export default categorySlice.reducer;