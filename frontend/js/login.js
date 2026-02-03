// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {

    // Get elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.spinner-border');
    const btnText = loginBtn.querySelector('.btn-text');
    const loginAlert = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('alertMessage');

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icon
        const icon = this.querySelector('svg');
        if (type === 'text') {
            icon.innerHTML = '<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>';
        } else {
            icon.innerHTML = '<path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>';
        }
    });

    // Form Validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    // Show Alert
    function showAlert(message, type = 'danger') {
        alertMessage.textContent = message;
        loginAlert.className = `toast align-items-center text-white bg-${type} border-0`;

        const toast = new bootstrap.Toast(loginAlert);
        toast.show();

        // Shake animation on form
        loginForm.closest('.card').classList.add('shake');
        setTimeout(() => {
            loginForm.closest('.card').classList.remove('shake');
        }, 500);
    }

    // Show Success Alert
    function showSuccessAlert(message) {
        alertMessage.textContent = message;
        loginAlert.className = 'toast align-items-center text-white bg-success border-0';

        const toast = new bootstrap.Toast(loginAlert);
        toast.show();
    }

    // Set Loading State
    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            spinner.classList.remove('d-none');
            btnText.textContent = 'Memproses...';
        } else {
            loginBtn.disabled = false;
            spinner.classList.add('d-none');
            btnText.textContent = 'Masuk';
        }
    }

    // If already logged in (token exists), redirect
    const existingToken = localStorage.getItem('otoman_token');
    const existingUser = localStorage.getItem('otoman_user');
    if (existingToken && existingUser) {
        // Optional: tampilkan toast singkat
        showSuccessAlert('Anda sudah login. Mengalihkan...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
        return;
    }

    // Form Submit Handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate
        if (!validateEmail(email)) {
            emailInput.classList.add('is-invalid');
            showAlert('Silakan masukkan email yang valid!');
            emailInput.focus();
            return;
        } else {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
        }

        if (!validatePassword(password)) {
            passwordInput.classList.add('is-invalid');
            showAlert('Password minimal 6 karakter!');
            passwordInput.focus();
            return;
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
        }

        // Set loading
        setLoading(true);

        // Real API Call (Laravel)
        try {
            // apiPost() + saveAuth() disediakan oleh js/api.js
            const data = await apiPost(
            "/auth/login",
            { email, password },
            { auth: false }
            );


            // expected response: { message, user, token }
            saveAuth(data);

            showSuccessAlert('Login berhasil! Mengalihkan...');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 900);

        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'Email atau password salah!');
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            setLoading(false);
        }
    });

    // Remove validation classes on input
    emailInput.addEventListener('input', function() {
        this.classList.remove('is-valid', 'is-invalid');
    });

    passwordInput.addEventListener('input', function() {
        this.classList.remove('is-valid', 'is-invalid');
    });

    // Enter key navigation
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });
});
