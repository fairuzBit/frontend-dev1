# KonekDin — Project Documentation

## Overview

**KonekDin** adalah platform Sistem Informasi Manajemen Reservasi Tutor belajar di lingkup kampus Universitas Dian Nuswantoro. Sistem ini menghubungkan mahasiswa yang butuh bimbingan belajar (Learner) dengan mahasiswa berkeahlian lebih (Tutor).

Proyek ini dibangun menggunakan arsitektur monolitik modern dengan **Laravel 13** sebagai backend dan **React + Inertia.js** sebagai frontend.

| Komponen | Teknologi | Tujuan |
|-----------|------|---------|
| `Backend` | Laravel 13, PHP 8.3+ | Menangani logika bisnis, API, dan manajemen database (MySQL). |
| `Frontend` | React, Vite, React Router, Tailwind | Antarmuka pengguna SPA (Single Page Application) terpisah untuk Admin, Tutor, dan Learner. |
| `Auth & Security` | JWT-Auth, Spatie Permission | Autentikasi stateless dan Role-Based Access Control (RBAC). |
| `Dokumentasi` | Dedoc Scramble | Auto-generate dokumentasi API Swagger/OpenAPI. |

---

## Architecture

```
[Web UI - React SPA (KonekDin-Frontend)]
        ↕ REST API Calls (Axios)
[Server - Laravel 13]
    ↕ MySQL Database (Users, Bookings, Slots, Reviews, Notifications)
    ↕ JWT Authentication (Stateless Token)
```

### Communication Flow

1. **User (Learner/Tutor) → System**: Melakukan login via endpoint autentikasi, mendapatkan token JWT.
2. **Learner → System**: Mencari tutor berdasarkan mata kuliah, melihat ketersediaan jadwal, dan melakukan booking slot.
3. **Tutor → System**: Mengatur ketersediaan jadwal (Availability Map), menerima/menolak booking, dan memperbarui status kelas.
4. **Admin → System**: Memverifikasi pendaftaran tutor baru (cek transkrip/Siadin), mengelola role/permission.
5. **System → User**: Mengirim notifikasi real-time terkait status booking, pembayaran, dan pengingat sesi.

---

## Component: Backend (Laravel)

### Struktur Folder Utama

```
app/
├── Http/
│   ├── Controllers/    # Controller API untuk Learner, Tutor, dan Admin
│   ├── Requests/       # FormRequests untuk validasi input
│   ├── Resources/      # API Resources untuk formatting response
│   └── Middleware/     # Middleware untuk JWT dan Spatie Roles
├── Models/             # Model Eloquent (User, Booking, MasterSlot, dll)
├── Services/           # Logika bisnis (Service Pattern untuk modularitas)
└── Providers/          # Service providers sistem
database/
├── migrations/         # Skema database (Users, Tutors, Bookings, dll)
└── seeders/            # Seeder data awal (MasterSlotSeeder, RoleSeeder)
routes/
└── api.php             # Rute endpoint API (Stateless)
```

### Key Technologies

- **Laravel 13** — Framework PHP
- **Tymon JWT Auth** — Autentikasi berbasis token stateless
- **Spatie Laravel-Permission** — Manajemen Role (Admin, Tutor, Learner) dan Permission
- **Dedoc Scramble** — Generator dokumentasi API otomatis tanpa anotasi manual

---

## Database Schema & Form Fields Reference

Daftar tabel beserta kolom dan relasinya. Ini akan menjadi acuan utama saat men-generate Form Input, Table List, atau Card UI di frontend.

### 1. Tabel Master & Autentikasi
*   **users**: Menyimpan seluruh data akun (Learner, Tutor, Admin).
    *   **Field/Kolom**: `id`, `name` (string), `email` (string, unique), `nim` (string, unique, nullable), `password` (string), `phone` (string, nullable), `avatar` (string, nullable).
    *   **Kegunaan UI**: Form Register (name, email, password), Form Edit Profile (name, phone, nim, avatar).
*   **courses**: Data mata kuliah yang tersedia untuk diajarkan.
    *   **Field/Kolom**: `id`, `name` (string), `code` (string, unique).
    *   **Kegunaan UI**: Dropdown pilihan mata kuliah, Table Admin Master Data.
*   **master_slots**: Waktu baku bimbingan (misal: 08:00-10:00).
    *   **Field/Kolom**: `id`, `code` (string, unique), `start_time` (time), `end_time` (time).
    *   **Kegunaan UI**: Opsi jam bagi Tutor saat menyusun jadwal, Table Admin Master Data.

### 2. Tabel Domain Tutor
*   **tutors**: Profil khusus tutor (1 User memiliki 1 Profil Tutor).
    *   **Field/Kolom**: `id`, `user_id` (FK -> users.id), `ipk` (decimal), `bio` (text), `skills` (json), `rating_avg` (float), `total_reviews` (integer), `is_active` (boolean), `price` (decimal).
    *   **Kegunaan UI**: Halaman Profile Tutor, Edit Bio Tutor, Card Daftar Tutor.
