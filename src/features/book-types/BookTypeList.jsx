import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchBookTypes, createBookType, updateBookType, resetBookTypeState } from './bookTypeSlice';
import './BookTypeList.css';

const BookTypeList = () => {
  const dispatch = useDispatch();
  const { bookTypes, loading, error, action } = useSelector((state) => state.bookTypes);
  const [createForm, setCreateForm] = useState({ bookTypeName: '', showModal: false });
  const [editBookType, setEditBookType] = useState(null);

  useEffect(() => {
    dispatch(fetchBookTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.success('Lấy danh sách loại sách thành công!');
      } else if (action === 'create') {
        toast.success('Tạo loại sách thành công!');
      } else if (action === 'update') {
        toast.success('Sửa loại sách thành công!');
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.error(`Lấy danh sách loại sách thất bại: ${error}`);
      } else if (action === 'create') {
        toast.error(`Tạo loại sách thất bại: ${error}`);
      } else if (action === 'update') {
        toast.error(`Sửa loại sách thất bại: ${error}`);
      }
    }
    return () => {
      dispatch(resetBookTypeState());
    };
  }, [loading, error, action, dispatch]);

  const handleCreate = () => {
    if (createForm.bookTypeName.trim()) {
      dispatch(createBookType(createForm.bookTypeName));
      setCreateForm({ bookTypeName: '', showModal: false });
    } else {
      toast.error('Tên loại sách không được rỗng');
    }
  };

  const handleEdit = (bookType) => {
    setEditBookType({ ...bookType });
  };

  const handleSaveEdit = () => {
    if (editBookType && editBookType.bookTypeName) {
      dispatch(updateBookType({ bookTypeId: editBookType.bookTypeId, bookTypeName: editBookType.bookTypeName }));
      setEditBookType(null);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="book-type-list-container">
      <h2>Danh sách loại sách</h2>
      <div className="book-type-create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm loại sách</button>
      </div>
      <table className="book-type-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên loại sách</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bookTypes.map((bookType) => (
            <tr key={bookType.bookTypeId}>
              <td>{bookType.bookTypeId}</td>
              <td>{bookType.bookTypeName}</td>
              <td>
                <button onClick={() => handleEdit(bookType)}>Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {createForm.showModal && (
        <div className="book-type-modal">
          <div className="book-type-modal-content">
            <span className="close-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3>Tạo loại sách mới</h3>
            <input
              type="text"
              placeholder="Tên loại sách..."
              value={createForm.bookTypeName}
              onChange={(e) => setCreateForm({ ...createForm, bookTypeName: e.target.value })}
            />
            <button onClick={handleCreate}>Tạo</button>
            <button onClick={() => setCreateForm({ ...createForm, showModal: false })}>Hủy</button>
          </div>
        </div>
      )}
      {editBookType && (
        <div className="book-type-modal">
          <div className="book-type-modal-content">
            <h3>Chỉnh sửa loại sách</h3>
            <input
              type="text"
              value={editBookType.bookTypeName}
              onChange={(e) => setEditBookType({ ...editBookType, bookTypeName: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditBookType(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTypeList;