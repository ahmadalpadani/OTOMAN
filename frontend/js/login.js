// login.js (fixed)

document.addEventListener("DOMContentLoaded", () => {
  // --- guard: pastikan api.js expose function ---
  const apiReady =
    typeof window.apiPost === "function" &&
    typeof window.saveAuth === "function" &&
    typeof window.clearAuth === "function";

  if (!apiReady) {
    console.error("API not ready:", {
      apiPost: typeof window.apiPost,
      saveAuth: typeof window.saveAuth,
      clearAuth: typeof window.clearAuth,
      apiFileHint: "Cek http://localhost:3000/js/api.js",
    });

    alert("api.js belum termuat atau tidak expose function yang dibutuhkan. Cek path js/api.js dan urutan script.");
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginBtn = document.getElementById("loginBtn");
  const spinner = loginBtn.querySelector(".spinner-border");
  const btnText = loginBtn.querySelector(".btn-text");
  const loginAlert = document.getElementById("loginAlert");
  const alertMessage = document.getElementById("alertMessage");

  // --- helpers ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    spinner.classList.toggle("d-none", !isLoading);
    btnText.textContent = isLoading ? "Memproses..." : "Masuk";
  }

  function showToast(message, type = "danger") {
    alertMessage.textContent = message;
    loginAlert.className = `toast align-items-center text-white bg-${type} border-0`;
    new bootstrap.Toast(loginAlert).show();
  }

  // --- toggle password ---
  togglePasswordBtn?.addEventListener("click", function () {
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

  // --- auto redirect kalau sudah login ---
  const token = localStorage.getItem("otoman_token");
  const user = localStorage.getItem("otoman_user");
  if (token && user) {
    showToast("Anda sudah login. Mengalihkan...", "success");
    setTimeout(() => (window.location.href = "dashboard/dashboard.html"), 700);
    return;
  }

  // clear validation on input
  emailInput.addEventListener("input", () => emailInput.classList.remove("is-valid", "is-invalid"));
  passwordInput.addEventListener("input", () => passwordInput.classList.remove("is-valid", "is-invalid"));

  // --- submit ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let ok = true;

    if (!validateEmail(email)) {
      emailInput.classList.add("is-invalid");
      ok = false;
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    }

    if (!password || password.length < 6) {
      passwordInput.classList.add("is-invalid");
      ok = false;
    } else {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
    }

    if (!ok) {
      showToast("Silakan periksa kembali input Anda!");
      return;
    }

    setLoading(true);

    try {
      // optional: bersihin auth lama
      window.clearAuth();

      const data = await window.apiPost("/auth/login", { email, password }, { auth: false });

      window.saveAuth(data);

      showToast("Login berhasil! Mengalihkan...", "success");
      setTimeout(() => (window.location.href = "dashboard/dashboard.html"), 900);
    } catch (err) {
      console.error("Login error:", err);
      showToast(err?.message || "Email atau password salah!");
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      setLoading(false);
    }
  });
});