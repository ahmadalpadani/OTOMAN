# Endpoint yang Perlu Dibuat di Backend

---

## 1. USER - Detail Inspection

### GET /api/inspections/{id}
Detail inspection berdasarkan ID.

**Header:** Authorization: Bearer {token}

**Response (200):**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "order_code": "INS-ABC123",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890"
    },
    "vehicle_type": "mobil",
    "brand": "toyota",
    "model": "Avanza",
    "year": 2021,
    "license_plate": "B 1234 ABC",
    "mileage": 50000,
    "condition": "good",
    "notes": "Body mulus, mesin halus",
    "inspection_date": "2026-03-15",
    "inspection_time": "10:00-12:00",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "address": "Jl. Sudirman No. 123",
    "contact_phone": "081234567890",
    "price": 350000,
    "payment_method": "bank_transfer",
    "payment_proof_url": "https://.../payment/xxx.pdf",
    "status": "pending",
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z"
  }
}
```

**Catatan:** Response_INCLUDE user object karena frontend membutuhkannya untuk display.

---

## 2. USER - POST Inspection (Update)

### POST /api/inspections
Buat pesanan inspeksi baru (dengan upload bukti pembayaran).

**Header:** Authorization: Bearer {token}
**Content-Type:** multipart/form-data

**Request (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vehicle_type | string | yes | "mobil" atau "motor" |
| brand | string | yes | Merek kendaraan (lower case) |
| model | string | yes | Model kendaraan |
| year | int | yes | Tahun produksi |
| license_plate | string | no | Plat nomor kendaraan |
| mileage | int | yes | Kilometer |
| condition | string | yes | "excellent", "good", "fair", "poor" |
| notes | string | no | Catatan tambahan |
| inspection_date | date | yes | Tanggal inspeksi (min H+2) |
| inspection_time | string | yes | "08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00" |
| province | string | yes | Provinsi |
| city | string | yes | Kota/Kabupaten |
| address | string | yes | Alamat lengkap |
| contact_phone | string | yes | No. HP yang dapat dihubungi |
| payment_method | string | yes | "bank_transfer" |
| payment_proof | file | yes | Bukti pembayaran (PNG/JPG/JPEG/PDF, max 2MB) |

**Response (201):**
```json
{
  "message": "Pesanan inspeksi berhasil dibuat",
  "data": {
    "id": 1,
    "order_code": "INS-ABC123",
    "user_id": 1,
    "vehicle_type": "mobil",
    "brand": "toyota",
    "model": "Avanza",
    "license_plate": "B 1234 ABC",
    "year": 2021,
    "mileage": 50000,
    "condition": "good",
    "notes": "Body mulus, mesin halus",
    "inspection_date": "2026-03-15",
    "inspection_time": "10:00-12:00",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "address": "Jl. Sudirman No. 123",
    "contact_phone": "081234567890",
    "price": 350000,
    "payment_method": "bank_transfer",
    "payment_proof_url": "uploads/payment/xxx.pdf",
    "status": "pending",
    "created_at": "2026-03-10T10:00:00Z"
  }
}
```

**Catatan:**
- Saat ini backend TIDAK menerima `payment_method` dan `payment_proof` - perlu ditambahkan
- Tambahkan `license_plate` ke fillable di Model

---

## 3. ADMIN - Stats

### GET /api/admin/stats
Get dashboard statistics (admin only).

**Header:** Authorization: Bearer {token} (role: admin)

**Response (200):**
```json
{
  "total_users": 12,
  "total_inspections": 48,
  "pending_inspections": 8,
  "completed_inspections": 35,
  "status_breakdown": {
    "pending": 5,
    "paid": 3,
    "scheduled": 2,
    "in_progress": 3,
    "completed": 35,
    "rejected": 0
  },
  "monthly_inspections": {
    "Jan": 5,
    "Feb": 12,
    "Mar": 15,
    "Apr": 8,
    "Mei": 8
  }
}
```

---

## 4. ADMIN - Inspections

### GET /api/admin/inspections
List semua inspections (admin only).

**Header:** Authorization: Bearer {token}

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | int | Halaman |
| limit | int | Jumlah per halaman |
| status | string | Filter status |
| search | string | Search kendaraan/user |

**Response (200):**
```json
{
  "inspections": [
    {
      "id": 1,
      "order_code": "INS-ABC123",
      "user": { "id": 1, "name": "John Doe" },
      "vehicle_brand": "Toyota",
      "vehicle_model": "Avanza",
      "vehicle_year": 2021,
      "license_plate": "B 1234 ABC",
      "location": "DKI Jakarta, Jakarta Selatan",
      "inspection_date": "2026-03-15",
      "status": "paid",
      "created_at": "2026-03-10T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total": 48
  }
}
```

---

### GET /api/admin/inspections/{id}
Detail inspection lengkap (admin only).

**Header:** Authorization: Bearer {token}

**Response (200):**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "order_code": "INS-ABC123",
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "phone": "081234567890" },
    "vehicle_type": "mobil",
    "vehicle_brand": "Toyota",
    "vehicle_model": "Avanza",
    "vehicle_year": 2021,
    "license_plate": "B 1234 ABC",
    "mileage": 50000,
    "condition": "good",
    "notes": "Body mulus, mesin halus",
    "inspection_date": "2026-03-15",
    "inspection_time": "10:00-12:00",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "address": "Jl. Sudirman No. 123",
    "contact_phone": "081234567890",
    "price": 350000,
    "payment_method": "bank_transfer",
    "payment_proof_url": "https://.../payment/xxx.pdf",
    "status": "paid",
    "mechanic": { "id": 1, "name": "Pak Budi" },
    "scheduled_date": "2026-03-15",
    "scheduled_time": "10:00",
    "admin_notes": null,
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z"
  }
}
```

---

### PUT /api/admin/inspections/{id}/assign
Assign teknisi/mekanik ke inspection (admin only).

**Header:** Authorization: Bearer {token}

**Request:**
```json
{
  "mechanic_id": 1,
  "scheduled_date": "2026-03-15",
  "scheduled_time": "10:00"
}
```

**Response (200):**
```json
{
  "message": "Teknisi berhasil ditugaskan",
  "data": {
    "id": 1,
    "status": "scheduled",
    "mechanic_id": 1,
    "scheduled_date": "2026-03-15",
    "scheduled_time": "10:00",
    "updated_at": "2026-03-10T10:00:00Z"
  }
}
```

---

### PUT /api/admin/inspections/{id}/status
Update status inspection (admin only).

**Header:** Authorization: Bearer {token}

**Request:**
```json
{
  "status": "completed",
  "notes": "Inspeksi selesai, kondisi bagus"
}
```

**Response (200):**
```json
{
  "message": "Status berhasil diupdate",
  "data": {
    "id": 1,
    "status": "completed",
    "admin_notes": "Inspeksi selesai, kondisi bagus",
    "updated_at": "2026-03-10T10:00:00Z"
  }
}
```

---

## 5. ADMIN - Users

### GET /api/admin/users
List semua users (admin only).

**Header:** Authorization: Bearer {token}

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | int | Halaman |
| limit | int | Jumlah per halaman |
| role | string | Filter role (user/admin) |
| search | string | Search name/email |

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "role": "user",
      "created_at": "2026-03-10T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 2,
    "total": 12
  }
}
```

---

### GET /api/admin/users/{id}
Detail user (admin only).

**Header:** Authorization: Bearer {token}

**Response (200):**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "user",
    "inspections_count": 5,
    "created_at": "2026-03-10T10:00:00Z"
  }
}
```

