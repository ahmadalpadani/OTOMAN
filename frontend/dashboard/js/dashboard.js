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

            // Handle pagination response
            const inspections = response.data?.data || [];

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

            // Handle pagination response
            const inspections = response.data?.data || [];
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
                    'completed': 'success'
                }[inspection.status] || 'secondary';

                const statusLabel = {
                    'pending': 'Menunggu',
                    'in_progress': 'Dalam Proses',
                    'completed': 'Selesai'
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

            // Handle pagination response
            const inspections = response.data?.data || [];
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
            'completed': 'completed'
        }[inspection.status] || 'pending';

        const statusLabel = {
            'pending': 'Menunggu',
            'in_progress': 'Dalam Proses',
            'completed': 'Selesai'
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
            'completed': 'success'
        }[inspection.status] || 'secondary';

        const statusLabel = {
            'pending': 'Menunggu Jadwal',
            'in_progress': 'Inspeksi Sedang Berlangsung',
            'completed': 'Inspeksi Selesai'
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
        `;

        // Hide download button (only for completed inspections with inspection data)
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
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
