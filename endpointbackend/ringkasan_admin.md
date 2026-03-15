# Analisis Backend untuk Dashboard Admin - Ringkasan

## Frontend Expected Endpoints

Dashboard admin memanggil endpoint berikut (dari dashboard-admin.js):

| No | Endpoint | Method | Keterangan |
|----|----------|--------|------------|
| 1 | `/api/admin/stats` | GET | Statistik dashboard (total user, inspection, pending, completed) |
| 2 | `/api/admin/inspections` | GET | Daftar inspeksi dengan pagination & filter |
| 3 | `/api/admin/inspections/{id}` | GET | Detail inspeksi |
| 4 | `/api/admin/inspections/{id}/status` | PUT | Update status inspeksi |
| 5 | `/api/admin/users` | GET | Daftar user dengan pagination & filter |
| 6 | `/api/admin/users/{id}` | GET | Detail user |
| 7 | `/api/admin/inspections/{id}/report` | GET | Download laporan inspeksi |

---

## Status Backend: TIDAK ADA ❌

**Tidak ada satupun endpoint di atas** yang tersedia di backend.

### routes/api.php saat ini:
```php
// AUTH
Route::post('auth/register', ...)
Route::post('auth/login', ...)
Route::post('auth/logout', ...)
Route::get('auth/me', ...)

// INSPECTIONS
Route::post('inspections', ...)  // dari user
Route::get('inspections', ...)   // dari user

// ADMIN? TIDAK ADA!
```

---

## Detail Endpoint & Response

### 1. GET /api/admin/stats

**Request:** Tidak ada

**Query Parameters:** Tidak ada

**Response:**
```json
{
  "total_users": 12,
  "total_inspections": 48,
  "pending_inspections": 8,
  "completed_inspections": 35,
  "status_breakdown": {
    "pending": 8,
    "in_progress": 5,
    "completed": 35,
    "rejected": 0
  },
  "monthly_inspections": {
    "Jan": 5,
    "Feb": 12,
    "Mar": 15
  }
}
```

---

### 2. GET /api/admin/inspections

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Default: 1 |
| limit | integer | No | Default: 10 |
| status | string | No | pending, in_progress, completed, rejected |
| search | string | No | Search by user name, vehicle brand/model, license plate |

**Response:**
```json
{
  "inspections": [
    {
      "id": 1,
      "order_code": "INS-ABC123",
      "user": {
        "id": 1,
        "name": "Ahmad Wijaya"
      },
      "vehicle_type": "mobil",
      "vehicle_brand": "Toyota",
      "vehicle_model": "Avanza",
      "vehicle_year": 2021,
      "license_plate": "B 1234 ABC",
      "location": "DKI Jakarta, Jakarta Selatan",
      "inspection_date": "2026-03-05",
      "status": "pending",
      "created_at": "2026-03-01 10:30:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total": 25,
    "per_page": 10
  }
}
```

---

### 3. GET /api/admin/inspections/{id}

**Request:** Tidak ada

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Response:**
```json
{
  "id": 1,
  "order_code": "INS-ABC123",
  "user": {
    "id": 1,
    "name": "Ahmad Wijaya",
    "email": "ahmad@example.com",
    "phone": "081234567890"
  },
  "vehicle_type": "mobil",
  "vehicle_brand": "Toyota",
  "vehicle_model": "Avanza",
  "vehicle_year": 2021,
  "license_plate": "B 1234 ABC",
  "mileage": 45000,
  "condition": "good",
  "notes": "Mobil terawat, body mulus, mesin halus",
  "inspection_date": "2026-03-05",
  "inspection_time": "09:00-11:00",
  "province": "DKI Jakarta",
  "city": "Jakarta Selatan",
  "address": "Jl. Sudirman No. 123",
  "contact_phone": "081234567890",
  "price": 350000,
  "status": "pending",
  "admin_notes": null,
  "payment_method": "bank_transfer",
  "payment_status": "paid",
  "payment_proof_path": "/storage/payment_proofs/file.jpg",
  "created_at": "2026-03-01 10:30:00",
  "updated_at": "2026-03-01 10:30:00"
}
```

---

### 4. PUT /api/admin/inspections/{id}/status

**Request:**
```json
{
  "status": "in_progress",
  "notes": "Catatan optional"
}
```

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Request Body:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | pending, in_progress, completed, rejected |
| notes | string | No | Catatan admin |

**Response:**
```json
{
  "message": "Status berhasil diupdate",
  "inspection": {
    "id": 1,
    "status": "in_progress",
    "admin_notes": "Catatan optional"
  }
}
```

---

### 5. GET /api/admin/users

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Default: 1 |
| limit | integer | No | Default: 10 |
| role | string | No | user, admin |
| search | string | No | Search by name, email, phone |

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Ahmad Wijaya",
      "email": "ahmad@example.com",
      "phone": "081234567890",
      "role": "user",
      "created_at": "2026-01-15 10:30:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 2,
    "total": 12,
    "per_page": 10
  }
}
```

---

### 6. GET /api/admin/users/{id}

**Request:** Tidak ada

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | User ID |

**Response:**
```json
{
  "id": 1,
  "name": "Ahmad Wijaya",
  "email": "ahmad@example.com",
  "phone": "081234567890",
  "role": "user",
  "created_at": "2026-01-15 10:30:00",
  "updated_at": "2026-01-15 10:30:00"
}
```

---

### 7. GET /api/admin/inspections/{id}/report

**Request:** Tidak ada

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Response:** File download (PDF) dengan header:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="inspection-report-INS-ABC123.pdf"
```

---

## Ringkasan Kekurangan

| Endpoint | Priority |
|----------|----------|
| `GET /api/admin/stats` | HIGH - Untuk ringkasan dashboard |
| `GET /api/admin/inspections` | HIGH - Untuk semua inspeksi |
| `PUT /api/admin/inspections/{id}/status` | HIGH - Untuk update status |
| `GET /api/admin/users` | MEDIUM - Untuk manajemen user |
| `GET /api/admin/inspections/{id}` | MEDIUM - Detail inspeksi |
| `GET /api/admin/users/{id}` | LOW - Detail user |
| `GET /api/admin/inspections/{id}/report` | LOW - Download laporan |

**Semua endpoint perlu dibuat** untuk dashboard admin berfungsi penuh dengan backend.

---

## Catatan Penting

1. Semua endpoint admin harus menggunakan middleware `auth:sanctum` dan `admin`
2. Response menggunakan format JSON (kecuali endpoint report)
3. Pagination menggunakan format Laravel standard
4. Semua timestamp menggunakan format `Y-m-d H:i:s`