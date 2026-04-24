// Dashboard Admin JavaScript
// ============================

// Helper functions from api.js
function getApiUrl() {
    // api.js exposes window.API_BASE_RESOLVED (not window.API_BASE)
    if (typeof window !== 'undefined' && window.API_BASE_RESOLVED) {
        return window.API_BASE_RESOLVED;
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
// NOTE: window.API_BASE is exposed by api.js (const). Do NOT redeclare it.
// Use API_BASE_URL for all fetch calls.

// State
let currentPage = {
    inspections: 1,
    users: 1
};
let inspectionStatusChart = null;
let inspectionMonthlyChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
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
async function checkAuth() {
    const token = localStorage.getItem('otoman_token');

    if (!token) {
        redirectLogin();
        return;
    }

    // Verify token still valid with server
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        // Response is { user: {...} }, not { data: { role: ... } }
        if (data.user?.role !== 'admin') {
            localStorage.removeItem('otoman_token');
            localStorage.removeItem('otoman_user');
            redirectLogin();
            return;
        }
        document.getElementById('adminName').textContent = data.user.name || 'Admin';
        document.getElementById('adminEmailDisplay').textContent = data.user.email || 'admin@otoman.com';
    } catch {
        localStorage.removeItem('otoman_token');
        localStorage.removeItem('otoman_user');
        redirectLogin();
    }
}

function redirectLogin() {
    window.location.href = '../login.html';
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

            // Load section data
            if (section === 'inspections') loadAllInspections(1);
            if (section === 'marketplace') loadMarketplaceListings();

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
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load stats');

        const data = await response.json();
        updateStatsUI(data);
    } catch (error) {
        console.error('Failed to load stats:', error);
        showToast('Gagal memuat statistik', 'danger');
    }
}

function updateStatsUI(data) {
    document.getElementById('totalUsers').textContent = data?.total_users || 0;
    document.getElementById('totalInspections').textContent = data?.total_inspections || 0;
    document.getElementById('pendingInspections').textContent = data?.pending_inspections || 0;
    document.getElementById('completedInspections').textContent = data?.completed_inspections || 0;
}

