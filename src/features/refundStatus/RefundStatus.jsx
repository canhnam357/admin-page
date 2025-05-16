import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRefundStatuses, fetchUserById, clearSelectedUser } from './refundStatusSlice';
import './RefundStatus.css';

// Object ánh xạ trạng thái hoàn tiền sang tiếng Việt
const refundStatusLabels = {
  NONE: 'Không hoàn',
  PENDING_REFUND: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  FAILED_REFUND: 'Hoàn tiền thất bại',
};

// Object ánh xạ giới tính sang tiếng Việt
const genderLabels = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

// Object ánh xạ vai trò sang tiếng Việt
const roleLabels = {
  ADMIN: 'Quản trị viên',
  EMPLOYEE: 'Nhân viên',
  SHIPPER: 'Nhân viên giao hàng',
  USER: 'Người dùng',
};

const RefundStatus = () => {
  const dispatch = useDispatch();
  const { refundStatuses, selectedUser, loading } = useSelector((state) => state.refundStatuses);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [size] = useState(10);

  useEffect(() => {
    dispatch(fetchRefundStatuses({ index: currentPage, size, orderId }));
  }, [dispatch, currentPage, orderId, size]);

  const handleNextPage = () => {
    if (currentPage < refundStatuses.totalPages) {
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
    dispatch(fetchRefundStatuses({ index: 1, size, orderId }));
  };

  const handleViewUser = (userId) => {
    dispatch(fetchUserById(userId));
  };

  const handleCloseUserModal = () => {
    dispatch(clearSelectedUser());
  };

  // Hàm định dạng attemptTime thành hh:mm:ss dd-MM-yyyy
  const formatAttemptTime = (dateString) => {
    if (!dateString) return 'N/A';
    const dateRegex = /^(\d{2}):(\d{2}):(\d{2}) (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
    if (dateRegex.test(dateString)) {
      return dateString; // Giữ nguyên nếu đúng định dạng
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  // Hàm định dạng dateOfBirth thành dd-MM-yyyy
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return 'N/A';
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (dateRegex.test(dateString)) {
      return dateString; // Giữ nguyên nếu đúng định dạng
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  // Hàm định dạng số tiền
  const formatAmount = (amount) => {
    if (amount == null) return 'N/A';
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="refund-status__table-row--loading">
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
        <td><div className="refund-status__skeleton refund-status__skeleton--text"></div></td>
      </tr>
    ));
  };

  // Hàm tạo danh sách trang với dấu chấm lửng
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(refundStatuses.totalPages - 1, currentPage + delta);

    range.push(1);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (refundStatuses.totalPages > 1) {
      range.push(refundStatuses.totalPages);
    }

    let prevPage = null;
    for (const page of range) {
      if (prevPage && page - prevPage > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prevPage = page;
    }

    return rangeWithDots;
  };

  return (
    <div className="refund-status">
      <h2 className="refund-status__title">Danh sách trạng thái hoàn tiền</h2>
      <div className="refund-status__actions">
        <form onSubmit={handleSearch} className="refund-status__search-form">
          <input
            type="text"
            placeholder="Tìm theo Order ID..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="refund-status__search-input"
          />
          <button type="submit" className="refund-status__search-button">Tìm</button>
        </form>
      </div>
      <table className="refund-status__table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Số tiền</th>
            <th>Người tạo</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th>Lỗi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : refundStatuses.content && refundStatuses.content.length > 0 ? (
            refundStatuses.content.map((status) => (
              <tr key={status.id} className="refund-status__table-row">
                <td>{status.orderId}</td>
                <td>{formatAmount(status.amount)}</td>
                <td>
                  {status.createdBy === 'system' ? (
                    'Hệ thống'
                  ) : (
                    <button
                      className="refund-status__action-button"
                      onClick={() => handleViewUser(status.createdBy)}
                    >
                      Xem chi tiết
                    </button>
                  )}
                </td>
                <td>
                  <span className={`refund-status__status refund-status__status--${status.refundStatus}`}>
                    {refundStatusLabels[status.refundStatus] || status.refundStatus}
                  </span>
                </td>
                <td>{formatAttemptTime(status.attemptTime)}</td>
                <td>{status.errorMessage || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="refund-status__empty">Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
      <div className="refund-status__pagination">
        <button
          className="refund-status__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="refund-status__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`refund-status__pagination-button ${currentPage === page ? 'refund-status__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="refund-status__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === refundStatuses.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {selectedUser && (
        <div className="refund-status__modal" onClick={handleCloseUserModal}>
          <div className="refund-status__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="refund-status__modal-close" onClick={handleCloseUserModal}>×</span>
            <h3 className="refund-status__modal-title">Thông tin người dùng</h3>
            <div className="refund-status__user-details">
              <div className="refund-status__detail-item">
                <strong>User ID:</strong> {selectedUser.userId}
              </div>
              <div className="refund-status__detail-item">
                <strong>Họ tên:</strong> {selectedUser.fullName}
              </div>
              <div className="refund-status__detail-item">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="refund-status__detail-item">
                <strong>Số điện thoại:</strong> {selectedUser.phoneNumber}
              </div>
              <div className="refund-status__detail-item">
                <strong>Ngày sinh:</strong> {formatDateOfBirth(selectedUser.dateOfBirth)}
              </div>
              <div className="refund-status__detail-item">
                <strong>Giới tính:</strong>
                <span className={`refund-status__gender refund-status__gender--${selectedUser.gender}`}>
                  {genderLabels[selectedUser.gender] || selectedUser.gender}
                </span>
              </div>
              <div className="refund-status__detail-item">
                <strong>Vai trò:</strong>
                <span className={`refund-status__role refund-status__role--${selectedUser.role}`}>
                  {roleLabels[selectedUser.role] || selectedUser.role}
                </span>
              </div>
              <div className="refund-status__detail-item">
                <strong>Hoạt động:</strong>
                <span className={`refund-status__boolean refund-status__boolean--${selectedUser.active}`}>
                  {selectedUser.active ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="refund-status__detail-item">
                <strong>Xác minh:</strong>
                <span className={`refund-status__boolean refund-status__boolean--${selectedUser.verified}`}>
                  {selectedUser.verified ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundStatus;