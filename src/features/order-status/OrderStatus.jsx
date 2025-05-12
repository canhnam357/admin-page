import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderStatuses, fetchUserById, clearSelectedUser } from './orderStatusSlice';
import './OrderStatus.css';

const OrderStatus = () => {
  const dispatch = useDispatch();
  const { orderStatuses, selectedUser, loading } = useSelector((state) => state.orderStatuses);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [size] = useState(10);

  useEffect(() => {
    dispatch(fetchOrderStatuses({ index: currentPage, size, orderId }));
  }, [dispatch, currentPage, orderId, size]); // Thêm 'size' vào dependency array

  const handleNextPage = () => {
    if (currentPage < orderStatuses.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchOrderStatuses({ index: 1, size, orderId }));
  };

  const handleViewUser = (userId) => {
    dispatch(fetchUserById(userId));
  };

  const handleCloseUserModal = () => {
    dispatch(clearSelectedUser());
  };

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="order-status__table-row--loading">
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
        <td><div className="order-status__skeleton order-status__skeleton--text"></div></td>
      </tr>
    ));
  };

  return (
    <div className="order-status">
      <h2 className="order-status__title">Danh sách trạng thái đơn hàng</h2>
      <div className="order-status__actions">
        <form onSubmit={handleSearch} className="order-status__search-form">
          <input
            type="text"
            placeholder="Tìm theo Order ID..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="order-status__search-input"
          />
          <button type="submit" className="order-status__search-button">Tìm</button>
        </form>
      </div>
      <table className="order-status__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>From Status</th>
            <th>To Status</th>
            <th>Change By</th>
            <th>Change At</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : orderStatuses.content && orderStatuses.content.length > 0 ? (
            orderStatuses.content.map((status) => (
              <tr key={status.id} className="order-status__table-row">
                <td>{status.id}</td>
                <td>{status.orderId}</td>
                <td>{status.fromStatus}</td>
                <td>{status.toStatus}</td>
                <td>
                  <button
                    className="order-status__action-button"
                    onClick={() => handleViewUser(status.changeBy)}
                  >
                    {status.changeBy}
                  </button>
                </td>
                <td>{new Date(status.changeAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="order-status__empty">Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
      <div className="order-status__pagination">
        <button
          className="order-status__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {Array.from({ length: orderStatuses.totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            className={`order-status__pagination-button ${currentPage === number ? 'order-status__pagination-button--active' : ''}`}
            onClick={() => handlePageClick(number)}
            disabled={loading}
          >
            {number}
          </button>
        ))}
        <button
          className="order-status__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === orderStatuses.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {selectedUser && (
        <div className="order-status__modal" onClick={handleCloseUserModal}>
          <div className="order-status__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="order-status__modal-close" onClick={handleCloseUserModal}>×</span>
            <h3 className="order-status__modal-title">Thông tin người dùng</h3>
            <div className="order-status__user-details">
              <div className="order-status__detail-item">
                <strong>User ID:</strong> {selectedUser.userId}
              </div>
              <div className="order-status__detail-item">
                <strong>Họ tên:</strong> {selectedUser.fullName}
              </div>
              <div className="order-status__detail-item">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="order-status__detail-item">
                <strong>Số điện thoại:</strong> {selectedUser.phoneNumber}
              </div>
              <div className="order-status__detail-item">
                <strong>Ngày sinh:</strong> {new Date(selectedUser.dateOfBirth).toLocaleDateString('vi-VN')}
              </div>
              <div className="order-status__detail-item">
                <strong>Giới tính:</strong> {selectedUser.gender === 'MALE' ? 'Nam' : 'Nữ'}
              </div>
              <div className="order-status__detail-item">
                <strong>Vai trò:</strong> {selectedUser.role}
              </div>
              <div className="order-status__detail-item">
                <strong>Hoạt động:</strong> {selectedUser.active ? 'Có' : 'Không'}
              </div>
              <div className="order-status__detail-item">
                <strong>Xác minh:</strong> {selectedUser.verified ? 'Có' : 'Không'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;