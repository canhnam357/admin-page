import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCategories, createCategory, updateCategory, resetCategoryState } from './categorySlice';
import './CategoryList.css';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, action } = useSelector((state) => state.categories);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ categoryName: '', showModal: false });
  const [editCategory, setEditCategory] = useState(null);
  const [toastShown, setToastShown] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories({ keyword }));
  }, [dispatch, keyword]);

  useEffect(() => {
    if (toastShown) return;

    if (!loading && !error) {
      if (action === 'fetch') {
        toast.success('Lấy danh sách thể loại thành công!');
        setToastShown(true);
      } else if (action === 'create') {
        toast.success('Tạo thể loại thành công!');
        setToastShown(true);
      } else if (action === 'update') {
        toast.success('Sửa thể loại thành công!');
        setToastShown(true);
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.error(`Lấy danh sách thể loại thất bại: ${error}`);
      } else if (action === 'create') {
        toast.error(`Tạo thể loại thất bại: ${error}`);
      } else if (action === 'update') {
        toast.error(`Sửa thể loại thất bại: ${error}`);
      }
    }

    return () => {
      dispatch(resetCategoryState());
    };
  }, [loading, error, action, dispatch, toastShown]);

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
    setKeyword(value);
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearch(value);
  };

  const validateCategoryName = (name) => {
    if (!name.trim()) {
      toast.error('Tên thể loại không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.error('Tên thể loại phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (validateCategoryName(createForm.categoryName)) {
      dispatch(createCategory(createForm.categoryName));
      setCreateForm({ categoryName: '', showModal: false });
      setToastShown(false);
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category });
  };

  const handleSaveEdit = () => {
    if (editCategory && validateCategoryName(editCategory.categoryName)) {
      dispatch(updateCategory({ categoryId: editCategory.categoryId, categoryName: editCategory.categoryName }));
      setEditCategory(null);
      setToastShown(false);
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="category__table-row--loading">
        <td><div className="category__skeleton category__skeleton--text"></div></td>
        <td><div className="category__skeleton category__skeleton--text"></div></td>
        <td><div className="category__skeleton category__skeleton--text"></div></td>
      </tr>
    ));
  };

  return (
    <div className="category-list">
      <h2 className="category__title">Danh sách thể loại</h2>
      <div className="category__actions">
        <div className="category__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm thể loại</button>
        </div>
        <div className="category__search-bar">
          <input
            ref={inputRef}
            type="text"
            lang="vi"
            placeholder="Tìm kiếm thể loại..."
            value={keyword}
            onChange={handleInputChange}
            className="category__search-input"
          />
        </div>
      </div>
      <table className="category__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên thể loại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="category__empty">Lỗi: {error}</td></tr>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category.categoryId} className="category__table-row">
                <td>{category.categoryId}</td>
                <td>{category.categoryName}</td>
                <td>
                  <button className="category__action-button" onClick={() => handleEdit(category)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="category__empty">Không có thể loại nào</td></tr>
          )}
        </tbody>
      </table>
      {createForm.showModal && (
        <div className="category__modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="category__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="category__modal-close" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3 className="category__modal-title">Tạo thể loại mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên thể loại..."
              value={createForm.categoryName}
              onChange={(e) => setCreateForm({ ...createForm, categoryName: e.target.value })}
              className="category__modal-input"
            />
            <div className="category__modal-actions">
              <button className="category__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="category__modal-button category__modal-button--cancel" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {editCategory && (
        <div className="category__modal" onClick={() => setEditCategory(null)}>
          <div className="category__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="category__modal-close" onClick={() => setEditCategory(null)}>
              ×
            </span>
            <h3 className="category__modal-title">Chỉnh sửa thể loại</h3>
            <input
              type="text"
              lang="vi"
              value={editCategory.categoryName}
              onChange={(e) => setEditCategory({ ...editCategory, categoryName: e.target.value })}
              className="category__modal-input"
            />
            <div className="category__modal-actions">
              <button className="category__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button className="category__modal-button category__modal-button--cancel" onClick={() => setEditCategory(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;