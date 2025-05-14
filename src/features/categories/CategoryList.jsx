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
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories({ keyword }));
  }, [dispatch, keyword]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách thể loại thành công!');
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo thể loại thành công!');
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa thể loại thành công!');
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách thể loại thất bại: ${error}`);
      } else if (action === 'create') {
        toast.dismiss();
        toast.error(`Tạo thể loại thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Sửa thể loại thất bại: ${error}`);
      }
    }
    return () => {
      dispatch(resetCategoryState());
    };
  }, [loading, error, action, dispatch]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const [value] = args;
        if (value === undefined || value.trim() === '') {
          func('');
        } else {
          func(value);
        }
      }, delay);
    };
  };

  const handleSearch = debounce((value) => {
    dispatch(fetchCategories({ keyword: value }));
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    handleSearch(value);
  };

  const handleCreate = () => {
    if (createForm.categoryName.trim()) {
      dispatch(createCategory(createForm.categoryName));
      setCreateForm({ categoryName: '', showModal: false });
    } else {
      toast.dismiss();
      toast.error('Tên thể loại không được rỗng');
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category });
  };

  const handleSaveEdit = () => {
    if (editCategory && editCategory.categoryName) {
      dispatch(updateCategory({ categoryId: editCategory.categoryId, categoryName: editCategory.categoryName }));
      setEditCategory(null);
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index}>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-button"></div></td>
      </tr>
    ));
  };

  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="category-list-container">
      <h2>Danh sách thể loại</h2>
      <div className="category-create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm thể loại</button>
      </div>
      <div className="category-search-bar">
        <input
          ref={inputRef}
          type="text"
          lang="vi"
          placeholder="Tìm kiếm thể loại..."
          value={keyword}
          onChange={handleInputChange}
        />
      </div>
      <table className="category-table">
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
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category.categoryId}>
                <td>{category.categoryId}</td>
                <td>{category.categoryName}</td>
                <td>
                  <button onClick={() => handleEdit(category)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3">Không có thể loại nào</td></tr>
          )}
        </tbody>
      </table>
      {createForm.showModal && (
        <div className="category-modal">
          <div className="category-modal-content">
            <span className="close-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3>Tạo thể loại mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên thể loại..."
              value={createForm.categoryName}
              onChange={(e) => setCreateForm({ ...createForm, categoryName: e.target.value })}
            />
            <button onClick={handleCreate}>Tạo</button>
            <button onClick={() => setCreateForm({ ...createForm, showModal: false })}>Hủy</button>
          </div>
        </div>
      )}
      {editCategory && (
        <div className="category-modal">
          <div className="category-modal-content">
            <h3>Chỉnh sửa thể loại</h3>
            <input
              type="text"
              lang="vi"
              value={editCategory.categoryName}
              onChange={(e) => setEditCategory({ ...editCategory, categoryName: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditCategory(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;