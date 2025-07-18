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
export const getStatistics = (params) => apiClient.get('/v1/statistics', { params });
export const getTasks = (params) => apiClient.get('/v1/tasks', { params });

// --- FUNGSI BARU DI SINI ---
// Fungsi untuk mengambil satu tugas spesifik berdasarkan ID
export const getTask = (id) => apiClient.get(`/v1/tasks/${id}`);

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
export const updateProfileInfo = (profileData) => apiClient.put('/v1/user/profile', profileData);
export const updatePassword = (passwordData) => apiClient.put('/v1/user/password', passwordData);
export const uploadAttachment = (taskId, file) => {
    const formData = new FormData();
    formData.append('attachment_type', file.type.startsWith('image/') ? 'image' : 'file');
    formData.append('file', file);
    return apiClient.post(`/v1/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const addLinkAttachment = (taskId, url) => {
    return apiClient.post(`/v1/tasks/${taskId}/attachments`, {
        attachment_type: 'link',
        url: url,
    });
};
export const deleteAttachment = (attachmentId) => {
    return apiClient.delete(`/v1/attachments/${attachmentId}`);
};
export const getTaskComments = (taskId) => {
    return apiClient.get(`/v1/tasks/${taskId}/comments`);
};
export const postTaskComment = (taskId, commentData) => {
    return apiClient.post(`/v1/tasks/${taskId}/comments`, commentData);
};

export const createUser = (userData) => apiClient.post('/v1/users', userData);
export const updateUser = (id, userData) => apiClient.put(`/v1/users/${id}`, userData);
export const deleteUser = (id) => apiClient.delete(`/v1/users/${id}`);
