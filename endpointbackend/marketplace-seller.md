# Endpoint Backend untuk Seller Marketplace OTOMAN

## Deskripsi Fitur

Seller marketplace memungkinkan penjual mendaftarkan kendaraan mereka untuk dijual. Setelah seller bayar biaya inspeksi dan inspeksi approve oleh admin, listing akan dipublish dan visible ke buyers.

---

## Flow Seller Marketplace

```
Seller Login
    ↓
Step 1: Detail Kendaraan
    ↓
Step 2: Jadwal & Lokasi Inspeksi
    ↓
Step 3: Harga Jual
    ↓
Step 4: Preview / Summary
    ↓
Step 5: Pembayaran (Inspeksi + Platform Fee)
    ↓
Listing Submitted → Status: "pending"
    ↓
Admin assign inspector
    ↓
Inspeksi selesai → Hasil: "approved" / "rejected"
    ↓
Admin review:
  → Approved → Published (visible ke buyers)
  → Rejected → Not published + alasan ke seller
```

---

## Endpoints yang Dibutuhkan

### 1. GET /api/marketplace/seller/listings

**Daftar listing milik seller yang login**

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |
| status | string | No | - | Filter: pending, approved, rejected |

**Response:**
```json
{
  "message": "OK",
  "data": {
    "listings": [
      {
        "id": 1,
        "order_code": "MKT-ABC123",
        "vehicle_brand": "Toyota",
        "vehicle_model": "Fortuner GR",
        "vehicle_year": 2022,
        "license_plate": "B 1234 XYZ",
        "mileage": 20000,
        "vehicle_price": 385000000,
        "listing_price_display": "Rp 385.000.000",
        "thumbnail_url": "https://.../fortuner.jpg",
        "status": "pending",
        "status_label": "Menunggu Inspeksi",
        "inspection_result": null,
        "created_at": "2026-03-01T10:30:00Z",
        "updated_at": "2026-03-01T10:30:00Z"
      },
      {
        "id": 2,
        "order_code": "MKT-DEF456",
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
        "inspection_result": "approve",
        "created_at": "2026-02-25T09:00:00Z",
        "updated_at": "2026-03-02T14:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total": 15,
      "per_page": 10
    }
  }
}
```

---

### 2. POST /api/marketplace/seller/listings

**Submit listing baru (setelah payment berhasil)**

**Request Body:**
```json
{
  "vehicle_brand": "Toyota",
  "vehicle_model": "Fortuner GR",
  "vehicle_year": 2022,
  "license_plate": "B 1234 XYZ",
  "vin": "MHABC123456789",
  "machine_number": "1GD-1234567",
  "mileage": 20000,
  "transmission": "Automatic",
  "fuel_type": "Diesel",
  "exterior_color": "Hitam",
  "interior_color": "Hitam",
  "inspection_date": "2026-03-10",
  "inspection_time": "09:00-11:00",
  "province": "DKI Jakarta",
  "city": "Jakarta Selatan",
  "address": "Jl. Sudirman No. 123",
  "contact_phone": "081234567890",
  "vehicle_price": 385000000,
  "payment_method": "bca_va",
  "payment_proof_url": "https://.../bukti-bayar.jpg",
  "notes": "Body mulus, mesin halus"
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| vehicle_brand | string | Yes | Merek kendaraan |
| vehicle_model | string | Yes | Model kendaraan |
| vehicle_year | integer | Yes | Tahun produksi |
| license_plate | string | Yes | Nomor plat |
| vin | string | No | Nomor VIN |
| machine_number | string | No | Nomor mesin |
| mileage | integer | Yes | Jarak tempuh (km) |
| transmission | string | Yes | Automatic / Manual |
| fuel_type | string | Yes | Gasoline / Diesel / Electric / Hybrid |
| exterior_color | string | No | Warna exterior |
| interior_color | string | No | Warna interior |
| inspection_date | date | Yes | Tanggal inspeksi (min H+2) |
| inspection_time | string | Yes | Waktu: "09:00-11:00" |
| province | string | Yes | Provinsi |
| city | string | Yes | Kota |
| address | string | Yes | Alamat lengkap |
| contact_phone | string | Yes | No. HP |
| vehicle_price | integer | Yes | Harga jual kendaraan |
| payment_method | string | Yes | Metode pembayaran |
| payment_proof_url | string | No | URL bukti transfer |
| notes | string | No | Catatan |

**Response:**
```json
{
  "message": "Listing berhasil submitted",
  "data": {
    "id": 5,
    "order_code": "MKT-XYZ789",
    "status": "pending",
    "status_label": "Menunggu Inspeksi",
    "inspection_fee": 350000,
    "platform_fee": 6500,
    "total_payment": 356500,
    "payment_deadline": "2026-03-03T23:59:00Z"
  }
}
```

---

### 3. GET /api/marketplace/seller/listings/{id}

**Detail listing milik seller**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "order_code": "MKT-ABC123",
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
      "location": "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta",
      "contact_phone": "081234567890",
      "inspector_name": null,
      "status": "pending"
    },
    "pricing": {
      "vehicle_price": 385000000,
      "vehicle_price_display": "Rp 385.000.000",
      "inspection_fee": 350000,
      "platform_fee": 6500,
      "total": 385356500,
      "total_display": "Rp 385.356.500"
    },
    "status": "pending",
    "status_label": "Menunggu Inspeksi",
    "payment": {
      "method": "BCA Virtual Account",
      "proof_url": "https://.../bukti-bayar.jpg",
      "paid_at": "2026-03-01T10:35:00Z"
    },
    "notes": "Body mulus, mesin halus",
    "inspection_result": null,
    "admin_notes": null,
    "created_at": "2026-03-01T10:30:00Z",
    "updated_at": "2026-03-01T10:30:00Z"
  }
}
```

