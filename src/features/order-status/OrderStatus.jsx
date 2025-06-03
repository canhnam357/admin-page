import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderStatuses, fetchUserById, clearSelectedUser } from './orderStatusSlice';
import './OrderStatus.css';

// Object ánh xạ trạng thái sang tiếng Việt
const statusLabels = {
  PENDING: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
  IN_PREPARATION: 'Đang chuẩn bị hàng',
  READY_TO_SHIP: 'Chuẩn bị giao',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
  FAILED_DELIVERY: 'Giao thất bại',
  RETURNED: 'Đã hoàn hàng',
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

const OrderStatus = () => {
  const dispatch = useDispatch();
  const { orderStatuses, selectedUser, loading } = useSelector((state) => state.orderStatuses);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [size] = useState(10);
  const [selectedCause, setSelectedCause] = useState(null);

  useEffect(() => {
    dispatch(fetchOrderStatuses({ index: currentPage, size, orderId }));
  }, [dispatch, currentPage, orderId, size]);

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

  const handleViewCause = (cause) => {
    setSelectedCause(cause);
  };

  const handleCloseCauseModal = () => {
    setSelectedCause(null);
  };

  // Hàm định dạng changeAt thành hh:mm:ss dd-MM-yyyy
  const formatChangeAt = (dateString) => {
    if (!dateString) return 'N/A';
    const dateRegex = /^(\d{2}):(\d{2}):(\d{2}) (\d{2})-(\d{2})-(\d{4})$/;
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

  // Hàm tạo danh sách trang với dấu chấm lửng
  const getPageNumbers = () => {
    const delta = 1; // Số trang hiển thị trước/sau trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Tính toán khoảng trang hiển thị
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(orderStatuses.totalPages - 1, currentPage + delta);

    // Thêm trang đầu
    range.push(1);

    // Thêm các trang từ start đến end
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Thêm trang cuối nếu totalPages > 1
    if (orderStatuses.totalPages > 1) {
      range.push(orderStatuses.totalPages);
    }

    // Thêm dấu chấm lửng
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
            <th>Order ID</th>
            <th>Trạng thái trước</th>
            <th>Trạng thái hiện tại</th>
            <th>Người thay đổi</th>
            <th>Lý do</th>
            <th>Thời gian thay đổi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : orderStatuses.content && orderStatuses.content.length > 0 ? (
            orderStatuses.content.map((status) => (
              <tr key={status.id} className="order-status__table-row">
                <td>{status.orderId}</td>
                <td>
                  <span className={`order-status__status order-status__status--${status.fromStatus}`}>
                    {statusLabels[status.fromStatus] || status.fromStatus}
                  </span>
                </td>
                <td>
                  <span className={`order-status__status order-status__status--${status.toStatus}`}>
                    {statusLabels[status.toStatus] || status.toStatus}
                  </span>
                </td>
                <td>
                  <button
                    className="order-status__action-button"
                    onClick={() => handleViewUser(status.changeBy)}
                  >
                    Xem chi tiết
                  </button>
                </td>
                <td>
                  {['REJECTED', 'CANCELLED', 'FAILED_DELIVERY'].includes(status.toStatus) && (
                    <button
                      className="order-status__action-button order-status__action-button--cause"
                      onClick={() => handleViewCause(status.cause)}
                    >
                      Xem
                    </button>
                  )}
                </td>
                <td>{formatChangeAt(status.changeAt)}</td>
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
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="order-status__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`order-status__pagination-button ${currentPage === page ? 'order-status__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
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
                <strong>Ngày sinh:</strong> {formatDateOfBirth(selectedUser.dateOfBirth)}
              </div>
              <div className="order-status__detail-item">
                <strong>Giới tính:</strong>
                <span className={`order-status__gender order-status__gender--${selectedUser.gender}`}>
                  {genderLabels[selectedUser.gender] || selectedUser.gender}
                </span>
              </div>
              <div className="order-status__detail-item">
                <strong>Vai trò:</strong>
                <span className={`order-status__role order-status__role--${selectedUser.role}`}>
                  {roleLabels[selectedUser.role] || selectedUser.role}
                </span>
              </div>
              <div className="order-status__detail-item">
                <strong>Hoạt động:</strong>
                <span className={`order-status__boolean order-status__boolean--${selectedUser.active}`}>
                  {selectedUser.active ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="order-status__detail-item">
                <strong>Xác minh:</strong>
                <span className={`order-status__boolean order-status__boolean--${selectedUser.verified}`}>
                  {selectedUser.verified ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedCause && (
        <div className="order-status__modal" onClick={handleCloseCauseModal}>
          <div className="order-status__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="order-status__modal-close" onClick={handleCloseCauseModal}>×</span>
            <h3 className="order-status__modal-title">Lý do</h3>
            <div className="order-status__cause-details">
              <p>{selectedCause || 'Không có lý do'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;