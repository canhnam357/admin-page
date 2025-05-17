import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAuthors, createAuthor, updateAuthor, fetchAuthorBooks } from './authorSlice';
import './AuthorList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const AuthorList = () => {
  const dispatch = useDispatch();
  const { authors, authorBooks, loading, error } = useSelector((state) => state.authors);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ authorName: '', showModal: false });
  const [editAuthor, setEditAuthor] = useState(null);
  const [viewAuthorId, setViewAuthorId] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const size = 10;
  const bookSize = 5;

  // Debounced search function
  const debouncedFetchAuthors = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
        setCurrentPage(1);
        dispatch(fetchAuthors({ index: 1, size, keyword: value }));
      }, 300),
    [dispatch, size]
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedFetchAuthors(value);
  };

  useEffect(() => {
    dispatch(fetchAuthors({ index: currentPage, size, keyword }));
  }, [dispatch, currentPage, keyword, size]);

  useEffect(() => {
    if (viewAuthorId) {
      dispatch(fetchAuthorBooks({ authorId: viewAuthorId, index: currentBookPage, size: bookSize }));
    }
  }, [viewAuthorId, currentBookPage, dispatch, bookSize]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (authorBooks.totalPages > 0 && currentBookPage > authorBooks.totalPages) {
      setCurrentBookPage(authorBooks.totalPages);
    }
  }, [authorBooks.totalPages, currentBookPage]);

  const handleNextPage = () => {
    if (currentPage < authors.totalPages) {
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

  const validateAuthorName = (name) => {
    if (!name.trim()) {
      toast.dismiss();
      toast.error('Tên tác giả không được rỗng');
      return false;
    }
    if (name.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên tác giả phải có ít nhất 2 ký tự');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (validateAuthorName(createForm.authorName)) {
      try {
        await dispatch(createAuthor(createForm.authorName)).unwrap();
        setCreateForm({ authorName: '', showModal: false });
        dispatch(fetchAuthors({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Tạo tác giả thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Tạo tác giả thất bại: ${err}`);
      }
    }
  };

  const handleEdit = (author) => {
    setEditAuthor({ ...author });
  };

  const handleViewBooks = (authorId) => {
    setViewAuthorId(authorId);
    setCurrentBookPage(1);
  };

  const handleSaveEdit = async () => {
    if (editAuthor && validateAuthorName(editAuthor.authorName)) {
      try {
        await dispatch(
          updateAuthor({ authorId: editAuthor.authorId, authorName: editAuthor.authorName })
        ).unwrap();
        setEditAuthor(null);
        dispatch(fetchAuthors({ index: currentPage, size, keyword }));
        toast.dismiss();
        toast.success('Cập nhật tác giả thành công!');
      } catch (err) {
        toast.dismiss();
        toast.error(`Cập nhật tác giả thất bại: ${err}`);
      }
    }
  };

  const renderSkeleton = (isBooks = false) => {
    const length = isBooks ? bookSize : size;
    return Array.from({ length }).map((_, index) => (
      <tr key={index} className={isBooks ? 'author__books-table-row--loading' : 'author__table-row--loading'}>
        {isBooks ? (
          <>
            <td><div className="author__skeleton author__skeleton--image"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
          </>
        ) : (
          <>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
            <td><div className="author__skeleton author__skeleton--text"></div></td>
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
    <div className="author-list">
      <h2 className="author__title">Danh sách tác giả</h2>
      <div className="author__actions">
        <div className="author__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm tác giả</button>
        </div>
        <div className="author__search-bar">
          <input
            type="text"
            lang="vi"
            placeholder="Tìm kiếm tác giả..."
            value={keyword}
            onChange={handleSearch}
            className="author__search-input"
          />
        </div>
      </div>
      <table className="author__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên tác giả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading && !viewAuthorId ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="3" className="author__empty">Lỗi: {error}</td></tr>
          ) : authors.content && authors.content.length > 0 ? (
            authors.content.map((author) => (
              <tr key={author.authorId} className="author__table-row">
                <td>{author.authorId}</td>
                <td>{author.authorName}</td>
                <td>
                  <button className="author__action-button" onClick={() => handleEdit(author)}>Sửa</button>
                  <button className="author__action-button author__action-button--view" onClick={() => handleViewBooks(author.authorId)}>
                    Xem sách
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" className="author__empty">Không có tác giả nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="author__pagination">
        <button
          className="author__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {getPageNumbers(authors.totalPages).map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="author__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`author__pagination-button ${currentPage === page ? 'author__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
        <button
          className="author__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === authors.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {createForm.showModal && (
        <div className="author__modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="author__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="author__modal-close" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3 className="author__modal-title">Tạo tác giả mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên tác giả..."
              value={createForm.authorName}
              onChange={(e) => setCreateForm({ ...createForm, authorName: e.target.value })}
              className="author__modal-input"
            />
            <div className="author__modal-actions">
              <button className="author__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="author__modal-button author__modal-button--cancel" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {editAuthor && (
        <div className="author__modal" onClick={() => setEditAuthor(null)}>
          <div className="author__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="author__modal-close" onClick={() => setEditAuthor(null)}>
              ×
            </span>
            <h3 className="author__modal-title">Chỉnh sửa tác giả</h3>
            <input
              type="text"
              lang="vi"
              value={editAuthor.authorName}
              onChange={(e) => setEditAuthor({ ...editAuthor, authorName: e.target.value })}
              className="author__modal-input"
            />
            <div className="author__modal-actions">
              <button className="author__modal-button" onClick={handleSaveEdit}>Lưu</button>
              <button className="author__modal-button author__modal-button--cancel" onClick={() => setEditAuthor(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {viewAuthorId && (
        <div className="author__modal" onClick={() => { setViewAuthorId(null); setCurrentBookPage(1); }}>
          <div className="author__modal-content author__books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="author__modal-close" onClick={() => { setViewAuthorId(null); setCurrentBookPage(1); }}>
              ×
            </span>
            <h3 className="author__modal-title">
              Danh sách sách của {authors.content.find(a => a.authorId === viewAuthorId)?.authorName || 'Tác giả'}
            </h3>
            <table className="author__books-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tên sách</th>
                  <th>Giá</th>
                  <th>Số trang</th>
                  <th>Tác giả</th>
                  <th>Nhà xuất bản</th>
                  <th>Nhà phát hành</th>
                  <th>Thể loại</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeleton(true)
                ) : authorBooks.content && authorBooks.content.length > 0 ? (
                  authorBooks.content.map((book) => (
                    <tr key={book.bookId} className="author__table-row">
                      <td>
                        {book.urlThumbnail ? (
                          <img
                            src={book.urlThumbnail}
                            alt={book.bookName}
                            className="author__book-thumbnail"
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
                      <td>{book.categories && book.categories.length > 0 ? book.categories.map(c => c.categoryName).join(', ') : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="author__empty">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="author__books-pagination">
              <button
                className="author__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || loading || authorBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {getPageNumbers(authorBooks.totalPages, true).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-books-${index}`} className="author__pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`author__pagination-button ${currentBookPage === page ? 'author__pagination-button--active' : ''}`}
                    onClick={() => setCurrentBookPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="author__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, authorBooks.totalPages || 1))}
                disabled={currentBookPage === authorBooks.totalPages || loading || authorBooks.totalPages === 0}
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

export default AuthorList;