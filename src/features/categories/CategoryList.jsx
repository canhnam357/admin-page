import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCategories, createCategory, updateCategory, fetchCategoryBooks } from './categorySlice';
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
  const { categories, categoryBooks, loading, error } = useSelector((state) => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ categoryName: '', showModal: false });
  const [editCategory, setEditCategory] = useState(null);
  const [viewCategoryId, setViewCategoryId] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const size = 10; // Số lượng thể loại trên mỗi trang
  const bookSize = 5; // Số lượng sách trên mỗi trang

  // Debounced search function
  const debouncedFetchCategories = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
        setCurrentPage(1);
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
    if (viewCategoryId) {
      dispatch(fetchCategoryBooks({ categoryId: viewCategoryId, index: currentBookPage, size: bookSize }));
    }
  }, [viewCategoryId, currentBookPage, dispatch, bookSize]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (categoryBooks.totalPages > 0 && currentBookPage > categoryBooks.totalPages) {
      setCurrentBookPage(categoryBooks.totalPages);
    }
  }, [categoryBooks.totalPages, currentBookPage]);

  const handleNextPage = () => {
    const totalPages = Math.ceil(categories.length / size);
    if (currentPage < totalPages) {
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

  const handleViewBooks = (categoryId) => {
    setViewCategoryId(categoryId);
    setCurrentBookPage(1);
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

  const renderSkeleton = (isBooks = false) => {
    const length = isBooks ? bookSize : size;
    return Array.from({ length }).map((_, index) => (
      <tr key={index} className={isBooks ? 'category__books-table-row--loading' : 'category__table-row--loading'}>
        {isBooks ? (
          <>
            <td><div className="category__skeleton category__skeleton--image"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
          </>
        ) : (
          <>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
            <td><div className="category__skeleton category__skeleton--text"></div></td>
          </>
        )}
      </tr>
    ));
  };

  const getPageNumbers = (totalItems, isBooks = false) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const current = isBooks ? currentBookPage : currentPage;
    const itemsPerPage = isBooks ? bookSize : size;
    const totalPages = isBooks ? (totalItems || 1) : Math.ceil(totalItems / itemsPerPage) || 1;

    const start = Math.max(2, current - delta);
    const end = Math.min(totalPages - 1, current + delta);

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

  // Phân trang thủ công cho danh sách thể loại
  const paginatedCategories = categories.slice((currentPage - 1) * size, currentPage * size);
  const totalCategoryPages = Math.ceil(categories.length / size);

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
          {loading && !viewCategoryId ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="category__empty">Lỗi: {error}</td></tr>
          ) : paginatedCategories.length > 0 ? (
            paginatedCategories.map((category) => (
              <tr key={category.categoryId} className="category__table-row">
                <td>{category.categoryId}</td>
                <td>{category.categoryName}</td>
                <td>
                  <button className="category__action-button" onClick={() => handleEdit(category)}>Sửa</button>
                  <button className="category__action-button category__action-button--view" onClick={() => handleViewBooks(category.categoryId)}>
                    Xem sách
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="category__empty">Không có thể loại nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="category__pagination">
        <button
          className="category__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers(categories.length).map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="category__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`category__pagination-button ${currentPage === page ? 'category__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="category__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === totalCategoryPages || loading}
        >
          Trang sau
        </button>
      </div>
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
      {viewCategoryId && (
        <div className="category__modal" onClick={() => { setViewCategoryId(null); setCurrentBookPage(1); }}>
          <div className="category__modal-content category__books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="category__modal-close" onClick={() => { setViewCategoryId(null); setCurrentBookPage(1); }}>
              ×
            </span>
            <h3 className="category__modal-title">
              Danh sách sách của {categories.find(c => c.categoryId === viewCategoryId)?.categoryName || 'Thể loại'}
            </h3>
            <table className="category__books-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tên sách</th>
                  <th>Giá</th>
                  <th>Số trang</th>
                  <th>Tác giả</th>
                  <th>Nhà xuất bản</th>
                  <th>Nhà phát hành</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeleton(true)
                ) : categoryBooks.content && categoryBooks.content.length > 0 ? (
                  categoryBooks.content.map((book) => (
                    <tr key={book.bookId} className="category__table-row">
                      <td>
                        {book.urlThumbnail ? (
                          <img
                            src={book.urlThumbnail}
                            alt={book.bookName}
                            className="category__book-thumbnail"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                          />
                        ) : (
                          'Không có ảnh'
                        )}
                      </td>
                      <td>{book.bookName}</td>
                      <td>{book.price.toLocaleString('vi-VN')} VNĐ</td>
                      <td>{book.numberOfPage}</td>
                      <td>{book.author.authorName}</td>
                      <td>{book.publisher.publisherName}</td>
                      <td>{book.distributor.distributorName}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="category__empty">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="category__books-pagination">
              <button
                className="category__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || loading || categoryBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {getPageNumbers(categoryBooks.totalPages, true).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-books-${index}`} className="category__pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`category__pagination-button ${currentBookPage === page ? 'category__pagination-button--active' : ''}`}
                    onClick={() => setCurrentBookPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="category__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, categoryBooks.totalPages || 1))}
                disabled={currentBookPage === categoryBooks.totalPages || loading || categoryBooks.totalPages === 0}
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;