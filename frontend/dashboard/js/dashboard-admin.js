// Dashboard Admin JavaScript
// ============================

// Helper functions from api.js
function getApiUrl() {
    if (typeof window !== 'undefined' && window.API_BASE) {
        return window.API_BASE;
    }
    return 'http://localhost:8000/api';
}

function getHeaders() {
    const token = localStorage.getItem('token');
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
    inspections: 1,
    users: 1
};
let inspectionStatusChart = null;
let inspectionMonthlyChart = null;

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
    if (hash && hash !== 'overview') {
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

    if (user.role !== 'admin') {
        // Redirect to user dashboard if not admin
        window.location.href = 'dashboard.html';
        return;
    }

    // Set admin info
    document.getElementById('adminName').textContent = user.name || 'Admin';
    document.getElementById('adminEmailDisplay').textContent = user.email || 'admin@otoman.com';
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

    // Quick action cards
    document.querySelectorAll('.quick-action-card[data-section]').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${section}"]`);
            if (navLink) navLink.click();
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

// Navigate to section (for "Lihat Semua" buttons)
function navigateToSection(sectionName) {
    const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${sectionName}"]`);
    if (navLink) {
        navLink.click();
    }
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadRecentInspections()
    ]);
}

// Load statistics
async function loadStats() {
    // MOCK DATA - Sesuai format response di neededendpoint.md
    const mockStats = {
        total_users: 12,
        total_inspections: 48,
        pending_inspections: 8,
        completed_inspections: 35,
        status_breakdown: {
            pending: 8,
            in_progress: 5,
            completed: 35,
            rejected: 0
        },
        monthly_inspections: {
            'Jan': 5,
            'Feb': 12,
            'Mar': 15,
            'Apr': 8,
            'Mei': 8
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
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
    document.getElementById('totalUsers').textContent = data.total_users || 0;
    document.getElementById('totalInspections').textContent = data.total_inspections || 0;
    document.getElementById('pendingInspections').textContent = data.pending_inspections || 0;
    document.getElementById('completedInspections').textContent = data.completed_inspections || 0;

    // Update charts
    updateStatusChart(data.status_breakdown || {});
    updateMonthlyChart(data.monthly_inspections || {});
}

// Load recent inspections
async function loadRecentInspections() {
    // MOCK DATA - Sesuai format response di neededendpoint.md
    const mockInspections = [
        { id: 1, user: { id: 1, name: 'Ahmad Wijaya' }, vehicle_brand: 'Toyota', vehicle_model: 'Avanza', vehicle_year: '2021', license_plate: 'B 1234 ABC', location: 'DKI Jakarta, Jakarta Selatan', inspection_date: '2026-03-05', status: 'pending', created_at: '2026-03-01 10:30:00' },
        { id: 2, user: { id: 2, name: 'Siti Nurhaliza' }, vehicle_brand: 'Honda', vehicle_model: 'Civic', vehicle_year: '2020', license_plate: 'D 5678 DEF', location: 'Jawa Barat, Bandung', inspection_date: '2026-03-04', status: 'in_progress', created_at: '2026-03-01 11:45:00' },
        { id: 3, user: { id: 3, name: 'Budi Santoso' }, vehicle_brand: 'Suzuki', vehicle_model: 'Ertiga', vehicle_year: '2022', license_plate: 'F 9012 GHI', location: 'Jawa Timur, Surabaya', inspection_date: '2026-03-03', status: 'completed', created_at: '2026-02-28 09:15:00' },
        { id: 4, user: { id: 4, name: 'Dewi Lestari' }, vehicle_brand: 'Nissan', vehicle_model: 'Livina', vehicle_year: '2019', license_plate: 'G 3456 JKL', location: 'Sumatera Utara, Medan', inspection_date: '2026-03-02', status: 'pending', created_at: '2026-02-28 14:20:00' },
        { id: 5, user: { id: 5, name: 'Rudi Hermawan' }, vehicle_brand: 'Toyota', vehicle_model: 'Fortuner', vehicle_year: '2021', license_plate: 'H 7890 MNO', location: 'DKI Jakarta, Jakarta Barat', inspection_date: '2026-03-01', status: 'completed', created_at: '2026-02-27 16:00:00' },
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections?limit=5`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspections');

        const data = await response.json();
        renderRecentInspections(data.inspections || []);
    } catch (error) {
        console.log('Using mock data for inspections');
        renderRecentInspections(mockInspections);
    }
}

// Render recent inspections table
function renderRecentInspections(inspections) {
    const tbody = document.getElementById('recentInspectionsBody');

    if (inspections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Belum ada inspeksi</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inspections.map(insp => `
        <tr>
            <td>#${insp.id}</td>
            <td>${insp.user?.name || '-'}</td>
            <td>${insp.vehicle_brand} ${insp.vehicle_model}</td>
            <td>${formatDate(insp.inspection_date)}</td>
            <td>${getStatusBadge(insp.status)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load all inspections (with pagination)
async function loadAllInspections(page = 1) {
    currentPage.inspections = page;

    const status = document.getElementById('inspectionStatusFilter').value;
    const search = document.getElementById('inspectionSearch').value;

    // MOCK DATA - Sesuai format response di neededendpoint.md
    const mockInspectionsAll = [
        { id: 1, user: { id: 1, name: 'Ahmad Wijaya' }, vehicle_brand: 'Toyota', vehicle_model: 'Avanza', vehicle_year: '2021', license_plate: 'B 1234 ABC', location: 'DKI Jakarta, Jakarta Selatan', inspection_date: '2026-03-05', status: 'pending', created_at: '2026-03-01 10:30:00' },
        { id: 2, user: { id: 2, name: 'Siti Nurhaliza' }, vehicle_brand: 'Honda', vehicle_model: 'Civic', vehicle_year: '2020', license_plate: 'D 5678 DEF', location: 'Jawa Barat, Bandung', inspection_date: '2026-03-04', status: 'in_progress', created_at: '2026-03-01 11:45:00' },
        { id: 3, user: { id: 3, name: 'Budi Santoso' }, vehicle_brand: 'Suzuki', vehicle_model: 'Ertiga', vehicle_year: '2022', license_plate: 'F 9012 GHI', location: 'Jawa Timur, Surabaya', inspection_date: '2026-03-03', status: 'completed', created_at: '2026-02-28 09:15:00' },
        { id: 4, user: { id: 4, name: 'Dewi Lestari' }, vehicle_brand: 'Nissan', vehicle_model: 'Livina', vehicle_year: '2019', license_plate: 'G 3456 JKL', location: 'Sumatera Utara, Medan', inspection_date: '2026-03-02', status: 'pending', created_at: '2026-02-28 14:20:00' },
        { id: 5, user: { id: 5, name: 'Rudi Hermawan' }, vehicle_brand: 'Toyota', vehicle_model: 'Fortuner', vehicle_year: '2021', license_plate: 'H 7890 MNO', location: 'DKI Jakarta, Jakarta Barat', inspection_date: '2026-03-01', status: 'completed', created_at: '2026-02-27 16:00:00' },
        { id: 6, user: { id: 6, name: 'Indra Gunawan' }, vehicle_brand: 'Mitsubishi', vehicle_model: 'Pajero Sport', vehicle_year: '2020', license_plate: 'B 1111 AAA', location: 'Jawa Barat, Bekasi', inspection_date: '2026-02-28', status: 'rejected', created_at: '2026-02-26 10:30:00' },
        { id: 7, user: { id: 7, name: 'Maya Sari' }, vehicle_brand: 'Hyundai', vehicle_model: 'Stargazer', vehicle_year: '2023', license_plate: 'D 2222 BBB', location: 'Jawa Timur, Sidoarjo', inspection_date: '2026-02-27', status: 'completed', created_at: '2026-02-25 13:45:00' },
        { id: 8, user: { id: 8, name: 'Hendra Wijaya' }, vehicle_brand: 'Wuling', vehicle_model: 'Almaz', vehicle_year: '2022', license_plate: 'F 3333 CCC', location: 'DKI Jakarta, Jakarta Timur', inspection_date: '2026-02-26', status: 'in_progress', created_at: '2026-02-24 09:00:00' },
        { id: 9, user: { id: 9, name: 'Rina Susilowati' }, vehicle_brand: 'Kia', vehicle_model: 'Sonet', vehicle_year: '2023', license_plate: 'G 4444 DDD', location: 'Jawa Tengah, Semarang', inspection_date: '2026-02-25', status: 'pending', created_at: '2026-02-23 15:30:00' },
        { id: 10, user: { id: 10, name: 'Dodi Pratama' }, vehicle_brand: 'Toyota', vehicle_model: 'Rush', vehicle_year: '2021', license_plate: 'H 5555 EEE', location: 'Banten, Tangerang', inspection_date: '2026-02-24', status: 'completed', created_at: '2026-02-22 11:00:00' },
    ];

    // Mock pagination
    const mockPagination = {
        current_page: page,
        total_pages: 3,
        total: 25
    };

    // Filter mock data based on status and search
    let filteredData = mockInspectionsAll;
    if (status) {
        filteredData = filteredData.filter(i => i.status === status);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(i =>
            i.user.name.toLowerCase().includes(searchLower) ||
            i.vehicle_brand.toLowerCase().includes(searchLower) ||
            i.vehicle_model.toLowerCase().includes(searchLower) ||
            i.license_plate.toLowerCase().includes(searchLower)
        );
    }

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/admin/inspections?${params}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspections');

        const data = await response.json();
        renderAllInspections(data.inspections || []);
        renderPagination('inspectionPagination', data.pagination, 'loadAllInspections');
    } catch (error) {
        console.log('Using mock data for inspections');
        // Use mock data for frontend demo
        const startIndex = (page - 1) * 10;
        const paginatedData = filteredData.slice(startIndex, startIndex + 10);
        renderAllInspections(paginatedData);
        renderPagination('inspectionPagination', mockPagination, 'loadAllInspections');
    }
}

// Render all inspections table
function renderAllInspections(inspections) {
    const tbody = document.getElementById('allInspectionsBody');

    if (inspections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Tidak ada data</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = inspections.map(insp => `
        <tr>
            <td>#${insp.id}</td>
            <td>${insp.user?.name || '-'}</td>
            <td>${insp.vehicle_brand} ${insp.vehicle_model}</td>
            <td>${insp.location || '-'}</td>
            <td>${formatDate(insp.inspection_date)}</td>
            <td>${getStatusBadge(insp.status)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="openUpdateStatus(${insp.id}, '${insp.status}')" title="Update Status">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load all users
async function loadAllUsers(page = 1) {
    currentPage.users = page;

    const role = document.getElementById('userRoleFilter').value;
    const search = document.getElementById('userSearch').value;

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        if (role) params.append('role', role);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        renderAllUsers(data.users || []);
        renderPagination('userPagination', data.pagination, 'loadAllUsers');
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Gagal memuat data user', 'danger');
    }
}

// Render all users table
function renderAllUsers(users) {
    const tbody = document.getElementById('usersBody');

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Tidak ada user</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>${getRoleBadge(user.role)}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewUser(${user.id})" title="Lihat">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// View inspection detail
async function viewInspection(id) {
    // MOCK DATA - Ganti dengan endpoint asli kalau sudah tersedia
    const mockDetail = {
        id: id,
        order_code: 'INS-00000' + id,
        user: { id: 1, name: 'Ahmad Wijaya', email: 'ahmad@example.com', phone: '081234567890' },
        vehicle_type: 'mobil',
        vehicle_brand: 'Toyota',
        vehicle_model: 'Avanza',
        vehicle_year: '2021',
        license_plate: 'B 1234 ABC',
        mileage: 45000,
        condition: 'good',
        notes: 'Mobil terawat, body mulus, mesin halus',
        inspection_date: '2026-03-05',
        inspection_time: '09:00-11:00',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        address: 'Jl. Sudirman No. 123, Jakarta Selatan',
        contact_phone: '081234567890',
        price: 350000,
        status: 'pending',
        admin_notes: null,
        created_at: '2026-03-01 10:30:00',
        updated_at: '2026-03-01 10:30:00'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspection');

        const inspection = await response.json();
        renderInspectionDetail(inspection);
    } catch (error) {
        console.log('Using mock data for inspection detail');
        renderInspectionDetail(mockDetail);
    }

    const modal = new bootstrap.Modal(document.getElementById('inspectionDetailModal'));
    modal.show();
}

// Render inspection detail
function renderInspectionDetail(insp) {
    const content = document.getElementById('inspectionDetailContent');

    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted">Kendaraan</h6>
                <p class="fw-bold">${insp.vehicle_brand} ${insp.vehicle_model} ${insp.vehicle_year || ''}</p>
                <p class="mb-1"><small class="text-muted">Plat: ${insp.license_plate || '-'}</small></p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted">Status</h6>
                ${getStatusBadge(insp.status)}
                <p class="mt-2"><small class="text-muted">Tanggal: ${formatDate(insp.inspection_date)}</small></p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted">Pemilik</h6>
                <p>${insp.user?.name || '-'}</p>
                <p><small>${insp.user?.email || '-'}</small></p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted">Lokasi</h6>
                <p>${insp.location || '-'}</p>
            </div>
        </div>
        ${insp.notes ? `
        <hr>
        <div>
            <h6 class="text-muted">Catatan</h6>
            <p>${insp.notes}</p>
        </div>
        ` : ''}
        ${insp.admin_notes ? `
        <div class="mt-2">
            <h6 class="text-muted">Catatan Admin</h6>
            <p>${insp.admin_notes}</p>
        </div>
        ` : ''}
    `;

    // Set download button action
    document.getElementById('downloadReportBtn').onclick = () => downloadReport(insp.id);
}

// Open update status modal
function openUpdateStatus(id, currentStatus) {
    document.getElementById('updateInspectionId').value = id;
    document.getElementById('updateStatusSelect').value = currentStatus;
    document.getElementById('updateStatusNote').value = '';

    const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    modal.show();
}

// Save status update
async function saveStatusUpdate() {
    const id = document.getElementById('updateInspectionId').value;
    const status = document.getElementById('updateStatusSelect').value;
    const notes = document.getElementById('updateStatusNote').value;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status, notes })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showAlert('Status berhasil diupdate', 'success');

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();

        // Reload data
        loadDashboardData();
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('Gagal mengupdate status', 'danger');
    }
}

// View user detail
async function viewUser(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load user');

        const user = await response.json();
        renderUserDetail(user);

        const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading user:', error);
        showAlert('Gagal memuat detail user', 'danger');
    }
}

// Render user detail
function renderUserDetail(user) {
    const content = document.getElementById('userDetailContent');

    content.innerHTML = `
        <div class="text-center mb-4">
            <div class="profile-avatar-large mx-auto mb-3">
                <i class="bi bi-person-fill"></i>
            </div>
            <h5 class="fw-bold">${user.name}</h5>
            <p class="text-muted">${user.email}</p>
            ${getRoleBadge(user.role)}
        </div>
        <div class="row">
            <div class="col-6">
                <h6 class="text-muted">Telepon</h6>
                <p>${user.phone || '-'}</p>
            </div>
            <div class="col-6">
                <h6 class="text-muted">Terdaftar</h6>
                <p>${formatDate(user.created_at)}</p>
            </div>
        </div>
    `;
}

// Download report
function downloadReport(id) {
    // Implement report download
    window.open(`${API_BASE_URL}/admin/inspections/${id}/report`, '_blank');
}

// Update status chart
function updateStatusChart(data) {
    const ctx = document.getElementById('inspectionStatusChart');

    if (inspectionStatusChart) {
        inspectionStatusChart.destroy();
    }

    inspectionStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update monthly chart
function updateMonthlyChart(data) {
    const ctx = document.getElementById('inspectionMonthlyChart');

    if (inspectionMonthlyChart) {
        inspectionMonthlyChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    inspectionMonthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Inspeksi',
                data: values,
                backgroundColor: '#0d6efd'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render pagination
function renderPagination(elementId, pagination, loadFunction) {
    const container = document.getElementById(elementId);

    if (!pagination || pagination.total_pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous
    html += `<li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
        <a class="page-link" href="javascript:${loadFunction}(${pagination.current_page - 1})">Prev</a>
    </li>`;

    // Pages
    for (let i = 1; i <= pagination.total_pages; i++) {
        html += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
            <a class="page-link" href="javascript:${loadFunction}(${i})">${i}</a>
        </li>`;
    }

    // Next
    html += `<li class="page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}">
        <a class="page-link" href="javascript:${loadFunction}(${pagination.current_page + 1})">Next</a>
    </li>`;

    container.innerHTML = html;
}

// Filter events
document.getElementById('inspectionStatusFilter')?.addEventListener('change', () => loadAllInspections(1));
document.getElementById('inspectionSearch')?.addEventListener('input', debounce(() => loadAllInspections(1), 500));
document.getElementById('userRoleFilter')?.addEventListener('change', () => loadAllUsers(1));
document.getElementById('userSearch')?.addEventListener('input', debounce(() => loadAllUsers(1), 500));

// Save status button
document.getElementById('saveStatusBtn')?.addEventListener('click', saveStatusUpdate);

// Load data when section is shown
document.querySelector('.sidebar-nav .nav-link[data-section="all-inspections"]')?.addEventListener('click', () => {
    setTimeout(() => loadAllInspections(1), 100);
});

document.querySelector('.sidebar-nav .nav-link[data-section="users"]')?.addEventListener('click', () => {
    setTimeout(() => loadAllUsers(1), 100);
});

// Utility functions
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Pending</span>',
        'in_progress': '<span class="badge bg-info">Dikerjakan</span>',
        'completed': '<span class="badge bg-success">Selesai</span>',
        'rejected': '<span class="badge bg-danger">Ditolak</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

function getRoleBadge(role) {
    return role === 'admin'
        ? '<span class="badge bg-danger">Admin</span>'
        : '<span class="badge bg-primary">User</span>';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showAlert(message, type = 'info') {
    // Simple alert - can be enhanced with toast notifications
    alert(message);
}

function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    // Add timestamp to prevent auto-redirect
    localStorage.setItem('logout_time', Date.now());
    window.location.href = '../login.html';
}
