import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  useEffect(() => {
    const handleApiError = (event) => {
      if (event.detail && event.detail.message === 'Không tìm thấy refresh token') {
        dispatch(logoutUser());
        navigate('/login');
      }
    };

    window.addEventListener('apiError', handleApiError);
    return () => window.removeEventListener('apiError', handleApiError);
  }, [dispatch, navigate]);

  return (
    <header className="admin-header">
      <div className="admin-header__container">
        <h1 className="admin-header__title">Quản lý Admin</h1>
        {isAuthenticated && (
          <nav className="admin-header__nav">
            <button className="admin-header__logout-button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;