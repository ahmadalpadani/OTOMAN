# Endpoint Backend untuk Admin Marketplace OTOMAN

## Deskripsi Fitur

Admin mengelola listing marketplace: review listing baru, assign inspector, approve/reject listing, dan statistik marketplace.

---

## Flow Admin Marketplace

```
Listing Submitted (Seller)
    ↓
Admin Dashboard — Daftar Listing Pending
    ↓
Admin Review Detail Listing
  → Lihat data kendaraan + payment proof seller
    ↓
Assign Inspector (untuk listing pending)
    ↓
Inspeksi Selesai → Hasil Approve/Reject
    ↓
Admin Review Hasil Inspeksi
  → APPROVE → Listing go live (visible ke buyers)
  → REJECT → Not published + alasan ke seller
    ↓
Admin bisa arsipkan / unpublish listing
```

---

## Endpoints yang Dibutuhkan

### 1. GET /api/admin/marketplace/listings

**Daftar semua listing marketplace**

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 15 | Jumlah data per halaman |
| status | string | No | - | Filter: pending, scheduled, in_progress, approved, rejected |
| search | string | No | - | Search: kode, brand, model, plat |

**Response:**
```json
{
  "message": "OK",
  "data": {
    "listings": [
      {
        "id": 1,
        "order_code": "MKT-ABC123",
        "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com", "phone": "081234567890" },
        "vehicle_brand": "Toyota",
        "vehicle_model": "Fortuner GR",
        "vehicle_year": 2022,
        "license_plate": "B 1234 XYZ",
        "mileage": 20000,
        "vehicle_price": 385000000,
        "listing_price_display": "Rp 385.000.000",
        "thumbnail_url": "https://.../fortuner.jpg",
        "status": "pending",
        "status_label": "Menunggu Review",
        "payment_status": "paid",
        "payment_method": "BCA Virtual Account",
        "payment_proof_url": "https://.../bukti-bayar.jpg",
        "inspection_result": null,
        "created_at": "2026-03-01T10:30:00Z"
      },
      {
        "id": 2,
        "order_code": "MKT-DEF456",
        "user": { "id": 2, "name": "Siti Rahayu", "email": "siti@example.com", "phone": "081298765432" },
        "vehicle_brand": "Honda",
        "vehicle_model": "Civic RS",
        "vehicle_year": 2021,
        "license_plate": "D 5678 DEF",
        "mileage": 25000,
        "vehicle_price": 320000000,
        "listing_price_display": "Rp 320.000.000",
        "thumbnail_url": "https://.../civic.jpg",
        "status": "approved",
        "status_label": "Dipublikasi",
        "payment_status": "paid",
        "inspection_result": "approve",
        "inspector_name": "Joko Mechanic",
        "created_at": "2026-02-25T09:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total": 42,
      "per_page": 15
    }
  }
}
```

---

### 2. GET /api/admin/marketplace/listings/{id}

