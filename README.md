PANDUAN ONLINE — APLIKASI MANAJEMEN AYAM PETELUR

Versi ini disiapkan untuk hosting Node.js dan database file sederhana. Cocok untuk skala kecil dengan beberapa petugas.

REKOMENDASI
- Railway cocok untuk tahap awal karena aplikasi Node.js dapat dijalankan dan volume penyimpanan dapat dipakai untuk menyimpan data.
- Render juga dapat menjalankan Node.js, tetapi penyimpanan filesystem default bersifat sementara; untuk data lokal seperti data.json perlu persistent disk berbayar atau pindah ke database terkelola.

LANGKAH RINGKAS RAILWAY
1. Buat akun Railway.
2. Buat project baru dan deploy aplikasi ini dari GitHub (atau upload melalui metode yang disediakan Railway).
3. Pastikan Start Command menggunakan: npm start
4. Tambahkan Volume pada service dan mount ke: /data
5. Tambahkan Environment Variable:
   DATA_DIR=/data
   ADMIN_USER=admin
   ADMIN_PASSWORD=GANTI_DENGAN_PASSWORD_KUAT
6. Deploy/redeploy.
7. Buka URL publik yang diberikan Railway.
8. Login sebagai Admin, lalu buat akun Petugas.

PENTING
- Jangan gunakan password contoh `ubahpassword` pada server publik.
- Backup data/data.json atau /data/data.json secara berkala sebelum aplikasi digunakan untuk pencatatan resmi.
- Untuk skala lebih besar, sebaiknya migrasikan data ke PostgreSQL/MySQL.

AKUN AWAL
Username: admin
Password default lokal: ubahpassword
Untuk hosting, WAJIB isi ADMIN_PASSWORD dengan password baru.

TEST LOKAL
1. Instal Node.js 18+.
2. Jalankan `npm install`.
3. Jalankan `npm start`.
4. Buka http://localhost:3000
5. Pemeriksaan kesehatan: http://localhost:3000/health
