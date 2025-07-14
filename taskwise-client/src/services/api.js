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
export const login = (credentials) => apiClient.post('/login', credentials);

// Fungsi untuk mendapatkan data user yang sedang login
export const getUser = () => apiClient.get('/v1/user');

// Fungsi untuk mendapatkan daftar semua pengguna
export const getUsers = () => apiClient.get('/v1/users');

// Fungsi untuk mendapatkan data ringkasan/statistik
export const getSummary = () => apiClient.get('/v1/tasks/summary');

// Fungsi untuk mendapatkan semua tugas (dengan filter)
export const getTasks = (params) => apiClient.get('/v1/tasks', { params });

// Fungsi untuk mendapatkan riwayat aktivitas sebuah tugas
export const getTaskActivities = (taskId) => apiClient.get(`/v1/tasks/${taskId}/activities`);

// Fungsi untuk membuat tugas baru
export const createTask = (taskData) => apiClient.post('/v1/tasks', taskData);

// Fungsi untuk mengupdate tugas
export const updateTask = (id, taskData) => apiClient.put(`/v1/tasks/${id}`, taskData);

// Fungsi untuk menghapus tugas
export const deleteTask = (id) => apiClient.delete(`/v1/tasks/${id}`);

// Fungsi untuk mengirim pembaruan/komentar ke sebuah tugas
export const postTaskUpdate = (taskId, data) => {
    return apiClient.post(`/v1/tasks/${taskId}/updates`, data);
};
