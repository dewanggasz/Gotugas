# Taskwise - Sistem Manajemen Tugas Kolaboratif
Taskwise adalah aplikasi full-stack yang dirancang untuk membantu tim mengelola tugas secara efisien. Dengan antarmuka yang modern dan fitur kolaborasi yang lengkap, Taskwise memungkinkan pengguna untuk melacak kemajuan proyek, berdiskusi, dan berbagi file dalam satu platform terpusat.
## Fitur Utama
- Manajemen Tugas (CRUD): Buat, perbarui, lihat, dan hapus tugas dengan mudah.
- Atribut Tugas Lengkap: Setiap tugas memiliki status, prioritas, dan tanggal jatuh tempo.
- Kolaborasi Tim: Tambahkan beberapa anggota tim sebagai kolaborator dalam satu tugas.
- Sistem Komentar: Berdiskusi langsung di setiap tugas dengan dukungan threaded comments.
- Lampiran File: Unggah dan bagikan file penting yang terkait dengan tugas.
- Dasbor Statistik: Visualisasikan produktivitas dengan ringkasan jumlah tugas yang selesai, sedang berjalan, dll.
- Panel Admin: Panel admin yang kuat (dibangun dengan Filament) untuk mengelola pengguna dan semua tugas di sistem.
- Notifikasi Email: Dapatkan notifikasi otomatis untuk penugasan baru dan komentar baru.
- Riwayat Aktivitas: Lacak semua perubahan yang terjadi pada sebuah tugas untuk transparansi penuh.
## Tech Stack
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
## Panduan Instalasi & Menjalankan Proyek
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

### 2. Akses Panel Admin
Untuk mengakses panel admin yang dibuat dengan Filament:
    - URL: ```http://localhost:8000/admin``` (atau ```http://taskwise-api.test/admin```)
    - Email: ```admin@example.com```
    - Password: ```password```
(Kredensial ini dibuat oleh seeder RealisticUserTaskSeeder.php).
