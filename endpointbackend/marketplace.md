# Endpoint Backend untuk Marketplace OTOMAN

## Deskripsi Fitur

Marketplace OTOMAN menampilkan kendaraan bekas yang sudah melalui inspeksi dan terverifikasi. Setiap listing kendaraan memiliki laporan inspeksi lengkap.

---

## Endpoints yang Dibutuhkan

### 1. GET /api/marketplace/vehicles

**Daftar kendaraan terverifikasi untuk marketplace**

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 12 | Jumlah data per halaman |
| brand | string | No | - | Filter: nama brand (e.g. "Toyota") |
| min_price | integer | No | - | Harga minimum (IDR) |
| max_price | integer | No | - | Harga maksimum (IDR) |
| min_year | integer | No | - | Tahun minimum |
| max_year | integer | No | - | Tahun maksimum |
| search | string | No | - | Search: brand, model, plat nomor |
| sort | string | No | newest | Sort: newest, price_asc, price_desc, year_desc |

**Response:**
```json
{
  "message": "OK",
  "data": {
    "vehicles": [
      {
        "id": 1,
        "order_code": "INS-ABC123",
        "vehicle_brand": "Toyota",
        "vehicle_model": "Fortuner GR",
        "vehicle_year": 2022,
        "license_plate": "B 1234 XYZ",
        "transmission": "Automatic",
        "mileage": 20000,
        "fuel_type": "Diesel",
        "color": "Hitam",
        "location": "Jakarta Selatan",
        "province": "DKI Jakarta",
        "price": 385000000,
        "price_display": "Rp 385.000.000",
        "thumbnail_url": "https://.../fortuner.jpg",
        "inspection_summary": {
          "overall_result": "approve",
          "body_condition": "good",
          "engine_condition": "good",
          "interior_condition": "fair"
        },
        "listing_url": "/marketplace-detail.html?id=1",
        "created_at": "2026-03-01T10:30:00Z"
      },
      {
        "id": 2,
        "order_code": "INS-DEF456",
        "vehicle_brand": "Honda",
        "vehicle_model": "Civic RS",
        "vehicle_year": 2021,
        "license_plate": "D 5678 DEF",
        "transmission": "Automatic",
        "mileage": 25000,
        "fuel_type": "Gasoline",
        "color": "Putih",
        "location": "Bandung",
        "province": "Jawa Barat",
        "price": 320000000,
        "price_display": "Rp 320.000.000",
        "thumbnail_url": "https://.../civic.jpg",
        "inspection_summary": {
          "overall_result": "approve",
          "body_condition": "excellent",
          "engine_condition": "good",
          "interior_condition": "good"
        },
        "listing_url": "/marketplace-detail.html?id=2",
        "created_at": "2026-02-28T08:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total": 52,
      "per_page": 12
    },
    "filters": {
      "available_brands": ["Toyota", "Honda", "BMW", "Mercedes-Benz", "Wuling"],
      "price_range": {
        "min": 85000000,
        "max": 1200000000
      },
      "year_range": {
        "min": 2015,
        "max": 2026
      }
    }
  }
}
```

---

### 2. GET /api/marketplace/vehicles/{id}

**Detail kendaraan + laporan inspeksi lengkap**

**Path Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Vehicle / Inspection ID |

