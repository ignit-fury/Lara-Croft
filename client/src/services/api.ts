import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const customerToken = localStorage.getItem('customer_token');
  const supabaseToken = localStorage.getItem('supabase_token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  } else if (supabaseToken) {
    config.headers.Authorization = `Bearer ${supabaseToken}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url} — token: ${adminToken ? 'admin' : customerToken ? 'customer' : supabaseToken ? 'supabase' : 'NONE'}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
      // Don't clear supabase_token here — let useAuth handle cleanup on next page load.
      // Clearing on first 401 kills all subsequent requests if error was transient.
    }
    return Promise.reject(error);
  }
);

export default api;
