import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import authorReducer from './features/authors/authorSlice';
import publisherReducer from './features/publishers/publisherSlice';
import distributorReducer from './features/distributors/distributorSlice';
import categoryReducer from './features/categories/categorySlice';
import bookTypeReducer from './features/book-types/bookTypeSlice';
import bookReducer from './features/books/bookSlice';
import userReducer from './features/users/userSlice';
import orderStatusReducer from './features/order-status/orderStatusSlice';
import refundStatusReducer from './features/refundStatus/refundStatusSlice';
import statisticsReducer from './features/statistics/statisticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    authors: authorReducer,
    publishers: publisherReducer,
    distributors: distributorReducer,
    categories: categoryReducer,
    bookTypes: bookTypeReducer,
    books: bookReducer,
    users: userReducer,
    orderStatuses: orderStatusReducer,
    refundStatuses: refundStatusReducer,
    statistics: statisticsReducer,
  },
});

export default store;