import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, clearNotification } from '../authSlice';
import './Login.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, notification } = useSelector((state) => state.auth);

  // Xóa thông báo khi vào trang
  useEffect(() => {
    dispatch(clearNotification());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data)).unwrap();
      if (resultAction && localStorage.getItem('accessToken')) {
        navigate('/');
      }
    } catch (error) {
      // Xử lý lỗi 401 hoặc refresh token thất bại từ api.js
      if (error.message === 'Không tìm thấy refresh token' || error.response?.status === 401) {
        dispatch(logoutUser());
        navigate('/login');
      }
      console.error('Lỗi đăng nhập:', error);
      // Thông báo lỗi đã được xử lý trong authSlice, không cần hiển thị thêm toast ở đây
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h2>Đăng nhập Admin</h2>
          <p>Vui lòng nhập thông tin để truy cập hệ thống quản trị</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ',
                },
              })}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              })}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;