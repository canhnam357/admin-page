import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCategories, createCategory, updateCategory } from './categorySlice';
import './CategoryList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.categories);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ categoryName: '', showModal: false });
  const [editCategory, setEditCategory] = useState(null);

  // Debounced search function
  const debouncedFetchCategories = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
        dispatch(fetchCategories({ keyword: value }));
      }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedFetchCategories(value);
  };

  useEffect(() => {
    dispatch(fetchCategories({ keyword }));
  }, [dispatch, keyword]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  const validateCategoryName = (name) => {
    if (!name.trim()) {
      toast.dismiss();
      toast.error('Tên thể loại không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên thể loại phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (validateCategoryName(createForm.categoryName)) {
      try {
        await dispatch(createCategory(createForm.categoryName)).unwrap();
        setCreateForm({ categoryName: '', showModal: false });
        dispatch(fetchCategories({ keyword }));
        toast.dismiss();
        toast.success('Tạo thể loại thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Tạo thể loại thất bại: ${err}`);
      }
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category });
  };

  const handleSaveEdit = async () => {
    if (editCategory && validateCategoryName(editCategory.categoryName)) {
      try {
        await dispatch(
          updateCategory({ categoryId: editCategory.categoryId, categoryName: editCategory.categoryName })
        ).unwrap();
        setEditCategory(null);
        dispatch(fetchCategories({ keyword }));
        toast.dismiss();
        toast.success('Cập nhật thể loại thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Cập nhật thể loại thất bại: ${err}`);
      }
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
            type="text"
            lang="vi"
            placeholder="Tìm kiếm thể loại..."
            value={keyword}
            onChange={handleSearch}
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
          ) : categories && categories.length > 0 ? (
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