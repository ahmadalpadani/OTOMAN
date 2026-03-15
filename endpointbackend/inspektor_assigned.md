# Analisis Backend untuk Halaman Inspeksi Assigned (Inspector)

## Data yang Dibutuhkan

### 1. Tabel/Model yang Relevan

**Table: inspections**
| Field | Status | Keterangan |
|-------|--------|-------------|
| id | ✅ Ada | Primary key |
| user_id | ✅ Ada | Foreign key ke users |
| order_code | ✅ Ada | Kode inspeksi |
| vehicle_type | ✅ Ada | mobil/motor |
| brand | ✅ Ada | Merek kendaraan |
| model | ✅ Ada | Model kendaraan |
| year | ✅ Ada | Tahun kendaraan |
| license_plate | ✅ Ada | Plat nomor |
| mileage | ✅ Ada | Jarak tempuh |
| condition | ✅ Ada | Kondisi (excellent/good/fair/poor) |
| notes | ✅ Ada | Catatan dari user |
| inspection_date | ✅ Ada | Tanggal inspeksi |
| inspection_time | ✅ Ada | Waktu inspeksi |
| province | ✅ Ada | Provinsi |
| city | ✅ Ada | Kota |
| address | ✅ Ada | Alamat lengkap |
| contact_phone | ✅ Ada | No. telepon customer |
| price | ✅ Ada | Harga |
| status | ✅ Ada | pending/in_progress/completed |
| payment_method | ✅ Ada | Metode pembayaran |
| payment_proof_path | ✅ Ada | Path bukti pembayaran |
| payment_status | ✅ Ada | Status pembayaran |
| mechanic_id | ✅ Ada | Foreign key ke mechanics |
| scheduled_date | ✅ Ada | Tanggal jadwal |
| scheduled_time | ✅ Ada | Waktu jadwal |
| mechanic_notes | ✅ Ada | Catatan mechanic |
| admin_notes | ✅ Ada | Catatan admin |

**Table: users**
| Field | Status | Keterangan |
|-------|--------|-------------|
| id | ✅ Ada | |
| name | ✅ Ada | |
| email | ✅ Ada | |
| phone | ✅ Ada | |

**Table: mechanics**
| Field | Status | Keterangan |
|-------|--------|-------------|
| id | ✅ Ada | |
| user_id | ✅ Ada | Link ke user |
| name | ✅ Ada | |
| phone | ✅ Ada | |
| specialization | ✅ Ada | |
| is_active | ✅ Ada | |

---

## Field yang Perlu Ditambahkan

### Table: inspections - Tambahan untuk hasil inspector

| Field | Tipe | Keterangan |
|-------|------|-------------|
| result | enum('approve', 'pending', 'reject') | Hasil inspeksi |
| body_condition | enum('excellent', 'good', 'fair', 'poor') | Kondisi body |
| engine_condition | enum('excellent', 'good', 'fair', 'poor') | Kondisi mesin |
| interior_condition | enum('excellent', 'good', 'fair', 'poor') | Kondisi interior |
| result_notes | text | Catatan hasil inspeksi |
| completed_at | timestamp | Waktu selesai inspeksi |

---

## Endpoint yang Dibutuhkan

### 1. GET /api/inspector/inspections

**Daftar inspeksi yang di-assign ke inspector yang login**

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Default: 1 |
| limit | integer | No | Default: 10 |
| status | string | No | Filter: pending, in_progress |

**Response:**
```json
{
  "inspections": [
    {
      "id": 2,
      "order_code": "INS-DEF456",
      "user": {
        "name": "Siti Nurhaliza",
        "phone": "081234567890"
      },
      "vehicle_brand": "Honda",
      "vehicle_model": "Civic",
      "vehicle_year": 2020,
      "license_plate": "D 5678 DEF",
      "city": "Bandung",
      "address": "Jl. Braga No. 45",
      "scheduled_date": "2026-03-05",
      "scheduled_time": "09:00-11:00",
      "status": "in_progress"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total": 3,
    "per_page": 10
  }
}
```

---

### 2. GET /api/inspector/inspections/{id}

