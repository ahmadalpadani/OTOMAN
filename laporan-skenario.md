# Laporan Skenario Penggunaan Sistem OTOMAN
## Aplikasi Inspeksi Kendaraan Online

---

## Skenario 1: Registrasi dan Login User Client

### Tujuan
User client dapat membuat akun baru dan masuk ke sistem untuk mengakses fitur pengajuan inspeksi.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | User | Mengakses halaman utama (`/`) | Menampilkan halaman landing OTOMAN dengan tombol "Daftar" dan "Masuk" |
| 2 | User | Klik tombol "Daftar" | Menampilkan modal/form registrasi |
| 3 | User | Mengisi formulir: Nama, Email, Password, Konfirmasi Password | Form validasi fields wajib |
| 4 | User | Klik tombol "Daftar" | Sistem menyimpan data user ke database, menampilkan toast sukses "Registrasi berhasil! Silakan masuk" |
| 5 | User | Klik tombol "Masuk" | Menampilkan modal/form login |
| 6 | User | Mengisi Email dan Password, klik "Masuk" | Sistem memverifikasi kredensial, membuat token autentikasi (Sanctum), menyimpan token ke localStorage |
| 7 | User | Berhasil login | Redirect ke halaman dashboard client (`/dashboard/dashboard.html`), navbar menampilkan nama user |

### Hasil yang Diharapkan
- User berhasil registrasi dan login tanpa error
- Token autentikasi tersimpan di browser
- Dashboard menampilkan data inspeksi user (kosong jika belum ada pengajuan)

---

## Skenario 2: Pengajuan Inspeksi oleh User Client

### Tujuan
User client dapat mengajukan inspeksi kendaraan dengan mengisi formulir lengkap termasuk mengunggah bukti pembayaran.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | User Client | Login ke sistem | Menampilkan halaman dashboard client |
| 2 | User Client | Klik tombol "Ajukan Inspeksi Baru" di halaman ringkasan | Membuka modal formulir pengajuan inspeksi |
| 3 | User Client | Mengisi data kendaraan: Tipe (Mobil/Motor), Merek, Model, Tahun, Jarak Tempuh (km), Kondisi | Semua field wajib divalidasi |
| 4 | User Client | Mengisi catatan tambahan (opsional) | Text area untuk informasi tambahan |
| 5 | User Client | Memilih tanggal inspeksi (minimal H+2 dari hari ini) | Datepicker hanya menampilkan tanggal valid |
| 6 | User Client | Memilih waktu inspeksi dari dropdown | Opsi: 08:00–10:00, 10:00–12:00, 13:00–15:00, 15:00–17:00 |
| 7 | User Client | Mengisi lokasi: Provinsi, Kota/Kabupaten, Alamat Lengkap, No. Telepon | Semua field wajib divalidasi |
| 8 | User Client | Mengunggah bukti pembayaran (foto/FILE transfer bank) | Validasi: format JPG/PNG/PDF, maks 2MB. Menampilkan preview gambar |
| 9 | User Client | Klik tombol "Ajukan Inspeksi" | Sistem mengirim data + file ke API endpoint `/api/inspections` |
| 10 | Sistem | Memvalidasi semua data dan file | Jika valid: menyimpan ke database, generate kode pesanan (contoh: `INS-ABCD12`), upload file ke storage |
| 11 | Sistem | Memberikan respons sukses | Menampilkan toast "Pesanan inspeksi berhasil dibuat! Kode: INS-ABCD12" |
| 12 | User Client | Modal ditutup, data inspeksi baru muncul di halaman ringkasan dengan status "Menunggu" | Dashboard refresh otomatis |

### Catatan Teknis
- Biaya inspeksi tetap: **Rp 350.000**
- Bukti pembayaran wajib diunggah pada saat pengajuan
- Kode pesanan unik 6 karakter (contoh: `INS-XY7K2P`)
- Status awal: `pending`, Payment Status: `paid` (karena sudah upload bukti)

### Hasil yang Diharapkan
- Inspeksi tersimpan di database dengan status "pending"
- Bukti pembayaran tersimpan di storage (`storage/app/public/payment-proofs/`)
- User dapat melihat detail inspeksi beserta bukti pembayaran yang sudah diunggah

---

