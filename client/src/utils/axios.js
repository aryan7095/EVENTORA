import axios from 'axios';

// Pre-configured axios instance pointing to the backend API's base URL,
// so individual requests only need to specify the relative path (e.g. api.get('/events'))
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor: runs before every outgoing request via this instance.
// Attaches the stored auth token (if present) as a Bearer token, so authenticated
// requests don't need to manually set the Authorization header each time.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