*   **tutor_courses**: Relasi mata kuliah apa saja yang bisa diajarkan oleh tutor tertentu.
    *   **Field/Kolom**: `id`, `tutor_id` (FK -> tutors.id), `course_id` (FK -> courses.id), `grade` (string).
    *   **Kegunaan UI**: Menampilkan tag/badge mata kuliah di Card Tutor.
*   **tutor_application**: Pengajuan Learner menjadi Tutor.
    *   **Field/Kolom**: `id`, `user_id` (FK -> users.id), `course_id` (FK -> courses.id), `grade` (string), `transcript_file` (string, path file), `status` (enum: pending, approved, rejected), `admin_note` (text).
    *   **Kegunaan UI**: Form Upload Transkrip, Tabel Admin Verifikasi Tutor.
*   **availability_slots**: Pemetaan hari dan jam kapan tutor bersedia mengajar.
    *   **Field/Kolom**: `id`, `tutor_id` (FK -> tutors.id), `day_of_week` (string: Monday, Tuesday, dll), `slot_id` (FK -> master_slots.id), `is_active` (boolean).
    *   **Kegunaan UI**: Kalender ketersediaan, checkbox slot jam di sisi Tutor, dan radio button jam di Modal Booking Learner.

### 3. Tabel Transaksi & Interaksi
*   **bookings**: Tabel transaksi pemesanan jadwal bimbingan.
    *   **Field/Kolom**: `id`, `tutor_id` (FK), `course_id` (FK), `learner_id` (FK), `booking_date` (date), `total_price` (decimal), `service_fee` (decimal), `grand_total` (decimal), `status` (enum: pending, accepted, rejected, completed, cancelled), `payment_status` (enum: unpaid, paid, refunded), `payment_method` (string), `payment_code` (string), `payment_expired_at` (timestamp).
    *   **Kegunaan UI**: Halaman Detail Pesanan, Card Riwayat, Notifikasi, Timer Countdown Pembayaran.
*   **reviews**: Penilaian setelah sesi bimbingan (`booking`) selesai.
    *   **Field/Kolom**: `id`, `booking_id` (FK -> bookings.id), `rating` (tinyInteger, 1-5), `comment` (text).
    *   **Kegunaan UI**: Form Ulasan Bintang, Daftar Ulasan di Halaman Profil Tutor.
*   **notifications**: Sistem notifikasi di dalam aplikasi.
    *   **Field/Kolom**: Menyimpan detail pesan pengingat jadwal, status pembayaran, atau update aksi (disesuaikan via polymorphic atau field terpisah).

---

## Component: Frontend (React SPA)

### Struktur KonekDin-Frontend

```
src/
├── components/     # Komponen UI Reusable (Shadcn/UI, Tailwind)
├── layouts/        # Layout spesifik (LearnerLayout, TutorLayout, AdminLayout)
├── pages/          # Halaman React per Role (Admin/, Tutor/, Learner/, Auth/)
├── lib/            # Fungsi utility & konfigurasi (Axios interceptor)
└── index.css       # Konfigurasi Tailwind CSS
```

### Fitur Utama UI

1. **Dashboard Berbasis Role**: Antarmuka berbeda untuk Admin, Tutor, dan Learner.
2. **Sistem Notifikasi Kaya**: Menampilkan notifikasi dengan aksi langsung (contoh: "Lihat Jadwal Belajar").
3. **Kalender Ketersediaan**: UI interaktif bagi Tutor untuk mengatur jadwal luang dan bagi Learner untuk memilih slot booking.

---

## Business Flow & API Mapping

Bagian ini memetakan alur bisnis aplikasi dengan endpoint API terkait, sangat berguna sebagai referensi untuk membangun komponen Frontend (React) sesuai dengan role (User Journey).

### 1. Public & Auth Flow (Alur Masuk)
Alur ketika pengguna pertama kali menggunakan sistem atau mengakses data publik.
*   **Registrasi & Login**: User mendaftar sebagai `Learner` secara default.
    *   `POST /api/register` (Pendaftaran akun baru)
    *   `POST /api/login` (Login, menghasilkan JWT Token & info role)
    *   `GET /api/user` (Mendapatkan data user yang sedang login)
    *   `POST /api/logout` (Logout dan invalidasi token)
*   **Upgrade ke Tutor**: Learner dapat mendaftar menjadi Tutor dengan mengunggah dokumen/transkrip nilai.
    *   `POST /api/register/tutor/upload-document`
*   **Data Global (Master Data)**: Data publik yang digunakan untuk referensi form/dropdown di frontend.
    *   `GET /api/courses` (Daftar mata kuliah)
    *   `GET /api/master-slots` (Daftar waktu baku/slot yang tersedia)

