import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Interceptor untuk menambahkan token otorisasi ke setiap request
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Fungsi yang sudah ada ---
export const login = (credentials) => apiClient.post('/login', credentials);
export const getUser = () => apiClient.get('/v1/user');
export const getUsers = () => apiClient.get('/v1/users');
export const getSummary = () => apiClient.get('/v1/tasks/summary');
export const getTasks = (params) => apiClient.get('/v1/tasks', { params });
export const getTaskActivities = (taskId) => apiClient.get(`/v1/tasks/${taskId}/activities`);
export const createTask = (taskData) => apiClient.post('/v1/tasks', taskData);
export const updateTask = (id, taskData) => apiClient.put(`/v1/tasks/${id}`, taskData);
export const deleteTask = (id) => apiClient.delete(`/v1/tasks/${id}`);
export const postTaskUpdate = (taskId, data) => apiClient.post(`/v1/tasks/${taskId}/updates`, data);
export const uploadProfilePhoto = (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    return apiClient.post('/v1/user/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// --- FUNGSI BARU UNTUK UPDATE PROFIL & PASSWORD ---
export const updateProfileInfo = (profileData) => {
    return apiClient.put('/v1/user/profile', profileData);
};
export const updatePassword = (passwordData) => {
    return apiClient.put('/v1/user/password', passwordData);
};
