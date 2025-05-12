import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, createBook, updateBook, resetBookState } from './bookSlice';
import { fetchAuthors } from '../authors/authorSlice';
import { fetchPublishers } from '../publishers/publisherSlice';
import { fetchDistributors } from '../distributors/distributorSlice';
import { fetchBookTypes } from '../book-types/bookTypeSlice';
import { fetchCategories } from '../categories/categorySlice';
import './BookList.css';
import api from '../../api/api';
import { toast } from 'react-toastify';


const BookList = () => {
  const dispatch = useDispatch();
  const { books, loading, notification } = useSelector((state) => state.books);
  const { authors } = useSelector((state) => state.authors);
  const { publishers } = useSelector((state) => state.publishers);
  const { distributors } = useSelector((state) => state.distributors);
  const { bookTypes } = useSelector((state) => state.bookTypes);
  const { categories } = useSelector((state) => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [createForm, setCreateForm] = useState({
    bookName: '',
    inStock: '',
    price: '',
    description: '',
    numberOfPage: '',
    publishedDate: new Date().toISOString().split('T')[0],
    weight: '',
    authorId: '',
    publisherId: '',
    distributorId: '',
    bookTypeId: '',
    thumbnailIdx: 0,
    categoriesId: [],
    images: [],
    newArrival: false,
    showModal: false,
  });
  const [editForm, setEditForm] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [viewBook, setViewBook] = useState(null);
  const [oldImages, setOldImages] = useState([]);
  const [removedOldImageIds, setRemovedOldImageIds] = useState([]);
  const [discountForm, setDiscountForm] = useState(null);
  const isInitialMount = useRef(true);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      dispatch(fetchBooks({ index: currentPage, size: 10, keyword }));
      dispatch(fetchAuthors({ index: 1, size: 100 }));
      dispatch(fetchPublishers({ index: 1, size: 100 }));
      dispatch(fetchDistributors({ index: 1, size: 100 }));
      dispatch(fetchBookTypes());
      dispatch(fetchCategories({ keyword: '' }));
    }
  }, [dispatch, currentPage, keyword]);

  useEffect(() => {
    if (!loading && notification?.type === 'success') {
      dispatch(resetBookState());
    }
  }, [loading, notification, dispatch]);

  const handleNextPage = () => {
    if (currentPage < books.totalPages) {
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
    dispatch(fetchBooks({ index: 1, size: 10, keyword: value }));
  }, 150);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    handleSearch(value);
  };

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('bookName', createForm.bookName);
      formData.append('inStock', createForm.inStock);
      formData.append('price', createForm.price);
      formData.append('description', createForm.description);
      formData.append('numberOfPage', createForm.numberOfPage);
      formData.append('publishedDate', createForm.publishedDate);
      formData.append('weight', createForm.weight);
      formData.append('authorId', createForm.authorId);
      formData.append('publisherId', createForm.publisherId);
      formData.append('distributorId', createForm.distributorId);
      formData.append('bookTypeId', createForm.bookTypeId);
      formData.append('thumbnailIdx', createForm.thumbnailIdx);
      formData.append('newArrival', createForm.newArrival);
      createForm.categoriesId.forEach((id) => formData.append('categoriesId', id));
      createForm.images.forEach((file) => formData.append('images', file));

      await dispatch(createBook(formData)).unwrap();
      setCreateForm({
        bookName: '',
        inStock: '',
        price: '',
        description: '',
        numberOfPage: '',
        publishedDate: new Date().toISOString().split('T')[0],
        weight: '',
        authorId: '',
        publisherId: '',
        distributorId: '',
        bookTypeId: '',
        thumbnailIdx: 0,
        categoriesId: [],
        images: [],
        newArrival: false,
        showModal: false,
      });
      setSelectedCategories([]);
      setImagePreviews([]);
      dispatch(fetchBooks({ index: currentPage, size: 10, keyword }));
    } catch (err) {
      // Toast đã được xử lý trong slice, không cần hiển thị ở đây
    }
  };

  const handleEdit = (book) => {
    setEditForm({
      bookId: book.bookId,
      bookName: book.bookName,
      inStock: book.inStock,
      price: book.price,
      description: book.description || '',
      numberOfPage: book.numberOfPage,
      publishedDate: new Date(book.publishedDate).toISOString().split('T')[0],
      weight: book.weight,
      authorId: book.author.authorId,
      publisherId: book.publisher.publisherId,
      distributorId: book.distributor.distributorId,
      bookTypeId: book.bookType.bookTypeId,
      thumbnailIdx: 0,
      categoriesId: book.categories.map((cat) => cat.categoryId),
      images: [],
      newArrival: book.newArrival,
      isDeleted: book.isDeleted,
    });
    setSelectedCategories(book.categories.map((cat) => cat.categoryId));
    setOldImages(book.images || []);
    setImagePreviews(book.images ? book.images.map((img) => img.url) : []);
    setRemovedOldImageIds([]);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('bookName', editForm.bookName);
      formData.append('inStock', editForm.inStock);
      formData.append('price', editForm.price);
      formData.append('description', editForm.description);
      formData.append('numberOfPage', editForm.numberOfPage);
      formData.append('publishedDate', editForm.publishedDate);
      formData.append('weight', editForm.weight);
      formData.append('authorId', editForm.authorId);
      formData.append('publisherId', editForm.publisherId);
      formData.append('distributorId', editForm.distributorId);
      formData.append('bookTypeId', editForm.bookTypeId);
      formData.append('newArrival', editForm.newArrival);
      formData.append('isDeleted', editForm.isDeleted);

      const oldImagesCount = oldImages.length - removedOldImageIds.length;
      let adjustedThumbnailIdx;
      if (editForm.thumbnailIdx < oldImagesCount) {
        adjustedThumbnailIdx = editForm.thumbnailIdx;
      } else {
        const newImageIndex = editForm.thumbnailIdx - oldImagesCount;
        adjustedThumbnailIdx = oldImagesCount + newImageIndex;
      }
      formData.append('thumbnailIdx', adjustedThumbnailIdx);

      editForm.categoriesId.forEach((id) => formData.append('categoriesId', id));
      editForm.images.forEach((file) => formData.append('images', file));
      const remainingImages = oldImages
        .filter((img) => !removedOldImageIds.includes(img.imageId))
        .map((img) => img.imageId);
      remainingImages.forEach((id) => formData.append('remainImages', id));

      await dispatch(updateBook({ bookId: editForm.bookId, formData })).unwrap();
      setEditForm(null);
      setSelectedCategories([]);
      setImagePreviews([]);
      setOldImages([]);
      setRemovedOldImageIds([]);
      dispatch(fetchBooks({ index: currentPage, size: 10, keyword }));
    } catch (err) {
      // Toast đã được xử lý trong slice, không cần hiển thị ở đây
    }
  };

  const handleView = (book) => {
    setViewBook(book);
  };

  const handleFileChange = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    if (isEdit) {
      setEditForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    } else {
      setCreateForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    }
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleThumbnailSelect = (index, isEdit = false) => {
    if (isEdit) {
      setEditForm((prev) => ({ ...prev, thumbnailIdx: index }));
    } else {
      setCreateForm((prev) => ({ ...prev, thumbnailIdx: index }));
    }
  };

  const handleAddCategory = (categoryId, isEdit = false) => {
    setSelectedCategories((prev) => [...prev, categoryId]);
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        categoriesId: [...prev.categoriesId, categoryId],
      }));
    } else {
      setCreateForm((prev) => ({
        ...prev,
        categoriesId: [...prev.categoriesId, categoryId],
      }));
    }
  };

  const handleRemoveCategory = (categoryId, isEdit = false) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        categoriesId: prev.categoriesId.filter((id) => id !== categoryId),
      }));
    } else {
      setCreateForm((prev) => ({
        ...prev,
        categoriesId: prev.categoriesId.filter((id) => id !== categoryId),
      }));
    }
  };

  const handleNewArrivalChange = (e, isEdit = false) => {
    if (isEdit) {
      setEditForm((prev) => ({ ...prev, newArrival: e.target.checked }));
    } else {
      setCreateForm((prev) => ({ ...prev, newArrival: e.target.checked }));
    }
  };

  const handleIsDeletedChange = (e) => {
    setEditForm((prev) => ({ ...prev, isDeleted: e.target.checked }));
  };

  const handleRemoveOldImage = (index, imageId) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setRemovedOldImageIds((prev) => [...prev, imageId]);
    setEditForm((prev) => ({
      ...prev,
      thumbnailIdx: prev.thumbnailIdx === index ? 0 : prev.thumbnailIdx > index ? prev.thumbnailIdx - 1 : prev.thumbnailIdx,
    }));
  };

  const resetCreateForm = () => {
    setCreateForm({
      bookName: '',
      inStock: '',
      price: '',
      description: '',
      numberOfPage: '',
      publishedDate: new Date().toISOString().split('T')[0],
      weight: '',
      authorId: '',
      publisherId: '',
      distributorId: '',
      bookTypeId: '',
      thumbnailIdx: 0,
      categoriesId: [],
      images: [],
      newArrival: false,
      showModal: false,
    });
    setSelectedCategories([]);
    setImagePreviews([]);
  };

  const fetchDiscount = async (bookId) => {
    try {
      const response = await api.get(`/admin/discounts/${bookId}`);
      const discount = response.data.result;
      if (discount) {
        // Chuyển đổi định dạng ngày từ dd-MM-yyyy HH:mm:ss sang yyyy-MM-dd
        const [startDay, startMonth, startYear] = discount.startDate.split(' ')[0].split('-');
        const [endDay, endMonth, endYear] = discount.endDate.split(' ')[0].split('-');
        const startDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
        const endDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
        setDiscountForm({
          ...discount,
          startDate,
          endDate,
        });
      } else {
        setDiscountForm({
          bookId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          discountType: 'PERCENTAGE',
          discount: '',
        });
      }
    } catch (err) {
      setDiscountForm({
        bookId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        discountType: 'PERCENTAGE',
        discount: '',
      });
    }
  };

  const handleSaveDiscount = async () => {
    try {
      const { bookId, discountId, startDate, endDate, discountType, discount } = discountForm;
      const payload = {
        startDate,
        endDate,
        discountType,
        discount: parseFloat(discount),
      };

      if (discountId) {
        await api.put(`/admin/discounts/${discountId}`, payload);
      } else {
        await api.post('/admin/discounts', { ...payload, bookId });
      }
      setDiscountForm(null);
      toast.success('Cập nhật khuyến mãi thành công!');
      dispatch(fetchBooks({ index: currentPage, size: 10, keyword }));
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="book-list__table-row--loading">
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--button"></div></td>
      </tr>
    ));
  };

  const truncateBookName = (name) => {
    const maxLength = 30;
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name;
  };

  return (
    <div className="book-list">
      <h2 className="book-list__title">Danh sách sách</h2>
      <div className="book-list__actions">
        <div className="book-list__search">
          <input
            ref={searchInputRef}
            type="text"
            lang="vi"
            placeholder="Tìm kiếm sách..."
            value={keyword}
            onChange={handleInputChange}
            className="book-list__search-input"
          />
        </div>
        <button
          className="book-list__create-button"
          onClick={() => setCreateForm({ ...createForm, showModal: true })}
        >
          Tạo sách
        </button>
      </div>
      <table className="book-list__table">
        <thead>
          <tr>
            <th>Tên sách</th>
            <th>Tồn kho</th>
            <th>Giá</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Đã xóa</th>
            <th>Mới về</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : books.content && books.content.length > 0 ? (
            books.content.map((book) => (
              <tr key={book.bookId} className="book-list__table-row">
                <td>{truncateBookName(book.bookName)}</td>
                <td>{book.inStock}</td>
                <td>{book.price.toLocaleString()} VNĐ</td>
                <td>{new Date(book.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{book.updatedAt ? new Date(book.updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</td>
                <td className={book.isDeleted ? 'book-list__status--deleted-yes' : 'book-list__status--deleted-no'}>
                  {book.isDeleted ? 'YES' : 'NO'}
                </td>
                <td className={book.newArrival ? 'book-list__status--new-yes' : 'book-list__status--new-no'}>
                  {book.newArrival ? 'YES' : 'NO'}
                </td>
                <td>
                  <button className="book-list__action-button book-list__action-button--edit" onClick={() => handleEdit(book)}>Sửa</button>
                  <button className="book-list__action-button book-list__action-button--view" onClick={() => handleView(book)}>Xem chi tiết</button>
                  <button className="book-list__action-button book-list__action-button--discount" onClick={() => fetchDiscount(book.bookId)}>Khuyến mãi</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" className="book-list__empty">Không có sách nào</td></tr>
          )}
        </tbody>
      </table>
      <div className="book-list__pagination">
        <button
          className="book-list__pagination-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
        >
          Trang trước
        </button>
        {Array.from({ length: books.totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            className={`book-list__pagination-button ${currentPage === number ? 'book-list__pagination-button--active' : ''}`}
            onClick={() => handlePageClick(number)}
            disabled={loading}
          >
            {number}
          </button>
        ))}
        <button
          className="book-list__pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === books.totalPages || loading}
        >
          Trang sau
        </button>
      </div>
      {viewBook && (
        <div className="book-list__modal" onClick={() => setViewBook(null)}>
          <div className="book-list__modal-content book-list__modal-content--details" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={() => setViewBook(null)}>×</span>
            <h3 className="book-list__modal-title">Chi tiết sách: {viewBook.bookName}</h3>
            <div className="book-list__details">
              <div className="book-list__detail-item">
                <strong>Thumbnail:</strong>
                <img
                  src={viewBook.urlThumbnail || ''}
                  alt="Thumbnail"
                  className="book-list__thumbnail"
                  onError={(e) => (e.target.src = '')}
                />
              </div>
              <div className="book-list__detail-item">
                <strong>Hình ảnh:</strong>
                <div className="book-list__images">
                  {viewBook.images && viewBook.images.length > 0 ? (
                    viewBook.images.map((image) => (
                      <img
                        key={image.imageId}
                        src={image.url}
                        alt={image.caption || 'Book image'}
                        className="book-list__image"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                      />
                    ))
                  ) : (
                    <p>Không có hình ảnh</p>
                  )}
                </div>
              </div>
              <div className="book-list__detail-item">
                <strong>Tên sách:</strong> {viewBook.bookName}
              </div>
              <div className="book-list__detail-item">
                <strong>Số lượng:</strong> {viewBook.inStock}
              </div>
              <div className="book-list__detail-item">
                <strong>Giá:</strong> {viewBook.price.toLocaleString()} VNĐ
              </div>
              <div className="book-list__detail-item">
                <strong>Mô tả:</strong> <p>{viewBook.description}</p>
              </div>
              <div className="book-list__detail-item">
                <strong>Số trang:</strong> {viewBook.numberOfPage}
              </div>
              <div className="book-list__detail-item">
                <strong>Ngày xuất bản:</strong> {new Date(viewBook.publishedDate).toLocaleDateString('vi-VN')}
              </div>
              <div className="book-list__detail-item">
                <strong>Cân nặng:</strong> {viewBook.weight} g
              </div>
              <div className="book-list__detail-item">
                <strong>Ngày tạo:</strong> {new Date(viewBook.createdAt).toLocaleDateString('vi-VN')}
              </div>
              <div className="book-list__detail-item">
                <strong>Ngày cập nhật:</strong> {viewBook.updatedAt ? new Date(viewBook.updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </div>
              <div className="book-list__detail-item">
                <strong>Tác giả:</strong> {viewBook.author.authorName}
              </div>
              <div className="book-list__detail-item">
                <strong>Nhà xuất bản:</strong> {viewBook.publisher.publisherName}
              </div>
              <div className="book-list__detail-item">
                <strong>Nhà phát hành:</strong> {viewBook.distributor.distributorName}
              </div>
              <div className="book-list__detail-item">
                <strong>Danh sách thể loại:</strong>{' '}
                {viewBook.categories && viewBook.categories.length > 0
                  ? viewBook.categories.map((cat) => cat.categoryName).join(', ')
                  : 'Không có thể loại'}
              </div>
              <div className="book-list__detail-item">
                <strong>Loại sách:</strong> {viewBook.bookType.bookTypeName}
              </div>
              <div className="book-list__detail-item">
                <strong>Mới về:</strong> {viewBook.newArrival ? 'Có' : 'Không'}
              </div>
              <div className="book-list__detail-item">
                <strong>Đã xóa:</strong> {viewBook.isDeleted ? 'Có' : 'Không'}
              </div>
            </div>
          </div>
        </div>
      )}
      {createForm.showModal && (
        <div className="book-list__modal" onClick={() => resetCreateForm()}>
          <div className="book-list__modal-content book-list__modal-content--create" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={() => resetCreateForm()}>×</span>
            <h3 className="book-list__modal-title">Tạo sách mới</h3>
            <div className="book-list__form-group">
              <label className="book-list__label">Tên sách</label>
              <input
                type="text"
                lang="vi"
                placeholder="Tên sách..."
                value={createForm.bookName}
                onChange={(e) => setCreateForm({ ...createForm, bookName: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Số lượng (≥ 0)</label>
              <input
                type="number"
                placeholder="Số lượng (≥ 0)..."
                value={createForm.inStock}
                onChange={(e) => setCreateForm({ ...createForm, inStock: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Giá (> 0)</label>
              <input
                type="number"
                placeholder="Giá (> 0)..."
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Mô tả</label>
              <textarea
                lang="vi"
                placeholder="Mô tả..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="book-list__textarea"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Số trang (> 0)</label>
              <input
                type="number"
                placeholder="Số trang (> 0)..."
                value={createForm.numberOfPage}
                onChange={(e) => setCreateForm({ ...createForm, numberOfPage: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày xuất bản</label>
              <input
                type="date"
                value={createForm.publishedDate}
                onChange={(e) => setCreateForm({ ...createForm, publishedDate: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Cân nặng (> 0)</label>
              <input
                type="number"
                placeholder="Cân nặng (> 0)..."
                value={createForm.weight}
                onChange={(e) => setCreateForm({ ...createForm, weight: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Tác giả</label>
              <select
                value={createForm.authorId}
                onChange={(e) => setCreateForm({ ...createForm, authorId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn tác giả</option>
                {authors.content.map((author) => (
                  <option key={author.authorId} value={author.authorId}>
                    {author.authorName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Nhà xuất bản</label>
              <select
                value={createForm.publisherId}
                onChange={(e) => setCreateForm({ ...createForm, publisherId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn nhà xuất bản</option>
                {publishers.content.map((pub) => (
                  <option key={pub.publisherId} value={pub.publisherId}>
                    {pub.publisherName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Nhà phát hành</label>
              <select
                value={createForm.distributorId}
                onChange={(e) => setCreateForm({ ...createForm, distributorId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn nhà phát hành</option>
                {distributors.content.map((dist) => (
                  <option key={dist.distributorId} value={dist.distributorId}>
                    {dist.distributorName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Loại sách</label>
              <select
                value={createForm.bookTypeId}
                onChange={(e) => setCreateForm({ ...createForm, bookTypeId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn loại sách</option>
                {bookTypes.map((type) => (
                  <option key={type.bookTypeId} value={type.bookTypeId}>
                    {type.bookTypeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Thể loại</label>
              <div className="book-list__selected-categories">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.categoryId === catId);
                  return (
                    category && (
                      <span key={catId} className="book-list__category-tag">
                        {category.categoryName}
                        <span
                          className="book-list__remove-category"
                          onClick={() => handleRemoveCategory(catId)}
                        >
                          ×
                        </span>
                      </span>
                    )
                  );
                })}
              </div>
              <select
                value=""
                onChange={(e) => handleAddCategory(e.target.value)}
                className="book-list__select"
              >
                <option value="">Chọn thể loại</option>
                {categories
                  .filter((cat) => !selectedCategories.includes(cat.categoryId))
                  .map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Hình ảnh</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e)}
                className="book-list__file-input"
              />
            </div>
            <div className="book-list__form-group">
              <div className="book-list__checkbox-group">
                <label className="book-list__label">Mới về</label>
                <input
                  type="checkbox"
                  checked={createForm.newArrival}
                  onChange={(e) => handleNewArrivalChange(e)}
                  className="book-list__checkbox"
                />
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div className="book-list__form-group">
                <label className="book-list__label">Chọn ảnh thumbnail</label>
                <div className="book-list__image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="book-list__image-preview">
                      <img src={preview} alt={`Preview ${index}`} className="book-list__thumbnail" />
                      <input
                        type="checkbox"
                        checked={createForm.thumbnailIdx === index}
                        onChange={() => handleThumbnailSelect(index)}
                        className="book-list__checkbox"
                      />
                      <span>Ảnh thumbnail</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="book-list__form-actions">
              <button className="book-list__modal-button book-list__modal-button--submit" onClick={handleCreate}>Tạo</button>
              <button className="book-list__modal-button book-list__modal-button--cancel" onClick={() => resetCreateForm()}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {editForm && (
        <div className="book-list__modal" onClick={() => {
          setEditForm(null);
          setSelectedCategories([]);
          setImagePreviews([]);
          setOldImages([]);
          setRemovedOldImageIds([]);
        }}>
          <div className="book-list__modal-content book-list__modal-content--create" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={() => {
              setEditForm(null);
              setSelectedCategories([]);
              setImagePreviews([]);
              setOldImages([]);
              setRemovedOldImageIds([]);
            }}>×</span>
            <h3 className="book-list__modal-title">Chỉnh sửa sách</h3>
            <div className="book-list__form-group">
              <label className="book-list__label">Tên sách</label>
              <input
                type="text"
                lang="vi"
                placeholder="Tên sách..."
                value={editForm.bookName}
                onChange={(e) => setEditForm({ ...editForm, bookName: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Số lượng (≥ 0)</label>
              <input
                type="number"
                placeholder="Số lượng (≥ 0)..."
                value={editForm.inStock}
                onChange={(e) => setEditForm({ ...editForm, inStock: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Giá (> 0)</label>
              <input
                type="number"
                placeholder="Giá (> 0)..."
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Mô tả</label>
              <textarea
                lang="vi"
                placeholder="Mô tả..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="book-list__textarea"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Số trang (> 0)</label>
              <input
                type="number"
                placeholder="Số trang (> 0)..."
                value={editForm.numberOfPage}
                onChange={(e) => setEditForm({ ...editForm, numberOfPage: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày xuất bản</label>
              <input
                type="date"
                value={editForm.publishedDate}
                onChange={(e) => setEditForm({ ...editForm, publishedDate: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Cân nặng (> 0)</label>
              <input
                type="number"
                placeholder="Cân nặng (> 0)..."
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Tác giả</label>
              <select
                value={editForm.authorId}
                onChange={(e) => setEditForm({ ...editForm, authorId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn tác giả</option>
                {authors.content.map((author) => (
                  <option key={author.authorId} value={author.authorId}>
                    {author.authorName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Nhà xuất bản</label>
              <select
                value={editForm.publisherId}
                onChange={(e) => setEditForm({ ...editForm, publisherId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn nhà xuất bản</option>
                {publishers.content.map((pub) => (
                  <option key={pub.publisherId} value={pub.publisherId}>
                    {pub.publisherName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Nhà phát hành</label>
              <select
                value={editForm.distributorId}
                onChange={(e) => setEditForm({ ...editForm, distributorId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn nhà phát hành</option>
                {distributors.content.map((dist) => (
                  <option key={dist.distributorId} value={dist.distributorId}>
                    {dist.distributorName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Loại sách</label>
              <select
                value={editForm.bookTypeId}
                onChange={(e) => setEditForm({ ...editForm, bookTypeId: e.target.value })}
                className="book-list__select"
              >
                <option value="">Chọn loại sách</option>
                {bookTypes.map((type) => (
                  <option key={type.bookTypeId} value={type.bookTypeId}>
                    {type.bookTypeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Thể loại</label>
              <div className="book-list__selected-categories">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.categoryId === catId);
                  return (
                    category && (
                      <span key={catId} className="book-list__category-tag">
                        {category.categoryName}
                        <span
                          className="book-list__remove-category"
                          onClick={() => handleRemoveCategory(catId, true)}
                        >
                          ×
                        </span>
                      </span>
                    )
                  );
                })}
              </div>
              <select
                value=""
                onChange={(e) => handleAddCategory(e.target.value, true)}
                className="book-list__select"
              >
                <option value="">Chọn thể loại</option>
                {categories
                  .filter((cat) => !selectedCategories.includes(cat.categoryId))
                  .map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Hình ảnh mới</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e, true)}
                className="book-list__file-input"
              />
            </div>
            <div className="book-list__form-group">
              <div className="book-list__checkbox-group">
                <label className="book-list__label">Mới về</label>
                <input
                  type="checkbox"
                  checked={editForm.newArrival}
                  onChange={(e) => handleNewArrivalChange(e, true)}
                  className="book-list__checkbox"
                />
              </div>
            </div>
            <div className="book-list__form-group">
              <div className="book-list__checkbox-group">
                <label className="book-list__label">Đã xóa</label>
                <input
                  type="checkbox"
                  checked={editForm.isDeleted}
                  onChange={handleIsDeletedChange}
                  className="book-list__checkbox"
                />
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div className="book-list__form-group">
                <label className="book-list__label">Chọn ảnh thumbnail</label>
                <div className="book-list__image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="book-list__image-preview">
                      <img src={preview} alt={`Preview ${index}`} className="book-list__thumbnail" />
                      {index < oldImages.length && (
                        <span
                          className="book-list__remove-image"
                          onClick={() => handleRemoveOldImage(index, oldImages[index].imageId)}
                        >
                          ×
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={editForm.thumbnailIdx === index}
                        onChange={() => handleThumbnailSelect(index, true)}
                        className="book-list__checkbox"
                      />
                      <span>Ảnh thumbnail</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="book-list__form-actions">
              <button className="book-list__modal-button book-list__modal-button--submit" onClick={handleSaveEdit}>Lưu</button>
              <button className="book-list__modal-button book-list__modal-button--cancel" onClick={() => {
                setEditForm(null);
                setSelectedCategories([]);
                setImagePreviews([]);
                setOldImages([]);
                setRemovedOldImageIds([]);
              }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {discountForm && (
        <div className="book-list__modal" onClick={() => setDiscountForm(null)}>
          <div className="book-list__modal-content book-list__modal-content--create" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={() => setDiscountForm(null)}>×</span>
            <h3 className="book-list__modal-title">Quản lý khuyến mãi</h3>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày bắt đầu</label>
              <input
                type="date"
                value={discountForm.startDate}
                onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày kết thúc</label>
              <input
                type="date"
                value={discountForm.endDate}
                onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Loại khuyến mãi</label>
              <select
                value={discountForm.discountType}
                onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                className="book-list__select"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền (VNĐ)</option>
              </select>
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Giá trị khuyến mãi</label>
              <input
                type="number"
                placeholder={discountForm.discountType === 'PERCENTAGE' ? '0 - 99' : '0 - Giá sách'}
                value={discountForm.discount}
                onChange={(e) => setDiscountForm({ ...discountForm, discount: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-actions">
              <button className="book-list__modal-button book-list__modal-button--submit" onClick={handleSaveDiscount}>Lưu</button>
              <button className="book-list__modal-button book-list__modal-button--cancel" onClick={() => setDiscountForm(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;