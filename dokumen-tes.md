# DOKUMEN UJI COBA (TEST CHECKLIST)
## Sistem OTOMAN — Aplikasi Inspeksi Kendaraan Online

---

## AKUN UJI COBA

| Peran | Email | Password | URL Login |
|-------|-------|---------|-----------|
| User Client | (registrasi sendiri) | - | http://localhost/ |
| Admin | admin@otoman.com | password | http://localhost/dashboard/dashboard-admin.html |
| Inspector | joko@otoman.com | password | http://localhost/dashboard/dashboard-inspector.html |

---

## SKENARIO 1: Registrasi & Login User Client

**URL:** http://localhost/

**Langkah:**
- [ ] 1. Buka http://localhost/
- [ ] 2. Klik tombol **"Daftar"** → muncul form registrasi
- [ ] 3. Isi: Nama, Email, Password, Konfirmasi Password
- [ ] 4. Klik **"Daftar"** → muncul toast sukses
- [ ] 5. Klik tombol **"Masuk"** → muncul form login
- [ ] 6. Isi email & password yang sudah didaftarkan
- [ ] 7. Klik **"Masuk"** → redirect ke dashboard client
- [ ] 8. Cek navbar menampilkan nama user

**Hasil yang Diharapkan:**
- Registrasi tersimpan di database
- Login berhasil, token tersimpan di localStorage
- Berada di halaman dashboard client

---

## SKENARIO 2: Pengajuan Inspeksi + Upload Bukti Bayar

**URL:** http://localhost/dashboard/dashboard.html
**Syarat:** Sudah login sebagai User Client

**Langkah:**
- [ ] 1. Di halaman ringkasan, klik **"+ Ajukan Inspeksi Baru"**
- [ ] 2. Modal formulir inspeksi terbuka
- [ ] 3. Isi **Data Kendaraan:**
  - [ ] Tipe: Mobil / Motor
  - [ ] Merek
  - [ ] Model
  - [ ] Tahun
  - [ ] Jarak Tempuh (km)
  - [ ] Kondisi (Sangat Baik / Baik / Cukup / Kurang)
- [ ] 4. (Opsional) Isi catatan tambahan
- [ ] 5. Pilih **Tanggal Inspeksi** (minimal H+2)
- [ ] 6. Pilih **Waktu Inspeksi** (08:00-10:00, 10:00-12:00, 13:00-15:00, 15:00-17:00)
- [ ] 7. Isi **Lokasi:**
  - [ ] Provinsi
  - [ ] Kota/Kabupaten
  - [ ] Alamat Lengkap
  - [ ] No. Telepon
- [ ] 8. **Upload Bukti Pembayaran:**
  - [ ] Pilih file JPG/PNG/PDF (maks 2MB)
  - [ ] Preview gambar muncul
- [ ] 9. Klik **"Ajukan Inspeksi"**
- [ ] 10. Toast sukses muncul dengan kode pesanan (contoh: INS-ABCD12)
- [ ] 11. Modal tertutup, data inspeksi baru muncul di ringkasan
- [ ] 12. Status inspeksi: **"Menunggu"**

**Hasil yang Diharapkan:**
- Inspeksi tersimpan di database
- File bukti pembayaran tersimpan di `storage/app/public/payment-proofs/`
- Kode pesanan unik tergenerate

---

## SKENARIO 3: Admin Login

**URL:** http://localhost/dashboard/dashboard-admin.html

**Langkah:**
- [ ] 1. Buka http://localhost/dashboard/dashboard-admin.html
- [ ] 2. Klik tombol login / isi kredensial admin
- [ ] 3. Login dengan: `admin@otoman.com` / `password`
- [ ] 4. Dashboard admin terbuka
- [ ] 5. Cek statistik di ringkasan: Total Inspeksi, Pending, Sedang Berjalan, Selesai

**Hasil yang Diharapkan:**
- Login berhasil
- Data statistik tampil dari database

---

## SKENARIO 4: Admin Melihat Detail + Bukti Bayar

**URL:** http://localhost/dashboard/dashboard-admin.html
**Syarat:** Ada minimal 1 pengajuan inspeksi dari user

