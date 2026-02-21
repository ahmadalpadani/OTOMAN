// Inspection Form JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // Check authentication
  checkAuth();

  // Initialize year dropdown
  initializeYearDropdown();

  // Initialize form handlers
  initializeFormSteps();
  initializeVehicleTypeSelector();
  initializeConditionSelector();

  // Functions
  function checkAuth() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      showToast('Silakan login terlebih dahulu untuk memesan inspeksi', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    }
  }

  function initializeYearDropdown() {
    const yearSelect = document.getElementById('vehicleYear');
    console.log('YEAR SELECT:', yearSelect);

    if (!yearSelect) {
      console.error('vehicleYear tidak ditemukan!');
      return;
    }

    const currentYear = new Date().getFullYear();
    const startYear = 1990;

    // Reset dropdown biar tidak dobel dan opsi default tetap ada
    yearSelect.innerHTML = '<option value="">Pilih Tahun</option>';

    for (let year = currentYear; year >= startYear; year--) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    }

    console.log('TOTAL OPTIONS:', yearSelect.options.length);
  }

  function initializeFormSteps() {
    const nextButtons = document.querySelectorAll('.btn-next-step');
    const prevButtons = document.querySelectorAll('.btn-prev-step');
    const form = document.getElementById('inspectionForm');

    console.log('NEXT BUTTONS:', nextButtons.length);
    console.log('PREV BUTTONS:', prevButtons.length);
    console.log('FORM:', form);

    if (!form) {
      console.error('Form #inspectionForm tidak ditemukan!');
      return;
    }

    // Next step buttons
    nextButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const currentStep = this.closest('.form-step');
        const nextStepNum = this.getAttribute('data-next');

        console.log('CLICK NEXT =>', nextStepNum, 'CURRENT STEP =>', currentStep?.id);

        if (!currentStep) {
          console.error('currentStep tidak ditemukan (closest .form-step null)');
          return;
        }

        const ok = validateStep(currentStep);
        console.log('VALID =>', ok);

        if (ok) {
          goToStep(nextStepNum);
          if (nextStepNum === '3') updateSummary();
        }
      });
    });

    // Previous step buttons
    prevButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const prevStepNum = this.getAttribute('data-prev');
        goToStep(prevStepNum);
      });
    });

    // Form submission
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      await submitInspection();
    });

    // Set min date for inspection date
    const inspectionDate = document.getElementById('inspectionDate');
    if (inspectionDate) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2); // Minimum 2 days from now
      inspectionDate.min = minDate.toISOString().split('T')[0];
    }
  }

  function initializeVehicleTypeSelector() {
    const typeInputs = document.querySelectorAll('input[name="vehicleType"]');

    typeInputs.forEach((input) => {
      input.addEventListener('change', function () {
        const errorEl = document.getElementById('vehicleTypeError');
        if (errorEl && this.checked) errorEl.textContent = '';

        updateBrandOptions(this.value);
      });
    });
  }

  function initializeConditionSelector() {
    const conditionInputs = document.querySelectorAll('input[name="vehicleCondition"]');

    conditionInputs.forEach((input) => {
      input.addEventListener('change', function () {
        const errorEl = document.getElementById('conditionError');
        if (errorEl && this.checked) errorEl.textContent = '';
      });
    });
  }

  function updateBrandOptions(vehicleType) {
    const brandSelect = document.getElementById('vehicleBrand');
    if (!brandSelect) return;

    const groups = brandSelect.querySelectorAll('optgroup');

    groups.forEach((group) => {
      const label = (group.getAttribute('label') || '').toLowerCase();

      if (vehicleType === 'mobil') {
        group.style.display = label.includes('mobil') ? '' : 'none';
      } else if (vehicleType === 'motor') {
        group.style.display = label.includes('motor') ? '' : 'none';
      } else {
        group.style.display = '';
      }
    });

    brandSelect.value = '';
  }

  function validateStep(stepElement) {
    let isValid = true;

    const inputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');

    // Radio group: vehicleType
    const vehicleTypeInputs = stepElement.querySelectorAll('input[name="vehicleType"]');
    if (vehicleTypeInputs.length > 0) {
      const selected = Array.from(vehicleTypeInputs).some((input) => input.checked);
      if (!selected) {
        const el = document.getElementById('vehicleTypeError');
        if (el) el.textContent = 'Silakan pilih jenis kendaraan';
        isValid = false;
      }
    }

    // Radio group: vehicleCondition
    const conditionInputs = stepElement.querySelectorAll('input[name="vehicleCondition"]');
    if (conditionInputs.length > 0) {
      const selected = Array.from(conditionInputs).some((input) => input.checked);
      if (!selected) {
        const el = document.getElementById('conditionError');
        if (el) el.textContent = 'Silakan pilih kondisi kendaraan';
        isValid = false;
      }
    }

    // Required fields (non-radio)
    inputs.forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') return;

      const value = (input.value || '').trim();
      if (!value) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    });

    // Mileage >= 0
    const mileage = document.getElementById('vehicleMileage');
    if (mileage && mileage.value) {
      if (parseInt(mileage.value, 10) < 0) {
        mileage.classList.add('is-invalid');
        mileage.classList.remove('is-valid');
        isValid = false;
      }
    }

    // Phone validation
    const phone = document.getElementById('contactPhone');
    if (phone && phone.value) {
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
      const normalized = phone.value.replace(/[\s-]/g, '');
      if (!phoneRegex.test(normalized)) {
        phone.classList.add('is-invalid');
        phone.classList.remove('is-valid');

        // FIX: jangan pakai optional chaining di kiri assignment
        const helpEl = phone.nextElementSibling;
        if (helpEl) {
          helpEl.textContent = 'Format no. telepon tidak valid';
        }

        isValid = false;
      }
    }

    if (!isValid) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'danger');
    }

    return isValid;
  }

  function goToStep(stepNum) {
    const target = document.getElementById('step' + stepNum);
    if (!target) {
      console.error('Target step tidak ditemukan:', 'step' + stepNum);
      return;
    }

    document.querySelectorAll('.form-step').forEach((step) => {
      step.classList.remove('active');
    });

    target.classList.add('active');
    updateProgress(stepNum);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress(currentStep) {
    const stepNumber = parseInt(currentStep, 10);

    document.querySelectorAll('.step').forEach((step, index) => {
      const num = index + 1;
      step.classList.remove('active', 'completed');

      if (num < stepNumber) step.classList.add('completed');
      if (num === stepNumber) step.classList.add('active');
    });

    document.querySelectorAll('.step-connector').forEach((connector, index) => {
      connector.classList.remove('active');
      if (index + 1 < stepNumber) connector.classList.add('active');
    });
  }

  function updateSummary() {
    const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value || '-';
    const brand = document.getElementById('vehicleBrand')?.value || '-';
    const model = document.getElementById('vehicleModel')?.value || '-';
    const year = document.getElementById('vehicleYear')?.value || '-';
    const mileage = document.getElementById('vehicleMileage')?.value || '-';
    const condition = document.querySelector('input[name="vehicleCondition"]:checked')?.value || '-';
    const date = document.getElementById('inspectionDate')?.value || '-';
    const time = document.getElementById('inspectionTime')?.value || '-';
    const province = document.getElementById('inspectionProvince')?.value || '';
    const city = document.getElementById('inspectionCity')?.value || '-';

    const typeLabel = vehicleType === 'mobil' ? 'Mobil' : vehicleType === 'motor' ? 'Motor' : '-';

    const conditionLabels = {
      excellent: 'Sangat Baik',
      good: 'Baik',
      fair: 'Cukup',
      poor: 'Kurang',
    };

    const formattedMileage = mileage !== '-' ? parseInt(mileage, 10).toLocaleString('id-ID') + ' km' : '-';
    const formattedDate = date !== '-' ? formatDateIndo(date) : '-';
    const location = province && city !== '-' ? `${city}, ${province}` : city;

    document.getElementById('summaryType').textContent = typeLabel;
    document.getElementById('summaryModel').textContent = `${brand} ${model}`.trim();
    document.getElementById('summaryYear').textContent = year;
    document.getElementById('summaryMileage').textContent = formattedMileage;
    document.getElementById('summaryCondition').textContent = conditionLabels[condition] || '-';
    document.getElementById('summaryDate').textContent = formattedDate;
    document.getElementById('summaryTime').textContent = time;
    document.getElementById('summaryLocation').textContent = location;
  }

  async function submitInspection() {
    const agreeTerms = document.getElementById('agreeTerms');

    if (!agreeTerms || !agreeTerms.checked) {
      if (agreeTerms) agreeTerms.classList.add('is-invalid');
      showToast('Anda harus menyetujui syarat & ketentuan', 'danger');
      return;
    }

    const formData = {
      vehicle_type: document.querySelector('input[name="vehicleType"]:checked')?.value,
      brand: document.getElementById('vehicleBrand')?.value,
      model: document.getElementById('vehicleModel')?.value,
      year: document.getElementById('vehicleYear')?.value,
      mileage: document.getElementById('vehicleMileage')?.value,
      condition: document.querySelector('input[name="vehicleCondition"]:checked')?.value,
      notes: document.getElementById('vehicleNotes')?.value || '',
      inspection_date: document.getElementById('inspectionDate')?.value,
      inspection_time: document.getElementById('inspectionTime')?.value,
      province: document.getElementById('inspectionProvince')?.value,
      city: document.getElementById('inspectionCity')?.value,
      address: document.getElementById('inspectionAddress')?.value,
      contact_phone: document.getElementById('contactPhone')?.value,
    };

    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';
    }

    try {
      const res = await apiPost('/inspections', formData, { auth: true });

      const orderCode = res?.data?.order_code || '-';
      const orderEl = document.getElementById('orderCode');
      if (orderEl) orderEl.textContent = orderCode;

      if (res?.data?.price != null) {
        const priceEl = document.getElementById('summaryPrice');
        if (priceEl) priceEl.textContent = 'Rp ' + Number(res.data.price).toLocaleString('id-ID');
      }

      document.querySelectorAll('.form-step').forEach((step) => step.classList.remove('active'));
      document.getElementById('successStep')?.classList.add('active');

      showToast('Pesanan inspeksi berhasil dibuat!', 'success');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      showToast(error?.message || 'Gagal membuat pesanan. Silakan coba lagi.', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  }

  function formatDateIndo(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('inspectionToast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) {
      alert(message);
      return;
    }

    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toastMessage.textContent = message;

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
  }
});