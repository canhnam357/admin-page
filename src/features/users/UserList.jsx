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
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      dispatch(fetchUsers({ index: currentPage, size: 10, ...filters }));
    }
  }, [dispatch, currentPage, filters]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách người dùng thành công!');
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Cập nhật trạng thái người dùng thành công!');
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách người dùng thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Cập nhật trạng thái thất bại: ${error}`);
      }
    }
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  const handleSaveEdit = async () => {
    if (editUser && (editUser.active !== undefined) && (editUser.verified !== undefined) && (editUser.role !== undefined)) {
      try {
        await dispatch(updateUserStatus({ userId: editUser.userId, active: editUser.active, verified: editUser.verified, role: editUser.role })).unwrap();
        // Gọi lại API fetchUsers để tải lại danh sách, giữ nguyên filters và currentPage
        dispatch(fetchUsers({ index: currentPage, size: 10, ...filters }));
        setEditUser(null);
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
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index}>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-button"></div></td>
      </tr>
    ));
  };

  if (error) return <p>Lỗi: {error}</p>;

  const pageNumbers = [];
  for (let i = 1; i <= users.totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="user-list-container">
      <h2>Danh sách người dùng</h2>
      <div className="user-filters">
        <div className="user-search-bar">
          <input
            ref={inputRef}
            type="text"
            lang="vi"
            name="email"
            placeholder="Tìm kiếm theo email..."
            value={filters.email}
            onChange={handleFilterChange}
          />
        </div>
        <select name="isActive" value={filters.isActive} onChange={handleFilterChange}>
          <option value={2}>Tất cả (Active)</option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
        <select name="isVerified" value={filters.isVerified} onChange={handleFilterChange}>
          <option value={2}>Tất cả (Verified)</option>
          <option value={1}>Verified</option>
          <option value={0}>Unverified</option>
        </select>
      </div>
      <table className="user-table">
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
          ) : users.content && users.content.length > 0 ? (
            users.content.map((user) => (
              <tr key={user.userId}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || 'Chưa cập nhật'}</td>
                <td>{formatDate(user.dateOfBirth)}</td>
                <td>{user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</td>
                <td className={user.active ? 'active-true' : 'active-false'}>
                  {user.active ? 'YES' : 'NO'}
                </td>
                <td className={user.verified ? 'verified-true' : 'verified-false'}>
                  {user.verified ? 'YES' : 'NO'}
                </td>
                <td>{user.role || 'Chưa xác định'}</td>
                <td>
                  <button onClick={() => setEditUser({ ...user })}>Chỉnh sửa trạng thái</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9">Không có người dùng nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="user-pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
          Trang trước
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={currentPage === number ? 'active' : ''}
            disabled={loading}
          >
            {number}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === users.totalPages || loading}>
          Trang sau
        </button>
      </div>
      {editUser && (
        <div className="user-modal" onClick={() => setEditUser(null)}>
          <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setEditUser(null)}>
              ×
            </span>
            <h3>Chỉnh sửa trạng thái người dùng: {editUser.fullName}</h3>
            <div className="form-group">
              <label>Trạng thái hoạt động</label>
              <select
                value={editUser.active ? 1 : 0}
                onChange={(e) => setEditUser({ ...editUser, active: e.target.value === '1' })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái xác minh</label>
              <select
                value={editUser.verified ? 1 : 0}
                onChange={(e) => setEditUser({ ...editUser, verified: e.target.value === '1' })}
              >
                <option value={1}>Verified</option>
                <option value={0}>Unverified</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <select
                value={editUser.role || 'USER'} // Giá trị mặc định là 'USER' nếu role chưa có
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="SHIPPER">Shipper</option>
              </select>
            </div>
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditUser(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;