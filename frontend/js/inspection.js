// Inspection Form JavaScript

const API_BASE_URL = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', function () {
  try {
    // Check authentication
    checkAuth();

    // Initialize form handlers first
    initializeFormSteps();
    initializeVehicleTypeSelector();
    initializeConditionSelector();
    initializePaymentProofUpload();

    // Initialize year dropdown (after form handlers are set up)
    initializeYearDropdown();
  } catch (error) {
    console.error('Error during initialization:', error);
  }

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
    console.log('Initializing year dropdown...');
    const yearSelect = document.getElementById('vehicleYear');
    console.log('YEAR SELECT:', yearSelect);

    if (!yearSelect) {
      console.error('vehicleYear tidak ditemukan!');
      return;
    }

    const currentYear = new Date().getFullYear();
    const startYear = 1990;

    // Reset dropdown - remove all existing options first
    yearSelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Pilih Tahun';
    yearSelect.appendChild(defaultOption);

    // Add year options
    for (let year = currentYear; year >= startYear; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
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
          // Update summary saat masuk ke step 4 (konfirmasi)
          if (nextStepNum === '4') updateSummary();
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

  function initializePaymentProofUpload() {
    const fileInput = document.getElementById('paymentProof');
    const uploadArea = document.getElementById('paymentProofUpload');
    const preview = document.getElementById('paymentProofPreview');
    const fileNameEl = document.getElementById('paymentProofName');

    if (!fileInput || !uploadArea) return;

    // File input change
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      handleFileSelect(file);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    });

    function handleFileSelect(file) {
      const errorEl = document.getElementById('paymentProofError');

      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        errorEl.textContent = 'Format file tidak valid. Gunakan PNG, JPG, JPEG, atau PDF';
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 = 2097152 bytes)
      if (file.size > 2097152) {
        errorEl.textContent = 'Ukuran file terlalu besar. Maksimal 2MB';
        return;
      }

      // Clear error
      errorEl.textContent = '';

      // Show preview
      fileNameEl.textContent = file.name;
      preview.style.display = 'block';
      uploadArea.classList.add('has-file');

      // Store file for submission
      window.paymentProofFile = file;
    }
  }

  // Function to remove payment proof
  window.removePaymentProof = function() {
    const fileInput = document.getElementById('paymentProof');
    const preview = document.getElementById('paymentProofPreview');
    const uploadArea = document.getElementById('paymentProofUpload');

    fileInput.value = '';
    preview.style.display = 'none';
    uploadArea.classList.remove('has-file');
    window.paymentProofFile = null;
  };

  // Function to view payment proof
  window.viewPaymentProof = function() {
    if (!window.paymentProofFile) return;

    const file = window.paymentProofFile;
    const fileType = file.type;

    if (fileType.includes('image')) {
      // For images, show in modal
      const reader = new FileReader();
      reader.onload = function(e) {
        const modalHtml = `
          <div class="modal fade" id="viewProofModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Bukti Pembayaran</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <img src="${e.target.result}" alt="Bukti Pembayaran" class="img-fluid" style="max-height: 70vh;">
                </div>
                <div class="modal-footer">
                  <a href="${e.target.result}" download="${file.name}" class="btn btn-primary">
                    <i class="bi bi-download me-2"></i>Download
                  </a>
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Remove existing modal if any
        document.getElementById('viewProofModal')?.remove();

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('viewProofModal'));
        modal.show();
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'application/pdf') {
      // For PDF, open in new tab or download
      const reader = new FileReader();
      reader.onload = function(e) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head><title>Bukti Pembayaran - ${file.name}</title></head>
            <body style="margin:0;padding:0;">
              <embed src="${e.target.result}" type="application/pdf" width="100%" height="100%" style="position:absolute;top:0;left:0;width:100%;height:100%;">
            </body>
          </html>
        `);
      };
      reader.readAsDataURL(file);
    }
  };

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

    // Payment proof validation (step 3)
    const paymentProofInput = document.getElementById('paymentProof');
    if (stepElement.id === 'step3' && paymentProofInput) {
      if (!window.paymentProofFile) {
        const errorEl = document.getElementById('paymentProofError');
        if (errorEl) errorEl.textContent = 'Silakan upload bukti pembayaran';
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

    // Payment method di step 4 - always Bank Transfer
    if (document.getElementById('summaryPaymentMethod')) {
      document.getElementById('summaryPaymentMethod').textContent = 'Transfer Bank';
    }

    // Show payment proof filename if uploaded (clickable to view)
    const proofNameEl = document.getElementById('summaryPaymentProof');
    const proofRow = proofNameEl?.parentElement?.parentElement;
    if (proofNameEl && window.paymentProofFile) {
      proofNameEl.textContent = window.paymentProofFile.name;
      proofNameEl.style.color = '#0d6efd';
      proofNameEl.style.textDecoration = 'underline';
      proofNameEl.style.cursor = 'pointer';
      if (proofRow) proofRow.style.display = 'flex';
    } else {
      if (proofRow) proofRow.style.display = 'none';
    }
  }

  // Global variable to store formData for payment retry
let pendingFormData = null;

async function submitInspection() {
    const agreeTerms = document.getElementById('agreeTerms');

    if (!agreeTerms || !agreeTerms.checked) {
      if (agreeTerms) agreeTerms.classList.add('is-invalid');
      showToast('Anda harus menyetujui syarat & ketentuan', 'danger');
      return;
    }

    // Check payment proof
    if (!window.paymentProofFile) {
      showToast('Silakan upload bukti pembayaran terlebih dahulu', 'danger');
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
      payment_method: 'bank_transfer',
    };

    // Store file for submission
    pendingFormData = formData;
    pendingFormData.payment_proof = window.paymentProofFile;

    // Show payment modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();

    // Simulate payment processing
    setTimeout(() => {
      document.getElementById('paymentProcessing').style.display = 'none';
      document.getElementById('paymentActionsProcessing').style.display = 'none';
      document.getElementById('paymentSuccess').style.display = 'block';
      document.getElementById('paymentActionsSuccess').style.display = 'flex';
    }, 2000);
  }

  // Function untuk handle lanjut setelah payment success
  document.getElementById('confirmPaymentBtn')?.addEventListener('click', async function() {
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();

    await doSubmitInspection(pendingFormData);
  });

  // Function untuk retry payment
  window.retryPayment = function() {
    document.getElementById('paymentProcessing').style.display = 'block';
    document.getElementById('paymentActionsProcessing').style.display = 'flex';
    document.getElementById('paymentSuccess').style.display = 'none';
    document.getElementById('paymentActionsSuccess').style.display = 'none';
    document.getElementById('paymentFailed').style.display = 'none';
    document.getElementById('paymentActionsFailed').style.display = 'none';

    // Simulate payment processing again
    setTimeout(() => {
      document.getElementById('paymentProcessing').style.display = 'none';
      document.getElementById('paymentActionsProcessing').style.display = 'none';
      document.getElementById('paymentSuccess').style.display = 'block';
      document.getElementById('paymentActionsSuccess').style.display = 'flex';
    }, 2000);
  };

  // Actual submit to API
  async function doSubmitInspection(formData) {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';
    }

    try {
      // Use raw fetch with FormData to support file upload (payment_proof)
      // Backend store() currently doesn't handle files — this prepares for future multipart support
      const token = getToken();
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key !== 'payment_proof' && val !== undefined && val !== null) {
          payload.append(key, val);
        }
      });
      // Attach file if present
      if (formData.payment_proof) {
        payload.append('payment_proof', formData.payment_proof);
      }

      const response = await fetch(`${API_BASE_URL}/inspections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Accept': 'application/json'
          // NOTE: Do NOT set Content-Type for FormData — browser sets it with boundary
        },
        body: payload
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || errData.errors ? Object.values(errData.errors).flat().join(', ') : 'Gagal membuat pesanan');
      }

      const res = await response.json();
      // Backend returns { message, data: inspection }
      const inspection = res?.data || res;
      const orderCode = inspection?.order_code || '-';
      const orderEl = document.getElementById('orderCode');
      if (orderEl) orderEl.textContent = orderCode;

      if (inspection?.price != null) {
        const priceEl = document.getElementById('summaryPrice');
        if (priceEl) priceEl.textContent = 'Rp ' + Number(inspection.price).toLocaleString('id-ID');
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