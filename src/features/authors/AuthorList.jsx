import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAuthors, createAuthor, updateAuthor, resetAuthorState } from './authorSlice';
import api from '../../api/api';
import './AuthorList.css';

const AuthorList = () => {
  const dispatch = useDispatch();
  const { authors, loading, error, action } = useSelector((state) => state.authors);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ authorName: '', showModal: false });
  const [editAuthor, setEditAuthor] = useState(null);
  const [viewAuthorId, setViewAuthorId] = useState(null);
  const [authorBooks, setAuthorBooks] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const [toastShown, setToastShown] = useState(false);
  const inputRef = useRef(null);
  const size = 10;

  useEffect(() => {
    dispatch(fetchAuthors({ index: currentPage, size, keyword }));
  }, [dispatch, currentPage, keyword, size]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (viewAuthorId) {
        try {
          const response = await api.get(`/admin/books/author_books/${viewAuthorId}`, {
            params: { index: currentBookPage, size },
          });
          setAuthorBooks(response.data.result || { content: [], totalPages: 0, totalElements: 0 });
          if (!toastShown) {
            toast.dismiss();
            toast.success('Lấy danh sách sách thành công!');
            setToastShown(true);
          }
        } catch (err) {
          setAuthorBooks({ content: [], totalPages: 0, totalElements: 0 });
          toast.dismiss();
          toast.error(`Lấy danh sách sách thất bại: ${err.response?.data?.message || err.message}`);
        }
      }
    };
    fetchBooks();
  }, [viewAuthorId, currentBookPage, toastShown]);

  useEffect(() => {
    if (authorBooks.totalPages > 0 && currentBookPage > authorBooks.totalPages) {
      setCurrentBookPage(authorBooks.totalPages);
    }
  }, [authorBooks.totalPages, currentBookPage]);

  useEffect(() => {
    if (toastShown) return;

    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách tác giả thành công!');
        setToastShown(true);
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo tác giả thành công!');
        setToastShown(true);
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa tác giả thành công!');
        setToastShown(true);
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách tác giả thất bại: ${error}`);
      } else if (action === 'create') {
        toast.dismiss();
        toast.error(`Tạo tác giả thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Sửa tác giả thất bại: ${error}`);
      }
    }

    return () => {
      dispatch(resetAuthorState());
    };
  }, [loading, error, action, dispatch, toastShown]);

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
    setCurrentPage(1);
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearch(value);
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

  const handleCreate = () => {
    if (validateAuthorName(createForm.authorName)) {
      dispatch(createAuthor(createForm.authorName));
      setCreateForm({ authorName: '', showModal: false });
      setToastShown(false);
    }
  };

  const handleEdit = (author) => {
    setEditAuthor({ ...author });
  };

  const handleViewBooks = (authorId) => {
    setViewAuthorId(authorId);
    setCurrentBookPage(1);
    setToastShown(false);
  };

  const handleSaveEdit = () => {
    if (editAuthor && validateAuthorName(editAuthor.authorName)) {
      dispatch(updateAuthor({ authorId: editAuthor.authorId, authorName: editAuthor.authorName }));
      setEditAuthor(null);
      setToastShown(false);
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="author__table-row--loading">
        <td><div className="author__skeleton author__skeleton--text"></div></td>
        <td><div className="author__skeleton author__skeleton--text"></div></td>
        <td><div className="author__skeleton author__skeleton--text"></div></td>
      </tr>
    ));
  };

  const getPageNumbers = (totalPages) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

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

  return (
    <div className="author-list">
      <h2 className="author__title">Danh sách tác giả</h2>
      <div className="author__actions">
        <div className="author__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm tác giả</button>
        </div>
        <div className="author__search-bar">
          <input
            ref={inputRef}
            type="text"
            lang="vi"
            placeholder="Tìm kiếm tác giả..."
            value={keyword}
            onChange={handleInputChange}
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
          {loading ? (
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
        {getPageNumbers(authors.totalPages || 1).map((page, index) =>
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
        <div className="author__modal" onClick={() => { setEditAuthor(null); dispatch(resetAuthorState()); }}>
          <div className="author__modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="author__modal-close" onClick={() => { setEditAuthor(null); dispatch(resetAuthorState()); }}>
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
        <div className="author__modal" onClick={() => setViewAuthorId(null)}>
          <div className="author__modal-content author__books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="author__modal-close" onClick={() => setViewAuthorId(null)}>
              ×
            </span>
            <h3 className="author__modal-title">
              Danh sách sách của {authors.content.find(a => a.authorId === viewAuthorId)?.authorName || 'Tác giả'}
            </h3>
            <table className="author__books-table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Giá</th>
                  <th>Số trang</th>
                  <th>Nhà xuất bản</th>
                  <th>Nhà phân phối</th>
                  <th>Loại sách</th>
                  <th>Thumbnail</th>
                </tr>
              </thead>
              <tbody>
                {authorBooks.content && authorBooks.content.length > 0 ? (
                  authorBooks.content.map((book) => (
                    <tr key={book.bookId} className="author__table-row">
                      <td>{book.bookName}</td>
                      <td>{book.price.toLocaleString()} VNĐ</td>
                      <td>{book.numberOfPage}</td>
                      <td>{book.publisherName}</td>
                      <td>{book.contributorName}</td>
                      <td>{book.bookType}</td>
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
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="author__empty">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="author__books-pagination">
              <button
                className="author__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || authorBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {getPageNumbers(authorBooks.totalPages || 1).map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-books-${index}`} className="author__pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`author__pagination-button ${currentBookPage === page ? 'author__pagination-button--active' : ''}`}
                    onClick={() => setCurrentBookPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="author__pagination-button"
                onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, authorBooks.totalPages || 1))}
                disabled={currentBookPage === authorBooks.totalPages || authorBooks.totalPages === 0}
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