// OTOMAN App JavaScript - Fungsi Umum

document.addEventListener('DOMContentLoaded', function() {

    // Cek status login
    checkLoginStatus();

    // Update UI berdasarkan status login
    function checkLoginStatus() {
        const token = localStorage.getItem('otoman_token');
        const userStr = localStorage.getItem('otoman_user');
        const user = userStr ? JSON.parse(userStr) : null;

        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');

        if (token && user) {
            // User sudah login
            if (authButtons) authButtons.classList.add('d-none');
            if (userInfo) {
                userInfo.classList.remove('d-none');
                userInfo.classList.add('d-flex');
            }
            if (userEmail) {
                userEmail.textContent = user.name || user.email || 'User';
            }

            // Add dashboard link if not exists
            addDashboardLink();
        } else {
            // User belum login
            if (authButtons) authButtons.classList.remove('d-none');
            if (userInfo) {
                userInfo.classList.add('d-none');
                userInfo.classList.remove('d-flex');
            }
        }
    }

    // Add dashboard link to navbar
    function addDashboardLink() {
        const navbarNav = document.querySelector('#navbarNav .navbar-nav');
        if (!navbarNav) return;

        // Check if dashboard link already exists
        if (navbarNav.querySelector('.dashboard-link')) return;

        // Create dashboard link
        const dashboardLi = document.createElement('li');
        dashboardLi.className = 'nav-item dashboard-link';
        dashboardLi.innerHTML = `
            <a class="nav-link text-warning fw-bold" href="dashboard/dashboard.html">
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
            </a>
        `;

        // Insert after the last nav item
        const lastNav = navbarNav.lastElementChild;
        navbarNav.insertBefore(dashboardLi, lastNav);
    }
});

// Fungsi Logout (global) - menggunakan clearAuth dari api.js
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Use clearAuth from api.js
        if (typeof clearAuth === 'function') {
            clearAuth();
        } else {
            // Fallback if api.js not loaded
            localStorage.removeItem('otoman_token');
            localStorage.removeItem('otoman_user');
        }

        // Redirect ke login
        window.location.href = 'login.html';
    }
}

// Utility: Format tanggal Indonesia
function formatDateIndo(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString('id-ID', options);
}

// Utility: Format angka ke format Indonesia
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Utility: Format mata uang Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Utility: Show toast notification
function showToast(message, type = 'info') {
    // Cek apakah elemen toast sudah ada
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

    // Hapus elemen setelah toast ditutup
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Utility: Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// API Helper (untuk pengembangan selanjutnya)
const API = {
    baseUrl: 'http://localhost:8000/api', // Ganti dengan URL backend sebenarnya

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('otoman_token');

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
