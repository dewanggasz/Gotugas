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

// Fungsi untuk login
export const login = (credentials) => {
    return apiClient.post('/login', credentials);
};

// Fungsi untuk mendapatkan data user
export const getUser = () => {
    return apiClient.get('/v1/user');
};

// Fungsi untuk mendapatkan semua tugas (dengan filter)
export const getTasks = (params) => {
    return apiClient.get('/v1/tasks', { params });
};

// Fungsi untuk membuat tugas baru
export const createTask = (taskData) => {
    return apiClient.post('/v1/tasks', taskData);
};

// Fungsi untuk mengupdate tugas
export const updateTask = (id, taskData) => {
    return apiClient.put(`/v1/tasks/${id}`, taskData);
};

// Fungsi untuk menghapus tugas
export const deleteTask = (id) => {
    return apiClient.delete(`/v1/tasks/${id}`);
};