**Response:**
```json
{
  "message": "OK",
  "data": {
    "id": 1,
    "order_code": "INS-ABC123",

    "vehicle": {
      "brand": "Toyota",
      "model": "Fortuner GR",
      "year": 2022,
      "license_plate": "B 1234 XYZ",
      "vin": "MHABC123456789",
      "transmission": "Automatic",
      "fuel_type": "Diesel",
      "color": "Hitam",
      "mileage": 20000,
      "machine_number": "1GD-1234567",
      "chassis_number": "MHABC123456789"
    },

    "location": {
      "city": "Jakarta Selatan",
      "province": "DKI Jakarta",
      "full_address": "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta"
    },

    "price": {
      "vehicle_price": 385000000,
      "vehicle_price_display": "Rp 385.000.000",
      "inspection_fee": 350000,
      "platform_fee": 6500,
      "total": 385356500,
      "total_display": "Rp 385.356.500"
    },

    "images": [
      { "url": "https://.../fortuner-1.jpg", "is_primary": true },
      { "url": "https://.../fortuner-2.jpg", "is_primary": false },
      { "url": "https://.../fortuner-3.jpg", "is_primary": false }
    ],

    "seller": {
      "name": "Budi Santoso",
      "phone": "081234567890",
      "member_since": "2024-01-15",
      "total_listings": 3,
      "verified": true
    },

    "inspection_report": {
      "order_code": "INS-ABC123",
      "inspection_date": "2026-03-01",
      "completed_at": "2026-03-01T15:30:00Z",
      "inspector": "Joko Mechanic",
      "overall_result": "approve",
      "result_label": "Disetujui",
      "result_notes": "Mobil dalam kondisi baik, rekomendasi approve. Body mulus, mesin halus, interior terawat.",

      "categories": {
        "body": {
          "label": "Kondisi Body",
          "condition": "good",
          "condition_label": "Baik",
          "notes": "Body mulus tanpa goresan berarti. Cat original.",
          "score": 85
        },
        "engine": {
          "label": "Kondisi Mesin",
          "condition": "good",
          "condition_label": "Baik",
          "notes": "Mesin halus, tidak ada kebocoran oli. AC dingin.",
          "score": 88
        },
        "interior": {
          "label": "Kondisi Interior",
          "condition": "fair",
          "condition_label": "Cukup",
          "notes": "Kulit setir sedikit aus. Jok terawat.",
          "score": 72
        },
        "electrical": {
          "label": "Sistem Kelistrikan",
          "condition": "good",
          "condition_label": "Baik",
          "notes": "Semua lampu, wiper, dan aksesoris berfungsi normal.",
          "score": 90
        },
        "history": {
          "label": "Riwayat Kendaraan",
          "condition": "good",
          "condition_label": "Baik",
          "notes": "Tidak pernah banjir. Tidak pernah kecelakaan berat. Buku service lengkap.",
          "score": 95
        }
      },

      "overall_score": 86,
      "documents": [
        { "type": "stnk", "status": "ada", "notes": "STNK aktif sampai 2027" },
        { "type": "bpkb", "status": "ada", "notes": "BPKB asli tersedia" },
        { "type": "faktur", "status": "ada", "notes": "Faktur asli tersedia" },
        { "type": "pajak", "status": "lunas", "notes": "Pajak tahunan lunas" }
      ],

      "report_url": "/api/marketplace/vehicles/1/report",
      "certificate_url": "/api/marketplace/vehicles/1/certificate"
    },

    "checkout_url": "/marketplace-checkout.html?id=1",
    "related_vehicles": [
      {
        "id": 5,
        "brand": "Toyota",
        "model": "Innova Reborn",
        "year": 2021,
        "price": 320000000,
        "thumbnail_url": "https://.../innova.jpg",
        "listing_url": "/marketplace-detail.html?id=5"
      }
    ]
  }
}
```

---

### 3. GET /api/marketplace/vehicles/{id}/report

**Download PDF laporan inspeksi**

**Response:** File PDF binary
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="laporan-inspeksi-INS-ABC123.pdf"
```

---

### 4. GET /api/marketplace/vehicles/{id}/certificate

**Download sertifikat verifikasi kendaraan**

**Response:** File PDF binary
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="sertifikat-OTOMAN-INS-ABC123.pdf"
```

---

### 5. POST /api/marketplace/checkout

**Buat pesanan inspeksi dari marketplace (checkout)**

**Request Body:**
```json
{
  "vehicle_id": 1,
  "inspection_date": "2026-03-10",
  "inspection_time": "09:00-11:00",
  "contact_phone": "081234567890",
  "notes": "Mohon hubungi saya 30 menit sebelum kedatangan"
}
```

**Request Body Fields:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| vehicle_id | integer | Yes | ID kendaraan dari marketplace |
| inspection_date | date | Yes | Tanggal inspeksi (min H+2) |
| inspection_time | string | Yes | Waktu: "09:00-11:00" |
| contact_phone | string | Yes | No. HP yang bisa dihubungi |
| notes | string | No | Catatan tambahan |