**Langkah:**
- [ ] 1. Admin sudah login
- [ ] 2. Di tabel inspeksi terbaru, klik ikon **"Mata"** (Lihat Detail)
- [ ] 3. Modal detail terbuka
- [ ] 4. Cek section **"Kendaraan"** → data kendaraan lengkap
- [ ] 5. Cek section **"Pemesan & Lokasi"** → data user & alamat
- [ ] 6. Cek section **"Pembayaran"**:
  - [ ] Metode Bayar
  - [ ] Status: Lunas (karena sudah upload bukti)
  - [ ] Total: Rp 350.000
  - [ ] **Gambar bukti pembayaran** terlihat
- [ ] 7. Klik gambar bukti bayar / ikon zoom
- [ ] 8. Modal popup bukti bayar terbuka dengan gambar besar
- [ ] 9. Klik tombol **"Download"** → file terdownload

**Hasil yang Diharapkan:**
- Semua data inspeksi lengkap
- Bukti pembayaran bisa dilihat & didownload

---

## SKENARIO 5: Admin Assign Inspector

**URL:** http://localhost/dashboard/dashboard-admin.html
**Syarat:** Ada minimal 1 inspeksi berstatus "pending"

**Langkah:**
- [ ] 1. Admin sudah login
- [ ] 2. Buka detail inspeksi pending
- [ ] 3. Klik tombol **"Assign Inspector"**
- [ ] 4. Modal assign terbuka
- [ ] 5. **CEK: Field Tanggal & Waktu sudah terisi otomatis** (dari pengajuan client)
- [ ] 6. Pilih **Inspector** dari dropdown
- [ ] 7. Klik **"Assign Inspector"**
- [ ] 8. Toast sukses: "Inspector berhasil di-assign!"
- [ ] 9. Modal tertutup, detail refresh
- [ ] 10. Cek section **"Inspector & Jadwal"** → inspector & jadwal tampil

**Hasil yang Diharapkan:**
- Inspector terkait dengan inspeksi
- Tanggal/waktu SAMA PERSIS dengan yang diajukan client
- Data tersimpan di database

---

## SKENARIO 6: Inspector Login & Lihat Inspeksi Ditugaskan

**URL:** http://localhost/dashboard/dashboard-inspector.html

**Langkah:**
- [ ] 1. Buka http://localhost/dashboard/dashboard-inspector.html
- [ ] 2. Login dengan: `joko@otoman.com` / `password`
- [ ] 3. Dashboard inspector terbuka
- [ ] 4. Cek statistik: Total Ditugaskan, Sedang Berjalan, Riwayat Selesai
- [ ] 5. Klik menu **"Inspeksi Ditugaskan"**
- [ ] 6. Cek tabel menampilkan inspeksi yang ditugaskan KE inspector ini SAJA
- [ ] 7. Klik **"Lihat Detail"**
- [ ] 8. Modal detail terbuka, cek:
  - [ ] Data kendaraan
  - [ ] Lokasi inspeksi
  - [ ] **Jadwal (tanggal & waktu)**
  - [ ] Data pemesan

**Hasil yang Diharapkan:**
- Inspector hanya melihat inspeksi miliknya
- Semua data inspeksi lengkap

---

## SKENARIO 7: Inspector Mengisi Hasil Inspeksi

**URL:** http://localhost/dashboard/dashboard-inspector.html
**Syarat:** Ada minimal 1 inspeksi yang sudah di-assign

**Langkah:**
- [ ] 1. Inspector sudah login
- [ ] 2. Buka detail inspeksi yang ditugaskan
- [ ] 3. Klik tombol **"Update Hasil Inspeksi"**
- [ ] 4. Modal hasil inspeksi terbuka
- [ ] 5. Isi **Kondisi Body:** Sangat Baik / Baik / Cukup / Kurang
- [ ] 6. Isi **Kondisi Mesin:** Sangat Baik / Baik / Cukup / Kurang
- [ ] 7. Isi **Kondisi Interior:** Sangat Baik / Baik / Cukup / Kurang
- [ ] 8. Isi **Catatan Hasil** (opsional)
- [ ] 9. Pilih **Hasil Akhir:** Disetujui / Ditolak
- [ ] 10. Klik **"Simpan Hasil"**
- [ ] 11. Toast sukses muncul
- [ ] 12. Modal tertutup, status berubah jadi **"Selesai"**

**Hasil yang Diharapkan:**
- Hasil inspeksi tersimpan di database
- Status inspeksi: `completed`
- Kolom `completed_at` terisi timestamp

---

## SKENARIO 8: User Client Melihat Hasil Inspeksi

**URL:** http://localhost/dashboard/dashboard.html
**Syarat:** Ada minimal 1 inspeksi yang sudah selesai (completed)