---

## 6. ADMIN - Mechanics

### GET /api/admin/mechanics
List semua teknisi/mekanik (admin only).

**Header:** Authorization: Bearer {token}

**Response (200):**
```json
{
  "mechanics": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "phone": "081234567890",
      "specialization": "Mesin & Body",
      "is_active": true
    }
  ]
}
```

---

### POST /api/admin/mechanics
Tambah teknisi baru (admin only).

**Header:** Authorization: Bearer {token}

**Request:**
```json
{
  "name": "Budi Santoso",
  "phone": "081234567890",
  "specialization": "Mesin & Body"
}
```

**Response (201):**
```json
{
  "message": "Teknisi berhasil ditambahkan",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "phone": "081234567890",
    "specialization": "Mesin & Body",
    "is_active": true
  }
}
```

---

## 7. Database Updates

### Tabel inspections - Tambah Kolom

```sql
-- Kolom untuk payment
ALTER TABLE inspections ADD COLUMN payment_method VARCHAR(50) DEFAULT 'bank_transfer';
ALTER TABLE inspections ADD COLUMN payment_proof_path VARCHAR(255) NULL;
ALTER TABLE inspections ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';

-- Kolom untuk license plate (sudah ada di migration tapi perlu dicek)
ALTER TABLE inspections ADD COLUMN license_plate VARCHAR(20) NULL;

-- Kolom untuk assign teknisi
ALTER TABLE inspections ADD COLUMN mechanic_id BIGINT UNSIGNED NULL;
ALTER TABLE inspections ADD COLUMN scheduled_date DATE NULL;
ALTER TABLE inspections ADD COLUMN scheduled_time TIME NULL;
ALTER TABLE inspections ADD COLUMN mechanic_notes TEXT NULL;

-- Update status enum (cek migration sebelumnya)
-- Pastikan status sudah include: pending, paid, scheduled, in_progress, completed, rejected
```

### Tabel mechanics (BARU)

```sql
CREATE TABLE mechanics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Model Updates

```php
// app/Models/Inspection.php - update fillable
protected $fillable = [
    'user_id',
    'order_code',
    'vehicle_type',
    'brand',
    'model',
    'year',
    'license_plate',        // TAMBAH
    'mileage',
    'condition',
    'notes',
    'inspection_date',
    'inspection_time',
    'province',
    'city',
    'address',
    'contact_phone',
    'price',
    'status',
    'payment_method',       // TAMBAH
    'payment_proof_path', // TAMBAH
    'mechanic_id',         // TAMBAH
    'scheduled_date',      // TAMBAH
    'scheduled_time',      // TAMBAH
    'mechanic_notes',      // TAMBAH
];
```

---

## 8. Ringkasan Endpoint yang Perlu Dibuat

| Method | Endpoint | Priority |
|--------|----------|----------|
| GET | /api/inspections/{id} | Tinggi |
| POST | /api/inspections (dengan file upload) | Tinggi |
| GET | /api/admin/stats | Tinggi |
| GET | /api/admin/inspections | Tinggi |
| GET | /api/admin/inspections/{id} | Tinggi |
| PUT | /api/admin/inspections/{id}/assign | Tinggi |
| PUT | /api/admin/inspections/{id}/status | Tinggi |
| GET | /api/admin/users | Sedang |
| GET | /api/admin/users/{id} | Sedang |
| GET | /api/admin/mechanics | Rendah |
| POST | /api/admin/mechanics | Rendah |