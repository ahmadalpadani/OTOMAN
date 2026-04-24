// marketplace-landing.js
// Fetches verified vehicles from API and renders the marketplace section on index.html

const MARKETPLACE_API_BASE = 'http://localhost:8000/api';
const FALLBACK_VEHICLES = [
    {
        id: 1,
        vehicle_brand: 'Toyota',
        vehicle_model: 'Fortuner GR',
        vehicle_year: 2022,
        license_plate: 'B 1234 XYZ',
        mileage: 20000,
        location: 'Jakarta Selatan',
        price: 385000000,
        thumbnail_url: 'Assets/fortuner.jpg',
        inspection_summary: { overall_result: 'approve' }
    },
    {
        id: 2,
        vehicle_brand: 'Honda',
        vehicle_model: 'Civic RS',
        vehicle_year: 2021,
        license_plate: 'D 5678 DEF',
        mileage: 25000,
        location: 'Bandung',
        price: 320000000,
        thumbnail_url: 'Assets/civic.jpg',
        inspection_summary: { overall_result: 'approve' }
    },
    {
        id: 3,
        vehicle_brand: 'BMW',
        vehicle_model: '320i Sport',
        vehicle_year: 2019,
        license_plate: 'B 9012 XYZ',
        mileage: 35000,
        location: 'Surabaya',
        price: 525000000,
        thumbnail_url: 'Assets/bmw-320i_2.jpg',
        inspection_summary: { overall_result: 'approve' }
    }
];

function formatPrice(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatMileage(km) {
    return Number(km || 0).toLocaleString('id-ID');
}

function getResultBadge(result) {
    const badges = {
        'approve': '<span class="badge bg-success">Verified</span>',
        'pending': '<span class="badge bg-warning">Pending</span>',
        'reject': '<span class="badge bg-danger">Not Recommended</span>'
    };
    return badges[result] || '<span class="badge bg-secondary">Unknown</span>';
}

function getVehicleImage(vehicle) {
    // Use thumbnail from API, fallback to placeholder
    if (vehicle.thumbnail_url) {
        return vehicle.thumbnail_url;
    }
    // Try to find a matching asset based on brand
    const brandLower = (vehicle.vehicle_brand || '').toLowerCase();
    if (brandLower.includes('toyota')) return 'Assets/innova.png';
    if (brandLower.includes('honda')) return 'Assets/Honda-Jazz.jpg';
    if (brandLower.includes('bmw')) return 'Assets/bmw-320i_2.jpg';
    // Placeholder
    return 'https://placehold.co/600x400?text=No+Image';
}

function renderVehicleCard(vehicle) {
    const image = getVehicleImage(vehicle);
    const fullName = `${vehicle.vehicle_brand || ''} ${vehicle.vehicle_model || ''} ${vehicle.vehicle_year || ''}`.trim();
    const badge = getResultBadge(vehicle.inspection_summary?.overall_result);

    return `
        <div class="col-lg-4 col-md-6">
            <div class="car-card">
                <div class="position-relative">
                    <img src="${image}" alt="${fullName}" class="card-img-top"
                         onerror="this.src='https://placehold.co/600x400?text=${encodeURIComponent(fullName)}'">
                    <span class="badge bg-success position-absolute top-0 start-0 m-3">${badge.replace(/<[^>]*>/g, '')}</span>
                    ${vehicle.inspection_summary?.overall_result === 'approve'
                        ? '<span class="badge bg-success position-absolute top-0 end-0 m-3" style="background:#28a745;"><i class="bi bi-check-circle-fill me-1"></i>Inspeksi Lulus</span>'
                        : ''}
                </div>
                <div class="card-body p-3">
                    <h5 class="fw-bold mb-2">${fullName}</h5>
                    <p class="text-muted mb-2">
                        <i class="bi bi-geo-alt me-1"></i>${vehicle.location || '-'}
                        ${vehicle.license_plate ? `&bull; ${vehicle.license_plate}` : ''}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="h5 mb-0 text-primary fw-bold">${formatPrice(vehicle.price)}</span>
                        <small class="text-muted">${formatMileage(vehicle.mileage)} km</small>
                    </div>
                    <div class="d-grid">
                        <a href="marketplace-detail.html?id=${vehicle.id}" class="btn btn-primary w-100">
                            <i class="bi bi-eye me-2"></i>Lihat Detail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="col-12 text-center py-5">
            <i class="bi bi-car-front fs-1 text-muted"></i>
            <p class="text-muted mt-3">Belum ada kendaraan terverifikasi saat ini.</p>
            <a href="inspection.html" class="btn btn-primary">
                <i class="bi bi-clipboard-check me-2"></i>Pesan Inspeksi Sekarang
            </a>
        </div>
    `;
}

function renderErrorState(error) {
    return `
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
            <p class="text-muted mt-3">Gagal memuat kendaraan. Menggunakan data contoh.</p>
            <button class="btn btn-outline-primary" onclick="loadMarketplaceVehicles()">
                <i class="bi bi-arrow-clockwise me-2"></i>Coba Lagi
            </button>
        </div>
    `;
}

async function loadMarketplaceVehicles() {
    const container = document.getElementById('marketplaceVehicleList');
    if (!container) return;

    // Show loading
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Memuat kendaraan terverifikasi...</p>
        </div>
    `;

    try {
        const response = await fetch(`${MARKETPLACE_API_BASE}/marketplace/vehicles?limit=3`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        // Extract vehicles from response (handle various response structures)
        let vehicles = [];
        if (result.data?.vehicles) {
            vehicles = result.data.vehicles;
        } else if (result.vehicles) {
            vehicles = result.vehicles;
        } else if (Array.isArray(result.data)) {
            vehicles = result.data;
        }

        if (!vehicles || vehicles.length === 0) {
            // No vehicles from API, use fallback
            container.innerHTML = FALLBACK_VEHICLES.map(v => renderVehicleCard(v)).join('');
            return;
        }

        // Render vehicles (limit to 3 for landing page)
        const displayVehicles = vehicles.slice(0, 3);
        container.innerHTML = displayVehicles.map(v => renderVehicleCard(v)).join('');

    } catch (error) {
        console.error('Failed to load marketplace vehicles:', error);
        console.log('Using fallback vehicle data...');

        // Use fallback data on error
        container.innerHTML = FALLBACK_VEHICLES.map(v => renderVehicleCard(v)).join('');
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMarketplaceVehicles);
} else {
    loadMarketplaceVehicles();
}
