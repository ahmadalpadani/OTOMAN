# Endpoint Backend untuk Halaman Laporan (Admin)

## Fitur yang Diperlukan

| No | Fitur | Keterangan |
|----|-------|-------------|
| 1 | Status Inspeksi Chart | Pie/Doughnut chart menunjukkan distribusi status |
| 2 | Inspeksi per Bulan Chart | Bar chart menunjukkan jumlah inspeksi per bulan |
| 3 | Laporan Tabel | Tabel bulanan dengan total, pending, selesai, ditolak |
| 4 | Export | Download laporan dalam format tertentu |

---

## Data yang Dibutuhkan

### Table: inspections (Existing)
| Field | Status | Keterangan |
|-------|--------|-------------|
| id | ✅ Ada | |
| status | ✅ Ada | pending/in_progress/completed/rejected |
| created_at | ✅ Ada | Untuk grouping per bulan |
| inspection_date | ✅ Ada | Tanggal inspeksi |
| user_id | ✅ Ada | Untuk relasi |

---

## Endpoint yang Dibutuhkan

### 1. GET /api/admin/reports/summary

**Ringkasan laporan untuk charts dan tabel**

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| year | integer | No | current year | Tahun laporan |
| month | integer | No | - | Bulan tertentu (opsional) |

**Response:**
```json
{
  "status_breakdown": {
    "pending": 8,
    "in_progress": 5,
    "completed": 35,
    "rejected": 2
  },
  "monthly_inspections": {
    "Januari": 5,
    "Februari": 12,
    "Maret": 15,
    "April": 8,
    "Mei": 10,
    "Juni": 0,
    "Juli": 0,
    "Agustus": 0,
    "September": 0,
    "Oktober": 0,
    "November": 0,
    "Desember": 0
  },
  "monthly_report": [
    {
      "month": "Januari",
      "total": 5,
      "pending": 2,
      "completed": 3,
      "rejected": 0
    },
    {
      "month": "Februari",
      "total": 12,
      "pending": 3,
      "completed": 8,
      "rejected": 1
    },
    {
      "month": "Maret",
      "total": 15,
      "pending": 3,
      "completed": 11,
      "rejected": 1
    },
    {
      "month": "April",
      "total": 8,
      "pending": 0,
      "completed": 7,
      "rejected": 0
    },
    {
      "month": "Mei",
      "total": 10,
      "pending": 0,
      "completed": 6,
      "rejected": 0
    }
  ],
  "total_inspections": 50,
  "total_completed": 35,
  "total_pending": 8,
  "total_rejected": 2
}
```

---

### 2. GET /api/admin/reports/export

**Export laporan dalam format file**

**Request:** Tidak ada

**Query Parameters:**
| Parameter | Tipe | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Format: csv, pdf, xlsx (default: csv) |
| year | integer | No | Tahun laporan |
| month | integer | No | Bulan tertentu |

**Response:** File download

**Headers:**
```
Content-Type: text/csv (atau application/pdf, application/vnd.ms-excel)
Content-Disposition: attachment; filename="laporan-inspeksi-2026.csv"
```

---

## Mock Data untuk Frontend

### loadStats - Status Breakdown
```javascript
const mockStatusBreakdown = {
    pending: 8,
    in_progress: 5,
    completed: 35,
    rejected: 2
};
```

### loadStats - Monthly Inspections
```javascript
const mockMonthlyInspections = {
    'Jan': 5,
    'Feb': 12,
    'Mar': 15,
    'Apr': 8,
    'Mei': 10,
    'Jun': 0,
    'Jul': 0,
    'Agt': 0,
    'Sep': 0,
    'Okt': 0,
    'Nov': 0,
    'Des': 0
};
```

### Laporan Tabel
```javascript
const mockMonthlyReport = [
    { month: 'Januari', total: 5, pending: 2, completed: 3, rejected: 0 },
    { month: 'Februari', total: 12, pending: 3, completed: 8, rejected: 1 },
    { month: 'Maret', total: 15, pending: 3, completed: 11, rejected: 1 },
    { month: 'April', total: 8, pending: 0, completed: 7, rejected: 0 },
    { month: 'Mei', total: 10, pending: 0, completed: 6, rejected: 0 }
];
```

---

## Ringkasan

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `GET /api/admin/reports/summary` | GET | Data untuk charts dan tabel |
| `GET /api/admin/reports/export` | GET | Download laporan |

## Catatan

1. **Status breakdown** = hitung inspections berdasarkan field `status`
2. **Monthly** = group berdasarkan bulan dari `created_at` atau `inspection_date`
3. **Filter tahun** = bisa filter berdasarkan tahun tertentu
4. **Export** = opsional, bisa CSV dulu untuk simplicity

## yang Mungkin Ditambahkan Nanti

- Filter berdasarkan mechanic/inspector
- Filter berdasarkan vehicle type (mobil/motor)
- Filter berdasarkan wilayah/ kota