**Detail listing lengkap untuk admin review**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "order_code": "MKT-ABC123",
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890",
      "member_since": "2024-01-15",
      "total_listings": 3
    },
    "vehicle": {
      "brand": "Toyota",
      "model": "Fortuner GR",
      "year": 2022,
      "license_plate": "B 1234 XYZ",
      "vin": "MHABC123456789",
      "machine_number": "1GD-1234567",
      "mileage": 20000,
      "transmission": "Automatic",
      "fuel_type": "Diesel",
      "exterior_color": "Hitam",
      "interior_color": "Hitam"
    },
    "inspection": {
      "scheduled_date": "2026-03-10",
      "scheduled_time": "09:00-11:00",
      "province": "DKI Jakarta",
      "city": "Jakarta Selatan",
      "address": "Jl. Sudirman No. 123",
      "contact_phone": "081234567890",
      "inspector_id": null,
      "inspector_name": null,
      "inspector_phone": null,
      "status": "pending"
    },
    "pricing": {
      "vehicle_price": 385000000,
      "vehicle_price_display": "Rp 385.000.000",
      "inspection_fee": 350000,
      "platform_fee": 6500,
      "total": 385356500
    },
    "payment": {
      "method": "BCA Virtual Account",
      "proof_url": "https://.../bukti-bayar.jpg",
      "paid_at": "2026-03-01T10:35:00Z",
      "verified": true
    },
    "status": "pending",
    "status_label": "Menunggu Review",
    "notes": "Body mulus, mesin halus",
    "admin_notes": null,
    "inspection_result": null,
    "inspection_report": null,
    "created_at": "2026-03-01T10:30:00Z",
    "updated_at": "2026-03-01T10:30:00Z"
  }
}
```

---

### 3. POST /api/admin/marketplace/listings/{id}/assign

**Assign inspector ke listing (untuk listing pending → scheduled)**

**Request Body:**
```json
{
  "inspector_id": 1,
  "scheduled_date": "2026-03-10",
  "scheduled_time": "09:00-11:00"
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| inspector_id | integer | Yes | ID inspector |
| scheduled_date | date | Yes | Tanggal inspeksi |
| scheduled_time | string | Yes | Waktu: "09:00-11:00" |

**Response:**
```json
{
  "message": "Inspector berhasil di-assign",
  "data": {
    "id": 1,
    "status": "scheduled",
    "status_label": "Inspeksi Terjadwal",
    "inspector": {
      "id": 1,
      "name": "Joko Mechanic",
      "phone": "081555555555"
    },
    "scheduled_date": "2026-03-10",
    "scheduled_time": "09:00-11:00"
  }
}
```

---

### 4. POST /api/admin/marketplace/listings/{id}/approve

**Approve listing — publish ke marketplace**

**Request Body:**
```json
{
  "admin_notes": "Listing sesuai kriteria, dipublikasi"
}
```

**Response:**
```json
{
  "message": "Listing berhasil dipublikasi",
  "data": {
    "id": 1,
    "status": "approved",
    "status_label": "Dipublikasi",
    "published_at": "2026-03-10T15:30:00Z"
  }
}
```

---

### 5. POST /api/admin/marketplace/listings/{id}/reject

**Reject listing**

**Request Body:**
```json
{
  "admin_notes": "Body berkarat, mesin bermasalah. Tidak memenuhi kriteria."
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| admin_notes | string | Yes | Alasan penolakan |

**Response:**
```json
{
  "message": "Listing ditolak",
  "data": {
    "id": 1,
    "status": "rejected",
    "status_label": "Ditolak",
    "admin_notes": "Body berkarat, mesin bermasalah. Tidak memenuhi kriteria."
  }
}
```

---

### 6. POST /api/admin/marketplace/listings/{id}/unpublish

**Unpublish listing (approved → archived/expired)**

**Request Body:**
```json
{
  "admin_notes": "Kendaraan sudah terjual"
}
```

**Response:**
```json
{
  "message": "Listing berhasil di-unpublish",
  "data": {
    "id": 1,
    "status": "sold",
    "status_label": "Terjual"
  }
}
```

---

### 7. GET /api/admin/marketplace/mechanics

**Daftar inspector yang tersedia untuk assign**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "mechanics": [
      { "id": 1, "name": "Joko Mechanic", "phone": "081555555555", "area": "Jakarta" },
      { "id": 2, "name": "Budi Teknisi", "phone": "081987654321", "area": "Bandung" },
      { "id": 3, "name": "Asep Service", "phone": "081333333333", "area": "Surabaya" }
    ]
  }
}
```

---

### 8. GET /api/admin/marketplace/stats

**Statistik marketplace untuk dashboard admin**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "total": 42,
    "pending_review": 5,
    "scheduled": 3,
    "in_progress": 2,
    "approved": 28,
    "rejected": 4,
    "revenue": {
      "total_inspection_revenue": 14700000,
      "total_inspection_revenue_display": "Rp 14.700.000",
      "total_listings": 42
    },
    "recent_listings": [
      {
        "id": 42,
        "order_code": "MKT-XYZ789",
        "vehicle_brand": "Toyota",
        "vehicle_model": "Camry",
        "status": "pending",
        "created_at": "2026-03-05T10:30:00Z"
      }
    ]
  }
}
```

---

## Ringkasan Endpoint Admin Marketplace

| Endpoint | Method | Priority |
|----------|--------|----------|
| `GET /api/admin/marketplace/listings` | GET | HIGH |
| `GET /api/admin/marketplace/listings/{id}` | GET | HIGH |
| `POST /api/admin/marketplace/listings/{id}/assign` | POST | HIGH |
| `POST /api/admin/marketplace/listings/{id}/approve` | POST | HIGH |
| `POST /api/admin/marketplace/listings/{id}/reject` | POST | HIGH |
| `POST /api/admin/marketplace/listings/{id}/unpublish` | POST | MEDIUM |
| `GET /api/admin/marketplace/mechanics` | GET | MEDIUM |
| `GET /api/admin/marketplace/stats` | GET | MEDIUM |

---

## Catatan Teknis

1. Semua endpoint butuh middleware: `auth:sanctum` + `admin`
2. Saat assign inspector → status berubah dari `pending` ke `scheduled`
3. Saat approve → status berubah ke `approved` dan listing visible di marketplace
4. Saat reject → status berubah ke `rejected` + notification ke seller
5. Notification bisa via email atau in-app notification
6. Filter "pending" di dashboard admin untuk listing yang perlu segera direview
