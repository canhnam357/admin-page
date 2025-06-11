import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../auth/authSlice';
import Sidebar from './Sidebar';
import './Admin.css';

const Admin = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('accessToken')) {
      dispatch(logoutUser());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;