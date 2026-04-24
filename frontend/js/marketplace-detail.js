// marketplace-detail.js
// Fetches and renders vehicle detail + inspection report

const MARKETPLACE_API_BASE = 'http://localhost:8000/api';

// Fallback data for when API is not available
const FALLBACK_DETAIL = {
    id: 1,
    order_code: 'INS-FRT001',
    vehicle: {
        brand: 'Toyota',
        model: 'Fortuner GR',
        year: 2022,
        license_plate: 'B 1234 XYZ',
        vin: 'MHABC123456789',
        transmission: 'Automatic',
        fuel_type: 'Diesel',
        color: 'Hitam',
        mileage: 20000,
        machine_number: '1GD-1234567',
        chassis_number: 'MHABC123456789'
    },
    location: {
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        full_address: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta'
    },
    price: {
        vehicle_price: 385000000,
        inspection_fee: 350000,
        platform_fee: 6500,
        total: 385356500
    },
    images: [
        { url: 'Assets/fortuner.jpg', is_primary: true },
        { url: 'https://placehold.co/800x500?text=Fortuner+View+2', is_primary: false },
        { url: 'https://placehold.co/800x500?text=Fortuner+View+3', is_primary: false }
    ],
    seller: {
        name: 'Budi Santoso',
        phone: '6281234567890',
        member_since: '2024-01-15',
        total_listings: 3,
        verified: true
    },
    inspection_report: {
        order_code: 'INS-FRT001',
        inspection_date: '2026-03-01',
        completed_at: '2026-03-01T15:30:00Z',
        inspector: 'Joko Mechanic',
        overall_result: 'approve',
        result_label: 'Disetujui',
        result_notes: 'Mobil dalam kondisi baik, rekomendasi approve. Body mulus, mesin halus, interior terawat.',
        categories: {
            body: {
                label: 'Kondisi Body',
                condition: 'good',
                condition_label: 'Baik',
                notes: 'Body mulus tanpa goresan berarti. Cat original.',
                score: 85
            },
            engine: {
                label: 'Kondisi Mesin',
                condition: 'good',
                condition_label: 'Baik',
                notes: 'Mesin halus, tidak ada kebocoran oli. AC dingin.',
                score: 88
            },
            interior: {
                label: 'Kondisi Interior',
                condition: 'fair',
                condition_label: 'Cukup',
                notes: 'Kulit setir sedikit aus. Jok terawat.',
                score: 72
            },
            electrical: {
                label: 'Sistem Kelistrikan',
                condition: 'good',
                condition_label: 'Baik',
                notes: 'Semua lampu, wiper, dan aksesoris berfungsi normal.',
                score: 90
            },
            history: {
                label: 'Riwayat Kendaraan',
                condition: 'good',
                condition_label: 'Baik',
                notes: 'Tidak pernah banjir. Tidak pernah kecelakaan berat. Buku service lengkap.',
                score: 95
            }
        },
        overall_score: 86,
        documents: [
            { type: 'STNK', status: 'ada', notes: 'STNK aktif sampai 2027' },
            { type: 'BPKB', status: 'ada', notes: 'BPKB asli tersedia' },
            { type: 'Faktur', status: 'ada', notes: 'Faktur asli tersedia' },
            { type: 'Pajak', status: 'lunas', notes: 'Pajak tahunan lunas' }
        ],
        report_url: '#',
        certificate_url: '#'
    },
    related_vehicles: [
        {
            id: 2,
            vehicle_brand: 'Toyota',
            vehicle_model: 'Innova Reborn',
            vehicle_year: 2021,
            price: 320000000,
            thumbnail_url: 'Assets/innova.png',
            location: 'Bandung'
        },
        {
            id: 5,
            vehicle_brand: 'Honda',
            vehicle_model: 'Civic RS',
            vehicle_year: 2021,
            price: 310000000,
            thumbnail_url: 'Assets/Honda-Jazz.jpg',
            location: 'Jakarta Timur'
        },
        {
            id: 6,
            vehicle_brand: 'Wuling',
            vehicle_model: 'Almaz',
            vehicle_year: 2022,
            price: 280000000,
            thumbnail_url: 'https://placehold.co/400x300?text=Wuling+Almaz',
            location: 'Surabaya'
        }
    ]
};

