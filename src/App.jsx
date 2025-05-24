import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Login from './features/auth/login/Login';
import Admin from './features/admin/Admin';
import Statistics from './features/statistics/Statistics';
import UserList from './features/users/UserList';
import BookList from './features/books/BookList';
import AuthorList from './features/authors/AuthorList';
import PublisherList from './features/publishers/PublisherList';
import DistributorList from './features/distributors/DistributorList';
import CategoryList from './features/categories/CategoryList';
import BookTypeList from './features/book-types/BookTypeList';
import OrderStatus from './features/order-status/OrderStatus';
import RefundStatus from './features/refundStatus/RefundStatus'
import './App.css';
import { ToastContainer } from 'react-toastify';

const App = () => {

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
  }, [dispatch, isAuthenticated]);

  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/*" element={<Admin />}>
              <Route path="statistics" element={<Statistics />} />
              <Route path="users" element={<UserList />} />
              <Route path="books" element={<BookList />} />
              <Route path="authors" element={<AuthorList />} />
              <Route path="publishers" element={<PublisherList />} />
              <Route path="distributors" element={<DistributorList />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="book-types" element={<BookTypeList />} />
              <Route path="order-status" element={<OrderStatus />} />
              <Route path="refund-status" element={<RefundStatus />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="custom-toast-container"
          style={{ zIndex: 99999 }} // Tăng z-index để đảm bảo không bị che
        />
      </Router>
    </Provider>
  );
};

export default App;