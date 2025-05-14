import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublishers, createPublisher, updatePublisher, resetPublisherState } from './publisherSlice';
import './PublisherList.css';

const PublisherList = () => {
  const dispatch = useDispatch();
  const { publishers, loading, error, action } = useSelector((state) => state.publishers);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ publisherName: '', showModal: false });
  const [editPublisher, setEditPublisher] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPublishers({ index: currentPage, size: 10, keyword }));
  }, [dispatch, currentPage, keyword]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách nhà xuất bản thành công!');
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo nhà xuất bản thành công!');
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa nhà xuất bản thành công!');
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách nhà xuất bản thất bại: ${error}`);
      } else if (action === 'create') {
        toast.dismiss();
        toast.error(`Tạo nhà xuất bản thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Sửa nhà xuất bản thất bại: ${error}`);
      }
    }
    return () => {
      dispatch(resetPublisherState());
    };
  }, [loading, error, action, dispatch]);

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
    dispatch(fetchPublishers({ index: 1, size: 10, keyword: value }));
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    handleSearch(value);
  };

  const handleCreate = () => {
    if (createForm.publisherName.trim()) {
      dispatch(createPublisher(createForm.publisherName));
      setCreateForm({ publisherName: '', showModal: false });
    } else {
      toast.dismiss();
      toast.error('Tên nhà xuất bản không được rỗng');
    }
  };

  const handleEdit = (publisher) => {
    setEditPublisher({ ...publisher });
  };

  const handleSaveEdit = () => {
    if (editPublisher && editPublisher.publisherName) {
      dispatch(updatePublisher({ publisherId: editPublisher.publisherId, publisherName: editPublisher.publisherName }));
      setEditPublisher(null);
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

  const pageNumbers = [];
  for (let i = 1; i <= publishers.totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="publisher-list-container">
      <h2>Danh sách nhà xuất bản</h2>
      <div className="publisher-create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm nhà xuất bản</button>
      </div>
      <div className="publisher-search-bar">
        <input
          ref={inputRef}
          type="text"
          lang="vi"
          placeholder="Tìm kiếm nhà xuất bản..."
          value={keyword}
          onChange={handleInputChange}
        />
      </div>
      <table className="publisher-table">
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
          ) : publishers.content && publishers.content.length > 0 ? (
            publishers.content.map((publisher) => (
              <tr key={publisher.publisherId}>
                <td>{publisher.publisherId}</td>
                <td>{publisher.publisherName}</td>
                <td>
                  <button onClick={() => handleEdit(publisher)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3">Không có nhà xuất bản nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="publisher-pagination">
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
        <button onClick={handleNextPage} disabled={currentPage === publishers.totalPages || loading}>
          Trang sau
        </button>
      </div>
      {createForm.showModal && (
        <div className="publisher-modal">
          <div className="publisher-modal-content">
            <span className="close-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3>Tạo nhà xuất bản mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên nhà xuất bản..."
              value={createForm.publisherName}
              onChange={(e) => setCreateForm({ ...createForm, publisherName: e.target.value })}
            />
            <button onClick={handleCreate}>Tạo</button>
            <button onClick={() => setCreateForm({ ...createForm, showModal: false })}>Hủy</button>
          </div>
        </div>
      )}
      {editPublisher && (
        <div className="publisher-modal">
          <div className="publisher-modal-content">
            <h3>Chỉnh sửa nhà xuất bản</h3>
            <input
              type="text"
              lang="vi"
              value={editPublisher.publisherName}
              onChange={(e) => setEditPublisher({ ...editPublisher, publisherName: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditPublisher(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublisherList;