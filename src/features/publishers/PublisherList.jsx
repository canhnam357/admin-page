import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublishers, createPublisher, updatePublisher, fetchPublisherBooks } from './publisherSlice';
import './PublisherList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const PublisherList = () => {
  const dispatch = useDispatch();
  const { publishers, publisherBooks, loading, error } = useSelector((state) => state.publishers);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ publisherName: '', showModal: false });
  const [editPublisher, setEditPublisher] = useState(null);
  const [viewPublisherId, setViewPublisherId] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const size = 10; // Số lượng nhà xuất bản trên mỗi trang
  const bookSize = 5; // Số lượng sách trên mỗi trang

  // Debounced search function
  const debouncedFetchPublishers = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
        setCurrentPage(1);
        dispatch(fetchPublishers({ index: 1, size, keyword: value }));
      }, 300),
    [dispatch, size]
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedFetchPublishers(value);
  };

  useEffect(() => {
    dispatch(fetchPublishers({ index: currentPage, size, keyword }));
  }, [dispatch, currentPage, keyword, size]);

  useEffect(() => {
    if (viewPublisherId) {
      dispatch(fetchPublisherBooks({ publisherId: viewPublisherId, index: currentBookPage, size: bookSize }));
    }
  }, [viewPublisherId, currentBookPage, dispatch, bookSize]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (publisherBooks.totalPages > 0 && currentBookPage > publisherBooks.totalPages) {
      setCurrentBookPage(publisherBooks.totalPages);
    }
  }, [publisherBooks.totalPages, currentBookPage]);

  const handleNextPage = () => {
    if (currentPage < publishers.totalPages) {
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

  const validatePublisherName = (name) => {
    if (!name.trim()) {
      toast.dismiss();
      toast.error('Tên nhà xuất bản không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên nhà xuất bản phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (validatePublisherName(createForm.publisherName)) {
      try {
        await dispatch(createPublisher(createForm.publisherName)).unwrap();
        setCreateForm({ publisherName: '', showModal: false });
        dispatch(fetchPublishers({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Tạo nhà xuất bản thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Tạo nhà xuất bản thất bại: ${err}`);
      }
    }
  };

  const handleEdit = (publisher) => {
    setEditPublisher({ ...publisher });
  };

  const handleViewBooks = (publisherId) => {
    setViewPublisherId(publisherId);
    setCurrentBookPage(1);
  };

  const handleSaveEdit = async () => {
    if (editPublisher && validatePublisherName(editPublisher.publisherName)) {
      try {
        await dispatch(
          updatePublisher({ publisherId: editPublisher.publisherId, publisherName: editPublisher.publisherName })
        ).unwrap();
        setEditPublisher(null);
        dispatch(fetchPublishers({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Cập nhật nhà xuất bản thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Cập nhật nhà xuất bản thất bại: ${err}`);
      }
    }
  };

  const renderSkeleton = (isBooks = false) => {
    const length = isBooks ? bookSize : size;
    return Array.from({ length }).map((_, index) => (
      <tr key={index} className={isBooks ? 'publisher__books-table-row--loading' : 'publisher__table-row--loading'}>
        {isBooks ? (
          <>
            <td><div className="publisher__skeleton publisher__skeleton--image"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
          </>
        ) : (
          <>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
            <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
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
    <div className="publisher-list">
      <h2 className="publisher__title">Danh sách nhà xuất bản</h2>
      <div className="publisher__actions">
        <div className="publisher__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm nhà xuất bản</button>
        </div>
        <div className="publisher__search-bar">
          <input
            type="text"
            lang="vi"
            placeholder="Tìm kiếm nhà xuất bản..."
            value={keyword}
            onChange={handleSearch}
            className="publisher__search-input"
          />
        </div>
      </div>
      <table className="publisher__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nhà xuất bản</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading && !viewPublisherId ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="publisher__empty">Lỗi: {error}</td></tr>
          ) : publishers.content && publishers.content.length > 0 ? (
            publishers.content.map((publisher) => (
              <tr key={publisher.publisherId} className="publisher__table-row">
                <td>{publisher.publisherId}</td>
                <td>{publisher.publisherName}</td>
                <td>
                  <button className="publisher__action-button" onClick={() => handleEdit(publisher)}>Sửa</button>
                  <button className="publisher__action-button publisher__action-button--view" onClick={() => handleViewBooks(publisher.publisherId)}>
                    Xem sách
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="publisher__empty">Không có nhà xuất bản nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="publisher__pagination">
        <button
          className="publisher__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers(publishers.totalPages).map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="publisher__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`publisher__pagination-button ${currentPage === page ? 'publisher__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="publisher__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === publishers.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {createForm.showModal && (
        <div className="publisher__modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="publisher__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="publisher__modal-close" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3 className="publisher__modal-title">Tạo nhà xuất bản mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên nhà xuất bản..."
              value={createForm.publisherName}
              onChange={(e) => setCreateForm({ ...createForm, publisherName: e.target.value })}
              className="publisher__modal-input"
            />
            <div className="publisher__modal-actions">
              <button className="publisher__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="publisher__modal-button publisher__modal-button--cancel" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {editPublisher && (
        <div className="publisher__modal" onClick={() => setEditPublisher(null)}>
          <div className="publisher__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="publisher__modal-close" onClick={() => setEditPublisher(null)}>
              ×
            </span>
            <h3 className="publisher__modal-title">Chỉnh sửa nhà xuất bản</h3>
            <input
              type="text"
              lang="vi"
              value={editPublisher.publisherName}
              onChange={(e) => setEditPublisher({ ...editPublisher, publisherName: e.target.value })}
              className="publisher__modal-input"
            />
            <div className="publisher__modal-actions">
              <button className="publisher__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button className="publisher__modal-button publisher__modal-button--cancel" onClick={() => setEditPublisher(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {viewPublisherId && (
        <div className="publisher__modal" onClick={() => { setViewPublisherId(null); setCurrentBookPage(1); }}>
          <div className="publisher__modal-content publisher__books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="publisher__modal-close" onClick={() => { setViewPublisherId(null); setCurrentBookPage(1); }}>
              ×
            </span>
            <h3 className="publisher__modal-title">
              Danh sách sách của {publishers.content.find(p => p.publisherId === viewPublisherId)?.publisherName || 'Nhà xuất bản'}
            </h3>
            <table className="publisher__books-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tên sách</th>
                  <th>Giá</th>
                  <th>Số trang</th>
                  <th>Tác giả</th>
                  <th>Nhà phát hành</th>
                  <th>Loại sách</th>
                  <th>Thể loại</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeleton(true)
                ) : publisherBooks.content && publisherBooks.content.length > 0 ? (
                  publisherBooks.content.map((book) => (
                    <tr key={book.bookId} className="publisher__table-row">
                      <td>
                        {book.urlThumbnail ? (
                          <img
                            src={book.urlThumbnail}
                            alt={book.bookName}
                            className="publisher__book-thumbnail"
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
                      <td>{book.distributor.distributorName}</td>
                      <td>{book.bookType.bookTypeName}</td>
                      <td>{book.categories && book.categories.length > 0 ? book.categories.map(c => c.categoryName).join(', ') : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="publisher__empty">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="publisher__books-pagination">
              <button
                className="publisher__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || loading || publisherBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {getPageNumbers(publisherBooks.totalPages, true).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-books-${index}`} className="publisher__pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`publisher__pagination-button ${currentBookPage === page ? 'publisher__pagination-button--active' : ''}`}
                    onClick={() => setCurrentBookPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="publisher__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, publisherBooks.totalPages || 1))}
                disabled={currentBookPage === publisherBooks.totalPages || loading || publisherBooks.totalPages === 0}
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

export default PublisherList;