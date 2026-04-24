// marketplace-checkout.js
// Handles marketplace checkout flow: vehicle selection, inspection scheduling, payment

const MARKETPLACE_API_BASE = 'http://localhost:8000/api';

const DEFAULT_PAYMENT_METHODS = [
    { id: 'bca_va', name: 'BCA Virtual Account', code: 'BCA', type: 'virtual_account', color: '#0066b2' },
    { id: 'bni_va', name: 'BNI Virtual Account', code: 'BNI', type: 'virtual_account', color: '#008899' },
    { id: 'bri_va', name: 'BRI Virtual Account', code: 'BRI', type: 'virtual_account', color: '#0054a6' },
    { id: 'mandiri_va', name: 'Mandiri Virtual Account', code: 'MANDIRI', type: 'virtual_account', color: '#003e7e' },
    { id: 'ovo', name: 'OVO', code: 'OVO', type: 'ewallet', color: '#500097' },
    { id: 'dana', name: 'DANA', code: 'DANA', type: 'ewallet', color: '#118eea' },
    { id: 'shopeepay', name: 'ShopeePay', code: 'SHOPEEPAY', type: 'ewallet', color: '#f35922' }
];

const FALLBACK_VEHICLE_DATA = {
    id: 1,
    order_code: 'INS-FRT001',
    vehicle: {
        brand: 'Toyota',
        model: 'Fortuner GR',
        year: 2022,
        license_plate: 'B 1234 XYZ',
        mileage: 20000
    },
    location: {
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta'
    },
    price: {
        vehicle_price: 385000000,
        inspection_fee: 350000,
        platform_fee: 6500,
        total: 385356500
    },
    images: [{ url: 'Assets/fortuner.jpg', is_primary: true }]
};

let selectedPaymentMethod = null;
let checkoutData = null;
let paymentDeadline = null;
let countdownInterval = null;

function formatPrice(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function setMinInspectionDate() {
    const dateInput = document.getElementById('inspectionDate');
    if (!dateInput) return;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    dateInput.min = minDate.toISOString().split('T')[0];
}

function updateStepIndicator(step) {
    for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`stepItem${i}`);
        if (!item) continue;
        item.classList.remove('active', 'completed');
        if (i < step) item.classList.add('completed');
        if (i === step) item.classList.add('active');
    }
}

