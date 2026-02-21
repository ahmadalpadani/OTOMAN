// Register Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const registerForm = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsInput = document.getElementById("agreeTerms");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");
  const registerBtn = document.getElementById("registerBtn");
  const spinner = registerBtn.querySelector(".spinner-border");
  const btnText = registerBtn.querySelector(".btn-text");
  const registerAlert = document.getElementById("registerAlert");
  const alertMessage = document.getElementById("alertMessage");

  // Guard: pastikan api.js sudah termuat
  function ensureApiReady() {
    if (!window.apiPost || !window.saveAuth || !window.clearAuth) {
      showAlert("api.js belum termuat atau tidak expose function yang dibutuhkan. Cek path dan urutan script.", "danger");
      return false;
    }
    return true;
  }

  // Toggle Password Visibility
  togglePasswordBtn.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = this.querySelector("svg");
    if (!icon) return;

    if (type === "text") {
      icon.innerHTML =
        '<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>';
    } else {
      icon.innerHTML =
        '<path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>';
    }
  });

  // Toggle Confirm Password Visibility
  toggleConfirmPasswordBtn.addEventListener("click", function () {
    const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password";
    confirmPasswordInput.setAttribute("type", type);

    const icon = this.querySelector("svg");
    if (!icon) return;

    if (type === "text") {
      icon.innerHTML =
        '<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>';
    } else {
      icon.innerHTML =
        '<path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>';
    }
  });

  // Form Validation Functions
  function validateName(name) {
    return name.trim().length >= 3;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    // Support Indonesian phone format (08xxxxxxxxxx or 62xxxxxxxxxx)
    const re = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return re.test(phone.replace(/[\s-]/g, ""));
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function validatePasswordsMatch(password, confirmPassword) {
    return password === confirmPassword && confirmPassword.length > 0;
  }

  // Show Alert
  function showAlert(message, type = "danger") {
    alertMessage.textContent = message;
    registerAlert.className = `toast align-items-center text-white bg-${type} border-0`;

    const toast = new bootstrap.Toast(registerAlert);
    toast.show();

    // Shake animation on form
    const card = registerForm.closest(".card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 500);
    }
  }

  // Show Success Alert
  function showSuccessAlert(message) {
    alertMessage.textContent = message;
    registerAlert.className = "toast align-items-center text-white bg-success border-0";

    const toast = new bootstrap.Toast(registerAlert);
    toast.show();
  }

  // Set Loading State
  function setLoading(isLoading) {
    if (isLoading) {
      registerBtn.disabled = true;
      spinner.classList.remove("d-none");
      btnText.textContent = "Memproses...";
    } else {
      registerBtn.disabled = false;
      spinner.classList.add("d-none");
      btnText.textContent = "Daftar";
    }
  }

  // Real-time password match validation
  confirmPasswordInput.addEventListener("input", function () {
    if (this.value.length > 0) {
      if (validatePasswordsMatch(passwordInput.value, this.value)) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.remove("is-valid");
        this.classList.add("is-invalid");
      }
    } else {
      this.classList.remove("is-valid", "is-invalid");
    }
  });

  // Update confirm password validation when password changes
  passwordInput.addEventListener("input", function () {
    if (confirmPasswordInput.value.length > 0) {
      if (validatePasswordsMatch(this.value, confirmPasswordInput.value)) {
        confirmPasswordInput.classList.remove("is-invalid");
        confirmPasswordInput.classList.add("is-valid");
      } else {
        confirmPasswordInput.classList.remove("is-valid");
        confirmPasswordInput.classList.add("is-invalid");
      }
    }
  });

  // Form Submit Handler
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreeTerms = agreeTermsInput.checked;

    let isValid = true;
    let firstInvalidInput = null;

    // Validate Name
    if (!validateName(name)) {
      nameInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = nameInput;
    } else {
      nameInput.classList.remove("is-invalid");
      nameInput.classList.add("is-valid");
    }

    // Validate Email
    if (!validateEmail(email)) {
      emailInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    }

    // Validate Phone
    if (!validatePhone(phone)) {
      phoneInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = phoneInput;
    } else {
      phoneInput.classList.remove("is-invalid");
      phoneInput.classList.add("is-valid");
    }

    // Validate Password
    if (!validatePassword(password)) {
      passwordInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = passwordInput;
    } else {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
    }

    // Validate Confirm Password
    if (!validatePasswordsMatch(password, confirmPassword)) {
      confirmPasswordInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = confirmPasswordInput;
    } else {
      confirmPasswordInput.classList.remove("is-invalid");
      confirmPasswordInput.classList.add("is-valid");
    }

    // Validate Terms
    if (!agreeTerms) {
      agreeTermsInput.classList.add("is-invalid");
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = agreeTermsInput;
    } else {
      agreeTermsInput.classList.remove("is-invalid");
    }

    if (!isValid) {
      showAlert("Silakan periksa kembali input Anda!");
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // Set loading
    setLoading(true);

    try {
      // Pastikan API siap
      if (!ensureApiReady()) return;

      const payload = {
        name,
        email,
        phone: phone.replace(/[\s-]/g, ""),
        password,
      };

      // optional: bersihkan auth lama
      window.clearAuth?.();

      // Real API Call (Laravel)
      const data = await window.apiPost("/auth/register", payload, { auth: false });

      // Simpan token/user jika API mengembalikan itu
      window.saveAuth?.(data);

      showSuccessAlert("Registrasi berhasil! Mengalihkan ke dashboard...");

      setTimeout(() => {
        window.location.href = "dashboard/dashboard.html";
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);
      showAlert(error?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  });

  // Remove validation classes on input
  const inputs = [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput];
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.classList.remove("is-valid", "is-invalid");
    });
  });

  agreeTermsInput.addEventListener("change", function () {
    this.classList.remove("is-invalid");
  });

  // Enter key navigation
  nameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      emailInput.focus();
    }
  });

  emailInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      phoneInput.focus();
    }
  });

  phoneInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInput.focus();
    }
  });

  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmPasswordInput.focus();
    }
  });
});