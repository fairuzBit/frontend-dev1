# Frontend Fetching Rule

Setiap kali membuat atau memodifikasi desain dan komponen frontend (terutama halaman dashboard, profil, atau daftar data), PASTIKAN bahwa data yang digunakan sudah di-fetching dengan benar dari backend (tidak menggunakan data dummy/statis).

1. Gunakan service yang sudah ada (misal `learnerService`, `tutorService`, atau `adminService`) dan pastikan endpoint-nya sudah sesuai.
2. Selalu gunakan state `loading` untuk menampilkan indikator memuat data kepada pengguna.
3. Selalu tampilkan pesan `error` atau UI _fallback_ jika request gagal atau data kosong.
4. **DILARANG KERAS** melakukan perubahan langsung pada file backend (API, Controller, Model) jika terdapat ketidaksesuaian struktur data. Jika frontend butuh penyesuaian backend, cukup berikan **saran/draft kode** kepada *user* untuk diimplementasikan sendiri.