**Detail inspeksi lengkap**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Response:**
```json
{
  "id": 2,
  "order_code": "INS-DEF456",
  "user": {
    "name": "Siti Nurhaliza",
    "email": "siti@example.com",
    "phone": "081234567890"
  },
  "vehicle_type": "mobil",
  "vehicle_brand": "Honda",
  "vehicle_model": "Civic",
  "vehicle_year": 2020,
  "license_plate": "D 5678 DEF",
  "mileage": 35000,
  "condition": "good",
  "notes": "Mobil terawat, ingin cek kondisi sebelum beli",
  "inspection_date": "2026-03-05",
  "inspection_time": "09:00-11:00",
  "province": "Jawa Barat",
  "city": "Bandung",
  "address": "Jl. Braga No. 45, Bandung",
  "contact_phone": "081234567890",
  "price": 350000,
  "payment_status": "paid",
  "status": "in_progress",
  "scheduled_date": "2026-03-05",
  "scheduled_time": "09:00-11:00",
  "mechanic": {
    "id": 1,
    "name": "Budi Teknisi"
  },
  "result": null,
  "body_condition": null,
  "engine_condition": null,
  "interior_condition": null,
  "result_notes": null,
  "completed_at": null,
  "created_at": "2026-03-01 11:45:00",
  "updated_at": "2026-03-05 10:00:00"
}
```

---

### 3. GET /api/inspector/inspections/history

**Riwayat inspeksi yang sudah selesai**

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Default: 1 |
| limit | integer | No | Default: 10 |

**Response:**
```json
{
  "inspections": [
    {
      "id": 5,
      "order_code": "INS-MNO789",
      "user": { "name": "Rudi Hermawan" },
      "vehicle_brand": "Toyota",
      "vehicle_model": "Fortuner",
      "vehicle_year": 2021,
      "inspection_date": "2026-03-04",
      "status": "completed",
      "result": "approve",
      "result_notes": "Mobil dalam kondisi baik",
      "completed_at": "2026-03-04 15:30:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total": 15,
    "per_page": 10
  }
}
```

---

### 4. GET /api/inspector/stats

**Statistik untuk inspector**

**Request:** Tidak ada

**Response:**
```json
{
  "assigned": 3,
  "in_progress": 2,
  "completed": 15
}
```

---

### 5. PUT /api/inspector/inspections/{id}/complete

**Selesai inspeksi + isi hasil**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Inspection ID |

**Request Body:**
```json
{
  "result": "approve",
  "body_condition": "good",
  "engine_condition": "good",
  "interior_condition": "fair",
  "notes": "Mobil dalam kondisi baik, mesin halus, body mulus"
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| result | string | Yes | approve, pending, reject |
| body_condition | string | Yes | excellent, good, fair, poor |
| engine_condition | string | Yes | excellent, good, fair, poor |
| interior_condition | string | Yes | excellent, good, fair, poor |
| notes | string | No | Catatan hasil inspeksi |

**Response:**
```json
{
  "message": "Inspeksi selesai",
  "inspection": {
    "id": 2,
    "status": "completed",
    "result": "approve",
    "body_condition": "good",
    "engine_condition": "good",
    "interior_condition": "fair",
    "result_notes": "Mobil dalam kondisi baik, mesin halus, body mulus",
    "completed_at": "2026-03-05 15:30:00"
  }
}
```

---

## Ringkasan

| Endpoint | Method | Priority |
|----------|--------|----------|
| `GET /api/inspector/inspections` | GET | HIGH - Untuk list assigned |
| `GET /api/inspector/inspections/{id}` | GET | HIGH - Untuk detail |
| `GET /api/inspector/stats` | GET | HIGH - Untuk stats cards |
| `GET /api/inspector/inspections/history` | GET | MEDIUM - Untuk riwayat |
| `PUT /api/inspector/inspections/{id}/complete` | PUT | HIGH - Untuk isi hasil |

## Middleware yang Diperlukan

- `auth:sanctum` - Untuk autentikasi
- `role:inspector` - Untuk memastikan yang login adalah inspector

## Catatan Tambahan

1. **Migration needed**: Tambahkan field baru ke table inspections
2. **Authorization**: Inspector hanya bisa melihat inspeksi yang di-assign ke mereka (berdasarkan mechanic_id yang linked ke user_id inspector)
3. **Validation**: Saat complete, status harus `in_progress` terlebih dahulu