// Load recent inspections
async function loadRecentInspections() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections?limit=5`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspections');

        const data = await response.json();
        renderRecentInspections(data.inspections || []);
    } catch (error) {
        console.error('Failed to load recent inspections:', error);
        renderRecentInspections([]);
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

    tbody.innerHTML = inspections.map(insp => {
        const isPending = insp.status === 'pending';
        const actionBtn = isPending
            ? `<button class="btn btn-sm btn-primary" onclick="openAssignInspector(${insp.id})" title="Assign Inspector">
                 <i class="bi bi-person-plus"></i>
               </button>
               <button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat Detail">
                 <i class="bi bi-eye"></i>
               </button>`
            : `<button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat Detail">
                 <i class="bi bi-eye"></i>
               </button>`;

        return `
        <tr>
            <td>#${insp.id}</td>
            <td>${insp.user?.name || '-'}</td>
            <td>${insp.vehicle_brand} ${insp.vehicle_model}</td>
            <td>${formatDate(insp.inspection_date)}</td>
            <td>${getStatusBadge(insp.status)}</td>
            <td>${actionBtn}</td>
        </tr>`;
    }).join('');
}

// Load all inspections (with pagination)
async function loadAllInspections(page = 1) {
    currentPage.inspections = page;

    const status = document.getElementById('inspectionStatusFilter').value;
    const search = document.getElementById('inspectionSearch').value;

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
        console.error('Failed to load inspections:', error);
        renderAllInspections([]);
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

    tbody.innerHTML = inspections.map(insp => {
        const isPending = insp.status === 'pending';
        const actionBtn = isPending
            ? `<button class="btn btn-sm btn-primary" onclick="openAssignInspector(${insp.id})" title="Assign Inspector">
                 <i class="bi bi-person-plus"></i>
               </button>
               <button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat Detail">
                 <i class="bi bi-eye"></i>
               </button>`
            : `<button class="btn btn-sm btn-warning" onclick="openUpdateStatus(${insp.id}, '${insp.status}')" title="Update Status">
                 <i class="bi bi-pencil-square"></i>
               </button>
               <button class="btn btn-sm btn-outline-primary" onclick="viewInspection(${insp.id})" title="Lihat Detail">
                 <i class="bi bi-eye"></i>
               </button>`;

        return `
        <tr>
            <td>#${insp.id}</td>
            <td>${insp.user?.name || '-'}</td>
            <td>${insp.vehicle_brand} ${insp.vehicle_model}</td>
            <td>${insp.city || '-'}, ${insp.province || '-'}</td>
            <td>${formatDate(insp.inspection_date)}</td>
            <td>${getStatusBadge(insp.status)}</td>
            <td>${actionBtn}</td>
        </tr>`;
    }).join('');
}

// Load all users
async function loadAllUsers(page = 1) {
    currentPage.users = page;

    const role = document.getElementById('userRoleFilter').value;
    const search = document.getElementById('userSearch').value;

    try {
        const params = new URLSearchParams({ page, limit: 10 });
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
        console.error('Failed to load users:', error);
        renderAllUsers([]);
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
    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load inspection');

        const inspection = await response.json();
        renderInspectionDetail(inspection);
    } catch (error) {
        console.error('Failed to load inspection detail:', error);
        showToast('Gagal memuat detail inspeksi', 'danger');
        renderInspectionDetail({});
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
                        <p class="mb-1">Inspector: <strong>${insp.mechanic?.name || insp.mechanic_name || '-'}</strong></p>
                        <p class="mb-0 text-muted">Telp: ${insp.mechanic?.phone || insp.mechanic_phone || '-'}</p>
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

// Open assign inspector modal
async function openAssignInspector(inspectionId) {
    const modal = document.getElementById('assignInspectorModal');
    if (!modal) {
        alert('Modal tidak ditemukan!');
        return;
    }

    // Set inspection ID
    document.getElementById('assignListingId').value = inspectionId;

    // Fetch inspection data to pre-fill date/time from client's request
    let inspectionDate = '';
    let inspectionTime = '';
    try {
        const inspRes = await fetch(`${API_BASE_URL}/admin/inspections/${inspectionId}`, {
            headers: getHeaders()
        });
        if (inspRes.ok) {
            const inspData = await inspRes.json();
            inspectionDate = inspData.inspection_date || '';
            inspectionTime = inspData.inspection_time || '';
        }
    } catch (error) {
        console.error('Failed to load inspection for pre-fill:', error);
    }

    // Pre-fill date/time from client's request (read-only for accuracy)
    document.getElementById('assignInspectionDate').value = inspectionDate;
    document.getElementById('assignInspectionTime').value = inspectionTime;

    // Fetch mechanics from API
    const mechanicSelect = document.getElementById('assignInspectorSelect');
    mechanicSelect.innerHTML = '<option value="">Memuat...</option>';

    try {
        const res = await fetch(`${API_BASE_URL}/admin/mechanics`, {
            headers: getHeaders()
        });
        if (res.ok) {
            const result = await res.json();
            const mechanics = result.mechanics || [];
            mechanicSelect.innerHTML = '<option value="">-- Pilih Inspector --</option>';
            mechanics.forEach(m => {
                mechanicSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
            });
        } else {
            mechanicSelect.innerHTML = '<option value="">Gagal memuat</option>';
        }
    } catch (error) {
        console.error('Failed to load mechanics:', error);
        mechanicSelect.innerHTML = '<option value="">Error loading</option>';
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Save inspector assignment
async function saveInspectorAssignment() {
    const inspectionId = document.getElementById('assignListingId').value;
    const mechanicId = document.getElementById('assignInspectorSelect').value;
    const scheduledDate = document.getElementById('assignInspectionDate').value;
    const scheduledTime = document.getElementById('assignInspectionTime').value;

    // Validation
    if (!mechanicId || !scheduledDate || !scheduledTime) {
        showToast('Mohon lengkapi semua field yang wajib', 'warning');
        return;
    }

    const resultEl = document.getElementById('assignResult');
    resultEl.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-primary"></div> Menyimpan...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inspections/${inspectionId}/assign`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                mechanic_id: parseInt(mechanicId),
                scheduled_date: scheduledDate,
                scheduled_time: scheduledTime
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Gagal assign inspector (${response.status})`);
        }

        const resultData = await response.json();
        console.log('[ASSIGN] Success:', resultData);

        resultEl.innerHTML = '<div class="alert alert-success py-2 mb-0">Inspector berhasil di-assign!</div>';

        setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('assignInspectorModal')).hide();
            viewInspection(parseInt(inspectionId));
            loadAllInspections(currentPage.inspections);
            loadStats();
            loadRecentInspections();
        }, 1000);

        showToast('Inspector berhasil di-assign!', 'success');
    } catch (error) {
        console.error('[ASSIGN] Error:', error);
        resultEl.innerHTML = `<div class="alert alert-danger py-2 mb-0">${error.message}</div>`;
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
        const response = await fetch(`${API_BASE_URL}/admin/inspections/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Gagal mengupdate status');
        }

        const resultData = await response.json();
        console.log('Status updated:', resultData);

        // Update local state
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

        // Refresh table and stats
        loadAllInspections(currentPage.inspections);
        loadStats();
        loadRecentInspections();
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
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to load user');

        const user = await response.json();
        renderUserDetail(user);
    } catch (error) {
        console.error('Gagal memuat detail user:', error);
        showToast('Gagal memuat detail user', 'danger');
        return;
    }

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
    const btn = document.getElementById('downloadReportBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memuat...';

    fetch(`${API_BASE_URL}/admin/inspections/${id}/report`, { headers: getHeaders() })
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat laporan');
            return res.json();
        })
        .then(report => {
            showReportModal(report);
        })
        .catch(err => {
            console.error('Error downloading report:', err);
            showToast('Gagal memuat laporan: ' + err.message, 'danger');
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
        });
}

