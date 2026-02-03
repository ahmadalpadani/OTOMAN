// OTOMAN App JavaScript - Fungsi Umum

document.addEventListener('DOMContentLoaded', function() {

    // Cek status login
    checkLoginStatus();

    // Update UI berdasarkan status login
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');

        if (isLoggedIn) {
            // User sudah login
            if (authButtons) authButtons.classList.add('d-none');
            if (userInfo) {
                userInfo.classList.remove('d-none');
                userInfo.classList.add('d-flex');
            }
            if (userEmail) {
                const email = localStorage.getItem('userEmail') || 'User';
                userEmail.textContent = email;
            }
        } else {
            // User belum login
            if (authButtons) authButtons.classList.remove('d-none');
            if (userInfo) {
                userInfo.classList.add('d-none');
                userInfo.classList.remove('d-flex');
            }
        }
    }
});

// Fungsi Logout (global)
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');

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
        toastContainer.style.zIndex = '11';
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
        const token = localStorage.getItem('userToken');

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