### 2. Learner Flow (Alur Pencari Bimbingan)
Alur utama bagi mahasiswa yang mencari bimbingan belajar.
*   **Dashboard & Profil**: Melihat ringkasan aktivitas dan mengelola informasi diri.
    *   `GET /api/dashboard` (Ringkasan aktivitas/jadwal)
    *   `GET /api/dashboard/stats` (Statistik pesanan)
    *   `GET /api/me` (Lihat profil diri)
    *   `PATCH /api/me` (Edit profil)
*   **Eksplorasi & Booking**: 
    *   `GET /api/tutors` (Melihat daftar tutor beserta filter/pencarian)
    *   `GET /api/tutors/{id}` (Detail tutor, ulasan, & slot waktu yang tersedia untuk dipesan)
    *   `POST /api/learner/bookings` (Membuat pesanan/booking sesi belajar)
*   **Manajemen Pesanan & Pembayaran**:
    *   `GET /api/learner/bookings` (Daftar pesanan aktif/menunggu pembayaran)
    *   `GET /api/learner/bookings/{id}` (Detail satu pesanan)
    *   `PATCH /api/learner/bookings/{id}/pay` (Memilih metode pembayaran/men-generate Virtual Account)
    *   `PATCH /api/learner/bookings/{id}/simulate-payment` (Simulasi aksi user telah membayar/klik OK)
*   **Sesi Belajar & Riwayat**:
    *   `GET /api/schedules` (Jadwal belajar yang sudah dibayar dan dikonfirmasi tutor)
    *   `GET /api/learner/history` (Riwayat kelas yang sudah selesai)
    *   `POST /api/learner/bookings/{id}/reviews` (Memberikan ulasan setelah sesi selesai)
*   **Notifikasi**: 
    *   `GET /api/learner/notification` (Daftar notifikasi)
    *   `PATCH /api/learner/notification/{id}/read` (Tandai sudah dibaca)

### 3. Tutor Flow (Alur Pengajar)
Alur bagi mahasiswa yang telah disetujui menjadi pengajar.
*   **Dashboard & Profil**: 
    *   `GET /api/tutor/dashboard` (Ringkasan pendapatan, permintaan masuk, dll)
    *   `PATCH /api/tutor/profile` (Memperbarui data diri/bio tutor)
*   **Manajemen Ketersediaan (Availability)**:
    *   `GET /api/tutor/availability` (Melihat slot kosong yang telah di-set)
    *   `POST /api/tutor/availability` (Mengatur slot mana saja ia bersedia mengajar berdasarkan master slot)
*   **Manajemen Booking (Persetujuan)**:
    *   `GET /api/tutor/bookings` (Melihat permintaan pesanan dari Learner)
    *   `PATCH /api/tutor/bookings/{id}/accept` (Menerima pesanan masuk)
    *   `PATCH /api/tutor/bookings/{id}/reject` (Menolak pesanan masuk)
*   **Sesi Belajar & Evaluasi**:
    *   `GET /api/tutor/schedules` (Jadwal kelas/sesi yang aktif)
    *   `GET /api/tutor/history` (Riwayat kelas yang telah diajar)
    *   `GET /api/tutor/reviews` (Melihat ulasan dan rating dari Learner)
*   **Notifikasi**: 
    *   `GET /api/tutor/notifications` (Notifikasi untuk Tutor)

### 4. Admin Flow (Alur Pengelola Platform)
Alur untuk staf pengelola platform guna mengawasi dan mengelola sistem.
*   **Dashboard & Statistik**: 
    *   `GET /api/admin/stats` (Statistik keseluruhan sistem)
*   **Persetujuan Tutor**: 
    *   `GET /api/admin/applications` (Daftar Learner yang mendaftar jadi Tutor)
    *   `PATCH /api/admin/applications/{id}/approve` (Menyetujui aplikasi tutor)
    *   `PATCH /api/admin/applications/{id}/reject` (Menolak aplikasi tutor)
*   **Manajemen Pengguna & Komplain**:
    *   `GET /api/admin/users` (Daftar semua pengguna)
    *   `DELETE /api/admin/users/{id}` (Menghapus pengguna)
    *   `GET /api/admin/complaints` (Daftar komplain dari pengguna)
*   **Manajemen Master Data**:
    *   `POST / PUT / DELETE /api/admin/courses` (CRUD tabel Mata Kuliah)
    *   `POST / DELETE /api/admin/master-slots` (CRUD tabel Slot Waktu Baku)

> **Catatan**: Untuk melihat struktur spesifik response (payload JSON) secara mendetail, silakan merujuk pada file [backend.md](file:///home/airuzulfi/Projects/konekdin/dev-1/.agents/progress/backend.md) atau Swagger (Scramble) UI di server lokal.
