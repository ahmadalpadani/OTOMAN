# Analisis Backend untuk Halaman Manajemen User (Admin)

## Fitur yang Diperlukan

| No | Fitur | Keterangan |
|----|-------|-------------|
| 1 | Lihat daftar user | Dengan pagination, filter role, search |
| 2 | Lihat detail user | Info lengkap user |
| 3 | Filter role | Filter: user, admin, inspector |

---

## Data yang Dibutuhkan

### Table: users (Existing)
| Field | Status | Keterangan |
|-------|--------|-------------|
| id | ✅ Ada | Primary key |
| name | ✅ Ada | Nama lengkap |
| email | ✅ Ada | Email (unique) |
| phone | ✅ Ada | Nomor telepon |
| role | ✅ Ada | user/admin/inspector |
| password | ✅ Ada | Hashed |
| created_at | ✅ Ada | Timestamp |
| updated_at | ✅ Ada | Timestamp |

**Tidak perlu tambahan field** - semua sudah ada.

---

## Endpoint yang Dibutuhkan

### 1. GET /api/admin/users

**Daftar semua user dengan pagination, filter, dan search**

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |
| role | string | No | - | Filter: user, admin, inspector |
| search | string | No | - | Search: name, email, phone |

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
    },
    {
      "id": 5,
      "name": "Admin OTOMAN",
      "email": "admin@otoman.com",
      "phone": null,
      "role": "admin",
      "created_at": "2026-01-01 08:00:00"
    },
    {
      "id": 6,
      "name": "Budi Teknisi",
      "email": "budi@otoman.com",
      "phone": "081987654321",
      "role": "inspector",
      "created_at": "2026-02-01 09:00:00"
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

### 2. GET /api/admin/users/{id}

**Detail user berdasarkan ID**

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

## Mock Data untuk Frontend

### Daftar User (LoadAllUsers)

```javascript
// Mock data untuk halaman manajemen user
const mockUsers = [
    // User (customer)
    { id: 1, name: 'Ahmad Wijaya', email: 'ahmad@example.com', phone: '081234567890', role: 'user', created_at: '2026-01-15 10:30:00' },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '081234567891', role: 'user', created_at: '2026-01-20 14:15:00' },
    { id: 3, name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567892', role: 'user', created_at: '2026-02-01 09:30:00' },
    { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', phone: '081234567893', role: 'user', created_at: '2026-02-10 11:45:00' },
    { id: 7, name: 'Rina Susilowati', email: 'rina@example.com', phone: '081234567894', role: 'user', created_at: '2026-02-15 16:20:00' },
    { id: 8, name: 'Dodi Pratama', email: 'dodi@example.com', phone: '081234567895', role: 'user', created_at: '2026-02-20 08:10:00' },
    { id: 9, name: 'Maya Sari', email: 'maya@example.com', phone: '081234567896', role: 'user', created_at: '2026-02-25 13:30:00' },
    { id: 10, name: 'Hendra Wijaya', email: 'hendra@example.com', phone: '081234567897', role: 'user', created_at: '2026-03-01 10:00:00' },

    // Admin
    { id: 5, name: 'Admin OTOMAN', email: 'admin@otoman.com', phone: null, role: 'admin', created_at: '2026-01-01 08:00:00' },

    // Inspector
    { id: 6, name: 'Budi Teknisi', email: 'budi@otoman.com', phone: '081987654321', role: 'inspector', created_at: '2026-02-01 09:00:00' },
    { id: 11, name: 'Joko Mechanic', email: 'joko@otoman.com', phone: '081555555555', role: 'inspector', created_at: '2026-02-05 10:30:00' },
    { id: 12, name: 'Asep Service', email: 'asep@otoman.com', phone: '081333333333', role: 'inspector', created_at: '2026-02-10 14:00:00' },
    { id: 13, name: 'Dedi Inspector', email: 'dedi@otoman.com', phone: '081222222222', role: 'inspector', created_at: '2026-02-15 11:20:00' },
    { id: 14, name: 'Rudi Teknisi', email: 'rudi@otoman.com', phone: '081111111111', role: 'inspector', created_at: '2026-02-20 09:45:00' },
];
```

### Detail User (ViewUser)

```javascript
// Mock detail untuk view user
const mockUserDetail = {
    id: 1,
    name: 'Ahmad Wijaya',
    email: 'ahmad@example.com',
    phone: '081234567890',
    role: 'user',
    created_at: '2026-01-15 10:30:00',
    updated_at: '2026-01-15 10:30:00'
};
```

---

## Ringkasan

| Endpoint | Method | Priority |
|----------|--------|----------|
| `GET /api/admin/users` | GET | HIGH |
| `GET /api/admin/users/{id}` | GET | MEDIUM |

## Catatan

1. **Tidak perlu migration** - semua field sudah ada di tabel users
2. **Role sudah tersedia**: user, admin, inspector
3. **Filter berdasarkan role** sudah bisa dilakukan
4. **Search** bisa berdasarkan name, email, atau phone

## yang Belum Tersedia (Optional)

- Create user baru (belum ada di frontend)
- Edit user (belum ada di frontend)
- Delete user (belum ada di frontend)

Jika fitur di atas dibutuhkan di masa depan, perlu tambahan endpoint:
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`