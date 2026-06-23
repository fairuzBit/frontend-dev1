# Design Spec: Tombol Aksi Cepat di Kartu Notifikasi

Dokumen ini mendefinisikan penambahan tombol aksi cepat di dalam kartu notifikasi untuk mempermudah navigasi pengguna langsung ke menu yang relevan.

---

## 1. Perubahan Halaman Notifikasi Learner

### Perilaku (Behavior)
* Ketika notifikasi memiliki `type === 'payment'` (pembayaran diverifikasi oleh Admin), sistem akan menampilkan tombol aksi `"Mulai Belajar"`.
* Tombol ini mengarahkan learner langsung ke halaman Jadwal Belajar (`/learner/schedules`).

### Tampilan & Gaya (Styling)
* **Warna:** Solid Emerald Green (`bg-emerald-500 hover:bg-emerald-600 text-white`)
* **Ikon:** `ArrowRight` di sisi kanan teks.
* **Layout:** Ditempatkan di bagian bawah pesan notifikasi dengan margin top (`mt-4`).

---

## 2. Perubahan Halaman Notifikasi Tutor

### Perilaku (Behavior)
* Ketika notifikasi memiliki `type === 'booking'` (pesanan baru masuk dari learner), sistem akan menampilkan tombol aksi `"Cek Booking"`.
* Tombol ini mengarahkan tutor langsung ke halaman daftar Booking (`/tutor/bookings`).

### Tampilan & Gaya (Styling)
* **Warna:** Solid Brand Green (`bg-brand-500 hover:bg-brand-600 text-white dark:bg-brand-500/20 dark:hover:bg-brand-500/30 dark:text-brand-400`)
* **Ikon:** `ArrowRight` di sisi kanan teks.
* **Layout:** Ditempatkan di bagian bawah pesan notifikasi dengan margin top (`mt-4`).
