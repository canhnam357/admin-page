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
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      dispatch(fetchAuthors({ index: currentPage, size: 10, keyword }));
    }
  }, [dispatch, currentPage, keyword]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (viewAuthorId) {
        try {
          console.log('Fetching books - authorId:', viewAuthorId, 'page:', currentBookPage);
          const response = await api.get(`/admin/books/author_books/${viewAuthorId}`, {
            params: { index: currentBookPage, size: 10 },
          });
          console.log('Books response:', response.data.result);
          setAuthorBooks(response.data.result || { content: [], totalPages: 0, totalElements: 0 });
          toast.dismiss();
          toast.success('Lấy danh sách sách thành công!');
        } catch (err) {
          console.error('Fetch books error:', err);
          setAuthorBooks({ content: [], totalPages: 0, totalElements: 0 });
          toast.dismiss();
          toast.error(`Lấy danh sách sách thất bại: ${err.response?.data?.message || err.message}`);
        }
      }
    };
    fetchBooks();
  }, [viewAuthorId, currentBookPage]);

  useEffect(() => {
    if (authorBooks.totalPages > 0 && currentBookPage > authorBooks.totalPages) {
      setCurrentBookPage(authorBooks.totalPages);
    }
  }, [authorBooks.totalPages, currentBookPage]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách tác giả thành công!');
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo tác giả thành công!');
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa tác giả thành công!');
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
  }, [loading, error, action, dispatch]);

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
        if (value === undefined || value.trim() === '') {
          func('');
        } else {
          func(value);
        }
      }, delay);
    };
  };

  const handleSearch = debounce((value) => {
    setCurrentPage(1);
    dispatch(fetchAuthors({ index: 1, size: 10, keyword: value }));
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    handleSearch(value);
  };

  const handleCreate = () => {
    if (createForm.authorName.trim()) {
      dispatch(createAuthor(createForm.authorName));
      setCreateForm({ authorName: '', showModal: false });
    } else {
      toast.dismiss();
      toast.error('Tên tác giả không được rỗng');
    }
  };

  const handleEdit = (author) => {
    setEditAuthor({ ...author });
  };

  const handleViewBooks = (authorId) => {
    setViewAuthorId(authorId);
    setCurrentBookPage(1);
  };

  const handleSaveEdit = () => {
    if (editAuthor && editAuthor.authorName) {
      dispatch(updateAuthor({ authorId: editAuthor.authorId, authorName: editAuthor.authorName }));
      setEditAuthor(null);
    }
  };

  // Skeleton loading cho bảng
  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index}>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-button"></div></td>
      </tr>
    ));
  };

  const pageNumbers = [];
  for (let i = 1; i <= authors.totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="author-list-container">
      <h2>Danh sách tác giả</h2>
      <div className="author-create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm tác giả</button>
      </div>
      <div className="author-search-bar">
        <input
          ref={inputRef}
          type="text"
          lang="vi"
          placeholder="Tìm kiếm tác giả..."
          value={keyword}
          onChange={handleInputChange}
        />
      </div>

      {error ? (
        <p>Lỗi: {error}</p>
      ) : (
        <>
          <table className="author-table">
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
              ) : authors.content && authors.content.length > 0 ? (
                authors.content.map((author) => (
                  <tr key={author.authorId}>
                    <td>{author.authorId}</td>
                    <td>{author.authorName}</td>
                    <td>
                      <button onClick={() => handleEdit(author)}>Sửa</button>
                      <button onClick={() => handleViewBooks(author.authorId)} className="view-books-button">
                        Xem sách
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">Không có tác giả nào</td></tr>
              )}
            </tbody>
          </table>
          <div className="author-pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
              Trang trước
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageClick(number)}
                className={currentPage === number ? 'active' : ''}
                disabled={loading}
              >
                {number}
              </button>
            ))}
            <button onClick={handleNextPage} disabled={currentPage === authors.totalPages || loading}>
              Trang sau
            </button>
          </div>
        </>
      )}

      {createForm.showModal && (
        <div className="author-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
          <div className="author-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3>Tạo tác giả mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên tác giả..."
              value={createForm.authorName}
              onChange={(e) => setCreateForm({ ...createForm, authorName: e.target.value })}
            />
            <button onClick={handleCreate}>Tạo</button>
            <button onClick={() => setCreateForm({ ...createForm, showModal: false })}>Hủy</button>
          </div>
        </div>
      )}
      {editAuthor && (
        <div className="author-modal" onClick={() => { setEditAuthor(null); dispatch(resetAuthorState()); }}>
          <div className="author-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => { setEditAuthor(null); dispatch(resetAuthorState()); }}>
              ×
            </span>
            <h3>Chỉnh sửa tác giả</h3>
            <input
              type="text"
              lang="vi"
              value={editAuthor.authorName}
              onChange={(e) => setEditAuthor({ ...editAuthor, authorName: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditAuthor(null)}>Hủy</button>
          </div>
        </div>
      )}
      {viewAuthorId && (
        <div className="author-modal" onClick={() => setViewAuthorId(null)}>
          <div className="author-modal-content author-books-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setViewAuthorId(null)}>
              ×
            </span>
            <h3>Danh sách sách của {authors.content.find(a => a.authorId === viewAuthorId)?.authorName || 'Tác giả'}</h3>
            <table className="author-books-table">
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
                    <tr key={book.bookId}>
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
                            className="book-thumbnail"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                          />
                        ) : (
                          'Không có ảnh'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7">Không có sách nào</td></tr>
                )}
              </tbody>
            </table>
            <div className="author-books-pagination">
              <button
                onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))}
                disabled={currentBookPage === 1 || authorBooks.totalPages === 0}
              >
                Trang trước
              </button>
              {Array.from({ length: authorBooks.totalPages || 0 }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentBookPage(number)}
                  className={currentBookPage === number ? 'active' : ''}
                >
                  {number}
                </button>
              ))}
              <button
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