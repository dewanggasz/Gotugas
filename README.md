<p align="center">
  <img src="https://github.com/dewanggasz/Task-management/blob/main/taskwise-client/public/GOTUgas.svg" width="300" alt="GotuGas Logo" />
  <br />
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=semantic-release" alt="Version 1.0.0" />
  <br /><br />
  <img src="https://img.shields.io/badge/frontend-React_19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Badge" />
  <img src="https://img.shields.io/badge/backend-Laravel_12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel Badge" />
</p>


# Taskwise - Sistem Manajemen Tugas Kolaboratif
Taskwise adalah aplikasi full-stack yang dirancang untuk membantu tim mengelola tugas secara efisien. Dengan antarmuka yang modern dan fitur kolaborasi yang lengkap, Taskwise memungkinkan pengguna untuk melacak kemajuan proyek, berdiskusi, dan berbagi file dalam satu platform terpusat.
## ✨ Fitur Utama
- **Manajemen Tugas Lengkap:** Pengguna dapat membuat, membaca, mengedit, dan menghapus (CRUD) tugas mereka sendiri.
- **Kolaborasi Tim Canggih:**
    - Undang banyak pengguna untuk berkolaborasi dalam satu tugas.
    - Atur izin granular (```edit```, ```komentar```, ```lihat```) untuk setiap kolaborator.
- **Diskusi & Riwayat:**
    - Sistem komentar berantai (*threaded comments*) untuk setiap tugas.
    - Log aktivitas otomatis yang melacak semua perubahan penting.
    - Kemampuan untuk menambahkan catatan pembaruan (```Update Note```) saat mengedit tugas.
- **Manajemen Lampiran:**
    - Unggah file dan gambar.
    - Tambahkan lampiran berupa link eksternal.
- **Dasbor Analitik Interaktif(React):**
    - Kartu ringkasan (KPI) dan berbagai grafik (tren, komposisi status, performa tim).
    - Filter dinamis berdasarkan periode (30 hari, 90 hari, tahun ini, dan rentang kustom).
    - Kemampuan pengguna dengan role admin untuk melihat statistik per pengguna.
- **Jurnal & Mood Tracker Harian:**
    - Kalender interaktif untuk navigasi harian dan bulanan.
    - Pengguna dapat mencatat mood harian mereka (senang, sedih, netral, dll.).
    - Membuat banyak catatan per hari dengan judul dan editor teks kaya (rich text editor).
    - Kartu catatan dengan kode warna untuk identifikasi visual yang cepat.
- **Sistem Peran & Izin (Roles & Permissions):**
    - Admin: Memiliki akses penuh ke semua fitur dan dapat mengelola semua pengguna (termasuk Admin lain).
    - Semi-Admin: Dapat mengelola pengguna dengan peran di bawahnya (Karyawan) dan melihat semua tugas.
    - Karyawan (Employee): Hanya dapat mengelola dan melihat tugas yang ditugaskan kepadanya.
- **Personalisasi Pengguna:**
    - Pengguna dapat memperbarui nama, mengubah password, dan mengunggah foto profil mereka sendiri.
- **Notifikasi Email:** Dapatkan notifikasi otomatis untuk penugasan baru dan komentar baru.
## 🚀 Tech Stack
Proyek ini dibangun menggunakan teknologi modern untuk backend dan frontend.
### Backend (Laravel API)
- Framework: Laravel 12
- Bahasa: PHP 8.2+
- Database: MySQL
- Autentikasi API: Laravel Sanctum
- Panel Admin: Filament 3.3
- Tugas Latar Belakang: Laravel Queues
### Frontend (React Client)
- Framework/Library: React
- Build Tool: Vite
- Styling: Tailwind CSS & DaisyUI
- Manajemen State & Cache: TanStack Query (React Query)
- Permintaan API: Axios
- Routing: React Router DOM
- Notifikasi UI: React Hot Toast
## ⚙️ Panduan Instalasi & Menjalankan Proyek
Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah di bawah ini.
### Prasyarat
- PHP >= 8.2
- Composer
- Node.js & NPM
- Server Database (contoh: MySQL)
- Lingkungan server lokal (contoh: XAMPP, Laragon, Laravel Valet/Herd)
### 1. Instalasi
Langkah-langkah ini hanya perlu dilakukan sekali saat pertama kali menyiapkan proyek.
```bash
    # 1. Clone repository ini
    git clone [URL_REPOSITORY_ANDA]
    cd [NAMA_FOLDER_PROYEK]

    # 2. Install dependensi Composer (Backend)
    composer install

    # 3. Install dependensi NPM (Frontend)
    # Masuk ke direktori client terlebih dahulu
    cd taskwise-client
    npm install
    cd .. 
    # Kembali ke direktori utama

    # 4. Salin file environment untuk Backend
    cp .env.example .env

    # 5. Konfigurasi file .env Laravel Anda
    # - Atur koneksi database (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
    # - Atur konfigurasi email, misalnya menggunakan Mailtrap
        MAIL_MAILER=smtp
        MAIL_HOST=sandbox.smtp.mailtrap.io
        MAIL_PORT=2525
        MAIL_USERNAME=...
        MAIL_PASSWORD=...
        MAIL_ENCRYPTION=tls
    # - Pastikan APP_URL dan FRONTEND_URL sudah benar

    # 6. Buat kunci aplikasi Laravel
    php artisan key:generate

    # 7. Jalankan migrasi dan seeder database
    php artisan migrate --seed --class=RealisticUserTaskSeeder

    # 8. Buat symbolic link untuk storage
    php artisan storage:link

    # 9. Buat file environment untuk Frontend
    # Masuk ke direktori client
    cd taskwise-client
    echo "VITE_API_BASE_URL=[http://taskwise-api.test/api](http://taskwise-api.test/api)" > .env
    cd ..
    # Kembali ke direktori utama
```