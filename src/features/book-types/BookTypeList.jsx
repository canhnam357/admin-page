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
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    dispatch(fetchBookTypes());
  }, [dispatch]);

  useEffect(() => {
    if (toastShown) return;

    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách loại sách thành công!');
        setToastShown(true);
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo loại sách thành công!');
        setToastShown(true);
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa loại sách thành công!');
        setToastShown(true);
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách loại sách thất bại: ${error}`);
      } else if (action === 'create') {
        toast.dismiss();
        toast.error(`Tạo loại sách thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Sửa loại sách thất bại: ${error}`);
      }
    }

    return () => {
      dispatch(resetBookTypeState());
    };
  }, [loading, error, action, dispatch, toastShown]);

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

  const handleCreate = () => {
    if (validateBookTypeName(createForm.bookTypeName)) {
      dispatch(createBookType(createForm.bookTypeName));
      setCreateForm({ bookTypeName: '', showModal: false });
      setToastShown(false);
    }
  };

  const handleEdit = (bookType) => {
    setEditBookType({ ...bookType });
  };

  const handleSaveEdit = () => {
    if (editBookType && validateBookTypeName(editBookType.bookTypeName)) {
      dispatch(updateBookType({ bookTypeId: editBookType.bookTypeId, bookTypeName: editBookType.bookTypeName }));
      setEditBookType(null);
      setToastShown(false);
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