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

// Fungsi untuk mendapatkan semua data statistik
export const getStatistics = (params) => apiClient.get('/v1/statistics', { params });

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
export const postTaskUpdate = (taskId, data) => apiClient.post(`/v1/tasks/${taskId}/updates`, data);

// Fungsi untuk mengunggah foto profil
export const uploadProfilePhoto = (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    return apiClient.post('/v1/user/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Fungsi untuk mengupdate info profil
export const updateProfileInfo = (profileData) => apiClient.put('/v1/user/profile', profileData);

// Fungsi untuk mengupdate password
export const updatePassword = (passwordData) => apiClient.put('/v1/user/password', passwordData);

// --- FUNGSI LAMPIRAN ---

// Fungsi untuk mengunggah file atau gambar
export const uploadAttachment = (taskId, file) => {
    const formData = new FormData();
    formData.append('attachment_type', file.type.startsWith('image/') ? 'image' : 'file');
    formData.append('file', file);
    return apiClient.post(`/v1/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Fungsi untuk menambahkan lampiran link
export const addLinkAttachment = (taskId, url) => {
    return apiClient.post(`/v1/tasks/${taskId}/attachments`, {
        attachment_type: 'link',
        url: url,
    });
};

// Fungsi untuk menghapus lampiran
export const deleteAttachment = (attachmentId) => {
    return apiClient.delete(`/v1/attachments/${attachmentId}`);
};
