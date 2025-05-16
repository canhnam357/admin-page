import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublishers, createPublisher, updatePublisher } from './publisherSlice';
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
  const { publishers, loading, error } = useSelector((state) => state.publishers);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ publisherName: '', showModal: false });
  const [editPublisher, setEditPublisher] = useState(null);
  const size = 10;

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
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

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

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="publisher__table-row--loading">
        <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
        <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
        <td><div className="publisher__skeleton publisher__skeleton--text"></div></td>
      </tr>
    ));
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const totalPages = publishers.totalPages || 1;

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
          {loading ? (
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
        {getPageNumbers().map((page, index) =>
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
    </div>
  );
};

export default PublisherList;