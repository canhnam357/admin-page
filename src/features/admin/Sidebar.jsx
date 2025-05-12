import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="admin-sidebar">
      <ul className="admin-sidebar__list">
        <li className="admin-sidebar__item">
          <NavLink to="/statistics" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')} end>
            Thống kê
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý người dùng
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/books" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')} end>
            Quản lý sách
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/authors" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý tác giả
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/publishers" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý nhà xuất bản
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/distributors" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý nhà phân phối
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý danh mục
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/book-types" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý loại sách
          </NavLink>
        </li>
        <li className="admin-sidebar__item">
          <NavLink to="/order-status" className={({ isActive }) => (isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link')}>
            Quản lý trạng thái đơn hàng
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;