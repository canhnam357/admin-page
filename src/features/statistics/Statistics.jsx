import React, { useEffect, useState } from 'react';
   import { useDispatch, useSelector } from 'react-redux';
   import { Bar, Pie } from 'react-chartjs-2';
   import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
   import { fetchMonthlyRevenue, fetchNewUsersCount, fetchOrdersByStatus } from './statisticsSlice';
   import { toast } from 'react-toastify';
   import './Statistics.css';

   ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

   const Statistics = () => {
     const dispatch = useDispatch();
     const { monthlyRevenue, newUsersCount, ordersByStatus, loading  } = useSelector((state) => state.statistics);

     const currentYear = new Date().getFullYear();
     const years = Array.from({ length: 6 }, (_, i) => currentYear - i); // 2025, 2024, ..., 2020
     const [selectedYear, setSelectedYear] = useState(currentYear);

     useEffect(() => {
       const fetchData = async () => {
         try {
           await Promise.all([
             dispatch(fetchMonthlyRevenue(selectedYear)).unwrap(),
             dispatch(fetchNewUsersCount(selectedYear)).unwrap(),
             dispatch(fetchOrdersByStatus()).unwrap(),
           ]);
           toast.dismiss();
           toast.success('Lấy dữ liệu thống kê thành công!');
         } catch (err) {
          toast.dismiss();
           toast.error('Lấy dữ liệu thống kê thất bại!');
         }
       };
       fetchData();
     }, [dispatch, selectedYear]);

     const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

     // Bar Chart Data for Monthly Revenue
     const revenueData = {
       labels: months,
       datasets: [
         {
           label: `Doanh thu (${selectedYear})`,
           data: monthlyRevenue ? Object.values(monthlyRevenue) : Array(12).fill(0),
           backgroundColor: 'rgba(75, 192, 192, 0.6)',
           borderColor: 'rgba(75, 192, 192, 1)',
           borderWidth: 1,
         },
       ],
     };

     // Bar Chart Data for New Users Count
     const newUsersData = {
       labels: months,
       datasets: [
         {
           label: `Người dùng mới (${selectedYear})`,
           data: newUsersCount ? Object.values(newUsersCount) : Array(12).fill(0),
           backgroundColor: 'rgba(153, 102, 255, 0.6)',
           borderColor: 'rgba(153, 102, 255, 1)',
           borderWidth: 1,
         },
       ],
     };

     const barOptionsRevenue = {
       responsive: true,
       maintainAspectRatio: false,
       plugins: {
         legend: { position: 'top' },
         title: { display: true },
         tooltip: {
           callbacks: {
             label: (context) => {
               const value = context.raw || 0;
               return `${context.dataset.label}: ${value.toLocaleString()} VNĐ`;
             },
           },
         },
       },
       scales: {
         y: {
           beginAtZero: true,
           title: { display: true, text: 'Doanh thu' },
           ticks: {
             callback: (value) => `${value.toLocaleString()} VNĐ`,
           },
         },
         x: {
           title: { display: true, text: 'Tháng' },
         },
       },
     };

     const barOptionsUsers = {
       responsive: true,
       maintainAspectRatio: false,
       plugins: {
         legend: { position: 'top' },
         title: { display: true },
       },
       scales: {
         y: {
           beginAtZero: true,
           title: { display: true, text: 'Số lượng' },
         },
         x: {
           title: { display: true, text: 'Tháng' },
         },
       },
     };

     // Pie Chart Data for Orders by Status
     const statusLabels = {
       PENDING: 'Chờ duyệt',
       REJECTED: 'Bị từ chối',
       IN_PREPARATION: 'Đang chuẩn bị hàng',
       READY_TO_SHIP: 'Chuẩn bị giao',
       DELIVERING: 'Đang giao',
       DELIVERED: 'Đã giao',
       CANCELLED: 'Đã huỷ',
       FAILED_DELIVERY: 'Giao thất bại',
       RETURNED: 'Đã hoàn hàng',
     };

     const statusColors = {
       PENDING: '#FFC107',
       REJECTED: '#DC3545',
       IN_PREPARATION: '#17A2B8',
       READY_TO_SHIP: '#007BFF',
       DELIVERING: '#FD7E14',
       DELIVERED: '#28A745',
       CANCELLED: '#6C757D',
       FAILED_DELIVERY: '#FF5733',
       RETURNED: '#C71585',
     };

     const orderStatusData = ordersByStatus
       ? Object.keys(ordersByStatus).map((status) => ({
           label: statusLabels[status] || status,
           value: ordersByStatus[status],
           color: statusColors[status] || '#999',
         }))
       : [];

     const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);

     const pieData = {
       labels: orderStatusData.map((item) => item.label),
       datasets: [
         {
           data: orderStatusData.map((item) => item.value),
           backgroundColor: orderStatusData.map((item) => item.color),
           hoverBackgroundColor: orderStatusData.map((item) => item.color),
           hoverOffset: 20,
         },
       ],
     };

     const pieOptions = {
       responsive: true,
       maintainAspectRatio: false,
       plugins: {
         legend: { position: 'right' },
         tooltip: {
           callbacks: {
             label: (context) => {
               const label = context.label || '';
               const value = context.raw || 0;
               return `${label}: ${value}`;
             },
           },
         },
         title: {
           display: true,
           text: `Tổng số đơn hàng: ${totalOrders}`,
         },
       },
     };

     return (
       <div className="statistics">
         <h2 className="statistics__title">Thống kê</h2>

         {/* Selection for Year */}
         <div className="statistics__filter">
           <label className="statistics__label">Chọn năm: </label>
           <select
             value={selectedYear}
             onChange={(e) => setSelectedYear(Number(e.target.value))}
             className="statistics__select"
           >
             {years.map((year) => (
               <option key={year} value={year}>
                 {year}
               </option>
             ))}
           </select>
         </div>

         {/* Monthly Revenue Bar Chart */}
         <div className="statistics__chart-container">
           <h3 className="statistics__chart-title">Doanh thu theo tháng</h3>
           {loading ? (
             <div className="statistics__loading">Đang tải...</div>
           ) : (
             <div className="statistics__chart">
               <Bar data={revenueData} options={{ ...barOptionsRevenue, plugins: { ...barOptionsRevenue.plugins, title: { display: true, text: `Doanh thu năm ${selectedYear}` } } }} />
             </div>
           )}
         </div>

         {/* New Users Bar Chart */}
         <div className="statistics__chart-container">
           <h3 className="statistics__chart-title">Người dùng mới theo tháng</h3>
           {loading ? (
             <div className="statistics__loading">Đang tải...</div>
           ) : (
             <div className="statistics__chart">
               <Bar data={newUsersData} options={{ ...barOptionsUsers, plugins: { ...barOptionsUsers.plugins, title: { display: true, text: `Người dùng mới năm ${selectedYear}` } } }} />
             </div>
           )}
         </div>

         {/* Orders by Status Pie Chart */}
         <div className="statistics__chart-container">
           <h3 className="statistics__chart-title">Đơn hàng theo trạng thái</h3>
           {loading ? (
             <div className="statistics__loading">Đang tải...</div>
           ) : (
             <div className="statistics__chart statistics__chart--pie">
               <Pie data={pieData} options={pieOptions} />
             </div>
           )}
         </div>
       </div>
     );
   };

   export default Statistics;