// Dashboard JavaScript - OTOMAN

document.addEventListener('DOMContentLoaded', function() {

    // DEBUG: Clear all cached data on load
    console.log('[Dashboard] Clearing all cached data...');
    delete window.inspectionsData;
    localStorage.removeItem('inspectionsCache');

    // Check authentication
    checkAuth();

    // Initialize components
    initializeSidebar();
    initializeNavigation();
    loadUserData();
    loadDashboardData();

    // Profile form
    initializeProfileForm();

    // Functions
    function checkAuth() {
        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            // Redirect to login if not authenticated
            window.location.href = '../login.html';
            return;
        }

        // Redirect admin to admin dashboard
        if (user.role === 'admin') {
            window.location.href = 'dashboard-admin.html';
            return;
        }
    }

    function initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarClose = document.getElementById('sidebarClose');

        // Toggle sidebar on mobile
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
        }

        // Close sidebar on mobile
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function() {
                sidebar.classList.remove('show');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                if (!sidebar.contains(e.target) && !sidebarToggle?.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }

    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const targetSection = this.getAttribute('data-section');

                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${targetSection}-section`) {
                        section.classList.add('active');
                    }
                });

                // Update page title
                const titles = {
                    'overview': 'Dashboard',
                    'inspections': 'Inspeksi Saya',
                    'marketplace': 'Marketplace',
                    'listings': 'Iklan Saya',
                    'profile': 'Profil Saya'
                };
                pageTitle.textContent = titles[targetSection] || 'Dashboard';

                // Close sidebar on mobile after navigation
                if (window.innerWidth < 992) {
                    document.getElementById('sidebar').classList.remove('show');
                }

                // Load section-specific data
                loadSectionData(targetSection);
            });
        });

        // Quick inspection button
        const quickInspectionBtn = document.getElementById('quickInspectionBtn');
        if (quickInspectionBtn) {
            quickInspectionBtn.addEventListener('click', function() {
                window.location.href = '../inspection.html';
            });
        }

        // Marketplace quick action
        const marketplaceLinks = document.querySelectorAll('a[href="#marketplace"]');
        marketplaceLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('[data-section="marketplace"]').click();
            });
        });
    }

    // Navigate to a section programmatically (used by "Lihat Semua" button)
    function navigateToSection(sectionName) {
        const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${sectionName}"]`);
        if (navLink) {
            navLink.click();
        }
    }
    window.navigateToSection = navigateToSection;
    window.filterListings = filterListings;
    window.loadListings = loadListings;

    function loadUserData() {
        const user = getUser();

        if (user) {
            // Update sidebar user info
            const userNameEl = document.getElementById('userName');
            const userEmailDisplayEl = document.getElementById('userEmailDisplay');

            if (userNameEl) {
                userNameEl.textContent = user.name || 'User';
            }
            if (userEmailDisplayEl) {
                userEmailDisplayEl.textContent = user.email || '';
            }

            // Update profile section
            const profileNameEl = document.getElementById('profileName');
            const profileEmailEl = document.getElementById('profileEmail');
            const profileNameInput = document.getElementById('profileNameInput');
            const profileEmailInput = document.getElementById('profileEmailInput');

            if (profileNameEl) {
                profileNameEl.textContent = user.name || 'User';
            }
            if (profileEmailEl) {
                profileEmailEl.textContent = user.email || '';
            }
            if (profileNameInput) {
                profileNameInput.value = user.name || '';
            }
            if (profileEmailInput) {
                profileEmailInput.value = user.email || '';
            }
        }
    }

    async function loadDashboardData() {
        try {
            // Load statistics
            await loadStatistics();

            // Load recent activity
            await loadRecentActivity();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async function loadStatistics() {
        try {
            // Load inspections data from API
            const response = await apiGet('/inspections');

            // Handle pagination response (backend returns { message, data: { data: [...], ... } })
            const inspections = response?.data?.data || [];

            // Calculate statistics
            const totalInspections = inspections.length;
            const pendingInspections = inspections.filter(i => i.status === 'pending').length;

            // Update UI
            const totalInspectionsEl = document.getElementById('totalInspections');
            const pendingInspectionsEl = document.getElementById('pendingInspections');

            if (totalInspectionsEl) totalInspectionsEl.textContent = totalInspections;
            if (pendingInspectionsEl) pendingInspectionsEl.textContent = pendingInspections;

        } catch (error) {
            console.error('Error loading statistics:', error);

            // Set to 0 on error
            const totalInspectionsEl = document.getElementById('totalInspections');
            const pendingInspectionsEl = document.getElementById('pendingInspections');

            if (totalInspectionsEl) totalInspectionsEl.textContent = '0';
            if (pendingInspectionsEl) pendingInspectionsEl.textContent = '0';
        }
    }

    async function loadRecentActivity() {
        try {
            // Load inspections from API
            const response = await apiGet('/inspections');

            // Handle pagination response (backend returns { message, data: { data: [...], ... } })
            const inspections = response?.data?.data || [];
            const activityContainer = document.getElementById('recentActivity');

            if (!activityContainer) return;

            // Get latest 3 inspections
            const recentInspections = inspections.slice(0, 3);

            if (recentInspections.length === 0) {
                activityContainer.innerHTML = `
                    <div class="text-center text-muted py-5">
                        <i class="bi bi-inbox fs-1"></i>
                        <p class="mt-3">Belum ada aktivitas</p>
                        <a href="../inspection.html" class="btn btn-primary btn-sm">Mulai Sekarang</a>
                    </div>
                `;
                return;
            }

            // Render activity items
            activityContainer.innerHTML = recentInspections.map(inspection => {
                const statusClass = {
                    'pending': 'warning',
                    'in_progress': 'primary',
                    'completed': 'success',
                    'rejected': 'danger'
                }[inspection.status] || 'secondary';

                const statusLabel = {
                    'pending': 'Menunggu',
                    'in_progress': 'Dalam Proses',
                    'completed': 'Selesai',
                    'rejected': 'Ditolak'
                }[inspection.status] || 'Unknown';

                const typeIcon = inspection.vehicle_type === 'mobil' ? 'bi-car-front' : 'bi-bicycle';

                return `
                    <div class="activity-item d-flex align-items-start mb-3">
                        <div class="activity-icon bg-primary bg-opacity-10 text-primary">
                            <i class="bi ${typeIcon}"></i>
                        </div>
                        <div class="activity-content flex-grow-1">
                            <h6 class="mb-1">${inspection.brand} ${inspection.model}</h6>
                            <p class="text-muted small mb-1">
                                <i class="bi bi-calendar3 me-1"></i>${formatDateIndo(inspection.inspection_date)}
                                <span class="mx-2">•</span>
                                <span class="badge bg-${statusClass}">${statusLabel}</span>
                            </p>
                        </div>
                        <span class="text-muted small">${formatTimeAgo(inspection.created_at)}</span>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading recent activity:', error);

            const activityContainer = document.getElementById('recentActivity');
            if (activityContainer) {
                activityContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Gagal memuat aktivitas terbaru.
                    </div>
                `;
            }
        }
    }

    async function loadSectionData(section) {
        switch(section) {
            case 'inspections':
                await loadInspections();
                break;
            case 'marketplace':
                await loadMarketplace();
                break;
            case 'listings':
                await loadListings();
                break;
        }
    }

    async function loadInspections() {
        const container = document.getElementById('inspectionsList');
        if (!container) return;

        try {
            // Load inspections from API
            console.log('[Dashboard] Fetching inspections from API...');
            const response = await apiGet('/inspections');
            console.log('[Dashboard] API Response:', response);

            // Handle pagination response (backend returns { message, data: { data: [...], ... } })
            const inspections = response?.data?.data || [];
            console.log('[Dashboard] Inspections count:', inspections.length);
            console.log('[Dashboard] Inspections data:', inspections);

            if (inspections.length === 0) {
                console.log('[Dashboard] No inspections found, showing empty state');
                container.innerHTML = `
                    <div class="text-center text-muted py-5">
                        <i class="bi bi-clipboard-x fs-1"></i>
                        <p class="mt-3">Belum ada inspeksi</p>
                        <a href="../inspection.html" class="btn btn-primary btn-sm">Pesan Inspeksi Sekarang</a>
                    </div>
                `;
                return;
            }

            // Store inspections globally for detail view
            window.inspectionsData = inspections;
            console.log('[Dashboard] Stored to window.inspectionsData:', window.inspectionsData);

            // Render inspection cards
            console.log('[Dashboard] Rendering inspection cards...');
            container.innerHTML = inspections.map(inspection => createInspectionCard(inspection)).join('');
            console.log('[Dashboard] Inspection cards rendered successfully');

            // Add click handlers
            container.querySelectorAll('.inspection-card-clickable').forEach(card => {
                card.addEventListener('click', function() {
                    const inspectionId = this.getAttribute('data-id');
                    showInspectionDetail(inspectionId);
                });
            });

        } catch (error) {
            console.error('Error loading inspections:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Gagal memuat data inspeksi. Silakan coba lagi.
                </div>
            `;
        }
    }

    function createInspectionCard(inspection) {
        const statusClass = {
            'pending': 'pending',
            'in_progress': 'in_progress',
            'completed': 'completed',
            'rejected': 'rejected'
        }[inspection.status] || 'pending';

        const statusLabel = {
            'pending': 'Menunggu',
            'in_progress': 'Dalam Proses',
            'completed': 'Selesai',
            'rejected': 'Ditolak'
        }[inspection.status] || 'Menunggu';

        const typeIcon = inspection.vehicle_type === 'mobil' ? 'bi-car-front' : 'bi-bicycle';

        // Format location
        const location = `${inspection.city}, ${inspection.province}`;

        return `
            <div class="inspection-card inspection-card-clickable" data-id="${inspection.id}" style="cursor: pointer;">
                <div class="inspection-header">
                    <div>
                        <span class="inspection-id">${inspection.order_code}</span>
                        <h6 class="inspection-vehicle mb-1">
                            <i class="bi ${typeIcon} me-1"></i>${inspection.brand} ${inspection.model}
                        </h6>
                    </div>
                    <span class="inspection-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="inspection-details">
                    <div class="inspection-detail">
                        <i class="bi bi-calendar3"></i>
                        <span>${formatDateIndo(inspection.inspection_date)}</span>
                    </div>
                    <div class="inspection-detail">
                        <i class="bi bi-clock"></i>
                        <span>${inspection.inspection_time}</span>
                    </div>
                    <div class="inspection-detail">
                        <i class="bi bi-geo-alt"></i>
                        <span>${location}</span>
                    </div>
                </div>
                <div class="inspection-price mt-2">
                    <small class="text-muted">Biaya:</small>
                    <span class="fw-bold text-primary ms-1">Rp ${Number(inspection.price).toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
    }

    function showInspectionDetail(inspectionId) {
        const inspection = window.inspectionsData.find(i => i.id == inspectionId);
        if (!inspection) return;

        const modal = document.getElementById('inspectionDetailModal');
        const content = document.getElementById('inspectionDetailContent');
        const downloadBtn = document.getElementById('downloadReportBtn');

        const statusClass = {
            'pending': 'warning',
            'in_progress': 'primary',
            'completed': 'success',
            'rejected': 'danger'
        }[inspection.status] || 'secondary';

        const statusLabel = {
            'pending': 'Menunggu Konfirmasi',
            'in_progress': 'Inspeksi Sedang Berlangsung',
            'completed': 'Inspeksi Selesai',
            'rejected': 'Ditolak'
        }[inspection.status] || 'Unknown';

        const conditionLabels = {
            'excellent': 'Sangat Baik',
            'good': 'Baik',
            'fair': 'Cukup',
            'poor': 'Kurang'
        };

        // Format location
        const location = `${inspection.city}, ${inspection.province}`;

        content.innerHTML = `
            <!-- Status Badge -->
            <div class="text-center mb-4">
                <span class="badge bg-${statusClass} fs-6 px-4 py-2">${statusLabel}</span>
            </div>

            <!-- Order Info -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-receipt me-2"></i>Informasi Pesanan
                </h6>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Kode Pesanan</span>
                        <span class="detail-value fw-bold">${inspection.order_code}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Biaya</span>
                        <span class="detail-value fw-bold text-primary">Rp ${Number(inspection.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value"><span class="badge bg-${statusClass}">${statusLabel}</span></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Dipesan pada</span>
                        <span class="detail-value">${formatDateIndo(inspection.created_at)}</span>
                    </div>
                </div>
            </div>

            <!-- Vehicle Info -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-car-front me-2"></i>Informasi Kendaraan
                </h6>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Jenis</span>
                        <span class="detail-value">${inspection.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Merek & Model</span>
                        <span class="detail-value">${inspection.brand} ${inspection.model}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tahun</span>
                        <span class="detail-value">${inspection.year}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Kilometer</span>
                        <span class="detail-value">${Number(inspection.mileage).toLocaleString('id-ID')} km</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Kondisi</span>
                        <span class="detail-value">${conditionLabels[inspection.condition] || '-'}</span>
                    </div>
                </div>
            </div>

            ${inspection.notes ? `
                <!-- Notes -->
                <div class="detail-section mb-4">
                    <h6 class="detail-section-title">
                        <i class="bi bi-card-text me-2"></i>Catatan Tambahan
                    </h6>
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        ${inspection.notes || '-'}
                    </div>
                </div>
            ` : ''}

            <!-- Schedule Info -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-calendar-check me-2"></i>Jadwal & Lokasi
                </h6>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Tanggal</span>
                        <span class="detail-value">${formatDateIndo(inspection.inspection_date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Waktu</span>
                        <span class="detail-value">${inspection.inspection_time}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Lokasi</span>
                        <span class="detail-value">${location}</span>
                    </div>
                    <div class="detail-item full-width">
                        <span class="detail-label">Alamat Lengkap</span>
                        <span class="detail-value">${inspection.address}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">No. Telepon</span>
                        <span class="detail-value">${inspection.contact_phone}</span>
                    </div>
                </div>
            </div>

            ${inspection.mechanic_id ? `
            <!-- Inspector Info -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-person-badge me-2"></i>Inspector
                </h6>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Nama</span>
                        <span class="detail-value fw-bold">${inspection.mechanic?.name || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">No. Telepon</span>
                        <span class="detail-value">${inspection.mechanic?.phone || '-'}</span>
                    </div>
                    ${inspection.scheduled_date ? `
                    <div class="detail-item">
                        <span class="detail-label">Jadwal Inspeksi</span>
                        <span class="detail-value">${formatDateIndo(inspection.scheduled_date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Jam</span>
                        <span class="detail-value">${inspection.scheduled_time}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : `
            ${inspection.status === 'pending' ? `
            <!-- Waiting for Assignment -->
            <div class="alert alert-warning mb-4">
                <i class="bi bi-hourglass-split me-2"></i>
                <strong>Menunggu konfirmasi admin.</strong> Inspector akan segera ditugaskan.
            </div>
            ` : ''}
            `}

            ${inspection.admin_notes ? `
            <!-- Admin Notes -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-sticky me-2"></i>Catatan Admin
                </h6>
                <div class="alert alert-secondary mb-0">
                    ${inspection.admin_notes}
                </div>
            </div>
            ` : ''}

            ${inspection.payment_proof_path ? `
            <!-- Payment Proof -->
            <div class="detail-section mb-4">
                <h6 class="detail-section-title">
                    <i class="bi bi-receipt me-2"></i>Bukti Pembayaran
                </h6>
                <div class="bg-light p-3 rounded">
                    <div class="d-flex align-items-start gap-3">
                        ${inspection.payment_proof_path.match(/\.(jpg|jpeg|png|gif)$/i)
                            ? `<img src="${STORAGE_BASE}/storage/${inspection.payment_proof_path}" alt="Bukti Pembayaran" class="img-thumbnail" style="max-width: 200px; max-height: 200px; cursor: pointer;" onclick="window.open('${STORAGE_BASE}/storage/${inspection.payment_proof_path}', '_blank')">`
                            : `<a href="${STORAGE_BASE}/storage/${inspection.payment_proof_path}" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-file-earmark-arrow-down me-1"></i>Download Bukti Bayar</a>`
                        }
                        <div>
                            <p class="mb-1"><strong>${inspection.payment_status === 'paid' ? 'Lunas' : inspection.payment_status}</strong></p>
                            <p class="mb-0 text-muted small">Klik gambar untuk memperbesar</p>
                        </div>
                    </div>
                </div>
            </div>
            ` : `
            ${inspection.payment_status === 'unpaid' ? `
            <div class="alert alert-warning mb-4">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Belum ada bukti pembayaran.</strong> Silakan upload bukti transfer.
            </div>
            ` : ''}
            `}
        `;

        // Show download button only for completed inspections
        if (downloadBtn) {
            downloadBtn.style.display = inspection.status === 'completed' ? 'inline-block' : 'none';
            downloadBtn.onclick = () => downloadInspectionReport(inspection.id);
        }

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    // Download inspection report
    async function downloadInspectionReport(inspectionId) {
        const btn = document.getElementById('downloadReportBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memuat...';

        try {
            const report = await apiGet(`/inspections/${inspectionId}/report`);

            // Open report in new window for printing/download
            const reportWindow = window.open('', '_blank');

            if (!reportWindow) {
                // Popup blocked - show in current page instead
                const printContent = generateReportHTML(report);
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                if (printWindow) {
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                } else {
                    // Fallback: show in a modal
                    showReportModal(report);
                }
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }

            reportWindow.document.write(`
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
        .result-approve { background: #d1e7dd; color: #0f5132; }
        .result-pending { background: #fff3cd; color: #664d03; }
        .result-reject { background: #f8d7da; color: #842029; }
        .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        @media print { button { display: none; } }
    </style>
</head>

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
        .result-approve { background: #d1e7dd; color: #0f5132; }
        .result-pending { background: #fff3cd; color: #664d03; }
        .result-reject { background: #f8d7da; color: #842029; }
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
            <div class="value">${report.inspection_date} ${report.inspection_time}</div>
        </div>
        <div class="card">
            <div class="label">Hasil Inspeksi</div>
            <div class="value">
                <span class="result-badge result-${report.result?.status?.toLowerCase()}">${report.result?.status}</span>
            </div>
        </div>
    </div>

    <h2>Data Customer</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Nama</div>
            <div class="value">${report.user?.name || '-'}</div>
        </div>
        <div class="card">
            <div class="label">Telepon</div>
            <div class="value">${report.user?.phone || '-'}</div>
        </div>
        <div class="card full">
            <div class="label">Email</div>
            <div class="value">${report.user?.email || '-'}</div>
        </div>
    </div>

    <h2>Data Kendaraan</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Tipe</div>
            <div class="value">${report.vehicle?.type}</div>
        </div>
        <div class="card">
            <div class="label">Merek / Model</div>
            <div class="value">${report.vehicle?.brand} ${report.vehicle?.model}</div>
        </div>
        <div class="card">
            <div class="label">Tahun</div>
            <div class="value">${report.vehicle?.year}</div>
        </div>
        <div class="card">
            <div class="label">No. Plat</div>
            <div class="value">${report.vehicle?.license_plate || '-'}</div>
        </div>
        <div class="card">
            <div class="label">Jarak Tempuh</div>
            <div class="value">${Number(report.vehicle?.mileage || 0).toLocaleString('id-ID')} km</div>
        </div>
        <div class="card">
            <div class="label">Kondisi Umum</div>
            <div class="value">${report.vehicle?.condition}</div>
        </div>
    </div>

    <h2>Lokasi Inspeksi</h2>
    <div class="card full">
        <div class="value">${report.location?.address}<br>${report.location?.city}, ${report.location?.province}</div>
    </div>

    ${report.mechanic ? `
    <h2>Inspector</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Nama</div>
            <div class="value">${report.mechanic.name}</div>
        </div>
        <div class="card">
            <div class="label">Jadwal</div>
            <div class="value">${report.scheduled_date} ${report.scheduled_time}</div>
        </div>
    </div>
    ` : ''}

    <h2>Hasil Pemeriksaan</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Body / Exterior</div>
            <div class="value">${report.result?.body_condition}</div>
        </div>
        <div class="card">
            <div class="label">Mesin / Engine</div>
            <div class="value">${report.result?.engine_condition}</div>
        </div>
        <div class="card">
            <div class="label">Interior</div>
            <div class="value">${report.result?.interior_condition}</div>
        </div>
        <div class="card">
            <div class="label">Hasil Akhir</div>
            <div class="value">
                <span class="result-badge result-${report.result?.status?.toLowerCase()}">${report.result?.status}</span>
            </div>
        </div>
        ${report.result?.notes ? `
        <div class="card full">
            <div class="label">Catatan</div>
            <div class="value">${report.result.notes}</div>
        </div>
        ` : ''}
    </div>

    <h2>Pembayaran</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Metode</div>
            <div class="value">${report.payment?.method}</div>
        </div>
        <div class="card">
            <div class="label">Total</div>
            <div class="value">Rp ${Number(report.payment?.price || 0).toLocaleString('id-ID')}</div>
        </div>
    </div>

    <div class="footer">
        <p>Dokumen ini generated secara otomatis oleh sistem OTOMAN</p>
        <p>${report.generated_at}</p>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 30px;font-size:16px;cursor:pointer;">
            Cetak / Download PDF
        </button>
    </div>
</body>
</html>
            `);
            reportWindow.document.close();
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Gagal memuat laporan: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // Generate HTML for report
    function generateReportHTML(report) {
        const resultStatus = report.result?.status || '';
        const resultClass = resultStatus.toLowerCase();
        return `
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
        .result-approve { background: #d1e7dd; color: #0f5132; }
        .result-pending { background: #fff3cd; color: #664d03; }
        .result-reject { background: #f8d7da; color: #842029; }
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
            <div class="value">${report.inspection_date} ${report.inspection_time}</div>
        </div>
        <div class="card">
            <div class="label">Hasil Inspeksi</div>
            <div class="value">
                <span class="result-badge result-${resultClass}">${report.result?.status}</span>
            </div>
        </div>
    </div>

    <h2>Data Customer</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Nama</div>
            <div class="value">${report.user?.name || '-'}</div>
        </div>
        <div class="card">
            <div class="label">Telepon</div>
            <div class="value">${report.user?.phone || '-'}</div>
        </div>
        <div class="card full">
            <div class="label">Email</div>
            <div class="value">${report.user?.email || '-'}</div>
        </div>
    </div>

    <h2>Data Kendaraan</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Tipe</div>
            <div class="value">${report.vehicle?.type}</div>
        </div>
        <div class="card">
            <div class="label">Merek / Model</div>
            <div class="value">${report.vehicle?.brand} ${report.vehicle?.model}</div>
        </div>
        <div class="card">
            <div class="label">Tahun</div>
            <div class="value">${report.vehicle?.year}</div>
        </div>
        <div class="card">
            <div class="label">No. Plat</div>
            <div class="value">${report.vehicle?.license_plate || '-'}</div>
        </div>
        <div class="card">
            <div class="label">Jarak Tempuh</div>
            <div class="value">${Number(report.vehicle?.mileage || 0).toLocaleString('id-ID')} km</div>
        </div>
        <div class="card">
            <div class="label">Kondisi Umum</div>
            <div class="value">${report.vehicle?.condition}</div>
        </div>
    </div>

    <h2>Lokasi Inspeksi</h2>
    <div class="card full">
        <div class="value">${report.location?.address}<br>${report.location?.city}, ${report.location?.province}</div>
    </div>

    ${report.mechanic ? `
    <h2>Inspector</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Nama</div>
            <div class="value">${report.mechanic.name}</div>
        </div>
        <div class="card">
            <div class="label">Jadwal</div>
            <div class="value">${report.scheduled_date} ${report.scheduled_time}</div>
        </div>
    </div>
    ` : ''}

    <h2>Hasil Pemeriksaan</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Body / Exterior</div>
            <div class="value">${report.result?.body_condition}</div>
        </div>
        <div class="card">
            <div class="label">Mesin / Engine</div>
            <div class="value">${report.result?.engine_condition}</div>
        </div>
        <div class="card">
            <div class="label">Interior</div>
            <div class="value">${report.result?.interior_condition}</div>
        </div>
        <div class="card">
            <div class="label">Hasil Akhir</div>
            <div class="value">
                <span class="result-badge result-${resultClass}">${report.result?.status}</span>
            </div>
        </div>
        ${report.result?.notes ? `
        <div class="card full">
            <div class="label">Catatan</div>
            <div class="value">${report.result.notes}</div>
        </div>
        ` : ''}
    </div>

    <h2>Pembayaran</h2>
    <div class="grid">
        <div class="card">
            <div class="label">Metode</div>
            <div class="value">${report.payment?.method}</div>
        </div>
        <div class="card">
            <div class="label">Total</div>
            <div class="value">Rp ${Number(report.payment?.price || 0).toLocaleString('id-ID')}</div>
        </div>
    </div>

    <div class="footer">
        <p>Dokumen ini generated secara otomatis oleh sistem OTOMAN</p>
        <p>${report.generated_at}</p>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 30px;font-size:16px;cursor:pointer;">
            Cetak / Download PDF
        </button>
    </div>
</body>
</html>`;
    }

    // Show report in a modal when popup is blocked
    function showReportModal(report) {
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
                <button type="button" class="btn btn-primary" onclick="document.getElementById('reportIframe').contentWindow.print()">
                    <i class="bi bi-printer me-2"></i>Cetak / Download PDF
                </button>
            </div>
        </div>
    </div>
</div>`;

        document.getElementById('reportModal')?.remove();
        document.body.insertAdjacentHTML('beforeend', html);

        const iframe = document.getElementById('reportIframe');
        iframe.srcdoc = generateReportHTML(report);

        new bootstrap.Modal(document.getElementById('reportModal')).show();
    }

    function formatDateIndo(dateString) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    function formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        return formatDateIndo(dateString);
    }

    async function loadMarketplace() {
        const container = document.getElementById('marketplaceList');
        if (!container) return;

        try {
            // Show empty state for now
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-shop fs-1"></i>
                    <p class="mt-3">Kendaraan terverifikasi akan muncul di sini</p>
                    <a href="../index.html#marketplace" class="btn btn-warning btn-sm">Lihat Marketplace</a>
                </div>
            `;

        } catch (error) {
            console.error('Error loading marketplace:', error);
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Gagal memuat data marketplace. Silakan coba lagi.
                    </div>
                </div>
            `;
        }
    }

    // ============================
    // SELLER LISTINGS
    // ============================
    let allListings = [];
    let currentListingFilter = 'all';

    const LISTING_STATUS_BADGES = {
        'pending': { label: 'Menunggu', class: 'bg-warning text-dark' },
        'scheduled': { label: 'Terjadwal', class: 'bg-info' },
        'in_progress': { label: 'Inspeksi Berlangsung', class: 'bg-primary' },
        'approved': { label: 'Dipublikasi', class: 'bg-success' },
        'rejected': { label: 'Ditolak', class: 'bg-danger' },
        'sold': { label: 'Terjual', class: 'bg-secondary' }
    };

    function getListingBadge(status) {
        const config = LISTING_STATUS_BADGES[status] || { label: status, class: 'bg-secondary' };
        return `<span class="badge ${config.class}">${config.label}</span>`;
    }

    async function loadListings(filter = 'all') {
        const container = document.getElementById('listingsList');
        if (!container) return;

        document.getElementById('listingsLoading')?.remove();

        try {
            const response = await apiGet('/marketplace/seller/listings');
            console.log('[Listings] Full API response:', JSON.stringify(response));
            const listings = Array.isArray(response) ? response : (response?.data || []);
            console.log('[Listings] Parsed listings count:', listings.length);
            allListings = listings;
            renderListings(listings, filter);
        } catch (error) {
            console.error('[Listings] Error loading listings:', error);
            renderListings([], filter);
        }
    }

    function renderListings(listings, filter) {
        const container = document.getElementById('listingsList');
        if (!container) return;

        const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="bi bi-card-list fs-1"></i>
                    <p class="mt-3">Belum ada iklan${filter !== 'all' ? ' dengan status ini' : ''}</p>
                    <a href="../marketplace-listing.html" class="btn btn-warning btn-sm">Pasang Iklan Sekarang</a>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(l => createListingCard(l)).join('');
    }

    function filterListings(filter) {
        currentListingFilter = filter;
        document.querySelectorAll('#listingStatusTabs .nav-link').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        renderListings(allListings, filter);
    }

    function showListingDetail(listing) {
        const content = document.getElementById('listingDetailContent');
        const actions = document.getElementById('listingDetailActions');
        const STORAGE_BASE = window.STORAGE_BASE || 'http://localhost:8000';

        const images = listing.images || [];
        const thumb = listing.thumbnail_url
            ? (listing.thumbnail_url.startsWith('http')
                ? listing.thumbnail_url
                : `${STORAGE_BASE}${listing.thumbnail_url}`)
            : '';

        const statusMap = {
            pending: ['<span class="badge bg-warning">Pending</span>', 'Menunggu Inspeksi'],
            scheduled: ['<span class="badge bg-info">Terjadwal</span>', 'Dijadwalkan'],
            assigned: ['<span class="badge bg-primary">Ditugaskan</span>', 'Sudah Ditugaskan'],
            in_progress: ['<span class="badge bg-primary">Sedang Inspeksi</span>', 'Sedang Inspeksi'],
            completed: ['<span class="badge bg-success">Selesai</span>', 'Selesai'],
            rejected: ['<span class="badge bg-danger">Ditolak</span>', 'Ditolak'],
        };
        const [badge] = statusMap[listing.status] || ['<span class="badge bg-secondary">-</span>', '-'];

        const priceDisplay = listing.vehicle_price
            ? 'Rp ' + Number(listing.vehicle_price).toLocaleString('id-ID')
            : '-';

        let photoGallery = '';
        if (images.length) {
            photoGallery = `
            <div class="mb-3">
                <label class="fw-semibold small text-muted">Foto Kendaraan</label>
                <div class="d-flex flex-wrap gap-2 mt-1">
                    ${images.map((img, i) => {
                        const src = img.startsWith('http') ? img : `${STORAGE_BASE}${img}`;
                        return `<img src="${src}" class="rounded" style="width:80px;height:80px;object-fit:cover;border:2px solid #dee2e6;cursor:pointer;" onclick="window.open('${src}','_blank')" title="Foto ${i+1}">`;
                    }).join('')}
                </div>
            </div>`;
        } else {
            photoGallery = `<div class="text-muted small mb-3"><i class="bi bi-image"></i> Tidak ada foto</div>`;
        }

        content.innerHTML = `
            ${photoGallery}
            <div class="row g-3">
                <div class="col-6"><label class="fw-semibold small text-muted">Kode</label><div class="fw-semibold text-primary">${listing.order_code || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Status</label><div>${badge}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Merek</label><div>${listing.vehicle_brand || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Model</label><div>${listing.vehicle_model || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Tahun</label><div>${listing.vehicle_year || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Plat</label><div>${listing.license_plate || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Jarak Tempuh</label><div>${listing.mileage ? Number(listing.mileage).toLocaleString('id-ID') + ' km' : '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Harga Jual</label><div class="fw-semibold text-success">${priceDisplay}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Tanggal Inspeksi</label><div>${listing.inspection_date || '-'}</div></div>
                <div class="col-6"><label class="fw-semibold small text-muted">Waktu</label><div>${listing.inspection_time || '-'}</div></div>
                <div class="col-12"><label class="fw-semibold small text-muted">Lokasi</label><div>${listing.city || ''}, ${listing.province || ''}</div></div>
                ${listing.inspection_result ? `<div class="col-12"><label class="fw-semibold small text-muted">Hasil Inspeksi</label><div class="fw-semibold ${listing.inspection_result === 'approve' ? 'text-success' : 'text-danger'}">${listing.inspection_result === 'approve' ? 'Disetujui' : 'Ditolak'}</div></div>` : ''}
            </div>`;

        actions.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>';

        new bootstrap.Modal(document.getElementById('listingDetailModal')).show();
    }

    function createListingCard(listing) {
        const priceDisplay = new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', maximumFractionDigits: 0
        }).format(listing.vehicle_price || 0);

        const mileageDisplay = Number(listing.mileage || 0).toLocaleString('id-ID') + ' km';
        const image = listing.thumbnail_url
            ? (listing.thumbnail_url.startsWith('http') ? listing.thumbnail_url : `${window.STORAGE_BASE || 'http://localhost:8000'}${listing.thumbnail_url}`)
            : 'https://placehold.co/80x60?text=No+Image';
        const date = listing.created_at
            ? new Date(listing.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';
        const badge = getListingBadge(listing.status);

        const detailUrl = `../marketplace-listing.html?id=${listing.id}&view=detail`;

        return `
            <div class="listing-card border rounded p-3 mb-3" style="display:flex; gap:1rem; align-items:center;">
                <img src="${image}" alt="${listing.vehicle_brand} ${listing.vehicle_model}"
                     style="width:80px; height:60px; object-fit:cover; border-radius:8px; flex-shrink:0;"
                     onerror="this.src='https://placehold.co/80x60?text=No+Image'">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-start justify-content-between gap-2">
                        <div>
                            <h6 class="mb-1 fw-bold">${listing.vehicle_brand} ${listing.vehicle_model} ${listing.vehicle_year || ''}</h6>
                            <p class="mb-1 small text-muted">
                                <i class="bi bi-credit-card-2-front me-1"></i>${listing.license_plate || '-'}
                                &nbsp;
                                <i class="bi bi-speedometer2 me-1"></i>${mileageDisplay}
                            </p>
                            <p class="mb-1 small text-muted">
                                <i class="bi bi-calendar3 me-1"></i>${date}
                            </p>
                        </div>
                        <div class="text-end">
                            <div class="mb-1 fw-bold text-primary" style="white-space:nowrap;">${priceDisplay}</div>
                            <div class="mb-2">${badge}</div>
                            <button class="btn btn-sm btn-outline-secondary" onclick="showListingDetail(window.allListings.find(l=>l.id===${listing.id}))"><i class="bi bi-eye me-1"></i>Detail</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function initializeProfileForm() {
        const profileForm = document.getElementById('profileForm');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (profileForm) {
            profileForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const phone = document.getElementById('profilePhoneInput').value;
                const location = document.getElementById('profileLocationInput').value;

                try {
                    // TODO: Implement API call when backend is ready
                    // await apiPut('/user/profile', { phone, location });

                    showToast('Profil berhasil diperbarui!', 'success');

                } catch (error) {
                    console.error('Error updating profile:', error);
                    showToast('Gagal memperbarui profil. Silakan coba lagi.', 'danger');
                }
            });
        }

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function() {
                showToast('Fitur ubah password akan segera tersedia', 'info');
            });
        }
    }

    // Utility: Show toast notification
    function showToast(message, type = 'info') {
        // Check if toast container exists
        let toastContainer = document.querySelector('.toast-container-position');

        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container-position position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove element after toast is closed
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
});

// Redirect to login function (global)
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Clear auth data
        clearAuth();

        // Clear cached inspection data
        delete window.inspectionsData;

        // Redirect to login
        window.location.href = '../login.html';
    }
}
