import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDistributors, createDistributor, updateDistributor, fetchDistributorBooks } from './distributorSlice';
import './DistributorList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const DistributorList = () => {
  const dispatch = useDispatch();
  const { distributors, distributorBooks, loading, error } = useSelector((state) => state.distributors);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ distributorName: '', showModal: false });
  const [editDistributor, setEditDistributor] = useState(null);
  const [viewDistributorId, setViewDistributorId] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const size = 10; // Số lượng nhà phát hành trên mỗi trang
  const bookSize = 5; // Số lượng sách trên mỗi trang

  // Debounced search function
  const debouncedFetchDistributors = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
        setCurrentPage(1);
        dispatch(fetchDistributors({ index: 1, size, keyword: value }));
      }, 300),
    [dispatch, size]
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedFetchDistributors(value);
  };

  useEffect(() => {
    dispatch(fetchDistributors({ index: currentPage, size, keyword }));
  }, [dispatch, currentPage, keyword, size]);

  useEffect(() => {
    if (viewDistributorId) {
      dispatch(fetchDistributorBooks({ distributorId: viewDistributorId, index: currentBookPage, size: bookSize }));
    }
  }, [viewDistributorId, currentBookPage, dispatch, bookSize]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (distributorBooks.totalPages > 0 && currentBookPage > distributorBooks.totalPages) {
      setCurrentBookPage(distributorBooks.totalPages);
    }
  }, [distributorBooks.totalPages, currentBookPage]);

  const handleNextPage = () => {
    if (currentPage < distributors.totalPages) {
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

  const validateDistributorName = (name) => {
    if (!name.trim()) {
      toast.dismiss();
      toast.error('Tên nhà phát hành không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên nhà phát hành phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (validateDistributorName(createForm.distributorName)) {
      try {
        await dispatch(createDistributor(createForm.distributorName)).unwrap();
        setCreateForm({ distributorName: '', showModal: false });
        dispatch(fetchDistributors({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Tạo nhà phát hành thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Tạo nhà phát hành thất bại: ${err}`);
      }
    }
  };

  const handleEdit = (distributor) => {
    setEditDistributor({ ...distributor });
  };

  const handleViewBooks = (distributorId) => {
    setViewDistributorId(distributorId);
    setCurrentBookPage(1);
  };

  const handleSaveEdit = async () => {
    if (editDistributor && validateDistributorName(editDistributor.distributorName)) {
      try {
        await dispatch(
          updateDistributor({ distributorId: editDistributor.distributorId, distributorName: editDistributor.distributorName })
        ).unwrap();
        setEditDistributor(null);
        dispatch(fetchDistributors({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Cập nhật nhà phát hành thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Cập nhật nhà phát hành thất bại: ${err}`);
      }
    }
  };

  const renderSkeleton = (isBooks = false) => {
    const length = isBooks ? bookSize : size;
    return Array.from({ length }).map((_, index) => (
      <tr key={index} className={isBooks ? 'distributor__books-table-row--loading' : 'distributor__table-row--loading'}>
        {isBooks ? (
          <>
            <td><div className="distributor__skeleton distributor__skeleton--image"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
          </>
        ) : (
          <>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
            <td><div className="distributor__skeleton distributor__skeleton--text"></div></td>
          </>
        )}
      </tr>
    ));
  };

  const getPageNumbers = (totalPages, isBooks = false) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const current = isBooks ? currentBookPage : currentPage;
    const pages = totalPages || 1;

    const start = Math.max(2, current - delta);
    const end = Math.min(pages - 1, current + delta);

    range.push(1);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (pages > 1) {
      range.push(pages);
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
    <div className="distributor-list">
      <h2 className="distributor__title">Danh sách nhà phát hành</h2>
      <div className="distributor__actions">
        <div className="distributor__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm nhà phát hành</button>
        </div>
        <div className="distributor__search-bar">
          <input
            type="text"
            lang="vi"
            placeholder="Tìm kiếm nhà phát hành..."
            value={keyword}
            onChange={handleSearch}
            className="distributor__search-input"
          />
        </div>
      </div>
      <table className="distributor__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nhà phát hành</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading && !viewDistributorId ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="distributor__empty">Lỗi: {error}</td></tr>
          ) : distributors.content && distributors.content.length > 0 ? (
            distributors.content.map((distributor) => (
              <tr key={distributor.distributorId} className="distributor__table-row">
                <td>{distributor.distributorId}</td>
                <td>{distributor.distributorName}</td>
                <td>
                  <button className="distributor__action-button" onClick={() => handleEdit(distributor)}>Sửa</button>
                  <button className="distributor__action-button distributor__action-button--view" onClick={() => handleViewBooks(distributor.distributorId)}>
                    Xem sách
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="distributor__empty">Không có nhà phát hành nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="distributor__pagination">
        <button
          className="distributor__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers(distributors.totalPages).map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="distributor__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`distributor__pagination-button ${currentPage === page ? 'distributor__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="distributor__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === distributors.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {createForm.showModal && (
        <div className="distributor__modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="distributor__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="distributor__modal-close" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3 className="distributor__modal-title">Tạo nhà phát hành mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên nhà phát hành..."
              value={createForm.distributorName}
              onChange={(e) => setCreateForm({ ...createForm, distributorName: e.target.value })}
              className="distributor__modal-input"
            />
            <div className="distributor__modal-actions">
              <button className="distributor__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="distributor__modal-button distributor__modal-button--cancel" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {editDistributor && (
        <div className="distributor__modal" onClick={() => setEditDistributor(null)}>
          <div className="distributor__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="distributor__modal-close" onClick={() => setEditDistributor(null)}>
              ×
            </span>
            <h3 className="distributor__modal-title">Chỉnh sửa nhà phát hành</h3>
            <input
              type="text"
              lang="vi"
              value={editDistributor.distributorName}
              onChange={(e) => setEditDistributor({ ...editDistributor, distributorName: e.target.value })}
              className="distributor__modal-input"
            />
            <div className="distributor__modal-actions">
              <button className="distributor__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button className="distributor__modal-button distributor__modal-button--cancel" onClick={() => setEditDistributor(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {viewDistributorId && (
        <div className="distributor__modal" onClick={() => { setViewDistributorId(null); setCurrentBookPage(1); }}>
          <div className="distributor__modal-content distributor__books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="distributor__modal-close" onClick={() => { setViewDistributorId(null); setCurrentBookPage(1); }}>
              ×
            </span>
            <h3 className="distributor__modal-title">
              Danh sách sách của {distributors.content.find(d => d.distributorId === viewDistributorId)?.distributorName || 'Nhà phát hành'}
            </h3>
            <table className="distributor__books-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tên sách</th>
                  <th>Giá</th>
                  <th>Số trang</th>
                  <th>Tác giả</th>
                  <th>Nhà xuất bản</th>
                  <th>Loại sách</th>
                  <th>Thể loại</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeleton(true)
                ) : distributorBooks.content && distributorBooks.content.length > 0 ? (
                  distributorBooks.content.map((book) => (
                    <tr key={book.bookId} className="distributor__table-row">
                      <td>
                        {book.urlThumbnail ? (
                          <img
                            src={book.urlThumbnail}
                            alt={book.bookName}
                            className="distributor__book-thumbnail"
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
                      <td>{book.bookType.bookTypeName}</td>
                      <td>{book.categories && book.categories.length > 0 ? book.categories.map(c => c.categoryName).join(', ') : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="distributor__empty">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="distributor__books-pagination">
              <button
                className="distributor__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || loading || distributorBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {getPageNumbers(distributorBooks.totalPages, true).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-books-${index}`} className="distributor__pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`distributor__pagination-button ${currentBookPage === page ? 'distributor__pagination-button--active' : ''}`}
                    onClick={() => setCurrentBookPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="distributor__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, distributorBooks.totalPages || 1))}
                disabled={currentBookPage === distributorBooks.totalPages || loading || distributorBooks.totalPages === 0}
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

export default DistributorList;