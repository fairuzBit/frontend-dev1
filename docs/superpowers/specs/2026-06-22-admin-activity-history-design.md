# Design Spec: Admin Activity History Page

Dokumen ini mendefinisikan rancangan halaman baru untuk melihat riwayat aktivitas moderasi admin secara lengkap di KonekDin.

---

## 1. Data Source & Service
* **API Endpoint:** `/api/admin/moderation/logs` (Backend sudah mendukung route GET ini).
* **Service Method:** `adminService.getModerationLogs()` (Sudah tersedia di frontend).

---

## 2. Rencana Implementasi Frontend

### 2.1. Routing & Layout
* **Route Baru:** `/admin/activities`
* **Layout Wrap:** Dibungkus menggunakan `<AdminLayout>` dan dienkapsulasi dengan `<ProtectedRoute allowedRoles={['admin']}>` pada `src/App.tsx`.
* **Navigasi Tab:** Menambahkan tab baru **"Riwayat Aktivitas"** di komponen `AdminNavigationTabs.tsx` agar terintegrasi mulus dengan tab Manajemen Pengguna, Verifikasi Tutor, dan Manajemen Keuangan.

### 2.2. Halaman Riwayat Aktivitas (`AdminActivitiesPage.tsx`)
Halaman baru akan dibuat di `src/features/admin/pages/AdminActivitiesPage.tsx` dengan fitur:
* **Pencarian & Filter:** Input pencarian teks untuk memfilter berdasarkan nama admin, aksi, atau alasan.
* **Tabel Riwayat Aktivitas:**
  * **Tanggal:** Format `d M Y, H:i`
  * **Nama Admin:** Nama admin yang melakukan tindakan.
  * **Aksi/Tindakan:** Kategori aksi (misal: "Hapus Ulasan", "Tangguhkan Pengguna").
  * **Alasan & Keterangan:** Deskripsi alasan dilakukannya tindakan tersebut.
* **Status Loading & Kosong:** State visual beranimasi jika sedang memuat data atau jika riwayat aktivitas masih kosong.
* **Desain:** Menggunakan card glassmorphic modern, font premium, serta ramah dark mode.

### 2.3. Dashboard Redirection
* Mengubah tombol **"Lihat Semua"** di bagian kartu "Aktivitas Terbaru" di `AdminDashboard.tsx` agar mengarah ke `/admin/activities` menggunakan router `<Link>`.
