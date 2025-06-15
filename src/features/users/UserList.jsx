import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchUsers, updateUserStatus } from './userSlice';
import './UserList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Role translation mapping
const roleTranslations = {
  ADMIN: 'Quản trị viên',
  EMPLOYEE: 'Nhân viên',
  SHIPPER: 'Nhân viên giao hàng',
  USER: 'Người dùng',
};

// Function to truncate email for table display
const truncateEmail = (email) => {
  if (email.length > 40) {
    return email.slice(0, 40) + '...';
  }
  return email;
};

// Function to split email for modal display
const splitEmail = (email) => {
  const maxLength = 100;
  const chunks = [];
  for (let i = 0; i < email.length; i += maxLength) {
    chunks.push(email.slice(i, i + maxLength));
  }
  // Return 1, 2, or 3 lines based on email length
  if (email.length <= maxLength) {
    return [email];
  } else if (email.length <= maxLength * 2) {
    return chunks.slice(0, 2);
  } else {
    return chunks.slice(0, 3);
  }
};

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ email: '', isActive: 2, isVerified: 2, role: 'ALL' });
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const size = 10;

  // Debounced search function
  const debouncedFetchUsers = useMemo(
    () =>
      debounce((email, isActive, isVerified, role) => {
        dispatch(fetchUsers({ index: 1, size, email, isActive, isVerified, role: role === 'ALL' ? '' : role }));
      }, 300),
    [dispatch, size]
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, email: value }));
    debouncedFetchUsers(value, filters.isActive, filters.isVerified, filters.role);
  };

  // Handle filter change for dropdowns
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Fetch users when page or filters change
  useEffect(() => {
    dispatch(fetchUsers({ index: currentPage, size, ...filters, role: filters.role === 'ALL' ? '' : filters.role }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, filters.isActive, filters.isVerified, filters.role]);

  // Handle error toast
  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lấy danh sách người dùng thất bại: ${error}`);
    }
  }, [error]);

  const handleNextPage = () => {
    if (currentPage < users.totalPages) {
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

  const handleSaveEdit = async () => {
    if (editUser && (editUser.active !== undefined) && (editUser.verified !== undefined) && (editUser.role !== undefined)) {
      try {
        await dispatch(updateUserStatus({
          userId: editUser.userId,
          active: editUser.active,
          verified: editUser.verified,
          role: editUser.role
        })).unwrap();
        setEditUser(null);
        dispatch(fetchUsers({ index: currentPage, size, ...filters, role: filters.role === 'ALL' ? '' : filters.role }));
        toast.dismiss();
        toast.success("Cập nhật trạng thái thành công!");
      } catch (err) {
        toast.dismiss();
        toast.error(`Cập nhật trạng thái thất bại: ${err}`);
      }
    } else {
      toast.dismiss();
      toast.error('Thiếu thông tin trạng thái active, verified hoặc role');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
    return 'Chưa cập nhật';
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const totalPages = users.totalPages || 1;

    range.push(1);
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (totalPages > 1) {
      range.push(totalPages);
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
    <div className="user-list">
      <h2 className="user-list__title">Danh sách người dùng</h2>
      <div className="user-list__filters">
        <div className="user-list__search-container">
          <div className="user-list__search-bar">
            <input
              type="text"
              lang="vi"
              name="email"
              placeholder="Tìm kiếm theo email..."
              value={filters.email}
              onChange={handleSearch}
              className="user-list__search-input"
            />
          </div>
        </div>
        <div className="user-list__dropdown-container">
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            className="user-list__select"
          >
            <option value={2}>Tất cả (Hoạt động)</option>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
          <select
            name="isVerified"
            value={filters.isVerified}
            onChange={handleFilterChange}
            className="user-list__select"
          >
            <option value={2}>Tất cả (Xác thực)</option>
            <option value={1}>Verified</option>
            <option value={0}>Unverified</option>
          </select>
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="user-list__select"
          >
            <option value="ALL">Tất cả (Vai trò)</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="EMPLOYEE">Nhân viên</option>
            <option value="SHIPPER">Nhân viên giao hàng</option>
            <option value="USER">Người dùng</option>
          </select>
        </div>
      </div>
      <table className="user-list__table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Hoạt động</th>
            <th>Xác thực</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="user-list__loading">
                <div className="user-list__spinner"></div>
                Đang tải Danh sách người dùng
              </td>
            </tr>
          ) : error ? (
            <tr><td colSpan="5" className="user-list__empty">Lỗi: {error}</td></tr>
          ) : users.content && users.content.length > 0 ? (
            users.content.map((user) => (
              <tr key={user.userId} className="user-list__table-row">
                <td>{truncateEmail(user.email)}</td>
                <td className={user.active ? 'user-list__status--active-yes' : 'user-list__status--active-no'}>
                  {user.active ? 'Active' : 'Inactive'}
                </td>
                <td className={user.verified ? 'user-list__status--verified-yes' : 'user-list__status--verified-no'}>
                  {user.verified ? 'Verified' : 'Unverified'}
                </td>
                <td className={`user-list__role user-list__role--${user.role?.toLowerCase()}`}>
                  {roleTranslations[user.role] || 'Chưa xác định'}
                </td>
                <td>
                  <button
                    className="user-list__action-button user-list__action-button--edit"
                    onClick={() => setEditUser({ ...user })}
                  >
                    Chỉnh sửa trạng thái
                  </button>
                  <button
                    className="user-list__action-button user-list__action-button--view"
                    onClick={() => setViewUser({ ...user })}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="user-list__empty">Không có người dùng nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="user-list__pagination">
        <button
          className="user-list__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="user-list__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`user-list__pagination-button ${currentPage === page ? 'user-list__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="user-list__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === users.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {editUser && (
        <div className="user-list__modal" onClick={() => setEditUser(null)}>
          <div className="user-list__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="user-list__modal-close" onClick={() => setEditUser(null)}>×</span>
            <h3 className="user-list__modal-title">Chỉnh sửa trạng thái người dùng: {editUser.fullName}</h3>
            <div className="user-list__form-group">
              <label className="user-list__label">Hoạt động:</label>
              <select
                value={editUser.active ? 1 : 0}
                onChange={(e) => setEditUser({ ...editUser, active: e.target.value === '1' })}
                className="user-list__select"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Xác thực:</label>
              <select
                value={editUser.verified ? 1 : 0}
                onChange={(e) => setEditUser({ ...editUser, verified: e.target.value === '1' })}
                className="user-list__select"
              >
                <option value={1}>Verified</option>
                <option value={0}>Unverified</option>
              </select>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Vai trò:</label>
              <select
                value={editUser.role || 'USER'}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="user-list__select"
              >
                <option value="ADMIN">Quản trị viên</option>
                <option value="USER">Người dùng</option>
                <option value="EMPLOYEE">Nhân viên</option>
                <option value="SHIPPER">Nhân viên giao hàng</option>
              </select>
            </div>
            <div className="user-list__form-actions">
              <button className="user-list__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button
                className="user-list__modal-button user-list__modal-button--cancel"
                onClick={() => setEditUser(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {viewUser && (
        <div className="user-list__modal" onClick={() => setViewUser(null)}>
          <div className="user-list__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="user-list__modal-close" onClick={() => setViewUser(null)}>×</span>
            <h3 className="user-list__modal-title">Chi tiết người dùng: {viewUser.fullName}</h3>
            <div className="user-list__form-group">
              <label className="user-list__label">User ID:</label>
              <span className="user-list__detail">{viewUser.userId}</span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Họ và tên:</label>
              <span className="user-list__detail">{viewUser.fullName}</span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Email:</label>
              <div className="user-list__detail--email">
                {splitEmail(viewUser.email).map((chunk, index) => (
                  <div key={index}>{chunk}</div>
                ))}
              </div>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Số điện thoại:</label>
              <span className="user-list__detail">{viewUser.phoneNumber || 'Chưa cập nhật'}</span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Ngày sinh:</label>
              <span className="user-list__detail">{formatDate(viewUser.dateOfBirth)}</span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Giới tính:</label>
              <span className="user-list__detail">
                {viewUser.gender === 'MALE' ? 'Nam' : viewUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
              </span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Hoạt động:</label>
              <span className={`user-list__detail ${viewUser.active ? 'user-list__status--active-yes' : 'user-list__status--active-no'}`}>
                {viewUser.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Xác thực:</label>
              <span className={`user-list__detail ${viewUser.verified ? 'user-list__status--verified-yes' : 'user-list__status--verified-no'}`}>
                {viewUser.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="user-list__form-group">
              <label className="user-list__label">Vai trò:</label>
              <span className={`user-list__detail user-list__role user-list__role--${viewUser.role?.toLowerCase()}`}>
                {roleTranslations[viewUser.role] || 'Chưa xác định'}
              </span>
            </div>
            <div className="user-list__form-actions">
              <button
                className="user-list__modal-button user-list__modal-button--cancel"
                onClick={() => setViewUser(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;