**Langkah:**
- [ ] 1. User client sudah login
- [ ] 2. Buka detail inspeksi yang statusnya "Selesai"
- [ ] 3. Cek section **"Hasil Inspeksi"** terlihat:
  - [ ] Kondisi Body
  - [ ] Kondisi Mesin
  - [ ] Kondisi Interior
  - [ ] Catatan Inspector
  - [ ] Hasil Akhir: Disetujui / Ditolak
- [ ] 4. Cek section **"Bukti Pembayaran"** → gambar tampil
- [ ] 5. Klik **"Unduh Laporan"**
- [ ] 6. Window baru terbuka dengan halaman laporan
- [ ] 7. Klik **"Cetak / Download PDF"** → dialog print browser
- [ ] 8. Pilih "Save as PDF" → file terdownload

**Hasil yang Diharapkan:**
- Hasil inspeksi lengkap terlihat
- Laporan bisa dicetak/disimpan sebagai PDF

---

## SKENARIO 9: Admin Update Status & Download Laporan

**URL:** http://localhost/dashboard/dashboard-admin.html

**Langkah:**
- [ ] 1. Admin sudah login
- [ ] 2. Buka detail inspeksi (bisa pending, assigned, atau completed)
- [ ] 3. Klik tombol **"Update Status"** (pensil)
- [ ] 4. Modal update status terbuka
- [ ] 5. Pilih status baru: Pending / Sedang Berjalan / Selesai / Dibatalkan
- [ ] 6. (Opsional) Isi catatan
- [ ] 7. Klik **"Simpan Status"**
- [ ] 8. Toast sukses: "Status berhasil diupdate!"
- [ ] 9. Kembali ke modal detail
- [ ] 10. Klik **"Download Laporan"**
- [ ] 11. Window baru terbuka dengan halaman laporan lengkap
- [ ] 12. Klik **"Download PDF"**

**Hasil yang Diharapkan:**
- Status inspeksi berhasil diupdate
- Laporan bisa didownload admin juga

---

## SKENARIO 10: Estimasi Harga Kendaraan (Taksiran Harga)

**URL:** http://localhost/price-estimation.html (atau sesuai route yang ada)

**Langkah:**
- [ ] 1. Buka halaman estimator
- [ ] 2. Pilih **Brand:** (contoh: Toyota)
- [ ] 3. Pilih **Model:** (contoh: Camry) — auto-update setelah brand dipilih
- [ ] 4. Pilih **Tahun:** (contoh: 2020)
- [ ] 5. Masukkan **Mileage:** (contoh: 50000)
- [ ] 6. Pilih **Fuel Type:** (contoh: Gasoline)
- [ ] 7. Pilih **Transmission:** Manual / Otomatis
- [ ] 8. Pilih **Accident:** Pernah / Tidak pernah
- [ ] 9. Pilih **Clean Title:** Ya / Tidak
- [ ] 10. Klik **"Estimasi Sekarang"** / **"Taksiran"**
- [ ] 11. Cek hasil muncul:
  - [ ] Harga Bawah
  - [ ] Harga Prediksi (tengah)
  - [ ] Harga Atas
- [ ] 12. Format mata uang: IDR (Rupiah Indonesia)

**Hasil yang Diharapkan:**
- Hasil prediksi tampil dengan 3 range harga
- Semua field wajib terisi sebelum submit

---

## SKENARIO 11: Logout (User, Admin, Inspector)

**Langkah:**
- [ ] 1. User/Admin/Inspector sedang login
- [ ] 2. Klik tombol **"Logout"** / **"Keluar"**
- [ ] 3. Redirect ke halaman landing/login
- [ ] 4. Token di localStorage dihapus
- [ ] 5. Coba akses halaman dashboard langsung → redirect ke login

**Hasil yang Diharapkan:**
- Session terputus
- Tidak bisa akses dashboard tanpa login ulang

---

## CHECKLIST KESELURUHAN

### Data Flow End-to-End

| Tahap | Status | Catatan |
|-------|--------|---------|
| Registrasi User Client | ☐ | |
| Login User Client | ☐ | |
| Ajukan Inspeksi + Upload Bukti Bayar | ☐ | |
| Admin Login | ☐ | |
| Admin Lihat Detail + Bukti Bayar | ☐ | |
| Admin Assign Inspector (tanggal auto dari client) | ☐ | |
| Inspector Login | ☐ | |
| Inspector Lihat Inspeksi Ditugaskan | ☐ | |
| Inspector Isi Hasil Inspeksi | ☐ | |
| User Client Lihat Hasil + Download Laporan | ☐ | |
| Admin Update Status + Download Laporan | ☐ | |
| Estimasi Harga Kendaraan | ☐ | |
| Logout (semua role) | ☐ | |

