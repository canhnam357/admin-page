import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchBooks, createBook, updateBook } from './bookSlice';
import { fetchAuthors } from '../authors/authorSlice';
import { fetchPublishers } from '../publishers/publisherSlice';
import { fetchDistributors } from '../distributors/distributorSlice';
import { fetchBookTypes } from '../book-types/bookTypeSlice';
import { fetchCategories } from '../categories/categorySlice';
import api from '../../api/api';
import './BookList.css';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const BookList = () => {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.books);
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
  const size = 10;

  // Debounced search function
  const debouncedFetchBooks = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
      }, 300),
    []
  );

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value); // Update input value immediately for smooth typing
    debouncedFetchBooks(value);
  };

  // Fetch books and other data, reset page to 1 when keyword changes
  useEffect(() => {
    dispatch(fetchBooks({ index: keyword ? 1 : currentPage, size, keyword }));
    if (keyword) setCurrentPage(1); // Reset page only after dispatch
    dispatch(fetchAuthors({ index: 1, size: 100 }));
    dispatch(fetchPublishers({ index: 1, size: 100 }));
    dispatch(fetchDistributors({ index: 1, size: 100 }));
    dispatch(fetchBookTypes());
    dispatch(fetchCategories({ keyword: '' }));
  }, [dispatch, currentPage, keyword, size]);

  useEffect(() => {
    if (error && error !== 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!') {
      toast.dismiss();
      toast.error(`Lấy danh sách sách thất bại: ${error}`);
    }
  }, [error]);

  // Hàm chuyển đổi từ dd-MM-yyyy sang YYYY-MM-DD để hiển thị trong input
  const convertToInputFormat = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  // Hàm chuyển đổi từ YYYY-MM-DD sang dd-MM-yyyy để gửi lên API
  const convertToApiFormat = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  };

  // Hàm chuyển đổi từ HH:mm:ss dd-MM-yyyy sang YYYY-MM-DDThh:mm:ss cho input datetime-local
  const formatToDateTimeLocal = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const dateTimeRegex = /^(\d{2}):(\d{2}):(\d{2}) (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
    if (dateTimeRegex.test(dateTimeStr)) {
      const [, hours, minutes, seconds, day, month, year] = dateTimeStr.match(dateTimeRegex);
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch {
      return '';
    }
  };

  // Hàm chuyển đổi từ YYYY-MM-DDThh:mm:ss sang HH:mm:ss dd-MM-yyyy để gửi API
  const formatToApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  // Hàm hiển thị ngày ở định dạng dd-MM-yyyy
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
    return 'Chưa cập nhật';
  };

  // Hàm hiển thị datetime, trả về object { time, date }
  const formatDisplayDateTime = (dateTimeString) => {
    if (!dateTimeString) return { time: 'Chưa cập nhật', date: '' };
    const dateTimeRegex = /^(\d{2}:\d{2}:\d{2}) (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
    if (dateTimeRegex.test(dateTimeString)) {
      const [, time, day, month, year] = dateTimeString.match(dateTimeRegex);
      return { time, date: `${day}-${month}-${year}` };
    }
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return { time: 'Chưa cập nhật', date: '' };
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return { time: `${hours}:${minutes}:${seconds}`, date: `${day}-${month}-${year}` };
    } catch {
      return { time: 'Chưa cập nhật', date: '' };
    }
  };

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

  const validateBookForm = (form, isEdit = false) => {
    const {
      bookName,
      inStock,
      price,
      numberOfPage,
      weight,
      authorId,
      publisherId,
      distributorId,
      bookTypeId,
      publishedDate,
    } = form;

    if (!bookName.trim()) {
      toast.dismiss();
      toast.error('Tên sách không được rỗng');
      return false;
    }
    if (bookName.trim().length < 2) {
      toast.dismiss();
      toast.error('Tên sách phải có ít nhất 2 ký tự');
      return false;
    }
    if (!isEdit && inStock === '') {
      toast.dismiss();
      toast.error('Số lượng không được rỗng');
      return false;
    }
    if (parseInt(inStock) < 0) {
      toast.dismiss();
      toast.error('Số lượng phải lớn hơn hoặc bằng 0');
      return false;
    }
    if (!isEdit && price === '') {
      toast.dismiss();
      toast.error('Giá không được rỗng');
      return false;
    }
    if (parseFloat(price) <= 0) {
      toast.dismiss();
      toast.error('Giá phải lớn hơn 0');
      return false;
    }
    if (!isEdit && numberOfPage === '') {
      toast.dismiss();
      toast.error('Số trang không được rỗng');
      return false;
    }
    if (parseInt(numberOfPage) <= 0) {
      toast.dismiss();
      toast.error('Số trang phải lớn hơn 0');
      return false;
    }
    if (!isEdit && weight === '') {
      toast.dismiss();
      toast.error('Cân nặng không được rỗng');
      return false;
    }
    if (parseFloat(weight) <= 0) {
      toast.dismiss();
      toast.error('Cân nặng phải lớn hơn 0');
      return false;
    }
    if (!authorId) {
      toast.dismiss();
      toast.error('Vui lòng chọn tác giả');
      return false;
    }
    if (!publisherId) {
      toast.dismiss();
      toast.error('Vui lòng chọn nhà xuất bản');
      return false;
    }
    if (!distributorId) {
      toast.dismiss();
      toast.error('Vui lòng chọn nhà phát hành');
      return false;
    }
    if (!bookTypeId) {
      toast.dismiss();
      toast.error('Vui lòng chọn loại sách');
      return false;
    }
    if (!publishedDate) {
      toast.dismiss();
      toast.error('Ngày xuất bản không được rỗng');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateBookForm(createForm)) return;

    try {
      const formData = new FormData();
      formData.append('bookName', createForm.bookName);
      formData.append('inStock', createForm.inStock);
      formData.append('price', createForm.price);
      formData.append('description', createForm.description);
      formData.append('numberOfPage', createForm.numberOfPage);
      const formattedDate = convertToApiFormat(createForm.publishedDate);
      if (!formattedDate) {
        toast.dismiss();
        toast.error('Ngày xuất bản không hợp lệ');
        return;
      }
      formData.append('publishedDate', formattedDate);
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
      toast.dismiss();
      toast.success('Tạo sách thành công!');
      dispatch(fetchBooks({ index: currentPage, size, keyword }));
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
    } catch (err) {
      console.log('createBook error:', err);
      toast.dismiss();
      toast.error(`Tạo sách thất bại: ${err.message || err}`);
    }
  };

  const handleEdit = (book) => {
    // Tìm chỉ số thumbnail dựa trên dữ liệu từ backend
    let thumbnailIdx = 0; // Mặc định là 0 nếu không tìm thấy
    if (book.images && book.images.length > 0) {
      const thumbnailImage = book.images.find((img) => img.isThumbnail) || 
                            book.images.find((img) => img.url === book.urlThumbnail);
      thumbnailIdx = thumbnailImage ? book.images.indexOf(thumbnailImage) : 0;
    }

    setEditForm({
      bookId: book.bookId,
      bookName: book.bookName,
      inStock: book.inStock,
      price: book.price,
      description: book.description || '',
      numberOfPage: book.numberOfPage,
      publishedDate: convertToInputFormat(book.publishedDate),
      weight: book.weight,
      authorId: book.author.authorId,
      publisherId: book.publisher.publisherId,
      distributorId: book.distributor.distributorId,
      bookTypeId: book.bookType.bookTypeId,
      thumbnailIdx: thumbnailIdx, // Sử dụng chỉ số thumbnail thực tế
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
    if (!validateBookForm(editForm, true)) return;

    try {
      const formData = new FormData();
      formData.append('bookName', editForm.bookName);
      formData.append('inStock', editForm.inStock);
      formData.append('price', editForm.price);
      formData.append('description', editForm.description);
      formData.append('numberOfPage', editForm.numberOfPage);
      const formattedDate = convertToApiFormat(editForm.publishedDate);
      if (!formattedDate) {
        toast.dismiss();
        toast.error('Ngày xuất bản không hợp lệ');
        return;
      }
      formData.append('publishedDate', formattedDate);
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
      toast.dismiss();
      toast.success('Cập nhật sách thành công!');
      dispatch(fetchBooks({ index: currentPage, size, keyword }));
      setEditForm(null);
      setSelectedCategories([]);
      setImagePreviews([]);
      setOldImages([]);
      setRemovedOldImageIds([]);
    } catch (err) {
      console.log('updateBook error:', err);
      toast.dismiss();
      toast.error(`Cập nhật sách thất bại: ${err.message || err}`);
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
        const startDate = formatToDateTimeLocal(discount.startDate);
        const endDate = formatToDateTimeLocal(discount.endDate);
        setDiscountForm({
          ...discount,
          startDate,
          endDate,
          isActive: discount.isActive,
        });
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const defaultDateTime = `${year}-${month}-${day}T00:00:00`;
        setDiscountForm({
          bookId,
          startDate: defaultDateTime,
          endDate: defaultDateTime,
          discountType: 'PERCENTAGE',
          discount: '',
          isActive: true,
        });
      }
    } catch (err) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const defaultDateTime = `${year}-${month}-${day}T00:00:00`;
      setDiscountForm({
        bookId,
        startDate: defaultDateTime,
        endDate: defaultDateTime,
        discountType: 'PERCENTAGE',
        discount: '',
        isActive: true,
      });
    }
  };

  const handleSaveDiscount = async () => {
    try {
      const { bookId, discountId, startDate, endDate, discountType, discount, isActive } = discountForm;
      if (!discount) {
        toast.dismiss();
        toast.error('Giá trị khuyến mãi không được rỗng');
        return;
      }
      if (discountType === 'PERCENTAGE' && (parseFloat(discount) <= 0 || parseFloat(discount) >= 100)) {
        toast.dismiss();
        toast.error('Giá trị khuyến mãi phần trăm phải từ 0 đến 99');
        return;
      }
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      if (startDateTime > endDateTime) {
        toast.dismiss();
        toast.error('Ngày bắt đầu phải trước ngày kết thúc');
        return;
      }

      const formattedStartDate = formatToApiDateTime(startDate);
      const formattedEndDate = formatToApiDateTime(endDate);
      if (!formattedStartDate || !formattedEndDate) {
        toast.dismiss();
        toast.error('Ngày giờ không hợp lệ');
        return;
      }

      const payload = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        discountType,
        discount: parseFloat(discount),
        isActive,
      };

      if (discountId) {
        await api.put(`/admin/discounts/${discountId}`, payload);
      } else {
        await api.post('/admin/discounts', { ...payload, bookId });
      }
      toast.dismiss();
      toast.success('Cập nhật khuyến mãi thành công!');
      setDiscountForm(null);
      dispatch(fetchBooks({ index: currentPage, size, keyword }));
    } catch (err) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || 'Cập nhật khuyến mãi thất bại');
    }
  };

  const renderSkeleton = () => {
    return Array.from({ length: size }).map((_, index) => (
      <tr key={index} className="book-list__table-row--loading">
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
        <td><div className="book-list__skeleton book-list__skeleton--text"></div></td>
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

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    const totalPages = books.totalPages || 1;

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
    <div className="book-list">
      <h2 className="book-list__title">Danh sách sách</h2>
      <div className="book-list__actions">
        <div className="book-list__create-form">
          <button onClick={() => setCreateForm({ ...createForm, showModal: true })}>Thêm sách</button>
        </div>
        <div className="book-list__search-bar">
          <input
            type="text"
            lang="vi"
            placeholder="Tìm kiếm sách..."
            value={keyword}
            onChange={handleSearch}
            className="book-list__search-input"
          />
        </div>
      </div>
      <table className="book-list__table">
        <thead>
          <tr>
            <th>Tên sách</th>
            <th>Tồn kho</th>
            <th>Giá</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Trạng thái</th>
            <th>Mới về</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <tr><td colSpan="8" className="book-list__empty">Lỗi: {error}</td></tr>
          ) : books.content && books.content.length > 0 ? (
            books.content.map((book) => {
              const createdAt = formatDisplayDateTime(book.createdAt);
              const updatedAt = formatDisplayDateTime(book.updatedAt || '');
              return (
                <tr key={book.bookId} className="book-list__table-row">
                  <td>{truncateBookName(book.bookName)}</td>
                  <td>{book.inStock}</td>
                  <td>{book.price.toLocaleString()} VNĐ</td>
                  <td>
                    <div className="book-list__datetime">
                      <span>{createdAt.time}</span>
                      <span>{createdAt.date}</span>
                    </div>
                  </td>
                  <td>
                    <div className="book-list__datetime">
                      <span>{updatedAt.time}</span>
                      <span>{updatedAt.date}</span>
                    </div>
                  </td>
                  <td className={book.isDeleted ? 'book-list__status--stopped' : 'book-list__status--selling'}>
                    {book.isDeleted ? 'Ngừng bán' : 'Đang bán'}
                  </td>
                  <td>
                    {book.newArrival ? 'Hàng mới' : '—'}
                  </td>
                  <td>
                    <button className="book-list__action-button book-list__action-button--edit" onClick={() => handleEdit(book)}>Sửa</button>
                    <button className="book-list__action-button book-list__action-button--view" onClick={() => handleView(book)}>Xem</button>
                    <button className="book-list__action-button book-list__action-button--discount" onClick={() => fetchDiscount(book.bookId)}>Khuyến mãi</button>
                  </td>
                </tr>
              );
            })
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
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="book-list__pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`book-list__pagination-button ${currentPage === page ? 'book-list__pagination-button--active' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={loading}
            >
              {page}
            </button>
          )
        )}
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
                  src={viewBook.urlThumbnail || 'https://via.placeholder.com/150'}
                  alt="Thumbnail"
                  className="book-list__thumbnail"
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
                      />
                    ))
                  ) : (
                    <p>Không có hình ảnh</p>
                  )}
                </div>
              </div>
              <div className="book-list__detail-item"><strong>Tên sách:</strong> {viewBook.bookName}</div>
              <div className="book-list__detail-item"><strong>Số lượng:</strong> {viewBook.inStock}</div>
              <div className="book-list__detail-item"><strong>Đã bán:</strong> {viewBook.soldQuantity}</div>
              <div className="book-list__detail-item"><strong>Giá:</strong> {viewBook.price.toLocaleString()} VNĐ</div>
              <div className="book-list__detail-item"><strong>Mô tả:</strong> <p>{viewBook.description || 'Không có mô tả'}</p></div>
              <div className="book-list__detail-item"><strong>Số trang:</strong> {viewBook.numberOfPage}</div>
              <div className="book-list__detail-item"><strong>Ngày xuất bản:</strong> {formatDisplayDate(viewBook.publishedDate)}</div>
              <div className="book-list__detail-item"><strong>Cân nặng:</strong> {viewBook.weight} g</div>
              <div className="book-list__detail-item"><strong>Ngày tạo:</strong> {formatDisplayDateTime(viewBook.createdAt).time} {formatDisplayDateTime(viewBook.createdAt).date}</div>
              <div className="book-list__detail-item"><strong>Ngày cập nhật:</strong> {viewBook.updatedAt ? `${formatDisplayDateTime(viewBook.updatedAt).time} ${formatDisplayDateTime(viewBook.updatedAt).date}` : 'Chưa cập nhật'}</div>
              <div className="book-list__detail-item"><strong>Tác giả:</strong> {viewBook.author.authorName}</div>
              <div className="book-list__detail-item"><strong>Nhà xuất bản:</strong> {viewBook.publisher.publisherName}</div>
              <div className="book-list__detail-item"><strong>Nhà phát hành:</strong> {viewBook.distributor.distributorName}</div>
              <div className="book-list__detail-item">
                <strong>Thể loại:</strong>{' '}
                {viewBook.categories && viewBook.categories.length > 0
                  ? viewBook.categories.map((cat) => cat.categoryName).join(', ')
                  : 'Không có thể loại'}
              </div>
              <div className="book-list__detail-item"><strong>Loại sách:</strong> {viewBook.bookType.bookTypeName}</div>
              <div className="book-list__detail-item"><strong>Mới về:</strong> {viewBook.newArrival ? 'Hàng mới' : '—'}</div>
              <div className="book-list__detail-item"><strong>Trạng thái:</strong> {viewBook.isDeleted ? 'Ngừng bán' : 'Đang bán'}</div>
            </div>
          </div>
        </div>
      )}
      {createForm.showModal && (
        <div className="book-list__modal" onClick={resetCreateForm}>
          <div className="book-list__modal-content book-list__modal-content--create" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={resetCreateForm}>×</span>
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
                placeholder="Số lượng..."
                value={createForm.inStock}
                onChange={(e) => setCreateForm({ ...createForm, inStock: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Giá (> 0)</label>
              <input
                type="number"
                placeholder="Giá (VNĐ)..."
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
                placeholder="Số trang..."
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
                placeholder="Cân nặng (g)..."
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
                {authors.content?.map((author) => (
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
                {publishers.content?.map((pub) => (
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
                {distributors.content?.map((dist) => (
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
              <button className="book-list__modal-button" onClick={handleCreate}>Tạo</button>
              <button className="book-list__modal-button book-list__modal-button--cancel" onClick={resetCreateForm}>Hủy</button>
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
                placeholder="Số lượng..."
                value={editForm.inStock}
                onChange={(e) => setEditForm({ ...editForm, inStock: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Giá (> 0)</label>
              <input
                type="number"
                placeholder="Giá (VNĐ)..."
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
                placeholder="Số trang..."
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
                placeholder="Cân nặng (g)..."
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
                {authors.content?.map((author) => (
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
                {publishers.content?.map((pub) => (
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
                {distributors.content?.map((dist) => (
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
                <label className="book-list__label">Ngừng bán </label>
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
              <button className="book-list__modal-button" onClick={handleSaveEdit}>Lưu</button>
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
          <div className="book-list__modal-content book-list__modal-content--discount" onClick={(e) => e.stopPropagation()}>
            <span className="book-list__modal-close" onClick={() => setDiscountForm(null)}>×</span>
            <h3 className="book-list__modal-title">Quản lý khuyến mãi</h3>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={discountForm.startDate}
                onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                className="book-list__input"
              />
            </div>
            <div className="book-list__form-group">
              <label className="book-list__label">Ngày kết thúc</label>
              <input
                type="datetime-local"
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
            <div className="book-list__form-group">
              <div className="book-list__checkbox-group">
                <label className="book-list__label">Kích hoạt</label>
                <input
                  type="checkbox"
                  checked={discountForm.isActive}
                  onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                  className="book-list__checkbox"
                />
              </div>
            </div>
            <div className="book-list__form-actions">
              <button className="book-list__modal-button" onClick={handleSaveDiscount}>Lưu</button>
              <button className="book-list__modal-button book-list__modal-button--cancel" onClick={() => setDiscountForm(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;