function showSection(sectionId) {
    ['sectionVehicle', 'sectionInspection', 'sectionPayment', 'sectionSuccess'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('d-none');
}

function renderPaymentMethods(methods) {
    const container = document.getElementById('paymentMethodsList');
    if (!container) return;

    container.innerHTML = methods.map(method => `
        <div class="col-6 col-md-4">
            <label class="payment-method-card w-100">
                <input type="radio" name="paymentMethod" value="${method.id}"
                       onchange="selectPaymentMethod('${method.id}', '${method.code}')">
                <div class="payment-method-logo" style="background: ${method.color || '#6c757d'};">
                    ${method.code?.substring(0, 3) || 'PAY'}
                </div>
                <div class="flex-grow-1">
                    <div class="fw-semibold" style="font-size: 0.85rem;">${method.name}</div>
                </div>
            </label>
        </div>
    `).join('');
}

function selectPaymentMethod(methodId, methodCode) {
    selectedPaymentMethod = methodId;

    // Highlight selected card
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    const selectedCard = document.querySelector(`input[value="${methodId}"]`)?.closest('.payment-method-card');
    if (selectedCard) selectedCard.classList.add('selected');

    // Show VA number section
    const vaSection = document.getElementById('vaNumberSection');
    const vaNumber = document.getElementById('vaNumber');

    // Generate mock VA number
    const va = generateMockVANumber(methodCode);
    if (vaSection) vaSection.classList.remove('d-none');
    if (vaNumber) vaNumber.textContent = va;

    // Enable confirm button
    const confirmBtn = document.getElementById('btnConfirmPayment');
    if (confirmBtn) confirmBtn.disabled = false;
}

function generateMockVANumber(code) {
    // Mock VA numbers (in real app, this comes from backend)
    const vaMap = {
        'BCA': '8800 1234 5678 9012',
        'BNI': '8801 1234 5678 9012',
        'BRI': '8802 1234 5678 9012',
        'MANDIRI': '8803 1234 5678 9012',
        'OVO': '0896 1234 5678 901',
        'DANA': '0897 1234 5678 901',
        'SHOPEEPAY': '0898 1234 5678 901'
    };
    return vaMap[code] || '0000 0000 0000 0000';
}

function copyVANumber() {
    const vaNumber = document.getElementById('vaNumber')?.textContent;
    if (!vaNumber) return;

    navigator.clipboard.writeText(vaNumber.replace(/\s/g, '')).then(() => {
        showToast('Nomor Virtual Account berhasil disalin!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin nomor VA.', 'danger');
    });
}

function startCountdown(deadline) {
    if (countdownInterval) clearInterval(countdownInterval);

    const countdownEl = document.getElementById('countdownText');
    if (!countdownEl) return;

    countdownInterval = setInterval(() => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;

        if (diff <= 0) {
            clearInterval(countdownInterval);
            countdownEl.textContent = 'WAKTU HABIS';
            showToast('Waktu pembayaran telah habis. Silakan buat pesanan baru.', 'danger');
            return;
        }

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        countdownEl.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function continueToPayment() {
    const date = document.getElementById('inspectionDate')?.value;
    const time = document.getElementById('inspectionTime')?.value;
    const phone = document.getElementById('contactPhone')?.value;

    if (!date || !time || !phone) {
        showToast('Mohon lengkapi semua field yang wajib!', 'danger');
        return;
    }

    // Store schedule data
    if (checkoutData) {
        checkoutData.inspection_date = date;
        checkoutData.inspection_time = time;
        checkoutData.contact_phone = phone;
        checkoutData.notes = document.getElementById('checkoutNotes')?.value || '';
    }

    // Update order summary
    document.getElementById('summaryDate').textContent = formatDate(date);
    document.getElementById('summaryTime').textContent = time;

    // Set payment deadline (24 hours from now)
    paymentDeadline = new Date();
    paymentDeadline.setHours(paymentDeadline.getHours() + 24);
    startCountdown(paymentDeadline);

    // Show payment section
    updateStepIndicator(3);
    showSection('sectionPayment');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToInspection() {
    updateStepIndicator(2);
    showSection('sectionInspection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validatePhone(phone) {
    const re = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

async function submitPayment() {
    if (!selectedPaymentMethod) {
        showToast('Silakan pilih metode pembayaran terlebih dahulu!', 'danger');
        return;
    }

    if (!checkoutData?.vehicle_id) {
        showToast('Data kendaraan tidak ditemukan. Silakan mulai dari awal.', 'danger');
        return;
    }

    const confirmBtn = document.getElementById('btnConfirmPayment');
    const originalText = confirmBtn?.innerHTML || '';
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';
    }

    try {
        const response = await fetch(`${MARKETPLACE_API_BASE}/marketplace/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('otoman_token') || ''}`
            },
            body: JSON.stringify({
                vehicle_id: checkoutData.vehicle_id,
                inspection_date: checkoutData.inspection_date,
                inspection_time: checkoutData.inspection_time,
                contact_phone: checkoutData.contact_phone,
                notes: checkoutData.notes || ''
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal membuat pesanan.');
        }

        // Show success
        const orderCode = result.data?.order_code || result.order_code || 'INS-' + Date.now();
        document.getElementById('successOrderCode').textContent = orderCode;

        updateStepIndicator(4);
        showSection('sectionSuccess');

        showToast('Pesanan inspeksi berhasil dibuat!', 'success');

    } catch (error) {
        console.error('Checkout error:', error);

        // For demo, simulate success
        const mockOrderCode = 'INS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        document.getElementById('successOrderCode').textContent = mockOrderCode;

        updateStepIndicator(4);
        showSection('sectionSuccess');

        showToast('Pesanan berhasil dibuat! (Demo mode)', 'success');
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    }
}

function renderVehicleData(data) {
    const vehicle = data.vehicle || {};
    const location = data.location || {};
    const price = data.price || {};
    const images = data.images || [];

    // Vehicle section
    document.getElementById('checkoutVehicleTitle').textContent =
        `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim();
    document.getElementById('checkoutVehicleLocation').textContent =
        `${location.city || ''}, ${location.province || ''}`.trim();
    document.getElementById('checkoutVehicleYear').textContent = vehicle.year || '-';
    document.getElementById('checkoutVehiclePlate').textContent = vehicle.license_plate || '-';
    document.getElementById('checkoutVehicleMileage').textContent =
        `${Number(vehicle.mileage || 0).toLocaleString('id-ID')} km`;

    const img = document.getElementById('checkoutVehicleImage');
    if (img && images.length > 0) {
        img.src = images[0].url;
        img.alt = `${vehicle.brand} ${vehicle.model}`;
    }

    // Order summary
    document.getElementById('summaryVehicle').textContent =
        `${vehicle.brand || ''} ${vehicle.model || ''}`.trim();
    document.getElementById('summaryOrderCode').textContent = data.order_code || '-';
    document.getElementById('summaryLocation').textContent =
        `${location.city || ''}, ${location.province || ''}`.trim();
    document.getElementById('summaryVehiclePrice').textContent = formatPrice(price.vehicle_price);
    document.getElementById('summaryInspectionFee').textContent = formatPrice(price.inspection_fee);
    document.getElementById('summaryPlatformFee').textContent = formatPrice(price.platform_fee);
    document.getElementById('summaryTotal').textContent = formatPrice(price.total);

    // Update checkout data
    if (checkoutData) {
        checkoutData.vehicle_id = data.id;
        checkoutData.order_code = data.order_code;
        checkoutData.price = price;
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('checkoutToast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    new bootstrap.Toast(toast).show();
}

async function loadCheckoutData() {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get('id');

    if (!vehicleId) {
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('errorState').classList.remove('d-none');
        document.getElementById('errorMessage').textContent = 'ID kendaraan tidak ditemukan.';
        return;
    }

    checkoutData = { vehicle_id: parseInt(vehicleId) };

    try {
        // Fetch vehicle detail
        const response = await fetch(`${MARKETPLACE_API_BASE}/marketplace/vehicles/${vehicleId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        let data = result.data || result;
        renderVehicleData(data);

        // Fetch payment methods
        try {
            const pmResponse = await fetch(`${MARKETPLACE_API_BASE}/marketplace/payment-methods`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (pmResponse.ok) {
                const pmResult = await pmResponse.json();
                const methods = pmResult.data?.payment_methods || pmResult.payment_methods || DEFAULT_PAYMENT_METHODS;
                renderPaymentMethods(methods);
            } else {
                renderPaymentMethods(DEFAULT_PAYMENT_METHODS);
            }
        } catch {
            renderPaymentMethods(DEFAULT_PAYMENT_METHODS);
        }

    } catch (error) {
        console.error('Failed to load checkout data:', error);
        console.log('Using fallback data...');

        // Use fallback vehicle data
        FALLBACK_VEHICLE_DATA.id = parseInt(vehicleId) || 1;
        renderVehicleData(FALLBACK_VEHICLE_DATA);
        renderPaymentMethods(DEFAULT_PAYMENT_METHODS);
    }

    // Show content
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('checkoutContent').classList.remove('d-none');
    updateStepIndicator(2);
    showSection('sectionInspection');
    setMinInspectionDate();
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCheckoutData);
} else {
    loadCheckoutData();
}
