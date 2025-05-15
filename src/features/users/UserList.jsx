import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchUsers, updateUserStatus, resetUserState } from './userSlice';
import './UserList.css';

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error, action } = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ email: '', isActive: 2, isVerified: 2 });
  const [editUser, setEditUser] = useState(null);
  const searchInputRef = useRef(null);
  const prevLoadingRef = useRef(loading); // Lưu trạng thái loading trước đó
  const size = 10;

  useEffect(() => {
    dispatch(fetchUsers({ index: currentPage, size, ...filters }));
  }, [dispatch, currentPage, filters]);

  useEffect(() => {
    // console.log('useEffect triggered - loading:', loading, 'error:', error, 'action:', action); // Debug
    // // Kiểm tra khi loading thay đổi hoặc action tồn tại
    // if (prevLoadingRef.current && !loading && action) {
    //   toast.dismiss();
    //   if (!error) {
    //     if (action === 'fetch') {
    //       toast.success('Lấy danh sách người dùng thành công!');
    //     } else if (action === 'update') {
    //       toast.success('Cập nhật trạng thái người dùng thành công!');
    //     }
    //   } else {
    //     if (action === 'fetch') {
    //       toast.error(`Lấy danh sách người dùng thất bại: ${error}`);
    //     } else if (action === 'update') {
    //       toast.error(`Cập nhật trạng thái thất bại: ${error}`);
    //     }
    //   }
    // }

    prevLoadingRef.current = loading;

    return () => {
      dispatch(resetUserState());
    };
  }, [loading, error, action, dispatch]);

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

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const [value] = args;
        func(value === undefined || value.trim() === '' ? '' : value);
      }, delay);
    };
  };

  const handleSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, email: value }));
    setCurrentPage(1);
  }, 150);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      handleSearch(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: parseInt(value) }));
      setCurrentPage(1);
    }
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
        dispatch(fetchUsers({ index: currentPage, size, ...filters }));
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
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="user-list__table-row--loading">
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
        <td><div className="user-list__skeleton user-list__skeleton--text"></div></td>
      </tr>
    ));
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const totalPages = users.totalPages || 1;

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    for (let i = start; i <= end; i++) {
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
        <div className="user-list__search-bar">
          <input
            ref={searchInputRef}
            type="text"
            lang="vi"
            name="email"
            placeholder="Tìm kiếm theo email..."
            value={filters.email}
            onChange={handleFilterChange}
            className="user-list__search-input"
          />
        </div>
        <select
          name="isActive"
          value={filters.isActive}
          onChange={handleFilterChange}
          className="user-list__select"
        >
          <option value={2}>Tất cả (Active)</option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
        <select
          name="isVerified"
          value={filters.isVerified}
          onChange={handleFilterChange}
          className="user-list__select"
        >
          <option value={2}>Tất cả (Verified)</option>
          <option value={1}>Verified</option>
          <option value={0}>Unverified</option>
        </select>
      </div>
      <table className="user-list__table">
        <thead>
          <tr>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Active</th>
            <th>Verified</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="9" className="user-list__empty">Lỗi: {error}</td></tr>
          ) : users.content && users.content.length > 0 ? (
            users.content.map((user) => (
              <tr key={user.userId} className="user-list__table-row">
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || 'Chưa cập nhật'}</td>
                <td>{formatDate(user.dateOfBirth)}</td>
                <td>{user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</td>
                <td className={user.active ? 'user-list__status--active-yes' : 'user-list__status--active-no'}>
                  {user.active ? 'YES' : 'NO'}
                </td>
                <td className={user.verified ? 'user-list__status--verified-yes' : 'user-list__status--verified-no'}>
                  {user.verified ? 'YES' : 'NO'}
                </td>
                <td>{user.role || 'Chưa xác định'}</td>
                <td>
                  <button
                    className="user-list__action-button user-list__action-button--edit"
                    onClick={() => setEditUser({ ...user })}
                  >
                    Chỉnh sửa trạng thái
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9" className="user-list__empty">Không có người dùng nào</td></tr>
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
              <label className="user-list__label">Trạng thái hoạt động</label>
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
              <label className="user-list__label">Trạng thái xác minh</label>
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
              <label className="user-list__label">Vai trò</label>
              <select
                value={editUser.role || 'USER'}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="user-list__select"
              >
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="SHIPPER">Shipper</option>
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
    </div>
  );
};

export default UserList;