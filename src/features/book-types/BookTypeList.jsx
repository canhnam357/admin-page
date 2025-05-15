import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchBookTypes, createBookType, updateBookType } from './bookTypeSlice';
import './BookTypeList.css';

const BookTypeList = () => {
  const dispatch = useDispatch();
  const { bookTypes, loading, error } = useSelector((state) => state.bookTypes);
  const [createForm, setCreateForm] = useState({ bookTypeName: '', showModal: false });
  const [editBookType, setEditBookType] = useState(null);

  useEffect(() => {
    dispatch(fetchBookTypes());
  }, [dispatch]);

  // Hiển thị toast lỗi khi fetchBookTypes thất bại (trừ lỗi 401)
  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lấy danh sách loại sách thất bại: ${error}`);
    }
  }, [error]);

  const validateBookTypeName = (name) => {
    if (!name.trim()) {
      toast.dismiss();
      toast.error('Tên loại sách không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên loại sách phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (validateBookTypeName(createForm.bookTypeName)) {
      try {
        const result = await dispatch(createBookType(createForm.bookTypeName)).unwrap();
        console.log('createBookType result:', result); // Debug
        setCreateForm({ bookTypeName: '', showModal: false });
        toast.dismiss();
        toast.success('Tạo loại sách thành công!');
      } catch (err) {
        console.log('createBookType error:', err); // Debug
        toast.dismiss();
        toast.error(`Tạo loại sách thất bại: ${err.message || err}`);
      }
    }
  };

  const handleEdit = (bookType) => {
    setEditBookType({ ...bookType });
  };

  const handleSaveEdit = async () => {
    if (editBookType && validateBookTypeName(editBookType.bookTypeName)) {
      try {
        const result = await dispatch(updateBookType({ bookTypeId: editBookType.bookTypeId, bookTypeName: editBookType.bookTypeName })).unwrap();
        console.log('updateBookType result:', result); // Debug
        setEditBookType(null);
        toast.dismiss();
        toast.success('Sửa loại sách thành công!');
      } catch (err) {
        console.log('updateBookType error:', err); // Debug
        toast.dismiss();
        toast.error(`Sửa loại sách thất bại: ${err.message || err}`);
      }
    } else {
      toast.dismiss();
      toast.error('Tên loại sách không hợp lệ!');
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="book-type__table-row--loading">
        <td><div className="book-type__skeleton book-type__skeleton--text"></div></td>
        <td><div className="book-type__skeleton book-type__skeleton--text"></div></td>
        <td><div className="book-type__skeleton book-type__skeleton--text"></div></td>
      </tr>
    ));
  };

  return (
    <div className="book-type-list">
      <h2 className="book-type__title">Danh sách loại sách</h2>
      <div className="book-type__create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm loại sách</button>
      </div>
      <table className="book-type__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên loại sách</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="book-type__empty">Lỗi: {error}</td></tr>
          ) : bookTypes.length > 0 ? (
            bookTypes.map((bookType) => (
              <tr key={bookType.bookTypeId} className="book-type__table-row">
                <td>{bookType.bookTypeId}</td>
                <td>{bookType.bookTypeName}</td>
                <td>
                  <button className="book-type__action-button" onClick={() => handleEdit(bookType)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="book-type__empty">Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
      {createForm.showModal && (
        <div className="book-type__modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="book-type__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="book-type__modal-close" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3 className="book-type__modal-title">Tạo loại sách mới</h3>
            <input
              type="text"
              placeholder="Tên loại sách..."
              value={createForm.bookTypeName}
              onChange={(e) => setCreateForm({ ...createForm, bookTypeName: e.target.value })}
              className="book-type__modal-input"
            />
            <div className="book-type__modal-actions">
              <button className="book-type__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="book-type__modal-button book-type__modal-button--cancel" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {editBookType && (
        <div className="book-type__modal" onClick={() => setEditBookType(null)}>
          <div className="book-type__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="book-type__modal-close" onClick={() => setEditBookType(null)}>
              ×
            </span>
            <h3 className="book-type__modal-title">Chỉnh sửa loại sách</h3>
            <input
              type="text"
              value={editBookType.bookTypeName}
              onChange={(e) => setEditBookType({ ...editBookType, bookTypeName: e.target.value })}
              className="book-type__modal-input"
            />
            <div className="book-type__modal-actions">
              <button className="book-type__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button className="book-type__modal-button book-type__modal-button--cancel" onClick={() => setEditBookType(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTypeList;