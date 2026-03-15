// Dashboard Inspector JavaScript
// ================================

// Helper functions from api.js
function getApiUrl() {
    if (typeof window !== 'undefined' && window.API_BASE) {
        return window.API_BASE;
    }
    return 'http://localhost:8000/api';
}

function getHeaders() {
    const token = localStorage.getItem('otoman_token');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

const API_BASE_URL = getApiUrl();

// State
let currentPage = {
    assigned: 1,
    history: 1
};
let currentInspectionId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initSidebar();
    loadDashboardData();
    setCurrentDate();

    // Handle hash navigation on page load
    handleHashNavigation();
});

// Handle hash navigation
function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'assigned') {
        const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${hash}"]`);
        if (navLink) {
            navLink.click();
        }
    }
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('otoman_token');
    const user = JSON.parse(localStorage.getItem('otoman_user') || '{}');

    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    if (user.role !== 'inspector') {
        // Redirect to appropriate dashboard if not inspector
        if (user.role === 'admin') {
            window.location.href = 'dashboard-admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    // Set inspector info
    document.getElementById('inspectorName').textContent = user.name || 'Inspector';
    document.getElementById('inspectorEmailDisplay').textContent = user.email || 'inspector@otoman.com';
}

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerHTML += ' ' + now.toLocaleDateString('id-ID', options);
}

// Initialize sidebar navigation
function initSidebar() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding section
            contentSections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');

            // Update page title
            const pageTitle = this.querySelector('span').textContent;
            document.getElementById('pageTitle').textContent = pageTitle;

            // Close mobile sidebar
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('show');
        });
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('show');
    });

    document.getElementById('sidebarClose').addEventListener('click', function() {
        document.getElementById('sidebar').classList.remove('show');
    });
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadAssignedInspections()
    ]);
}

// Load statistics
async function loadStats() {
    // MOCK DATA
    const mockStats = {
        assigned: 3,
        in_progress: 2,
        completed: 15
    };

    try {
        const response = await fetch(`${API_BASE_URL}/inspector/stats`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load stats');

        const data = await response.json();
        updateStatsUI(data);
    } catch (error) {
        console.log('Using mock data for stats');
        updateStatsUI(mockStats);
    }
}

function updateStatsUI(data) {
    document.getElementById('assignedCount').textContent = data.assigned || 0;
    document.getElementById('progressCount').textContent = data.in_progress || 0;
    document.getElementById('completedCount').textContent = data.completed || 0;
}

// Load assigned inspections
async function loadAssignedInspections(page = 1) {
    currentPage.assigned = page;

    const status = document.getElementById('assignedStatusFilter').value;

    // MOCK DATA - Inspeksi yang di-assign ke inspector ini
    const mockAssigned = [
        {
            id: 2,
            order_code: 'INS-DEF456',
            user: { name: 'Siti Nurhaliza', phone: '081234567890' },
            vehicle: 'Honda Civic 2020',
            vehicle_brand: 'Honda',
            vehicle_model: 'Civic',
            vehicle_year: '2020',
            license_plate: 'D 5678 DEF',
            address: 'Jl. Braga No. 45, Bandung',
            city: 'Bandung',
            province: 'Jawa Barat',
            inspection_date: '2026-03-05',
            inspection_time: '09:00-11:00',
            status: 'in_progress',
            scheduled_date: '2026-03-05',
            scheduled_time: '09:00-11:00',
            created_at: '2026-03-01 11:45:00'
        },
        {
            id: 8,
            order_code: 'INS-CCC333',
            user: { name: 'Hendra Wijaya', phone: '081299999999' },
            vehicle: 'Wuling Almaz 2022',
            vehicle_brand: 'Wuling',
            vehicle_model: 'Almaz',
            vehicle_year: '2022',
            license_plate: 'F 3333 CCC',
            address: 'Jl. Tamansari No. 12, Jakarta Timur',
            city: 'Jakarta Timur',
            province: 'DKI Jakarta',
            inspection_date: '2026-03-06',
            inspection_time: '11:00-13:00',
            status: 'pending',
            scheduled_date: '2026-03-06',
            scheduled_time: '11:00-13:00',
            created_at: '2026-02-24 09:00:00'
        },
        {
            id: 11,
            order_code: 'INS-PPP111',
            user: { name: 'Toni Wijaya', phone: '081288888888' },
            vehicle: 'Toyota Avanza 2021',
            vehicle_brand: 'Toyota',
            vehicle_model: 'Avanza',
            vehicle_year: '2021',
            license_plate: 'B 9999 PPP',
            address: 'Jl. Merdeka No. 33, Bekasi',
            city: 'Bekasi',
            province: 'Jawa Barat',
            inspection_date: '2026-03-07',
            inspection_time: '14:00-16:00',
            status: 'pending',
            scheduled_date: '2026-03-07',
            scheduled_time: '14:00-16:00',
            created_at: '2026-03-02 10:00:00'
        }
    ];

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        if (status) params.append('status', status);

        const response = await fetch(`${API_BASE_URL}/inspector/inspections?${params}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspections');

        const data = await response.json();
        renderAssignedInspections(data.inspections || []);
    } catch (error) {
        console.log('Using mock data for assigned inspections');
        renderAssignedInspections(mockAssigned);
    }
}

// Render assigned inspections table
function renderAssignedInspections(inspections) {
    const tbody = document.getElementById('assignedBody');

    if (inspections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Belum ada inspeksi assigned</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inspections.map(insp => `
        <tr>
            <td><strong>${insp.order_code}</strong></td>
            <td>
                <div>${insp.user?.name || '-'}</div>
                <small class="text-muted">${insp.user?.phone || '-'}</small>
            </td>
            <td>
                <div>${insp.vehicle_brand} ${insp.vehicle_model}</div>
                <small class="text-muted">${insp.vehicle_year} | ${insp.license_plate}</small>
            </td>
            <td>
                <div>${insp.city || '-'}</div>
                <small class="text-muted">${insp.address || '-'}</small>
            </td>
            <td>
                <div>${formatDate(insp.scheduled_date || insp.inspection_date)}</div>
                <small class="text-muted">${insp.scheduled_time || insp.inspection_time}</small>
            </td>
            <td>${getStatusBadge(insp.status)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInspectionDetail(${insp.id})">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load history
async function loadHistory(page = 1) {
    currentPage.history = page;

    // MOCK DATA - Riwayat inspeksi yang sudah selesai
    const mockHistory = [
        {
            id: 5,
            order_code: 'INS-MNO789',
            user: { name: 'Rudi Hermawan', phone: '081298765432' },
            vehicle: 'Toyota Fortuner 2021',
            vehicle_brand: 'Toyota',
            vehicle_model: 'Fortuner',
            vehicle_year: '2021',
            license_plate: 'H 7890 MNO',
            inspection_date: '2026-03-04',
            status: 'completed',
            result: 'approve',
            result_notes: 'Mobil dalam kondisi baik, rekomendasi approve',
            completed_at: '2026-03-04 15:30:00'
        },
        {
            id: 7,
            order_code: 'INS-BBB222',
            user: { name: 'Maya Sari', phone: '081277777777' },
            vehicle: 'Hyundai Stargazer 2023',
            vehicle_brand: 'Hyundai',
            vehicle_model: 'Stargazer',
            vehicle_year: '2023',
            license_plate: 'D 2222 BBB',
            inspection_date: '2026-03-03',
            status: 'completed',
            result: 'pending',
            result_notes: 'Perlu pengecekan mesin lebih lanjut',
            completed_at: '2026-03-03 12:00:00'
        },
        {
            id: 3,
            order_code: 'INS-GHI111',
            user: { name: 'Budi Santoso', phone: '081266666666' },
            vehicle: 'Suzuki Ertiga 2022',
            vehicle_brand: 'Suzuki',
            vehicle_model: 'Ertiga',
            vehicle_year: '2022',
            license_plate: 'F 9012 GHI',
            inspection_date: '2026-03-01',
            status: 'completed',
            result: 'reject',
            result_notes: 'Body berkarat, mesin bermasalah',
            completed_at: '2026-03-01 14:00:00'
        }
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/inspector/inspections/history?page=${page}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load history');

        const data = await response.json();
        renderHistory(data.inspections || []);
    } catch (error) {
        console.log('Using mock data for history');
        renderHistory(mockHistory);
    }
}

// Render history table
function renderHistory(inspections) {
    const tbody = document.getElementById('historyBody');

    if (inspections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Belum ada riwayat</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inspections.map(insp => `
        <tr>
            <td><strong>${insp.order_code}</strong></td>
            <td>${insp.user?.name || '-'}</td>
            <td>${insp.vehicle_brand} ${insp.vehicle_model}</td>
            <td>${formatDate(insp.inspection_date)}</td>
            <td>${getResultBadge(insp.result)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInspectionDetail(${insp.id}, true)">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// View inspection detail
async function viewInspectionDetail(id, isHistory = false) {
    currentInspectionId = id;

    // MOCK DATA - Detail lengkap inspeksi
    const mockDetail = {
        id: id,
        order_code: 'INS-DEF456',
        user: { name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '081234567890' },
        vehicle_type: 'mobil',
        vehicle_brand: 'Honda',
        vehicle_model: 'Civic',
        vehicle_year: '2020',
        license_plate: 'D 5678 DEF',
        mileage: 35000,
        condition: 'good',
        notes: 'Mobil terawat, ingin cek kondisi sebelum beli',
        inspection_date: '2026-03-05',
        inspection_time: '09:00-11:00',
        province: 'Jawa Barat',
        city: 'Bandung',
        address: 'Jl. Braga No. 45, Bandung',
        contact_phone: '081234567890',
        price: 350000,
        payment_status: 'paid',
        status: isHistory ? 'completed' : 'in_progress',
        scheduled_date: '2026-03-05',
        scheduled_time: '09:00-11:00',
        // Result fields (for completed)
        result: isHistory ? 'approve' : null,
        body_condition: isHistory ? 'good' : null,
        engine_condition: isHistory ? 'good' : null,
        interior_condition: isHistory ? 'fair' : null,
        result_notes: isHistory ? 'Mobil dalam kondisi baik, mesin halus, body mulus' : null,
        created_at: '2026-03-01 11:45:00',
        updated_at: isHistory ? '2026-03-05 15:30:00' : '2026-03-05 10:00:00'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/inspector/inspections/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspection');

        const inspection = await response.json();
        renderInspectionDetail(inspection, isHistory);
    } catch (error) {
        console.log('Using mock data for inspection detail');
        renderInspectionDetail(mockDetail, isHistory);
    }

    const modal = new bootstrap.Modal(document.getElementById('inspectionDetailModal'));
    modal.show();
}

// Render inspection detail
function renderInspectionDetail(insp, isHistory = false) {
    const content = document.getElementById('inspectionDetailContent');
    const markDoneBtn = document.getElementById('markDoneBtn');

    // Show/hide mark done button
    markDoneBtn.style.display = (insp.status === 'in_progress' && !isHistory) ? 'block' : 'none';

    const location = `${insp.address || '-'}, ${insp.city || '-'}, ${insp.province || '-'}`;

    content.innerHTML = `
        <!-- Order Info -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Kode Inspeksi</h6>
            <p class="fs-5 fw-bold">${insp.order_code}</p>
        </div>

        <!-- Customer Info -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Customer</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>${insp.user?.name || '-'}</strong></p>
                        <p class="mb-0 text-muted">${insp.user?.phone || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-0 text-muted">${insp.user?.email || '-'}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vehicle Info -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Kendaraan</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>${insp.vehicle_brand} ${insp.vehicle_model}</strong></p>
                        <p class="mb-1 text-muted">Tahun: ${insp.vehicle_year}</p>
                        <p class="mb-0 text-muted">Plat: ${insp.license_plate}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">Jarak Tempuh: ${parseInt(insp.mileage || 0).toLocaleString('id-ID')} km</p>
                        <p class="mb-0 text-muted">Kondisi: ${insp.condition}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Location Info -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Lokasi & Jadwal</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">Alamat:</p>
                        <p class="mb-0">${location}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">Jadwal:</p>
                        <p class="mb-0">${formatDate(insp.scheduled_date || insp.inspection_date)} | ${insp.scheduled_time || insp.inspection_time}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Status</h6>
            <div class="bg-light p-3 rounded">
                ${getStatusBadge(insp.status)}
            </div>
        </div>

        ${isHistory || insp.result ? `
        <!-- Result (for completed inspections) -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Hasil Inspeksi</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1">Hasil: ${getResultBadge(insp.result)}</p>
                        <p class="mb-1 text-muted">Body: ${insp.body_condition || '-'}</p>
                        <p class="mb-0 text-muted">Mesin: ${insp.engine_condition || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">Interior: ${insp.interior_condition || '-'}</p>
                        ${insp.result_notes ? `<p class="mb-0">Catatan: ${insp.result_notes}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        ${insp.notes ? `
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Catatan Customer</h6>
            <div class="bg-light p-3 rounded">
                <p class="mb-0">${insp.notes}</p>
            </div>
        </div>
        ` : ''}
    `;
}

// Mark as done button handler
document.getElementById('markDoneBtn')?.addEventListener('click', function() {
    // Close detail modal
    bootstrap.Modal.getInstance(document.getElementById('inspectionDetailModal')).hide();

    // Open complete modal after a short delay
    setTimeout(() => {
        document.getElementById('completeInspectionId').value = currentInspectionId;
        const modal = new bootstrap.Modal(document.getElementById('completeInspectionModal'));
        modal.show();
    }, 300);
});

// Save complete inspection
async function saveCompleteInspection() {
    const id = document.getElementById('completeInspectionId').value;
    const result = document.getElementById('inspectionResult').value;
    const bodyCondition = document.getElementById('bodyCondition').value;
    const engineCondition = document.getElementById('engineCondition').value;
    const interiorCondition = document.getElementById('interiorCondition').value;
    const notes = document.getElementById('inspectionNotes').value;

    // Validation
    if (!result || !bodyCondition || !engineCondition || !interiorCondition) {
        showAlert('Mohon lengkapi semua field yang wajib!', 'warning');
        return;
    }

    // Show loading
    const saveBtn = document.getElementById('saveCompleteBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

    try {
        // In real app: call API
        // const response = await fetch(`${API_BASE_URL}/inspector/inspections/${id}/complete`, {
        //     method: 'PUT',
        //     headers: getHeaders(),
        //     body: JSON.stringify({
        //         result, body_condition: bodyCondition, engine_condition: engineCondition,
        //         interior_condition: interiorCondition, notes
        //     })
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        showAlert('Inspeksi selesai! Hasil disimpan.', 'success');

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('completeInspectionModal')).hide();

        // Reset form
        document.getElementById('completeInspectionForm').reset();

        // Refresh data
        loadDashboardData();

    } catch (error) {
        console.error('Error saving inspection:', error);
        showAlert('Gagal menyimpan hasil inspeksi', 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// Utility functions
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Pending</span>',
        'in_progress': '<span class="badge bg-info">Dikerjakan</span>',
        'completed': '<span class="badge bg-success">Selesai</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

function getResultBadge(result) {
    const badges = {
        'approve': '<span class="badge bg-success">Approve</span>',
        'pending': '<span class="badge bg-warning">Pending</span>',
        'reject': '<span class="badge bg-danger">Reject</span>'
    };
    return badges[result] || `-`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showAlert(message, type = 'info') {
    alert(message);
}

function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    localStorage.setItem('logout_time', Date.now());
    window.location.href = '../login.html';
}

// Filter events
document.getElementById('assignedStatusFilter')?.addEventListener('change', () => loadAssignedInspections(1));

// Load data when section is shown
document.querySelector('.sidebar-nav .nav-link[data-section="history"]')?.addEventListener('click', () => {
    setTimeout(() => loadHistory(1), 100);
});

// Save complete button event
document.getElementById('saveCompleteBtn')?.addEventListener('click', saveCompleteInspection);