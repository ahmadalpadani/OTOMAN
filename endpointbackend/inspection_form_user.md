# Analisis Backend untuk Form Inspection

## Frontend Fields (dari inspection.js)

| Field | Tipe | Keterangan |
|-------|------|-------------|
| vehicle_type | string | "mobil" atau "motor" |
| brand | string | Merek kendaraan |
| model | string | Model kendaraan |
| year | integer | Tahun kendaraan |
| mileage | integer | Jarak tempuh (km) |
| condition | string | excellent/good/fair/poor |
| notes | string | Catatan tambahan |
| inspection_date | date | Tanggal inspeksi |
| inspection_time | string | Waktu inspeksi |
| province | string | Provinsi |
| city | string | Kota |
| address | string | Alamat lengkap |
| contact_phone | string | No. telepon |
| payment_method | string | "bank_transfer" |
| payment_proof | file | Bukti pembayaran (image/pdf) |

---

## Kekurangan Backend

### 1. Validasi `payment_method` tidak ada
**Location:** `laravel/app/Http/Controllers/Api/InspectionController.php:17-33`

Frontend mengirim `payment_method: "bank_transfer"` tetapi backend tidak memvalidasi field ini.

**Fix yang dibutuhkan:**
```php
'payment_method' => ['required', Rule::in(['bank_transfer', 'cash'])],
```

### 2. Validasi `payment_proof` tidak ada
**Location:** `laravel/app/Http/Controllers/Api/InspectionController.php:17-33`

Frontend mengirim file `payment_proof` tetapi backend tidak memvalidasi maupun menyimpannya.

**Fix yang dibutuhkan:**
```php
'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
```

### 3. File upload tidak disimpan
**Location:** `laravel/app/Http/Controllers/Api/InspectionController.php:38-44`

 ada validasi, file `payment_proof` tidak disimpan ke storage dan `payment_proof_path` tidak di-set di database.

**Fix yang dibutuhkan:**
```php
// Upload file
$paymentProofPath = $request->file('payment_proof')->store('payment_proofs', 'public');

// Simpan ke database
$inspection = Inspection::create([
    ...
    'payment_proof_path' => $paymentProofPath,
    'payment_status' => 'paid',
]);
```

---

## Ringkasan

| Kekurangan | Priority |
|------------|----------|
| Validasi payment_method | Medium |
| Validasi payment_proof | High |
| Simpan file payment_proof | High |

