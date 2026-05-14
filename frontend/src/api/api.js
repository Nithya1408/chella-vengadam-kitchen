import axios from 'axios';

// Base URL for our Express backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== MENU ====================

export const fetchMenu = async () => {
  const res = await API.get('/menu');
  return res.data;
};

export const fetchCategories = async () => {
  const res = await API.get('/menu/categories');
  return res.data;
};

export const fetchMenuByCategory = async (categoryId) => {
  const res = await API.get(`/menu/category/${categoryId}`);
  return res.data;
};
// ==================== ORDERS ====================

export const createOrder = async (orderData) => {
  const res = await API.post('/orders', orderData);
  return res.data;
};
// ==================== RESERVATIONS ====================

export const fetchTables = async () => {
  const res = await API.get('/reservations/tables');
  return res.data;
};

export const checkAvailability = async (date, time) => {
  const res = await API.get(`/reservations/availability?date=${date}&time=${time}`);
  return res.data;
};

export const createReservation = async (data) => {
  const res = await API.post('/reservations', data);
  return res.data;
};

export const fetchReservationById = async (id) => {
  const res = await API.get(`/reservations/${id}`);
  return res.data;
};
export const fetchOrderById = async (orderId) => {
  const res = await API.get(`/orders/${orderId}`);
  return res.data;
};

export default API;