### Catatan Testing:
1. Pastikan backend Laravel running di http://localhost:8000
2. Pastikan frontend accessible di http://localhost/
3. Pastikan database migration sudah dijalankan
4. Pastikan storage link sudah dibuat: `php artisan storage:link`
5. Pastikan akun admin & inspector sudah di-seed

---

## SKENARIO 12: Penaksiran Harga Kendaraan Bekas (Taksasi Harga)

**URL:** http://localhost/price-estimation.html

### Tujuan
User dapat menaksir/mendapatkan estimasi harga kendaraan bekas dengan mengisi spesifikasi kendaraan. Sistem menggunakan teknologi **Machine Learning** untuk memberikan 3 range harga: harga terendah, harga wajar (rekomendasi), dan harga tertinggi.

### Fitur Utama:
- Form isian kendaraan (brand, model, tahun, mileage, dll)
- Dropdown brand → model otomatis update
- Tahun produksi (last 30 tahun)
- Hasil estimasi 3 harga (low, mid, high)
- Tombol "Booking Inspeksi" setelah dapat hasil
- Tombol "Coba Lagi" untuk estimasi baru

---

### Langkah-langkah:

#### A. Pengisian Formulir

- [ ] 1. Buka http://localhost/price-estimation.html
- [ ] 2. Halaman menampilkan header **"Penaksiran Harga Kendaraan Bekas"**
- [ ] 3. Formulir tampil dengan field:

**Field Wajib (*):**
- [ ] **Merek** — dropdown, contoh: Toyota, Honda, BMW, dll
- [ ] **Model** — dropdown, auto-update setelah Merek dipilih, disabled sampai Merek dipilih
- [ ] **Tahun Produksi** — dropdown (tahun sekarang minus 30)
- [ ] **Jarak Tempuh (KM)** — input number, contoh: 50000
- [ ] **Jenis Bahan Bakar** — dropdown: Bensin, Diesel, Listrik, Hybrid
- [ ] **Tipe Transmissi** — radio button: Automatic / Manual / Lainnya
- [ ] **Riwayat Kecelakaan** — radio button: Tidak / Ya
- [ ] **Clean Title** — radio button: Ya / Tidak

**Field Opsional:**
- [ ] **Spesifikasi Mesin** — input text, contoh: "2.0L 4 cylinder"
- [ ] **Warna Exterior** — dropdown warna
- [ ] **Warna Interior** — dropdown warna

#### B. Pre-fill Otomatis dari API (Cek Koneksi Backend)

- [ ] 4. Cek dropdown **Merek** terisi otomatis dari API
- [ ] 5. Pilih **Merek**: contoh **Toyota**
- [ ] 6. Cek dropdown **Model** auto-update setelah Merek dipilih → tampil daftar model Toyota
- [ ] 7. Pilih **Model**: contoh **Camry**
- [ ] 8. Pilih **Tahun Produksi**: contoh **2020**
- [ ] 9. Masukkan **Jarak Tempuh**: **50000**
- [ ] 10. Pilih **Jenis Bahan Bakar**: **Bensin (Gasoline)**
- [ ] 11. Pilih **Tipe Transmissi**: **Automatic**
- [ ] 12. Pilih **Riwayat Kecelakaan**: **Tidak**
- [ ] 13. Pilih **Clean Title**: **Ya**
- [ ] 14. (Opsional) Isi Spesifikasi Mesin, Warna Exterior, Warna Interior
- [ ] 15. Klik tombol **"Taksir Harga"**

#### C. Loading State

- [ ] 16. Setelah klik submit, cek **overlay loading** muncul
- [ ] 17. Text: *"Menghitung estimasi harga..."*
- [ ] 18. Tunggu hasil dari backend

#### D. Hasil Estimasi

- [ ] 19. Loading hilang, section **Hasil Estimasi Harga** tampil (tidak hidden lagi)
- [ ] 20. Cek **Ringkasan Kendaraan**:
  - [ ] Format: "{Tahun} {Merek} {Model}"
  - [ ] Sub-text: "{Mileage} km | {Transmissi} | {Fuel Type}"
- [ ] 21. Cek **3 Card Harga** tampil:
  - [ ] **Kartu Kiri (Harga Terendah)** — label abu-abu, harga paling rendah
  - [ ] **Kartu Tengah (Harga Wajar)** — background biru, badge **"Rekomendasi"**
  - [ ] **Kartu Kanan (Harga Tertinggi)** — label abu-abu, harga paling tinggi
- [ ] 22. Cek semua harga berformat **IDR** (contoh: Rp 285.000.000)
- [ ] 23. Cek **Alert/Catatan** tampil:
  - [ ] *"Catatan: Harga ini adalah estimasi berdasarkan data pasar kendaraan bekas. Harga aktual dapat berbeda tergantung kondisi kendaraan dan lokasi."*
- [ ] 24. Cek **Tombol Aksi** tampil:
  - [ ] **"Coba Lagi"** (outline primary)
  - [ ] **"Booking Inspeksi"** → link ke inspection.html (btn hijau)

#### E. Aksi Setelah Hasil

- [ ] 25. Klik **"Coba Lagi"** → form reset, scroll ke atas, section hasil hilang kembali
- [ ] 26. Isi ulang form dengan data berbeda (contoh: Honda Civic 2018, 30000km)
- [ ] 27. Klik **"Taksir Harga"**
- [ ] 28. Hasil baru tampil dengan harga berbeda

#### F. Skenario Alternative — Backend Offline (Fallback)

- [ ] 29. Matikan/disconnect backend (optional test)
- [ ] 30. Form tetap bisa di-submit (menggunakan fallback data)
- [ ] Dropdown Merek & Fuel Type tetap terisi dari fallback hardcoded di JS
- [ ] Model dropdown tetap berfungsi dari fallback data

#### G. Validasi Form

- [ ] 31. Kosongkan semua field, klik **"Taksir Harga"**
- [ ] 32. Browser native validation muncul (field required)
- [ ] Submit tidak bisa dilakukan selama ada field wajib kosong

#### H. Pengujian API Endpoint (Opsional - Via Curl/Postman)

- [ ] 33. Kirim request POST ke: `POST http://localhost:8000/api/car-price/predict`
- [ ] 34. Body JSON:
```json
{
  "brand": "Toyota",
  "model": "Camry",
  "model_year": 2020,
  "milage": 50000,
  "fuel_type": "Gasoline",
  "transmission": "Automatic",
  "accident": "No",
  "clean_title": "Yes"
}
```
- [ ] 35. Response sukses (HTTP 200) dengan:
```json
{
  "success": true,
  "data": {
    "predicted_price": 285000000,
    "price_low": 270000000,
    "price_high": 300000000,
    "currency": "IDR"
  }
}
```

---

### Hasil yang Diharapkan:

| No | Checkpoint | Ekspektasi |
|----|-----------|------------|
| 1 | Dropdown Merek | Terisi otomatis dari API `/car-price/form-options` |
| 2 | Model dropdown | Update otomatis saat Merek dipilih |
| 3 | Tahun Produksi | Dropdown 30 tahun terakhir |
| 4 | Submit form | Loading overlay muncul |
| 5 | Hasil estimasi | 3 card harga tampil (Low, Mid, High) |
| 6 | Format mata uang | IDR (Rupiah Indonesia) |
| 7 | Badge Rekomendasi | Muncul di kartu tengah (Harga Wajar) |
| 8 | Tombol Coba Lagi | Form di-reset, hasil disembunyikan |
| 9 | Tombol Booking Inspeksi | Navigasi ke halaman inspeksi |
| 10 | Fallback offline | Data tetap bisa disubmit pakai fallback JS |
| 11 | Validasi browser | Required fields tidak bisa kosong |

---

### Catatan Teknis:

| Komponen | Detail |
|----------|--------|
| **Endpoint API** | `GET /api/car-price/form-options` → opsi form |
| **Endpoint API** | `POST /api/car-price/predict` → hasil prediksi |
| **Bahasa ML** | Python Flask service (port 5000) |
| **Currency** | IDR (Indonesian Rupiah) |
| **Format harga** | `Intl.NumberFormat` dengan `maximumFractionDigits: 0` |
| **Fallback** | Jika API offline, pakai data hardcoded di `price-estimation.js` |
| **Fuel Types** | Gasoline, Diesel, Electric, Hybrid |
| **Transmissions** | Automatic, Manual, Other |

---

*Dokumen ini digunakan untuk verifikasi fungsionalitas sistem OTOMAN*
*Tanggal testing: ____________________*
*Tester: ____________________*
