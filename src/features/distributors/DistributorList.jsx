import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDistributors, createDistributor, updateDistributor, resetDistributorState } from './distributorSlice';
import './DistributorList.css';

const DistributorList = () => {
  const dispatch = useDispatch();
  const { distributors, loading, error, action } = useSelector((state) => state.distributors);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({ distributorName: '', showModal: false });
  const [editDistributor, setEditDistributor] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchDistributors({ index: currentPage, size: 10, keyword }));
  }, [dispatch, currentPage, keyword]);

  useEffect(() => {
    if (!loading && !error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.success('Lấy danh sách nhà phát hành thành công!');
      } else if (action === 'create') {
        toast.dismiss();
        toast.success('Tạo nhà phát hành thành công!');
      } else if (action === 'update') {
        toast.dismiss();
        toast.success('Sửa nhà phát hành thành công!');
      }
    } else if (error) {
      if (action === 'fetch') {
        toast.dismiss();
        toast.error(`Lấy danh sách nhà phát hành thất bại: ${error}`);
      } else if (action === 'create') {
        toast.dismiss();
        toast.error(`Tạo nhà phát hành thất bại: ${error}`);
      } else if (action === 'update') {
        toast.dismiss();
        toast.error(`Sửa nhà phát hành thất bại: ${error}`);
      }
    }
    return () => {
      dispatch(resetDistributorState());
    };
  }, [loading, error, action, dispatch]);

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
    dispatch(fetchDistributors({ index: 1, size: 10, keyword: value }));
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    handleSearch(value);
  };

  const handleCreate = () => {
    if (createForm.distributorName.trim()) {
      dispatch(createDistributor(createForm.distributorName));
      setCreateForm({ distributorName: '', showModal: false });
    } else {
      toast.dismiss();
      toast.error('Tên nhà phát hành không được rỗng');
    }
  };

  const handleEdit = (distributor) => {
    setEditDistributor({ ...distributor });
  };

  const handleSaveEdit = () => {
    if (editDistributor && editDistributor.distributorName) {
      dispatch(updateDistributor({ distributorId: editDistributor.distributorId, distributorName: editDistributor.distributorName }));
      setEditDistributor(null);
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
  for (let i = 1; i <= distributors.totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="distributor-list-container">
      <h2>Danh sách nhà phát hành</h2>
      <div className="distributor-create-form">
        <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm nhà phát hành</button>
      </div>
      <div className="distributor-search-bar">
        <input
          ref={inputRef}
          type="text"
          lang="vi"
          placeholder="Tìm kiếm nhà phát hành..."
          value={keyword}
          onChange={handleInputChange}
        />
      </div>
      <table className="distributor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nhà phát hành</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : distributors.content && distributors.content.length > 0 ? (
            distributors.content.map((distributor) => (
              <tr key={distributor.distributorId}>
                <td>{distributor.distributorId}</td>
                <td>{distributor.distributorName}</td>
                <td>
                  <button onClick={() => handleEdit(distributor)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3">Không có nhà phát hành nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="distributor-pagination">
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
        <button onClick={handleNextPage} disabled={currentPage === distributors.totalPages || loading}>
          Trang sau
        </button>
      </div>
      {createForm.showModal && (
        <div className="distributor-modal">
          <div className="distributor-modal-content">
            <span className="close-modal" onClick={() => setCreateForm({ ...createForm, showModal: false })}>
              ×
            </span>
            <h3>Tạo nhà phát hành mới</h3>
            <input
              type="text"
              lang="vi"
              placeholder="Tên nhà phát hành..."
              value={createForm.distributorName}
              onChange={(e) => setCreateForm({ ...createForm, distributorName: e.target.value })}
            />
            <button onClick={handleCreate}>Tạo</button>
            <button onClick={() => setCreateForm({ ...createForm, showModal: false })}>Hủy</button>
          </div>
        </div>
      )}
      {editDistributor && (
        <div className="distributor-modal">
          <div className="distributor-modal-content">
            <h3>Chỉnh sửa nhà phát hành</h3>
            <input
              type="text"
              lang="vi"
              value={editDistributor.distributorName}
              onChange={(e) => setEditDistributor({ ...editDistributor, distributorName: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Lưu</button>
            <button onClick={() => setEditDistributor(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorList;