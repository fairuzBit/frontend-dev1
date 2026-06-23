# Design Spec: Instant Tutor Availability Toggle & Fixes

Dokumen ini mendefinisikan implementasi perubahan status ketersediaan Tutor secara instan (auto-save), perbaikan warna toggle, perbaikan sinkronisasi state data profile, dan modal konfirmasi kustom.

---

## 1. Backend Integration

### 1.1. Route
Menambahkan route PATCH baru di `routes/api.php` di dalam middleware group `role:tutor`:
```php
Route::patch('/tutor/profile/status', [TutorProfileController::class, 'toggleStatus']);
```

### 1.2. Controller Method
Menambahkan method `toggleStatus` di `TutorProfileController` untuk membalikkan status `is_active` pada tutor dan me-return JSON response status terbaru.

### 1.3. Booking Safeguard
Menambahkan validasi di `BookingService::createBooking` sebelum memproses pesanan untuk mencegah pemesanan ke tutor yang `is_active === false`.

---

## 2. Frontend Integration & Fixes

### 2.1. API Client Service
Menambahkan method `toggleStatus()` di `src/api/services/tutorService.ts`.

### 2.2. Unwrapping Bug Fix (Penyebab Toggle & Data Revert/Hilang)
* Di `TutorProfilePage.tsx` pada `useEffect` pengambilan data, respons API akan di-unwrap terlebih dahulu sebelum dimasukkan ke dalam state:
  ```typescript
  const unwrapped = data.data || data;
  setTutor(unwrapped);
  ```
* Hal ini memastikan state `isAvailable` terisi dengan nilai riil dari database (`unwrapped.is_active` atau `unwrapped.status`), dan data pendukung seperti `tutor.email`, `tutor.bio`, `tutor.skills`, `tutor.documents`, `tutor.reviews`, dsb. ter-load dengan benar di UI.

### 2.3. Perubahan Warna Latar Belakang Toggle (Saat Nonaktif)
* Saat tidak aktif (false), ganti kelas `bg-borderColor` menjadi kelas abu-abu netral agar di dark mode tidak bentrok dengan warna border lime green:
  ```typescript
  isAvailable ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
  ```

### 2.4. Kustom Konfirmasi Modal (Opsi B)
Menambahkan modal konfirmasi kustom dengan gaya premium (glassmorphic, rounded-3xl, dark-mode friendly):
* **State:** `isConfirmModalOpen` (boolean).
* **Trigger:** Jika tutor mematikan toggle (mengklik saat status `isAvailable === true`), modal konfirmasi akan terbuka terlebih dahulu.
* **Tampilan Modal:**
  * Backdrop dengan blur: `fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4`
  * Kartu Modal: `bg-bgSecondary w-full max-w-md rounded-[32px] border border-borderColor shadow-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200`
  * Icon: `AlertTriangle` warna merah/amber.
  * Title: `Nonaktifkan Akun?`
  * Deskripsi: `Apakah Anda yakin ingin menonaktifkan akun Anda? Tutor tidak akan dapat dicari atau dipesan oleh learner untuk sementara waktu.`
  * Pilihan Aksi:
    * Tombol **"Ya, Nonaktifkan"** -> Menjalankan `tutorService.toggleStatus()` lalu menutup modal.
    * Tombol **"Batal"** -> Menutup modal tanpa mengubah status.