## Skenario 3: Admin Login dan Memverifikasi Pengajuan

### Tujuan
Admin dapat login dan melihat daftar pengajuan inspeksi dari user, lengkap dengan bukti pembayaran.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | Admin | Mengakses halaman admin (`/dashboard/dashboard-admin.html`) | Otomatis redirect ke halaman login jika belum autentikasi |
| 2 | Admin | Klik tombol "Login Admin" (jika modal login ditampilkan) atau akses langsung form login | Form login admin |
| 3 | Admin | Mengisi Email dan Password admin, klik "Login" | Sistem memverifikasi kredensial via API `/api/admin/login` |
| 4 | Admin | Berhasil login | Dashboard admin dimuat, menampilkan statistik dan daftar inspeksi terbaru |
| 5 | Admin | Melihat statistik di halaman ringkasan | Menampilkan: Total Inspeksi, Inspeksi Pending, Sedang Berjalan, Selesai |
| 6 | Admin | Melihat daftar inspeksi terbaru | Tabel menampilkan: ID, Nama User, Kendaraan, Lokasi, Tanggal, Status, Aksi |
| 7 | Admin | Klik ikon "Lihat Detail" (mata) pada salah satu baris inspeksi | Membuka modal detail inspeksi |
| 8 | Admin | Di modal detail, melihat section "Pembayaran" | Menampilkan: Metode Bayar, Status Pembayaran (Lunas/Belum Bayar), Total Biaya, **Bukti Pembayaran** (gambar thumbnail) |
| 9 | Admin | Klik gambar bukti pembayaran atau ikon zoom | Membuka modal popup berisi gambar bukti pembayaran ukuran penuh dengan tombol "Download" |
| 10 | Admin | Memverifikasi bukti pembayaran | Admin memastikan nominal dan rekening sesuai |

### Catatan Teknis
- Bukti pembayaran diakses via URL: `http://localhost:8000/storage/payment-proofs/{filename}`
- Admin dapat melihat bukti pembayaran sebelum dan sesudah menugaskan inspector

### Hasil yang Diharapkan
- Admin berhasil melihat semua pengajuan inspeksi
- Bukti pembayaran dapat dilihat dalam ukuran penuh
- Admin dapat mengunduh bukti pembayaran sebagai arsip

---

## Skenario 4: Admin Menugaskan Inspector

### Tujuan
Admin menugaskan inspector untuk melaksanakan inspeksi dengan jadwal yang sama persis dengan yang diajukan user client.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | Admin | Di modal detail inspeksi, klik tombol "Assign Inspector" (untuk status pending) | Membuka modal "Assign Inspector" |
| 2 | Sistem | Otomatis mengisi field Tanggal dan Waktu | Field pre-filled otomatis dengan data yang diajukan user client (tanggal & waktu dari pengajuan client) |
| 3 | Admin | Field Tanggal Inspeksi | Sudah terisi otomatis: tanggal yang dipilih user client (read-only atau tetap bisa diubah jika perlu) |
| 4 | Admin | Field Waktu Inspeksi | Sudah terisi otomatis: slot waktu yang dipilih user client (contoh: "13:00 - 15:00") |
| 5 | Admin | Memilih inspector dari dropdown | Menampilkan daftar inspector yang tersedia dari database |
| 6 | Admin | Klik tombol "Assign Inspector" | Mengirim data ke API `/api/admin/inspections/{id}/assign` |
| 7 | Sistem | Memvalidasi data dan menyimpan | Menyimpan `mechanic_id`, `scheduled_date`, `scheduled_time` ke database |
| 8 | Sistem | Memberikan respons | Toast sukses "Inspector berhasil di-assign!" |
| 9 | Admin | Modal assign tertutup, modal detail refresh | Menampilkan data inspector yang baru ditugaskan |
| 10 | Admin | Melihat perubahan di tabel inspeksi | Status inspeksi berubah sesuai konfigurasi sistem |

### Catatan Teknis
- Tanggal dan waktu yang di-assign **sama persis** dengan yang diajukan oleh user client
- Admin hanya perlu memilih inspector, tanggal dan waktu sudah otomatis terisi
- Format waktu yang disimpan: string `"HH:MM-HH:MM"` (contoh: `"13:00-15:00"`)