function formatPrice(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function getConditionClass(condition) {
    const map = {
        'excellent': 'condition-excellent',
        'good': 'condition-good',
        'fair': 'condition-fair',
        'poor': 'condition-poor'
    };
    return map[condition] || 'condition-fair';
}

function getScoreClass(score) {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
}

function getResultAlertClass(result) {
    const map = {
        'approve': 'alert-success',
        'pending': 'alert-warning',
        'reject': 'alert-danger'
    };
    return map[result] || 'alert-secondary';
}

function getSpecIcon(key) {
    const map = {
        year: 'bi-calendar',
        transmission: 'bi-gear',
        fuel_type: 'bi-fuel-pump',
        color: 'bi-palette',
        mileage: 'bi-speedometer2',
        license_plate: 'bi-credit-card-2-front',
        vin: 'bi-upc',
        machine_number: 'bi-gear-fill',
        chassis_number: 'bi-box-seam'
    };
    return map[key] || 'bi-info-circle';
}

function renderVehicleSpecs(vehicle) {
    const specs = [
        { key: 'year', label: 'Tahun', value: vehicle.year },
        { key: 'transmission', label: 'Transmisi', value: vehicle.transmission },
        { key: 'fuel_type', label: 'Bahan Bakar', value: vehicle.fuel_type },
        { key: 'color', label: 'Warna', value: vehicle.color },
        { key: 'mileage', label: 'Jarak Tempuh', value: `${Number(vehicle.mileage || 0).toLocaleString('id-ID')} km` },
        { key: 'license_plate', label: 'No. Plat', value: vehicle.license_plate }
    ];

    return specs.map(spec => `
        <div class="spec-item">
            <i class="bi ${getSpecIcon(spec.key)}"></i>
            <div>
                <span class="spec-label">${spec.label}:</span>
                <strong>${spec.value || '-'}</strong>
            </div>
        </div>
    `).join('');
}

function renderInspectionCategory(key, cat) {
    const conditionClass = getConditionClass(cat.condition);

    return `
        <div class="inspection-category">
            <div class="inspection-category-header" onclick="toggleCategory('${key}')">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-chevron-down" id="icon-${key}"></i>
                    <span class="fw-semibold">${cat.label}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="condition-badge ${conditionClass}">${cat.condition_label || cat.condition}</span>
                    <span class="text-muted small">${cat.score || '-'}/100</span>
                </div>
            </div>
            <div class="inspection-category-body" id="body-${key}">
                <p class="mb-0">${cat.notes || 'Tidak ada catatan.'}</p>
            </div>
        </div>
    `;
}

function renderDocumentItem(doc) {
    const isAvailable = doc.status === 'ada' || doc.status === 'lunas';
    const iconClass = isAvailable ? 'bi-check-circle-fill doc-available' : 'bi-x-circle-fill doc-missing';

    return `
        <div class="document-item">
            <div class="document-icon ${isAvailable ? 'doc-available' : 'doc-missing'}">
                <i class="bi ${iconClass}"></i>
            </div>
            <div>
                <strong>${doc.type}</strong>
                <p class="mb-0 small text-muted">${doc.notes || doc.status}</p>
            </div>
        </div>
    `;
}

function renderRelatedVehicle(v) {
    const name = `${v.vehicle_brand || ''} ${v.vehicle_model || ''} ${v.vehicle_year || ''}`.trim();
    return `
        <div class="col-md-4">
            <div class="card h-100" style="border-radius: 12px; overflow: hidden;">
                <img src="${v.thumbnail_url || 'https://placehold.co/400x250?text=' + encodeURIComponent(name)}"
                     class="card-img-top"
                     alt="${name}"
                     style="height: 160px; object-fit: cover;"
                     onerror="this.src='https://placehold.co/400x250?text=${encodeURIComponent(name)}'">
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-1">${name}</h6>
                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>${v.location || '-'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-primary fw-bold">${formatPrice(v.price)}</span>
                    </div>
                    <a href="marketplace-detail.html?id=${v.id}" class="btn btn-sm btn-outline-primary w-100 mt-2">
                        Lihat Detail
                    </a>
                </div>
            </div>
        </div>
    `;
}

function toggleCategory(key) {
    const body = document.getElementById(`body-${key}`);
    const icon = document.getElementById(`icon-${key}`);
    if (body) body.classList.toggle('show');
    if (icon) {
        icon.classList.toggle('bi-chevron-down');
        icon.classList.toggle('bi-chevron-up');
    }
}

function renderGallery(images, primaryUrl) {
    const thumbs = document.getElementById('galleryThumbnails');
    if (!thumbs) return;

    if (!images || images.length === 0) {
        thumbs.innerHTML = '';
        return;
    }

    thumbs.innerHTML = images.map((img, idx) => `
        <div class="gallery-thumb ${idx === 0 ? 'active' : ''}"
             onclick="changeMainImage('${img.url}', this)">
            <img src="${img.url}" alt="Thumbnail ${idx + 1}"
                 onerror="this.src='https://placehold.co/70x50?text=?'">
        </div>
    `).join('');
}

function changeMainImage(url, thumbEl) {
    const main = document.getElementById('mainImage');
    if (main) main.src = url;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
}

function renderDetailPage(data) {
    // Update page title
    document.title = `${data.vehicle?.brand || ''} ${data.vehicle?.model || ''} ${data.vehicle?.year || ''} - OTOMAN`;

    // Breadcrumb
    document.getElementById('breadcrumbVehicle').textContent =
        `${data.vehicle?.brand || ''} ${data.vehicle?.model || ''}`.trim();

    // Vehicle title
    document.getElementById('vehicleTitle').textContent =
        `${data.vehicle?.brand || ''} ${data.vehicle?.model || ''} ${data.vehicle?.year || ''}`.trim();
    document.getElementById('vehicleSubtitle').querySelector('#vehicleLocation').textContent =
        `${data.location?.city || ''}, ${data.location?.province || ''}`.trim();
    document.getElementById('vehiclePlate').textContent = data.vehicle?.license_plate || '-';

    // Status badges
    const status = data.status || data.inspection_report?.overall_result || null;
    const statusBadge = document.getElementById('listingStatusBadge');
    const pendingNotice = document.getElementById('pendingNotice');
    const inspectionCard = document.querySelector('.inspection-card');

    if (status) {
        const statusConfig = {
            'approved': { label: 'Dipublikasi', class: 'bg-success' },
            'pending': { label: 'Menunggu Inspeksi', class: 'bg-warning text-dark' },
            'rejected': { label: 'Ditolak', class: 'bg-danger' },
            'scheduled': { label: 'Inspeksi Terjadwal', class: 'bg-info' },
            'approve': { label: 'Inspeksi Lulus', class: 'bg-success' }
        };
        const config = statusConfig[status] || { label: status, class: 'bg-secondary' };
        if (statusBadge) {
            statusBadge.style.display = '';
            statusBadge.textContent = config.label;
            statusBadge.className = `badge ${config.class}`;
        }
        if (status === 'pending' && pendingNotice) {
            pendingNotice.style.display = '';
        }
    }

    // Images
    const primaryImage = data.images?.find(i => i.is_primary)?.url || data.images?.[0]?.url;
    if (primaryImage) {
        const mainImg = document.getElementById('mainImage');
        if (mainImg) mainImg.src = primaryImage;
        renderGallery(data.images, primaryImage);
    }

    // Vehicle specs
    document.getElementById('vehicleSpecs').innerHTML = renderVehicleSpecs(data.vehicle);

    // Price
    document.getElementById('vehiclePrice').textContent = formatPrice(data.price?.vehicle_price);
    document.getElementById('inspectionFee').textContent = formatPrice(data.price?.inspection_fee);
    document.getElementById('platformFee').textContent = formatPrice(data.price?.platform_fee);
    document.getElementById('totalPrice').textContent = formatPrice(data.price?.total);

    // CTA buttons
    const contactBtn = document.getElementById('contactSellerBtn');
    if (contactBtn && data.seller?.phone) {
        const waNumber = data.seller.phone.replace(/^0/, '62');
        contactBtn.href = `https://wa.me/${waNumber}?text=Halo, saya tertarik dengan kendaraan ${data.vehicle?.brand} ${data.vehicle?.model} (${data.order_code})`;
    }

    // Seller
    document.getElementById('sellerName').textContent = data.seller?.name || '-';
    document.getElementById('sellerMemberSince').textContent =
        data.seller?.member_since
            ? new Date(data.seller.member_since).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
            : '-';
    document.getElementById('sellerTotalListings').textContent = data.seller?.total_listings || 0;

    // Inspection report
    const report = data.inspection_report;
    if (report) {
        // Overall score
        const scoreEl = document.getElementById('overallScore');
        if (scoreEl) {
            scoreEl.textContent = report.overall_score || '-';
            scoreEl.className = `overall-score ${getScoreClass(report.overall_score)}`;
        }

        // Inspector name
        document.getElementById('inspectorName').textContent = report.inspector || '-';

        // Result alert
        const alertEl = document.getElementById('resultAlert');
        if (alertEl) {
            alertEl.className = `alert d-flex align-items-center gap-3 mb-4 ${getResultAlertClass(report.overall_result)}`;
        }
        document.getElementById('resultLabel').textContent = report.result_label || report.overall_result || '-';
        document.getElementById('resultNotes').textContent = report.result_notes || '';

        // Categories
        const categoriesEl = document.getElementById('inspectionCategories');
        if (categoriesEl && report.categories) {
            categoriesEl.innerHTML = Object.entries(report.categories)
                .map(([key, cat]) => renderInspectionCategory(key, cat))
                .join('');
        }

        // Documents
        if (report.documents) {
            const docsContainer = document.createElement('div');
            docsContainer.className = 'mt-3 pt-3 border-top';
            docsContainer.innerHTML = `
                <h6 class="fw-bold mb-3"><i class="bi bi-file-earmark-text me-2"></i>Dokumen</h6>
                <div class="row">
                    ${report.documents.map(doc => `
                        <div class="col-md-6">
                            ${renderDocumentItem(doc)}
                        </div>
                    `).join('')}
                </div>
            `;
            categoriesEl?.appendChild(docsContainer);
        }

        // Download buttons
        const reportBtn = document.getElementById('downloadReportBtn');
        if (reportBtn) reportBtn.href = report.report_url || '#';
        const certBtn = document.getElementById('downloadCertBtn');
        if (certBtn) certBtn.href = report.certificate_url || '#';
    }

    // Related vehicles
    const relatedEl = document.getElementById('relatedVehicles');
    if (relatedEl && data.related_vehicles?.length > 0) {
        relatedEl.innerHTML = data.related_vehicles.map(v => renderRelatedVehicle(v)).join('');
    } else if (relatedEl) {
        relatedEl.innerHTML = '<div class="col-12 text-center text-muted py-3">Tidak ada kendaraan terkait.</div>';
    }

    // Show content
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('contentArea').classList.remove('d-none');
}

async function loadVehicleDetail() {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get('id');

    if (!vehicleId) {
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('errorState').classList.remove('d-none');
        document.getElementById('errorMessage').textContent = 'ID kendaraan tidak ditemukan di URL.';
        return;
    }

    try {
        const response = await fetch(`${MARKETPLACE_API_BASE}/marketplace/vehicles/${vehicleId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        // Extract data from various response structures
        let data = null;
        if (result.data) data = result.data;
        else if (result.vehicle) data = result;
        else data = result;

        renderDetailPage(data);

    } catch (error) {
        console.error('Failed to load vehicle detail:', error);
        console.log('Using fallback data...');

        // Use fallback data on error
        FALLBACK_DETAIL.id = parseInt(vehicleId) || 1;
        renderDetailPage(FALLBACK_DETAIL);
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVehicleDetail);
} else {
    loadVehicleDetail();
}