**Response:**
```json
{
  "message": "Pesanan inspeksi berhasil dibuat",
  "data": {
    "inspection_id": 15,
    "order_code": "INS-XYZ789",
    "vehicle": {
      "brand": "Toyota",
      "model": "Fortuner GR",
      "year": 2022
    },
    "price": {
      "inspection_fee": 350000,
      "platform_fee": 6500,
      "total": 356500,
      "total_display": "Rp 356.500"
    },
    "payment_methods": [
      { "id": "bca_va", "name": "BCA Virtual Account", "code": "BCA" },
      { "id": "bni_va", "name": "BNI Virtual Account", "code": "BNI" },
      { "id": "bri_va", "name": "BRI Virtual Account", "code": "BRI" },
      { "id": "mandiri_va", "name": "Mandiri Virtual Account", "code": "MANDIRI" },
      { "id": "ovo", "name": "OVO", "code": "OVO" },
      { "id": "dana", "name": "DANA", "code": "DANA" },
      { "id": "shopeepay", "name": "ShopeePay", "code": "SHOPEEPAY" }
    ],
    "payment_deadline": "2026-03-08T23:59:00Z",
    "checkout_url": "/marketplace-checkout.html?inspection_id=15"
  }
}
```

---

### 6. GET /api/marketplace/payment-methods

**Daftar metode pembayaran yang tersedia**

**Response:**
```json
{
  "message": "OK",
  "data": {
    "payment_methods": [
      {
        "id": "bca_va",
        "name": "BCA Virtual Account",
        "code": "BCA",
        "type": "virtual_account",
        "icon": "/images/payment/bca.png",
        "description": "Transfer via ATM / m-Banking BCA"
      },
      {
        "id": "bni_va",
        "name": "BNI Virtual Account",
        "code": "BNI",
        "type": "virtual_account",
        "icon": "/images/payment/bni.png",
        "description": "Transfer via ATM / m-Banking BNI"
      },
      {
        "id": "bri_va",
        "name": "BRI Virtual Account",
        "code": "BRI",
        "type": "virtual_account",
        "icon": "/images/payment/bri.png",
        "description": "Transfer via ATM / m-Banking BRI"
      },
      {
        "id": "mandiri_va",
        "name": "Mandiri Virtual Account",
        "code": "MANDIRI",
        "type": "virtual_account",
        "icon": "/images/payment/mandiri.png",
        "description": "Transfer via ATM / m-Banking Mandiri"
      },
      {
        "id": "ovo",
        "name": "OVO",
        "code": "OVO",
        "type": "ewallet",
        "icon": "/images/payment/ovo.png",
        "description": "Bayar dengan aplikasi OVO"
      },
      {
        "id": "dana",
        "name": "DANA",
        "code": "DANA",
        "type": "ewallet",
        "icon": "/images/payment/dana.png",
        "description": "Bayar dengan aplikasi DANA"
      },
      {
        "id": "shopeepay",
        "name": "ShopeePay",
        "code": "SHOPEEPAY",
        "type": "ewallet",
        "icon": "/images/payment/shopeepay.png",
        "description": "Bayar dengan ShopeePay"
      }
    ]
  }
}
```

---

## Ringkasan Endpoint

| Endpoint | Method | Auth | Priority |
|----------|--------|------|----------|
| `GET /api/marketplace/vehicles` | GET | No | HIGH |
| `GET /api/marketplace/vehicles/{id}` | GET | No | HIGH |
| `POST /api/marketplace/checkout` | POST | Yes (user) | HIGH |
| `GET /api/marketplace/payment-methods` | GET | No | MEDIUM |
| `GET /api/marketplace/vehicles/{id}/report` | GET | No | MEDIUM |
| `GET /api/marketplace/vehicles/{id}/certificate` | GET | No | LOW |

---

## Catatan Teknis

1. **Thumbnail & Images** — Gunakan `storage/app/public/vehicle_images/` atau CDN
2. **Report PDF** — Generate menggunakan DomPDF atau similar library
3. **Certificate PDF** — Generate dengan logo OTOMAN + QR code untuk verifikasi
4. **Payment Gateway** — Untuk MVP bisa pakai midtrans/sandbox, atau mock payment flow
5. **Public endpoints** — Listing & detail vehicle bisa diakses tanpa login (public)
6. **Protected endpoints** — Checkout & payment confirmation butuh auth (user)

---

## Frontend Files

| Halaman | File | Endpoint yang Dipakai |
|---------|------|----------------------|
| Landing (Marketplace Section) | `frontend/index.html` | `GET /api/marketplace/vehicles` |
| Marketplace Detail | `frontend/marketplace-detail.html` | `GET /api/marketplace/vehicles/{id}` |
| Marketplace Checkout | `frontend/marketplace-checkout.html` | `POST /api/marketplace/checkout`, `GET /api/marketplace/payment-methods` |
