# Endpoint Backend untuk Halaman Semua Inspeksi (Admin)

## Fitur yang Diperlukan

| No | Fitur | Keterangan |
|----|-------|-------------|
| 1 | Lihat daftar inspeksi | Dengan pagination, filter status, search |
| 2 | Lihat detail inspeksi | Including payment details & uploaded files |
| 3 | Assign inspector | Pilih inspector, tentukan jadwal |
| 4 | Update status | Ubah status (tanpa button edit, via modal) |
| 5 | Email notification | Kirim email saat status completed/rejected |

---

## Endpoints yang Dibutuhkan

### 1. GET /api/admin/inspections

**Daftar semua inspeksi dengan pagination, filter, dan search**

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |
| status | string | No | - | Filter: pending, in_progress, completed, rejected |
| search | string | No | - | Search: nama user, brand, model, plat |

**Response:**
```json
{
  "inspections": [
    {
      "id": 1,
      "order_code": "INS-ABC123",
      "user": { "id": 1, "name": "Ahmad Wijaya" },
      "vehicle_brand": "Toyota",
      "vehicle_model": "Avanza",
      "vehicle_year": 2021,
      "license_plate": "B 1234 ABC",
      "location": "DKI Jakarta, Jakarta Selatan",
      "inspection_date": "2026-03-05",
      "status": "pending",
      "payment_status": "paid",
      "payment_method": "bank_transfer",
      "price": 350000,
      "mechanic_id": null,
      "created_at": "2026-03-01 10:30:00"
    },
    {
      "id": 2,
      "order_code": "INS-DEF456",
      "user": { "id": 2, "name": "Siti Nurhaliza" },
      "vehicle_brand": "Honda",
      "vehicle_model": "Civic",
      "vehicle_year": 2020,
      "license_plate": "D 5678 DEF",
      "location": "Jawa Barat, Bandung",
      "inspection_date": "2026-03-04",
      "status": "in_progress",
      "payment_status": "paid",
      "mechanic_id": 1,
      "mechanic_name": "Budi Teknisi",
      "scheduled_date": "2026-03-04",
      "scheduled_time": "09:00-11:00",
      "created_at": "2026-03-01 11:45:00"
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

### 2. GET /api/admin/inspections/{id}

**Detail inspeksi lengkap**

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
  "address": "Jl. Sudirman No. 123, Jakarta Selatan",
  "contact_phone": "081234567890",
  "price": 350000,
  "payment_method": "bank_transfer",
  "payment_status": "paid",
  "payment_proof_url": "https://.../bukti-bayar.jpg",
  "payment_proof_path": "/storage/payment_proofs/bukti-bayar.jpg",
  "paid_at": "2026-03-01 10:35:00",
  "mechanic_id": 1,
  "mechanic_name": "Budi Teknisi",
  "mechanic_phone": "081987654321",
  "scheduled_date": "2026-03-05",
  "scheduled_time": "09:00-11:00",
  "status": "pending",
  "admin_notes": null,
  "created_at": "2026-03-01 10:30:00",
  "updated_at": "2026-03-01 10:30:00"
}
```

---

### 3. POST /api/admin/inspections/{id}/assign

**Assign inspector ke inspeksi**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Request Body:**
```json
{
  "mechanic_id": 1,
  "scheduled_date": "2026-03-05",
  "scheduled_time": "09:00-11:00",
  "notes": "Catatan untuk inspector"
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| mechanic_id | integer | Yes | ID mechanic |
| scheduled_date | date | Yes | Tanggal jadwal |
| scheduled_time | string | Yes | Waktu: "09:00-11:00" |
| notes | string | No | Catatan |

**Response:**
```json
{
  "message": "Inspector berhasil di-assign",
  "inspection": {
    "id": 1,
    "status": "in_progress",
    "mechanic": {
      "id": 1,
      "name": "Budi Teknisi",
      "phone": "081987654321",
      "scheduled_date": "2026-03-05",
      "scheduled_time": "09:00-11:00"
    },
    "updated_at": "2026-03-05 14:30:00"
  }
}
```

---

### 4. PUT /api/admin/inspections/{id}/status

**Update status + optional email notification**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Inspeksi selesai, mobil dalam kondisi baik",
  "send_email": true
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | pending, in_progress, completed, rejected |
| notes | string | No | Catatan admin |
| send_email | boolean | No | Kirim email (wajib jika status completed/rejected) |

**Response:**
```json
{
  "message": "Status berhasil diupdate",
  "email_sent": true,
  "inspection": {
    "id": 1,
    "status": "completed",
    "admin_notes": "Inspeksi selesai",
    "updated_at": "2026-03-05 14:30:00"
  }
}
```

**Error (send_email tidak dikirim untuk completed/rejected):**
```json
{
  "message": "Email notification wajib untuk status completed/rejected",
  "errors": {
    "send_email": ["Wajib mengirim email untuk status ini"]
  }
}
```

---

### 5. GET /api/admin/inspections/{id}/report

**Download laporan PDF**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Response:** File PDF
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="laporan-inspeksi-INS-ABC123.pdf"
```

---

### 6. GET /api/admin/mechanics

**Daftar inspector yang tersedia**

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| area | string | No | Filter area |

**Response:**
```json
{
  "mechanics": [
    { "id": 1, "name": "Budi Teknisi", "phone": "081987654321", "area": "Jakarta" },
    { "id": 2, "name": "Joko Mechanic", "phone": "081555555555", "area": "Bandung" },
    { "id": 3, "name": "Asep Service", "phone": "081333333333", "area": "Surabaya" }
  ]
}
```

---

## Ringkasan

| Endpoint | Method | Priority |
|----------|--------|----------|
| `/api/admin/inspections` | GET | HIGH |
| `/api/admin/inspections/{id}` | GET | HIGH |
| `/api/admin/inspections/{id}/assign` | POST | HIGH |
| `/api/admin/inspections/{id}/status` | PUT | HIGH |
| `/api/admin/inspections/{id}/report` | GET | MEDIUM |
| `/api/admin/mechanics` | GET | MEDIUM |

**Catatan:**
- Semua endpoint perlu middleware: `auth:sanctum` + `admin`
- Email wajib untuk status: completed, rejected
- Saat assign → status auto menjadi `in_progress`