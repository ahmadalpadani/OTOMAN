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
    // MOCK DATA - Dengan payment dan mechanic
    const mockInspections = [
        { id: 1, user: { id: 1, name: 'Ahmad Wijaya' }, vehicle_brand: 'Toyota', vehicle_model: 'Avanza', vehicle_year: '2021', license_plate: 'B 1234 ABC', location: 'DKI Jakarta, Jakarta Selatan', inspection_date: '2026-03-05', status: 'pending', payment_status: 'paid', mechanic_id: null, created_at: '2026-03-01 10:30:00' },
        { id: 2, user: { id: 2, name: 'Siti Nurhaliza' }, vehicle_brand: 'Honda', vehicle_model: 'Civic', vehicle_year: '2020', license_plate: 'D 5678 DEF', location: 'Jawa Barat, Bandung', inspection_date: '2026-03-04', status: 'in_progress', payment_status: 'paid', mechanic_id: 1, mechanic_name: 'Budi Teknisi', created_at: '2026-03-01 11:45:00' },
        { id: 3, user: { id: 3, name: 'Budi Santoso' }, vehicle_brand: 'Suzuki', vehicle_model: 'Ertiga', vehicle_year: '2022', license_plate: 'F 9012 GHI', location: 'Jawa Timur, Surabaya', inspection_date: '2026-03-03', status: 'completed', payment_status: 'paid', mechanic_id: 2, mechanic_name: 'Joko Mechanic', created_at: '2026-02-28 09:15:00' },
        { id: 4, user: { id: 4, name: 'Dewi Lestari' }, vehicle_brand: 'Nissan', vehicle_model: 'Livina', vehicle_year: '2019', license_plate: 'G 3456 JKL', location: 'Sumatera Utara, Medan', inspection_date: '2026-03-02', status: 'pending', payment_status: 'paid', mechanic_id: null, created_at: '2026-02-28 14:20:00' },
        { id: 5, user: { id: 5, name: 'Rudi Hermawan' }, vehicle_brand: 'Toyota', vehicle_model: 'Fortuner', vehicle_year: '2021', license_plate: 'H 7890 MNO', location: 'DKI Jakarta, Jakarta Barat', inspection_date: '2026-03-01', status: 'completed', payment_status: 'paid', mechanic_id: 3, mechanic_name: 'Asep Service', created_at: '2026-02-27 16:00:00' },
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

    // MOCK DATA - Dengan payment details dan mechanic assignment
    const mockInspectionsAll = [
        { id: 1, user: { id: 1, name: 'Ahmad Wijaya' }, vehicle_brand: 'Toyota', vehicle_model: 'Avanza', vehicle_year: '2021', license_plate: 'B 1234 ABC', location: 'DKI Jakarta, Jakarta Selatan', inspection_date: '2026-03-05', status: 'pending', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: null, created_at: '2026-03-01 10:30:00' },
        { id: 2, user: { id: 2, name: 'Siti Nurhaliza' }, vehicle_brand: 'Honda', vehicle_model: 'Civic', vehicle_year: '2020', license_plate: 'D 5678 DEF', location: 'Jawa Barat, Bandung', inspection_date: '2026-03-04', status: 'in_progress', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 1, mechanic_name: 'Budi Teknisi', scheduled_date: '2026-03-04', scheduled_time: '09:00-11:00', created_at: '2026-03-01 11:45:00' },
        { id: 3, user: { id: 3, name: 'Budi Santoso' }, vehicle_brand: 'Suzuki', vehicle_model: 'Ertiga', vehicle_year: '2022', license_plate: 'F 9012 GHI', location: 'Jawa Timur, Surabaya', inspection_date: '2026-03-03', status: 'completed', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 2, mechanic_name: 'Joko Mechanic', scheduled_date: '2026-03-03', scheduled_time: '10:00-12:00', created_at: '2026-02-28 09:15:00' },
        { id: 4, user: { id: 4, name: 'Dewi Lestari' }, vehicle_brand: 'Nissan', vehicle_model: 'Livina', vehicle_year: '2019', license_plate: 'G 3456 JKL', location: 'Sumatera Utara, Medan', inspection_date: '2026-03-02', status: 'pending', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: null, created_at: '2026-02-28 14:20:00' },
        { id: 5, user: { id: 5, name: 'Rudi Hermawan' }, vehicle_brand: 'Toyota', vehicle_model: 'Fortuner', vehicle_year: '2021', license_plate: 'H 7890 MNO', location: 'DKI Jakarta, Jakarta Barat', inspection_date: '2026-03-01', status: 'completed', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 3, mechanic_name: 'Asep Service', scheduled_date: '2026-03-01', scheduled_time: '14:00-16:00', created_at: '2026-02-27 16:00:00' },
        { id: 6, user: { id: 6, name: 'Indra Gunawan' }, vehicle_brand: 'Mitsubishi', vehicle_model: 'Pajero Sport', vehicle_year: '2020', license_plate: 'B 1111 AAA', location: 'Jawa Barat, Bekasi', inspection_date: '2026-02-28', status: 'rejected', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: null, admin_notes: 'Kendaraan tidak memenuhi kriteria inspection', created_at: '2026-02-26 10:30:00' },
        { id: 7, user: { id: 7, name: 'Maya Sari' }, vehicle_brand: 'Hyundai', vehicle_model: 'Stargazer', vehicle_year: '2023', license_plate: 'D 2222 BBB', location: 'Jawa Timur, Sidoarjo', inspection_date: '2026-02-27', status: 'completed', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 2, mechanic_name: 'Joko Mechanic', scheduled_date: '2026-02-27', scheduled_time: '09:00-11:00', created_at: '2026-02-25 13:45:00' },
        { id: 8, user: { id: 8, name: 'Hendra Wijaya' }, vehicle_brand: 'Wuling', vehicle_model: 'Almaz', vehicle_year: '2022', license_plate: 'F 3333 CCC', location: 'DKI Jakarta, Jakarta Timur', inspection_date: '2026-02-26', status: 'in_progress', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 4, mechanic_name: 'Dedi Inspector', scheduled_date: '2026-02-26', scheduled_time: '11:00-13:00', created_at: '2026-02-24 09:00:00' },
        { id: 9, user: { id: 9, name: 'Rina Susilowati' }, vehicle_brand: 'Kia', vehicle_model: 'Sonet', vehicle_year: '2023', license_plate: 'G 4444 DDD', location: 'Jawa Tengah, Semarang', inspection_date: '2026-02-25', status: 'pending', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: null, created_at: '2026-02-23 15:30:00' },
        { id: 10, user: { id: 10, name: 'Dodi Pratama' }, vehicle_brand: 'Toyota', vehicle_model: 'Rush', vehicle_year: '2021', license_plate: 'H 5555 EEE', location: 'Banten, Tangerang', inspection_date: '2026-02-24', status: 'completed', payment_status: 'paid', payment_method: 'bank_transfer', price: 350000, mechanic_id: 1, mechanic_name: 'Budi Teknisi', scheduled_date: '2026-02-24', scheduled_time: '15:00-17:00', created_at: '2026-02-22 11:00:00' },
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
                <button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat Detail">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load all users
async function loadAllUsers(page = 1) {
    currentPage.users = page;

    const role = document.getElementById('userRoleFilter').value;
    const search = document.getElementById('userSearch').value;

    // MOCK DATA - Manajemen user
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

    // Mock pagination
    const mockPagination = {
        current_page: page,
        total_pages: 2,
        total: 14
    };

    // Filter mock data
    let filteredUsers = mockUsers;
    if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            (u.phone && u.phone.includes(searchLower))
        );
    }

    // Langsung gunakan mock data saja (belum ada API)
    console.log('Loading users with mock data...', { role, search });
    const startIndex = (page - 1) * 10;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + 10);
    renderAllUsers(paginatedUsers);

    // Update pagination based on filtered count
    const totalPages = Math.ceil(filteredUsers.length / 10);
    const updatedPagination = {
        current_page: page,
        total_pages: totalPages,
        total: filteredUsers.length
    };
    renderPagination('userPagination', updatedPagination, 'loadAllUsers');
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
    // MOCK DATA - Dengan payment details, inspector assignment, dan file upload
    const mockDetail = {
        id: id,
        order_code: 'INS-ABC' + String(id).padStart(3, '0'),
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
        // Payment details
        payment_method: 'bank_transfer',
        payment_status: 'paid',
        payment_proof_path: '/storage/payment_proofs/bukti-bayar-' + id + '.jpg',
        payment_proof_url: 'https://via.placeholder.com/400x300?text=Bukti+Pembayaran',
        paid_at: '2026-03-01 10:35:00',
        // Inspector assignment
        mechanic_id: null,
        mechanic_name: null,
        mechanic_phone: null,
        scheduled_date: null,
        scheduled_time: null,
        // Timestamps
        created_at: '2026-03-01 10:30:00',
        updated_at: '2026-03-01 10:30:00'
    };

    // Assign mock mechanic for some inspections
    if (id == 2) {
        mockDetail.mechanic_id = 1;
        mockDetail.mechanic_name = 'Budi Teknisi';
        mockDetail.mechanic_phone = '081987654321';
        mockDetail.scheduled_date = '2026-03-05';
        mockDetail.scheduled_time = '09:00-11:00';
        mockDetail.status = 'in_progress';
    }

    if (id == 3) {
        mockDetail.mechanic_id = 2;
        mockDetail.mechanic_name = 'Joko Mechanic';
        mockDetail.mechanic_phone = '081555555555';
        mockDetail.scheduled_date = '2026-03-03';
        mockDetail.scheduled_time = '10:00-12:00';
        mockDetail.status = 'completed';
    }

    if (id == 6) {
        mockDetail.status = 'rejected';
        mockDetail.admin_notes = 'Kendaraan tidak memenuhi kriteria inspection';
    }

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

    // Format payment status badge
    const getPaymentBadge = (status) => {
        const badges = {
            'unpaid': '<span class="badge bg-warning">Belum Bayar</span>',
            'paid': '<span class="badge bg-success">Lunas</span>',
            'failed': '<span class="badge bg-danger">Gagal</span>'
        };
        return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
    };

    // Format condition
    const conditionLabels = {
        'excellent': 'Sangat Baik',
        'good': 'Baik',
        'fair': 'Cukup',
        'poor': 'Kurang'
    };

    const location = `${insp.city || '-'}, ${insp.province || '-'}`;

    content.innerHTML = `
        <!-- Section: Kendaraan -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Kendaraan</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>${insp.vehicle_brand} ${insp.vehicle_model}</strong></p>
                        <p class="mb-1 text-muted">Tahun: ${insp.vehicle_year}</p>
                        <p class="mb-1 text-muted">Plat: ${insp.license_plate || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">Jarak Tempuh: ${parseInt(insp.mileage || 0).toLocaleString('id-ID')} km</p>
                        <p class="mb-1 text-muted">Kondisi: ${conditionLabels[insp.condition] || '-'}</p>
                        <p class="mb-0 text-muted">Tipe: ${insp.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section: Pemesan & Lokasi -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Pemesan & Lokasi</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>${insp.user?.name || '-'}</strong></p>
                        <p class="mb-1 text-muted">${insp.user?.email || '-'}</p>
                        <p class="mb-0 text-muted">${insp.user?.phone || '-'}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted">${location}</p>
                        <p class="mb-0 text-muted">${insp.address || '-'}</p>
                        <p class="mb-0 text-muted">Tgl: ${formatDate(insp.inspection_date)} | ${insp.inspection_time}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section: Pembayaran -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Pembayaran</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1">Metode: <strong>${insp.payment_method === 'bank_transfer' ? 'Transfer Bank' : 'Tunai'}</strong></p>
                        <p class="mb-1">Status: ${getPaymentBadge(insp.payment_status)}</p>
                        <p class="mb-0 text-muted">Total: <strong>Rp ${parseInt(insp.price || 0).toLocaleString('id-ID')}</strong></p>
                    </div>
                    <div class="col-md-6">
                        ${insp.payment_proof_url ? `
                        <p class="mb-2 text-muted">Bukti Pembayaran:</p>
                        <div class="position-relative d-inline-block">
                            <img src="${insp.payment_proof_url}" alt="Bukti Pembayaran"
                                 class="img-thumbnail" style="max-width: 150px; cursor: pointer;"
                                 onclick="viewPaymentProof('${insp.payment_proof_url}', '${insp.payment_proof_path}')">
                            <span class="position-absolute top-0 start-100 translate-middle badge bg-primary"
                                  style="cursor: pointer;" onclick="viewPaymentProof('${insp.payment_proof_url}', '${insp.payment_proof_path}')">
                                <i class="bi bi-zoom-in"></i>
                            </span>
                        </div>
                        ` : '<p class="text-muted">Belum ada bukti pembayaran</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Section: Inspector Assignment -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Inspector & Jadwal</h6>
            <div class="bg-light p-3 rounded">
                ${insp.mechanic_id ? `
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1">Inspector: <strong>${insp.mechanic_name}</strong></p>
                        <p class="mb-0 text-muted">Telp: ${insp.mechanic_phone}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1">Jadwal: ${formatDate(insp.scheduled_date)}</p>
                        <p class="mb-0 text-muted">Jam: ${insp.scheduled_time}</p>
                    </div>
                </div>
                ` : `
                <div class="text-center py-2">
                    <p class="text-muted mb-2">Belum ada inspector</p>
                    <button class="btn btn-primary btn-sm" onclick="openAssignInspector(${insp.id})">
                        <i class="bi bi-person-plus me-1"></i>Assign Inspector
                    </button>
                </div>
                `}
            </div>
        </div>

        <!-- Section: Status & Catatan -->
        <div class="mb-3">
            <h6 class="text-muted fw-bold">Status & Catatan</h6>
            <div class="bg-light p-3 rounded">
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-2">Status: ${getStatusBadge(insp.status)}</p>
                    </div>
                    <div class="col-md-6">
                        ${insp.admin_notes ? `
                        <p class="mb-1 text-muted">Catatan Admin:</p>
                        <p class="mb-0">${insp.admin_notes}</p>
                        ` : '<p class="text-muted">Belum ada catatan</p>'}
                    </div>
                </div>
                ${insp.notes ? `
                <hr>
                <p class="mb-1 text-muted">Catatan Pemesan:</p>
                <p class="mb-0">${insp.notes}</p>
                ` : ''}
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-between mt-3">
            <div>
                ${!insp.mechanic_id ? `
                <button class="btn btn-primary" onclick="openAssignInspector(${insp.id})">
                    <i class="bi bi-person-plus me-1"></i>Assign Inspector
                </button>
                ` : ''}
            </div>
            <div>
                <button class="btn btn-warning" onclick="openUpdateStatus(${insp.id}, '${insp.status}')">
                    <i class="bi bi-pencil-square me-1"></i>Update Status
                </button>
            </div>
        </div>
    `;

    // Store current inspection for later use
    window.currentInspection = insp;

    // Set download button action
    document.getElementById('downloadReportBtn').onclick = () => downloadReport(insp.id);
}