---

### 4. PUT /api/marketplace/seller/listings/{id}

**Update listing (seller bisa edit selama status = pending)**

**Request Body:**
```json
{
  "vehicle_model": "Fortuner GR Sport",
  "mileage": 21000,
  "vehicle_price": 380000000,
  "inspection_date": "2026-03-12",
  "inspection_time": "13:00-15:00",
  "notes": "Updated mileage after 1 month"
}
```

**Response:**
```json
{
  "message": "Listing berhasil diupdate",
  "data": { ... }
}
```

**Error (jika status bukan pending):**
```json
{
  "message": "Listing tidak bisa diedit",
  "errors": { "status": ["Listing sudah diproses, tidak bisa diedit"] }
}
```

---

### 5. DELETE /api/marketplace/seller/listings/{id}

**Hapus listing (seller bisa hapus selama status = pending)**

**Response:**
```json
{
  "message": "Listing berhasil dihapus"
}
```

---

### 6. GET /api/marketplace/seller/payment-methods

**Daftar metode pembayaran untuk listing seller**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "payment_methods": [
      { "id": "bca_va", "name": "BCA Virtual Account", "code": "BCA" },
      { "id": "bni_va", "name": "BNI Virtual Account", "code": "BNI" },
      { "id": "bri_va", "name": "BRI Virtual Account", "code": "BRI" },
      { "id": "mandiri_va", "name": "Mandiri Virtual Account", "code": "MANDIRI" },
      { "id": "ovo", "name": "OVO", "code": "OVO" },
      { "id": "dana", "name": "DANA", "code": "DANA" },
      { "id": "shopeepay", "name": "ShopeePay", "code": "SHOPEEPAY" }
    ],
    "pricing": {
      "inspection_fee": 350000,
      "platform_fee": 6500,
      "total": 356500,
      "total_display": "Rp 356.500"
    }
  }
}
```

---

### 7. GET /api/marketplace/seller/vehicles/form-options

**Dropdown options untuk form (brand, model, dll)**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "brands": ["Toyota", "Honda", "BMW", "Mercedes-Benz", ...],
    "transmissions": ["Automatic", "Manual"],
    "fuel_types": ["Gasoline", "Diesel", "Electric", "Hybrid"],
    "colors": ["Hitam", "Putih", "Silver", "Abu-abu", "Merah", "Biru", ...],
    "provinces": ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", ...]
  }
}
```

---

## Status Listing

| Status | Label | Deskripsi |
|--------|-------|-----------|
| `pending` | Menunggu Inspeksi | Seller sudah submit & bayar, menunggu jadwal inspeksi |
| `scheduled` | Inspeksi Terjadwal | Admin sudah assign inspector |
| `in_progress` | Inspeksi Berlangsung | Inspector sedang inspeksi |
| `approved` | Dipublikasi | Listing approved admin, visible ke buyers |
| `rejected` | Ditolak | Listing ditolak admin, alasan di `admin_notes` |
| `sold` | Terjual | Kendaraan sudah terjual |
| `expired` | Kadaluarsa | Listing expired (optional) |

---

## Ringkasan Endpoint Seller

| Endpoint | Method | Auth | Priority |
|----------|--------|------|----------|
| `GET /api/marketplace/seller/listings` | GET | Yes (user) | HIGH |
| `POST /api/marketplace/seller/listings` | POST | Yes (user) | HIGH |
| `GET /api/marketplace/seller/listings/{id}` | GET | Yes (user) | HIGH |
| `PUT /api/marketplace/seller/listings/{id}` | PUT | Yes (user) | HIGH |
| `DELETE /api/marketplace/seller/listings/{id}` | DELETE | Yes (user) | MEDIUM |
| `GET /api/marketplace/seller/payment-methods` | GET | Yes (user) | MEDIUM |
| `GET /api/marketplace/seller/vehicles/form-options` | GET | Yes (user) | MEDIUM |

---

## Frontend Files

| Halaman | File | Endpoint yang Dipakai |
|---------|------|----------------------|
| Pasang Iklan | `frontend/marketplace-listing.html` | Semua endpoint seller |
| Iklan Saya | `frontend/dashboard/dashboard.html` | `GET /api/marketplace/seller/listings` |
| Detail Listing Saya | Via dashboard | `GET /api/marketplace/seller/listings/{id}` |
