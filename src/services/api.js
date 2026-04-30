import axios from 'axios';

const api = axios.create({
   baseURL: 'https://calibraai-api.onrender.com/api/v1', //
});

// Intercepta todas as requisições e adiciona o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;