// View payment proof in modal
function viewPaymentProof(imageUrl, filename) {
    const modalHtml = `
        <div class="modal fade" id="paymentProofModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-receipt me-2"></i>Bukti Pembayaran
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${imageUrl}" alt="Bukti Pembayaran" class="img-fluid" style="max-height: 70vh;">
                        <p class="mt-2 text-muted">${filename || ''}</p>
                    </div>
                    <div class="modal-footer">
                        <a href="${imageUrl}" download="bukti-pembayaran-${filename}" class="btn btn-primary">
                            <i class="bi bi-download me-2"></i>Download
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    document.getElementById('paymentProofModal')?.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('paymentProofModal'));
    modal.show();
}

// Mock data for mechanics/inspectors
const mockMechanics = [
    { id: 1, name: 'Budi Teknisi', phone: '081987654321', area: 'Jakarta' },
    { id: 2, name: 'Joko Mechanic', phone: '081555555555', area: 'Bandung' },
    { id: 3, name: 'Asep Service', phone: '081333333333', area: 'Surabaya' },
    { id: 4, name: 'Dedi Inspector', phone: '081222222222', area: 'Jakarta' },
    { id: 5, name: 'Rudi Teknisi', phone: '081111111111', area: 'Bekasi' }
];

// Open assign inspector modal
function openAssignInspector(inspectionId) {
    // Check if modal exists, if not create it
    let modal = document.getElementById('assignInspectorModal');
    if (!modal) {
        const modalHtml = `
            <div class="modal fade" id="assignInspectorModal" tabindex="-1" aria-labelledby="assignInspectorModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="assignInspectorModalLabel">
                                <i class="bi bi-person-plus me-2"></i>Assign Inspector
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="assignInspectorForm">
                                <input type="hidden" id="assignInspectionId">
                                <div class="mb-3">
                                    <label class="form-label">Pilih Inspector</label>
                                    <select class="form-select" id="mechanicSelect" required>
                                        <option value="">-- Pilih Inspector --</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tanggal Jadwal</label>
                                    <input type="date" class="form-control" id="scheduledDate" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Waktu Jadwal</label>
                                    <select class="form-select" id="scheduledTime" required>
                                        <option value="">-- Pilih Waktu --</option>
                                        <option value="09:00-11:00">09:00 - 11:00</option>
                                        <option value="11:00-13:00">11:00 - 13:00</option>
                                        <option value="13:00-15:00">13:00 - 15:00</option>
                                        <option value="15:00-17:00">15:00 - 17:00</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Catatan</label>
                                    <textarea class="form-control" id="inspectorNotes" rows="2" placeholder="Catatan untuk inspector..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-primary" id="saveInspectorBtn">
                                <i class="bi bi-check-lg me-2"></i>Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('assignInspectorModal');

        // Add event listener for save button
        document.getElementById('saveInspectorBtn').addEventListener('click', saveInspectorAssignment);
    }

    // Set inspection ID
    document.getElementById('assignInspectionId').value = inspectionId;

    // Populate mechanic select
    const mechanicSelect = document.getElementById('mechanicSelect');
    mechanicSelect.innerHTML = '<option value="">-- Pilih Inspector --</option>';
    mockMechanics.forEach(m => {
        mechanicSelect.innerHTML += `<option value="${m.id}">${m.name} (${m.area})</option>`;
    });

    // Reset form
    document.getElementById('scheduledDate').value = '';
    document.getElementById('scheduledTime').value = '';
    document.getElementById('inspectorNotes').value = '';

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Save inspector assignment
async function saveInspectorAssignment() {
    const inspectionId = document.getElementById('assignInspectionId').value;
    const mechanicId = document.getElementById('mechanicSelect').value;
    const scheduledDate = document.getElementById('scheduledDate').value;
    const scheduledTime = document.getElementById('scheduledTime').value;
    const notes = document.getElementById('inspectorNotes').value;

    // Validation
    if (!mechanicId || !scheduledDate || !scheduledTime) {
        showToast('Mohon lengkapi semua field yang wajib', 'warning');
        return;
    }

    // Find selected mechanic
    const mechanic = mockMechanics.find(m => m.id == mechanicId);

    // Show loading
    const saveBtn = document.getElementById('saveInspectorBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

    // Simulate API call
    try {
        // In real app: await fetch(`${API_BASE_URL}/admin/inspections/${inspectionId}/assign`, ...)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local mock data
        window.currentInspection.mechanic_id = parseInt(mechanicId);
        window.currentInspection.mechanic_name = mechanic.name;
        window.currentInspection.mechanic_phone = mechanic.phone;
        window.currentInspection.scheduled_date = scheduledDate;
        window.currentInspection.scheduled_time = scheduledTime;
        window.currentInspection.status = 'in_progress';

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('assignInspectorModal')).hide();

        // Refresh detail view
        viewInspection(parseInt(inspectionId));

        // Refresh table
        loadAllInspections(currentPage.inspections);

        showToast('Inspector berhasil di-assign!', 'success');
    } catch (error) {
        console.error('Error assigning inspector:', error);
        showToast('Gagal assign inspector', 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
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

    // Confirmation for status that trigger email
    const statusThatTriggerEmail = ['completed', 'rejected'];
    let sendEmail = false;

    if (statusThatTriggerEmail.includes(status)) {
        const confirmMessage = status === 'completed'
            ? 'Status akan diubah menjadi "Selesai" dan email notifikasi akan dikirim ke customer. Lanjutkan?'
            : 'Status akan diubah menjadi "Ditolak" dan email notifikasi akan dikirim ke customer. Lanjutkan?';

        if (!confirm(confirmMessage)) {
            return;
        }
        sendEmail = true;
    }

    // Prepare request body
    const requestBody = {
        status: status,
        notes: notes
    };

    if (sendEmail) {
        requestBody.send_email = true;
    }

    // Show loading
    const saveBtn = document.getElementById('saveStatusBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

    try {
        // In real app: call API
        // const response = await fetch(`${API_BASE_URL}/admin/inspections/${id}/status`, {
        //     method: 'PUT',
        //     headers: getHeaders(),
        //     body: JSON.stringify(requestBody)
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local mock data
        window.currentInspection.status = status;
        window.currentInspection.admin_notes = notes;
        window.currentInspection.updated_at = new Date().toISOString();

        // Show success message
        let successMsg = 'Status berhasil diupdate!';
        if (sendEmail) {
            successMsg += ' Email notifikasi telah dikirim ke customer.';
        }
        showAlert(successMsg, 'success');

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();

        // Refresh detail view
        viewInspection(parseInt(id));

        // Refresh table
        loadAllInspections(currentPage.inspections);
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('Gagal mengupdate status', 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// View user detail
async function viewUser(id) {
    // MOCK DATA - Detail user
    const mockUserDetails = {
        1: { id: 1, name: 'Ahmad Wijaya', email: 'ahmad@example.com', phone: '081234567890', role: 'user', created_at: '2026-01-15 10:30:00' },
        2: { id: 2, name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '081234567891', role: 'user', created_at: '2026-01-20 14:15:00' },
        3: { id: 3, name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567892', role: 'user', created_at: '2026-02-01 09:30:00' },
        4: { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', phone: '081234567893', role: 'user', created_at: '2026-02-10 11:45:00' },
        5: { id: 5, name: 'Admin OTOMAN', email: 'admin@otoman.com', phone: null, role: 'admin', created_at: '2026-01-01 08:00:00' },
        6: { id: 6, name: 'Budi Teknisi', email: 'budi@otoman.com', phone: '081987654321', role: 'inspector', created_at: '2026-02-01 09:00:00' },
        7: { id: 7, name: 'Rina Susilowati', email: 'rina@example.com', phone: '081234567894', role: 'user', created_at: '2026-02-15 16:20:00' },
        8: { id: 8, name: 'Dodi Pratama', email: 'dodi@example.com', phone: '081234567895', role: 'user', created_at: '2026-02-20 08:10:00' },
        9: { id: 9, name: 'Maya Sari', email: 'maya@example.com', phone: '081234567896', role: 'user', created_at: '2026-02-25 13:30:00' },
        10: { id: 10, name: 'Hendra Wijaya', email: 'hendra@example.com', phone: '081234567897', role: 'user', created_at: '2026-03-01 10:00:00' },
        11: { id: 11, name: 'Joko Mechanic', email: 'joko@otoman.com', phone: '081555555555', role: 'inspector', created_at: '2026-02-05 10:30:00' },
        12: { id: 12, name: 'Asep Service', email: 'asep@otoman.com', phone: '081333333333', role: 'inspector', created_at: '2026-02-10 14:00:00' },
        13: { id: 13, name: 'Dedi Inspector', email: 'dedi@otoman.com', phone: '081222222222', role: 'inspector', created_at: '2026-02-15 11:20:00' },
        14: { id: 14, name: 'Rudi Teknisi', email: 'rudi@otoman.com', phone: '081111111111', role: 'inspector', created_at: '2026-02-20 09:45:00' },
    };

    // Langsung gunakan mock data
    console.log('Loading user detail with mock data, id:', id);
    const user = mockUserDetails[id] || mockUserDetails[1];
    renderUserDetail(user);

    const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
    modal.show();
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