### Hasil yang Diharapkan
- Inspector berhasil ditugaskan dan terkait dengan inspeksi
- Inspector dapat melihat daftar inspeksi yang ditugaskan di dashboard inspector
- User client dapat melihat inspector yang ditugaskan di detail inspeksi miliknya

---

## Skenario 5: Inspector Login dan Melihat Inspeksi yang Ditugaskan

### Tujuan
Inspector dapat login dan melihat daftar inspeksi yangspecifically ditugaskan kepada dirinya.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | Inspector | Mengakses halaman inspector (`/dashboard/dashboard-inspector.html`) | Redirect ke login jika belum autentikasi |
| 2 | Inspector | Login dengan kredensial inspector | Autentikasi via API `/api/inspector/login` |
| 3 | Inspector | Berhasil login | Dashboard inspector dimuat |
| 4 | Inspector | Melihat halaman ringkasan | Menampilkan statistik: Total Ditugaskan, Sedang Berjalan, Riwayat Selesai |
| 5 | Inspector | Klik menu "Inspeksi Ditugaskan" | Menampilkan tabel inspeksi yang specifically ditugaskan kepada inspector tersebut |
| 6 | Inspector | Melihat detail inspeksi | Menampilkan: Data kendaraan, Lokasi inspeksi, Jadwal (tanggal & waktu), Data pemesan |
| 7 | Inspector | Klik tombol "Update Hasil Inspeksi" | Membuka modal untuk mengisi hasil inspeksi |
| 8 | Inspector | Mengisi hasil inspeksi: Kondisi Body, Mesin, Interior, Catatan hasil, Hasil akhir (Setuju/Tolak) | Semua field hasil harus diisi |
| 9 | Inspector | Klik tombol "Simpan Hasil" | Mengirim data ke API `/api/inspector/inspections/{id}/complete` |
| 10 | Sistem | Menyimpan hasil inspeksi, mengubah status menjadi `completed` | `completed_at` timestamp diset otomatis |
| 11 | Sistem | Memberikan respons | Toast sukses, modal tertutup, data di tabel berubah |

### Catatan Teknis
- Inspector hanya dapat melihat inspeksi yang specifically ditugaskan kepadanya (filter `mechanic_id = auth()->id()`)
- Hasil inspeksi mencakup: `body_condition`, `engine_condition`, `interior_condition`, `result_notes`, `result` (approve/reject)
- Status berubah dari `assigned`/`in_progress` menjadi `completed`

### Hasil yang Diharapkan
- Inspector dapat melihat dan mengelola inspeksi yang menjadi tanggung jawabnya
- Hasil inspeksi tersimpan dan dapat diakses oleh user client dan admin
- Status inspeksi berubah menjadi "completed"

---

## Skenario 6: User Client Mengunduh Laporan Hasil Inspeksi

### Tujuan
User client yang telah menyelesaikan inspeksi dapat melihat dan mengunduh/cetak laporan hasil inspeksi.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | User Client | Login ke sistem | Menampilkan dashboard client |
| 2 | User Client | Melihat halaman ringkasan | Menampilkan daftar inspeksi dengan status (Menunggu/Ditugaskan/Selesai) |
| 3 | User Client | Klik "Lihat Detail" pada inspeksi yang berstatus "Selesai" | Membuka modal detail inspeksi |
| 4 | User Client | Di modal detail, melihat section hasil inspeksi | Menampilkan: Kondisi Body, Mesin, Interior, Catatan Inspector, Hasil Akhir (Disetujui/Ditolak) |
| 5 | User Client | Klik tombol "Unduh Laporan" | Membuka window baru dengan halaman laporan lengkap (print-friendly) |
| 6 | Sistem | Men-generate halaman laporan | Menampilkan layout laporan siap cetak，包含: Header OTOMAN, Info Pesanan, Data Kendaraan, Data Lokasi, Hasil Inspeksi (kondisi body/mesin/interior), Tanda tangan inspector |
| 7 | User Client | Klik tombol "Cetak / Download PDF" di halaman laporan | Memicu fungsi `window.print()` atau membuka dialog cetak browser |
| 8 | User Client | Memilih "Save as PDF" di dialog cetak browser | Browser menyimpan laporan sebagai file PDF |

