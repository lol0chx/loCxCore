import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getAllOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrdersByCustomer: (customerName) => api.get(`/orders/customer/${customerName}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, status),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export const menuAPI = {
  getPizzaSizes: () => api.get('/menu/pizza-sizes'),
  getCrustTypes: () => api.get('/menu/crust-types'),
  getCheeseTypes: () => api.get('/menu/cheese-types'),
  getSauceTypes: () => api.get('/menu/sauce-types'),
  getDrinkSizes: () => api.get('/menu/drink-sizes'),
};

export default api;