function showReportModal(report) {
    const resultStatus = report.result?.status || '';
    const resultClass = resultStatus.toLowerCase();
    const html = `
<div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-file-earmark-text me-2"></i>Laporan Inspeksi - ${report.order_code}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" style="background:#f8f9fa;">
                <iframe id="reportIframe" style="width:100%;height:70vh;border:none;"></iframe>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                <button type="button" class="btn btn-primary" onclick="frames[0].print()">
                    <i class="bi bi-printer me-2"></i>Cetak / Download PDF
                </button>
            </div>
        </div>
    </div>
</div>`;

    document.getElementById('reportModal')?.remove();
    document.body.insertAdjacentHTML('beforeend', html);

    const iframe = document.getElementById('reportIframe');
    iframe.srcdoc = `
<!DOCTYPE html>
<html>
<head>
    <title>Laporan Inspeksi - ${report.order_code}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; }
        h1 { text-align: center; color: #333; }
        h2 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 8px; margin-top: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-code { font-size: 24px; font-weight: bold; color: #0d6efd; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .card { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .card.full { grid-column: 1 / -1; }
        .label { color: #666; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 500; }
        .result-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
        .result-disetujui { background: #d1e7dd; color: #0f5132; }
        .result-menunggu { background: #fff3cd; color: #664d03; }
        .result-ditolak { background: #f8d7da; color: #842029; }
        .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        @media print { button { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN HASIL INSPEKSI KENDARAAN</h1>
        <div class="order-code">${report.order_code}</div>
    </div>

    <h2>Informasi Umum</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Tanggal Inspeksi</div>
            <div class="value">${report.inspection_date || '-'} ${report.inspection_time || ''}</div>
        </div>
        <div class="card">
            <div class="label">Hasil Inspeksi</div>
            <div class="value">
                <span class="result-badge result-${resultClass}">${report.result?.status || '-'}</span>
            </div>
        </div>
    </div>

    <h2>Data Customer</h2>
    <div class="grid">
        <div class="card"><div class="label">Nama</div><div class="value">${report.user?.name || '-'}</div></div>
        <div class="card"><div class="label">Telepon</div><div class="value">${report.user?.phone || '-'}</div></div>
        <div class="card full"><div class="label">Email</div><div class="value">${report.user?.email || '-'}</div></div>
    </div>

    <h2>Data Kendaraan</h2>
    <div class="grid">
        <div class="card"><div class="label">Tipe</div><div class="value">${report.vehicle?.type || '-'}</div></div>
        <div class="card"><div class="label">Merek / Model</div><div class="value">${report.vehicle?.brand || ''} ${report.vehicle?.model || ''}</div></div>
        <div class="card"><div class="label">Tahun</div><div class="value">${report.vehicle?.year || '-'}</div></div>
        <div class="card"><div class="label">No. Plat</div><div class="value">${report.vehicle?.license_plate || '-'}</div></div>
        <div class="card"><div class="label">Jarak Tempuh</div><div class="value">${Number(report.vehicle?.mileage || 0).toLocaleString('id-ID')} km</div></div>
        <div class="card"><div class="label">Kondisi</div><div class="value">${report.vehicle?.condition || '-'}</div></div>
    </div>

    <h2>Lokasi Inspeksi</h2>
    <div class="card full">
        <div class="value">${report.location?.address || '-'}<br>${report.location?.city || ''}, ${report.location?.province || ''}</div>
    </div>

    ${report.mechanic ? `
    <h2>Inspector</h2>
    <div class="grid">
        <div class="card"><div class="label">Nama</div><div class="value">${report.mechanic.name}</div></div>
        <div class="card"><div class="label">Jadwal</div><div class="value">${report.scheduled_date || '-'} ${report.scheduled_time || ''}</div></div>
    </div>` : ''}

    ${report.result?.status ? `
    <h2>Hasil Pemeriksaan</h2>
    <div class="grid">
        <div class="card"><div class="label">Body / Exterior</div><div class="value">${report.result?.body_condition || '-'}</div></div>
        <div class="card"><div class="label">Mesin / Engine</div><div class="value">${report.result?.engine_condition || '-'}</div></div>
        <div class="card"><div class="label">Interior</div><div class="value">${report.result?.interior_condition || '-'}</div></div>
        <div class="card"><div class="label">Hasil Akhir</div><div class="value"><span class="result-badge result-${resultClass}">${report.result?.status}</span></div></div>
        ${report.result?.notes ? `<div class="card full"><div class="label">Catatan</div><div class="value">${report.result.notes}</div></div>` : ''}
    </div>` : ''}

    ${report.admin_notes ? `
    <h2>Catatan Admin</h2>
    <div class="card full"><div class="value">${report.admin_notes}</div></div>
    ` : ''}

    <h2>Pembayaran</h2>
    <div class="grid">
        <div class="card"><div class="label">Metode</div><div class="value">${report.payment?.method || '-'}</div></div>
        <div class="card"><div class="label">Total</div><div class="value">Rp ${Number(report.payment?.price || 0).toLocaleString('id-ID')}</div></div>
    </div>

    <div class="footer">
        <p>Dokumen ini generated secara otomatis oleh sistem OTOMAN</p>
        <p>${report.generated_at}</p>
    </div>
</body>
</html>`;

    new bootstrap.Modal(document.getElementById('reportModal')).show();
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
document.getElementById('mktStatusFilter')?.addEventListener('change', () => loadMarketplaceListings());
document.getElementById('mktSearch')?.addEventListener('input', debounce(() => loadMarketplaceListings(), 500));
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
    const badges = {
        'admin': '<span class="badge bg-danger">Admin</span>',
        'inspector': '<span class="badge bg-info">Inspector</span>',
        'user': '<span class="badge bg-primary">User</span>'
    };
    return badges[role] || `<span class="badge bg-secondary">${role}</span>`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRupiah(amount) {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
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

function showToast(message, type = 'info') {
    // Create toast notification
    const toastContainer = document.getElementById('toastContainer') || (() => {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    })();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    // Add timestamp to prevent auto-redirect
    localStorage.setItem('logout_time', Date.now());
    window.location.href = '../login.html';
}

// ============================================================
// Marketplace Admin Functions
// ============================================================

// Load marketplace stats into the stat cards
async function loadMarketplaceStats() {
    // Marketplace stats loaded via loadMarketplaceListings
}

// Load marketplace listings into the table
async function loadMarketplaceListings(params = {}) {
    const tbody = document.getElementById('marketplaceListingsBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Memuat...</td></tr>
    `;

    try {
        const query = new URLSearchParams({
            status: document.getElementById('mktStatusFilter')?.value || '',
            search: document.getElementById('mktSearch')?.value || '',
            limit: 10,
            ...params
        });

        const res = await fetch(`${API_BASE_URL}/admin/inspections?${query}`, {
            headers: getHeaders()
        });
        const json = await res.json();
        const items = json.inspections || json.data?.inspections || [];

        if (!items.length) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-shop fs-1"></i><p class="mt-2">Belum ada listing marketplace</p>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const images = item.vehicle_images ? (typeof item.vehicle_images === 'string' ? JSON.parse(item.vehicle_images) : item.vehicle_images) : [];
            const thumb = images[0] || '';
            const statusMap = {
                pending: '<span class="badge bg-warning">Pending</span>',
                scheduled: '<span class="badge bg-info">Terjadwal</span>',
                assigned: '<span class="badge bg-primary">Ditugaskan</span>',
                in_progress: '<span class="badge bg-primary">Sedang Inspeksi</span>',
                completed: '<span class="badge bg-success">Selesai</span>',
                rejected: '<span class="badge bg-danger">Ditolak</span>',
            };
            const badge = statusMap[item.status] || `<span class="badge bg-secondary">${item.status}</span>`;

            return `
            <tr>
                <td><span class="text-primary fw-semibold">${item.order_code || '-'}</span></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${thumb ? `<img src="${thumb}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">` : '<div style="width:40px;height:40px;background:#f0f0f0;border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="bi bi-car-front text-muted"></i></div>'}
                        <div>
                            <div class="fw-semibold small">${item.vehicle_brand || item.brand} ${item.vehicle_model || item.model}</div>
                            <div class="text-muted small">${item.license_plate || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>${item.user?.name || '-'}</td>
                <td>${item.vehicle_price ? 'Rp ' + Number(item.vehicle_price).toLocaleString('id-ID') : item.price ? 'Rp ' + Number(item.price).toLocaleString('id-ID') : '-'}</td>
                <td>${badge}</td>
                <td class="small text-muted">${item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewMarketplaceDetail(${item.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

    } catch (err) {
        console.error('[Marketplace] Error loadMarketplaceListings:', err);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Gagal memuat data: ${err.message}</td></tr>`;
    }
}

// View marketplace listing detail
async function viewMarketplaceDetail(id) {
    const content = document.getElementById('marketplaceDetailContent');
    const actions = document.getElementById('marketplaceDetailActions');
    content.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Memuat...</div>';
    actions.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE_URL}/admin/inspections/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Gagal memuat data');
        const json = await res.json();
        const item = json.data || json;
        const images = item.vehicle_images ? (typeof item.vehicle_images === 'string' ? JSON.parse(item.vehicle_images) : item.vehicle_images) : [];

        const statusMap = {
            pending: ['<span class="badge bg-warning">Pending</span>', 'Menunggu'],
            scheduled: ['<span class="badge bg-info">Terjadwal</span>', 'Dijadwalkan'],
            assigned: ['<span class="badge bg-primary">Ditugaskan</span>', 'Sudah Ditugaskan'],
            in_progress: ['<span class="badge bg-primary">Sedang Inspeksi</span>', 'Sedang Inspeksi'],
            completed: ['<span class="badge bg-success">Selesai</span>', 'Selesai'],
            rejected: ['<span class="badge bg-danger">Ditolak</span>', 'Ditolak'],
        };
        const [badge] = statusMap[item.status] || ['<span class="badge bg-secondary">-</span>', '-'];

        const isPending = item.status === 'pending';
        const isCompleted = item.status === 'completed';
        const noMechanic = !item.mechanic_id;

        let photoGallery = '';
        if (images.length) {
            photoGallery = `
            <div class="mb-3">
                <label class="fw-semibold small text-muted">Foto Kendaraan</label>
                <div class="d-flex flex-wrap gap-2 mt-1">
                    ${images.map((img, i) => `<img src="${img}" class="rounded" style="width:80px;height:80px;object-fit:cover;border:2px solid #dee2e6;" onclick="window.open('${img}','_blank')" title="Foto ${i+1}">`).join('')}
                </div>
            </div>`;
        } else {
            photoGallery = `<div class="text-muted small mb-3"><i class="bi bi-image"></i> Tidak ada foto</div>`;
        }

        content.innerHTML = `
            ${photoGallery}
            <div class="row g-3">
                <div class="col-6"><label class="fw-semibold small text-muted">Kode</label><div class="fw-semibold text-primary">${item.order_code || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Status</label><div>${badge}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Merek</label><div>${item.vehicle_brand || item.brand}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Model</label><div>${item.vehicle_model || item.model}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Tahun</label><div>${item.year || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Plat</label><div>${item.license_plate || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Jarak Tempuh</label><div>${item.mileage ? Number(item.mileage).toLocaleString('id-ID') + ' km' : '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Transmisi</label><div>${item.transmission || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Harga Jual</label><div class="fw-semibold text-success">${item.vehicle_price ? 'Rp ' + Number(item.vehicle_price).toLocaleString('id-ID') : '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Tanggal Inspeksi</label><div>${item.inspection_date || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Waktu</label><div>${item.inspection_time || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Inspector</label><div>${item.mechanic?.name || (noMechanic ? '<span class="text-danger">Belum ada</span>' : '-')}</div></div>
                <div class="col-12"><label class="fw-semibold small text-muted">Lokasi</label><div>${item.address || ''}, ${item.city || ''}, ${item.province || ''}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Penjual</label><div>${item.user?.name || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">HP Penjual</label><div>${item.contact_phone || '-'}</div></div>
                ${item.notes ? `<div class="col-12"><label class="fw-semibold small text-muted">Catatan</label><div>${item.notes}</div></div>` : ''}
                ${item.result ? `<div class="col-12"><label class="fw-semibold small text-muted">Hasil Inspeksi</label><div class="fw-semibold ${item.result === 'approve' ? 'text-success' : 'text-danger'}">${item.result === 'approve' ? 'Disetujui' : 'Ditolak'}</div></div>` : ''}
            </div>`;

        // Action buttons based on status
        let btnHtml = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>';

        if (isPending && noMechanic) {
            btnHtml = `
                <button type="button" class="btn btn-primary" onclick="openAssignInspectorMkt(${item.id})">
                    <i class="bi bi-person-badge me-1"></i>Assign Inspector
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
        } else if (isCompleted && item.result === 'approve') {
            btnHtml = `
                <span class="me-auto text-success fw-semibold"><i class="bi bi-check-circle me-1"></i>Sudah Dipublikasi</span>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
        } else if (isCompleted && item.result === 'reject') {
            btnHtml = `
                <span class="me-auto text-danger fw-semibold"><i class="bi bi-x-circle me-1"></i>Ditolak</span>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
        } else {
            btnHtml = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
        }

        actions.innerHTML = btnHtml;

        const modal = new bootstrap.Modal(document.getElementById('marketplaceDetailModal'));
        modal.show();
    } catch (err) {
        content.innerHTML = `<div class="text-center text-danger py-4">Gagal memuat: ${err.message}</div>`;
    }
}

// Open assign inspector for marketplace listing
async function openAssignInspectorMkt(id) {
    closeMktDetail();

    const modal = document.getElementById('assignInspectorModal');
    document.getElementById('assignListingId').value = id;

    // Pre-fill date/time from listing data
    try {
        const res = await fetch(`${API_BASE_URL}/admin/inspections/${id}`, { headers: getHeaders() });
        if (res.ok) {
            const json = await res.json();
            const item = json.data || json;
            document.getElementById('assignInspectionDate').value = item.inspection_date || '';
            document.getElementById('assignInspectionTime').value = item.inspection_time || '';
        }
    } catch {}

    // Load mechanics
    const select = document.getElementById('assignInspectorSelect');
    select.innerHTML = '<option value="">Memuat...</option>';

    try {
        const res = await fetch(`${API_BASE_URL}/admin/mechanics`, { headers: getHeaders() });
        if (res.ok) {
            const json = await res.json();
            const mechanics = json.mechanics || [];
            select.innerHTML = '<option value="">-- Pilih Inspector --</option>';
            mechanics.forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.name}</option>`;
            });
        } else {
            select.innerHTML = '<option value="">Gagal memuat</option>';
        }
    } catch {
        select.innerHTML = '<option value="">Error loading</option>';
    }

    new bootstrap.Modal(modal).show();
}

// Save assign inspector for marketplace
async function saveInspectorAssignment() {
    const id = document.getElementById('assignListingId').value;
    const mechanicId = document.getElementById('assignInspectorSelect').value;
    const date = document.getElementById('assignInspectionDate').value;
    const time = document.getElementById('assignInspectionTime').value;

    if (!mechanicId) return alert('Pilih inspector');

    try {
        const res = await fetch(`${API_BASE_URL}/admin/inspections/${id}/assign`, {
            method: 'POST',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ mechanic_id: mechanicId, scheduled_date: date, scheduled_time: time })
        });

        if (!res.ok) throw new Error('Gagal assign inspector');

        bootstrap.Modal.getInstance(document.getElementById('assignInspectorModal')).hide();
        showToast('Inspector berhasil di-assign!', 'success');
        loadMarketplaceListings();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function closeMktDetail() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('marketplaceDetailModal'));
    if (modal) modal.hide();
}

// Filter marketplace listings
let mktFilterTimeout = null;
function filterMarketplaceListings(_status, _search) {
    // Marketplace not available - no-op
}

// Make functions globally available for onclick handlers
window.openAssignInspector = openAssignInspector;
window.saveInspectorAssignment = saveInspectorAssignment;
window.viewInspection = viewInspection;
window.viewPaymentProof = viewPaymentProof;
window.loadAllInspections = loadAllInspections;
window.loadMarketplaceListings = loadMarketplaceListings;
window.viewMarketplaceDetail = viewMarketplaceDetail;
window.openAssignInspectorMkt = openAssignInspectorMkt;
window.openUpdateStatus = openUpdateStatus;

console.log('✅ Dashboard Admin JS fully loaded');
console.log('✅ openAssignInspector type:', typeof window.openAssignInspector);
console.log('✅ saveInspectorAssignment type:', typeof window.saveInspectorAssignment);
console.log('✅ openAssignInspector:', window.openAssignInspector);