### Catatan Teknis
- Laporan diakses via API: `GET /api/inspections/{id}/report`
- Halaman laporan menggunakan layout khusus untuk print (CSS `@media print`)
- Data laporan diformat dengan label Indonesia (contoh: "Sangat Baik", "Baik", "Disetujui")

### Hasil yang Diharapkan
- User client dapat melihat hasil inspeksi lengkap
- Laporan dapat dicetak langsung dari browser
- Laporan tersimpan sebagai file PDF

---

## Skenario 7: Admin Memperbarui Status dan Mengunduh Laporan

### Tujuan
Admin dapat memperbarui status inspeksi dan mengakses/download laporan hasil inspeksi.

### Langkah-langkah

| No | Aktor | Langkah | Sistem/Tampilan |
|----|-------|---------|----------------|
| 1 | Admin | Login ke dashboard admin | Menampilkan halaman ringkasan |
| 2 | Admin | Klik menu "Semua Inspeksi" atau lihat tabel inspeksi terbaru | Menampilkan daftar lengkap semua inspeksi |
| 3 | Admin | Klik ikon "Update Status" (pensil) pada baris inspeksi | Membuka modal "Update Status Inspeksi" |
| 4 | Admin | Memilih status baru dari dropdown | Opsi: Pending, Sedang Berjalan, Selesai, Dibatalkan |
| 5 | Admin | (Opsional) Mengisi catatan/status note | Field catatan opsional |
| 6 | Admin | Klik tombol "Simpan Status" | Mengirim data ke API `/api/admin/inspections/{id}/status` |
| 7 | Sistem | Memperbarui status di database | Respons sukses |
| 8 | Admin | Toast "Status berhasil diupdate!" | Tabel dan statistik refresh otomatis |
| 9 | Admin | Kembali ke modal detail inspeksi, klik "Download Laporan" | Membuka window baru dengan halaman laporan inspeksi |
| 10 | Admin | Di halaman laporan, klik "Download PDF" | Laporan disimpan sebagai PDF |

### Catatan Teknis
- Update status tidak mengubah hasil inspeksi yang sudah diisi inspector
- Download laporan menggunakan endpoint yang sama dengan user client: `GET /api/admin/inspections/{id}/report`
- Laporan mencakup semua data: info kendaraan, lokasi, jadwal, hasil inspeksi, data inspector, dan payment info

### Hasil yang Diharapkan
- Admin dapat memperbarui status inspeksi kapan saja
- Admin dapat mengakses dan mengunduh laporan inspeksi kapan saja
- Laporan admin mencakup informasi yang lebih lengkap dibanding versi client

---

## Ringkasan Alur End-to-End

```
[User Client]                    [Admin]                    [Inspector]
     |                              |                            |
  Registrasi/Login                  |                            |
     |                              |                            |
  Ajukan Inspeksi +                 |                            |
  Upload Bukti Bayar                 |                            |
     |                              |                            |
     |-------------------------> DAFTAR INSPEKSI PENDING         |
     |                              |                            |
     |                         View Detail +                     |
     |                         Verifikasi Bukti Bayar             |
     |                              |                            |
     |                         ASSIGN INSPECTOR                  |
     |                         (tanggal/waktu auto                |
     |                          dari pengajuan client)            |
     |                              |                            |
     |                              |----------------------> DAFTAR DITUGASKAN
     |                              |                            |
     |                              |                    UPDATE HASIL INSPEKSI
     |                              |                    (body/mesin/interior +
     |                              |                     hasil approve/reject)
     |                              |                            |
     |                              |<-------------------- STATUS: COMPLETED
     |                              |
VIEW HASIL + LAPORAN           DOWNLOAD LAPORAN
     |                              |
  CETAK/PRINT PDF             CETAK/PRINT PDF
```

---

## Akun Uji Coba (Sample Credentials)

| Peran | Email | Password |
|-------|-------|----------|
| User Client | (silakan registrasi sendiri) | - |
| Admin | admin@otoman.com | password |
| Inspector | joko@otoman.com | password |

---

*Dokumen ini disusun berdasarkan implementasi nyata pada sistem OTOMAN — Aplikasi Inspeksi Kendaraan Online.*
*Setiap skenario telah terhubung langsung ke API backend dan database (tanpa data dummy/mock).*
