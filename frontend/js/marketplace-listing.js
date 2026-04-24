// marketplace-listing.js
// Handles single-step-at-a-time seller listing form
// API_BASE comes from api.js (loaded before this script)

const INSPECTION_FEE = 350000;
const PLATFORM_FEE = 6500;

const DEFAULT_PAYMENT_METHODS = [
    { id: 'mandiri_va', name: 'Mandiri Virtual Account', code: 'MANDIRI', color: '#003e7e' },
    { id: 'bri_va', name: 'BRI Virtual Account', code: 'BRI', color: '#0054a6' },
];

// Step definitions — each step is rendered into #stepContainer one at a time
const STEPS = [
    {
        id: 1,
        title: 'Detail Kendaraan',
        icon: 'bi-car-front',
        validate: () => {
            const v = id => document.getElementById(id)?.value?.trim();
            if (!v('brand')) return alert('Pilih merek kendaraan'), false;
            if (!v('model')) return alert('Masukkan model kendaraan'), false;
            if (!v('year')) return alert('Pilih tahun kendaraan'), false;
            if (!v('licensePlate')) return alert('Masukkan nomor plat'), false;
            if (!v('mileage')) return alert('Masukkan jarak tempuh'), false;
            if (!v('transmission')) return alert('Pilih tipe transmisi'), false;
            if (!v('fuelType')) return alert('Pilih jenis bahan bakar'), false;
            return true;
        },
        render: () => `
            <div class="form-section-title"><i class="bi bi-car-front"></i>Detail Kendaraan</div>
            <div class="info-note">
                <i class="bi bi-info-circle me-1"></i>
                Isi data kendaraan Anda dengan lengkap dan jujur untuk hasil inspeksi yang akurat.
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Merek <span class="text-danger">*</span></label>
                    <select class="form-select" id="brand">
                        <option value="">-- Pilih Merek --</option>
                        ${['Toyota','Honda','Suzuki','Daihatsu','Mitsubishi','Nissan','Isuzu','Mazda','Hyundai','Kia','Wuling','BMW','Mercedes-Benz','Audi','Volkswagen','Ford','Chevrolet','Peugeot','Lainnya']
                            .map(b => `<option value="${b}">${b}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Model <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="model" placeholder="Contoh: Fortuner GR">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tahun <span class="text-danger">*</span></label>
                    <select class="form-select" id="year">
                        <option value="">-- Pilih Tahun --</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">No. Plat <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="licensePlate" placeholder="Contoh: B 1234 XYZ">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">No. Rangka (VIN)</label>
                    <input type="text" class="form-control" id="vin" placeholder="17 karakter">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">No. Mesin</label>
                    <input type="text" class="form-control" id="machineNumber" placeholder="Nomor mesin">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Jarak Tempuh (km) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="mileage" placeholder="Contoh: 25000" min="0">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Transmisi <span class="text-danger">*</span></label>
                    <select class="form-select" id="transmission">
                        <option value="">-- Pilih --</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="Tiptronic">Tiptronic</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Bahan Bakar <span class="text-danger">*</span></label>
                    <select class="form-select" id="fuelType">
                        <option value="">-- Pilih --</option>
                        <option value="Gasoline">Bensin</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Listrik</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Warna Exterior</label>
                    <select class="form-select" id="exteriorColor">
                        <option value="">-- Pilih --</option>
                        ${['Hitam','Putih','Silver','Abu-abu','Merah','Biru','Hijau','Kuning','Coklat','Orange','Lainnya']
                            .map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Warna Interior</label>
                    <select class="form-select" id="interiorColor">
                        <option value="">-- Pilih --</option>
                        ${['Hitam','Putih','Abu-abu','Beige','Coklat','Merah','Lainnya']
                            .map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label fw-semibold">Foto Kendaraan <span class="text-danger">*</span></label>
                    <input type="file" id="vehicleImages" accept="image/png,image/jpeg,image/jpg" multiple class="d-none">
                    <div class="d-flex flex-wrap gap-2" id="imagePreviewContainer">
                        <label for="vehicleImages" class="btn btn-outline-primary" style="cursor:pointer; min-width:100px; min-height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-style:dashed;">
                            <i class="bi bi-plus-circle fs-4"></i>
                            <small class="mt-1">Tambah Foto</small>
                        </label>
                    </div>
                    <small class="text-muted d-block mt-1">Maks 5 foto (PNG, JPG). Foto pertama sebagai thumbnail.</small>
                </div>
            </div>
            <div class="mt-4 text-end">
                <button class="btn btn-primary" onclick="goStep(2)">Lanjut <i class="bi bi-arrow-right ms-2"></i></button>
            </div>`
    },
    {
        id: 2,
        title: 'Jadwal Inspeksi',
        icon: 'bi-calendar-check',
        validate: () => {
            const v = id => document.getElementById(id)?.value?.trim();
            if (!v('inspectionDate')) return alert('Pilih tanggal inspeksi'), false;
            if (!v('inspectionTime')) return alert('Pilih waktu inspeksi'), false;
            if (!v('province')) return alert('Pilih provinsi'), false;
            if (!v('city')) return alert('Masukkan kota/kabupaten'), false;
            if (!v('contactPhone')) return alert('Masukkan nomor HP'), false;
            if (!v('address')) return alert('Masukkan alamat lengkap'), false;
            return true;
        },
        render: () => `
            <div class="form-section-title"><i class="bi bi-calendar-check"></i>Jadwal & Lokasi Inspeksi</div>
            <div class="info-note">
                <i class="bi bi-info-circle me-1"></i>
                Tim inspeksi OTOMAN akan datang ke lokasi Anda. Minimal H+2 dari sekarang.
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tanggal Inspeksi <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="inspectionDate">
                    <small class="text-muted">Minimal 2 hari dari sekarang</small>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Waktu <span class="text-danger">*</span></label>
                    <select class="form-select" id="inspectionTime">
                        <option value="">-- Pilih Waktu --</option>
                        <option value="08:00-10:00">08:00 - 10:00</option>
                        <option value="10:00-12:00">10:00 - 12:00</option>
                        <option value="13:00-15:00">13:00 - 15:00</option>
                        <option value="15:00-17:00">15:00 - 17:00</option>
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label fw-semibold">Provinsi <span class="text-danger">*</span></label>
                    <select class="form-select" id="province">
                        <option value="">-- Pilih Provinsi --</option>
                        ${['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','Banten','DI Yogyakarta','Sumatera Utara','Sumatera Barat','Riau','Lainnya']
                            .map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Kota/Kabupaten <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="city" placeholder="Contoh: Jakarta Selatan">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">No. HP yang Bisa Dihubungi <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control" id="contactPhone" placeholder="08xxxxxxxxxx">
                </div>
                <div class="col-12">
                    <label class="form-label fw-semibold">Alamat Lengkap <span class="text-danger">*</span></label>
                    <textarea class="form-control" id="address" rows="2" placeholder="Nama jalan, nomor, RT/RW, kelurahan, kecamatan..."></textarea>
                </div>
            </div>
            <div class="mt-4 d-flex justify-content-between">
                <button class="btn btn-outline-secondary" onclick="goStep(1)"><i class="bi bi-arrow-left me-2"></i>Kembali</button>
                <button class="btn btn-primary" onclick="goStep(3)">Lanjut <i class="bi bi-arrow-right ms-2"></i></button>
            </div>`
    },
    {
        id: 3,
        title: 'Harga Jual',
        icon: 'bi-currency-dollar',
        validate: () => {
            const price = parseInt(document.getElementById('vehiclePrice')?.value || '0');
            if (!price || price < 1000000) return alert('Masukkan harga jual min Rp 1.000.000'), false;
            return true;
        },
        render: () => {
            const price = parseInt(document.getElementById('vehiclePrice')?.value || '0');
            const total = price + INSPECTION_FEE + PLATFORM_FEE;
            return `
            <div class="form-section-title"><i class="bi bi-currency-dollar"></i>Harga Jual Kendaraan</div>
            <div class="info-note">
                <i class="bi bi-info-circle me-1"></i>
                Harga yang Anda masukkan akan ditampilkan di marketplace. Harga nego langsung dengan pembeli setelah inspeksi selesai.
            </div>
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-semibold">Harga Jual Kendaraan <span class="text-danger">*</span></label>
                    <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input type="text" class="form-control form-control-lg" id="vehiclePriceDisplay" placeholder="385.000.000" oninput="formatPriceInput(this)">
                        <input type="hidden" id="vehiclePrice" value="">
                    </div>
                    <small class="text-muted">Masukkan harga jual yang Anda inginkan</small>
                </div>
                <div class="col-12">
                    <label class="form-label fw-semibold">Deskripsi / Catatan Tambahan</label>
                    <textarea class="form-control" id="notes" rows="3" placeholder="Jelaskan keunggulan kendaraan, riwayat service, atau informasi tambahan..."></textarea>
                </div>
            </div>
            <div class="price-preview-card mt-4">
                <h6 class="fw-bold mb-3"><i class="bi bi-receipt me-2"></i>Ringkasan Biaya</h6>
                <div class="price-row"><span>Harga Kendaraan</span><span class="fw-semibold" id="pricePreviewVehicle">Rp 0</span></div>
                <div class="price-row"><span>Biaya Inspeksi</span><span class="fw-semibold">Rp 350.000</span></div>
                <div class="price-row"><span>Biaya Platform</span><span class="fw-semibold">Rp 6.500</span></div>
                <div class="price-row total"><span>Total Tagihan Anda</span><span class="text-primary" id="pricePreviewTotal">Rp 356.500</span></div>
                <div class="mt-2 small text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Anda hanya bayar biaya inspeksi + platform fee. Harga kendaraan tetap untuk Anda.
                </div>
            </div>
            <div class="mt-4 d-flex justify-content-between">
                <button class="btn btn-outline-secondary" onclick="goStep(2)"><i class="bi bi-arrow-left me-2"></i>Kembali</button>
                <button class="btn btn-primary" onclick="goStep(4)">Lanjut <i class="bi bi-arrow-right ms-2"></i></button>
            </div>`;
        }
    },
    {
        id: 4,
        title: 'Preview',
        icon: 'bi-eye',
        validate: () => true,
        render: () => {
            // Read from formState directly — DOM elements from previous step are destroyed after innerHTML replacement
            const get = id => formState[id]?.trim() || '-';
            const price = parseInt(formState['vehiclePrice'] || '0');
            const total = price + INSPECTION_FEE + PLATFORM_FEE;
            return `
            <div class="form-section-title"><i class="bi bi-eye"></i>Preview Iklan</div>
            <div class="info-note">
                <i class="bi bi-info-circle me-1"></i>
                Periksa kembali data Anda sebelum melanjutkan ke pembayaran.
            </div>
            <div class="border rounded p-3 mb-3">
                <h6 class="fw-bold mb-2"><i class="bi bi-car-front me-2 text-primary"></i>Kendaraan</h6>
                <div class="row g-2 small">
                    <div class="col-6"><strong>Merek:</strong> <span id="previewBrand">${get('brand')}</span></div>
                    <div class="col-6"><strong>Model:</strong> <span>${get('model')}</span></div>
                    <div class="col-6"><strong>Tahun:</strong> <span>${get('year')}</span></div>
                    <div class="col-6"><strong>Plat:</strong> <span>${get('licensePlate')}</span></div>
                    <div class="col-6"><strong>Jarak Tempuh:</strong> <span>${formatMileage(get('mileage'))}</span></div>
                    <div class="col-6"><strong>Transmisi:</strong> <span>${get('transmission')}</span></div>
                    <div class="col-6"><strong>Bahan Bakar:</strong> <span>${get('fuelType')}</span></div>
                    <div class="col-6"><strong>Warna:</strong> <span>${get('exteriorColor') || '-'}</span></div>
                </div>
            </div>
            <div class="border rounded p-3 mb-3">
                <h6 class="fw-bold mb-2"><i class="bi bi-calendar-check me-2 text-primary"></i>Jadwal & Lokasi</h6>
                <div class="row g-2 small">
                    <div class="col-6"><strong>Tanggal:</strong> <span>${formatDate(get('inspectionDate'))}</span></div>
                    <div class="col-6"><strong>Waktu:</strong> <span>${get('inspectionTime')}</span></div>
                    <div class="col-12"><strong>Lokasi:</strong> <span>${get('address')}, ${get('city')}, ${get('province')}</span></div>
                    <div class="col-12"><strong>HP:</strong> <span>${get('contactPhone')}</span></div>
                </div>
            </div>
            <div class="price-preview-card">
                <div class="price-row"><span>Harga Kendaraan</span><span class="fw-semibold" id="previewVehiclePrice">${formatPrice(price)}</span></div>
                <div class="price-row"><span>Biaya Inspeksi</span><span class="fw-semibold">Rp 350.000</span></div>
                <div class="price-row"><span>Biaya Platform</span><span class="fw-semibold">Rp 6.500</span></div>
                <div class="price-row total"><span>Total Tagihan</span><span class="text-primary" id="previewTotal">${formatPrice(total)}</span></div>
            </div>
            <div class="alert alert-warning mt-3">
                <i class="bi bi-exclamation-circle me-2"></i>
                Dengan melanjutkan, Anda menyetujui <a href="#" class="alert-link">syarat & ketentuan</a> OTOMAN.
            </div>
            <div class="mt-4 d-flex justify-content-between">
                <button class="btn btn-outline-secondary" onclick="goStep(3)"><i class="bi bi-arrow-left me-2"></i>Kembali</button>
                <button class="btn btn-success" onclick="goStep(5)">Bayar Sekarang <i class="bi bi-credit-card ms-2"></i></button>
            </div>`;
        }
    },
    {
        id: 5,
        title: 'Pembayaran',
        icon: 'bi-credit-card',
        validate: () => true,
        render: () => {
            const price = parseInt(document.getElementById('vehiclePrice')?.value || '0');
            const total = price + INSPECTION_FEE + PLATFORM_FEE;
            return `
            <div class="form-section-title"><i class="bi bi-credit-card"></i>Pembayaran</div>
            <div class="alert alert-primary d-flex align-items-center gap-2 mb-4">
                <i class="bi bi-info-circle fs-5"></i>
                <div>
                    <strong>Total Tagihan:</strong>
                    <span class="fs-5 fw-bold ms-2" id="paymentTotal">${formatPrice(total)}</span>
                    <small class="d-block text-muted">Biaya inspeksi + platform fee</small>
                </div>
            </div>
            <div class="alert alert-warning d-flex align-items-center gap-2 mb-4" id="countdownBox">
                <i class="bi bi-clock fs-5"></i>
                <div>Batas pembayaran: <strong id="countdownText">23:59:59</strong></div>
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Pilih Metode Pembayaran</label>
                <div id="paymentMethods">
                    ${DEFAULT_PAYMENT_METHODS.map(m => `
                    <label class="payment-method-card" id="pm-${m.id}">
                        <input type="radio" name="paymentMethod" value="${m.id}" onchange="selectPayment('${m.id}','${m.code}')">
                        <div class="payment-logo" style="background:${m.color}">${m.code}</div>
                        <div class="flex-grow-1"><div class="fw-semibold small">${m.name}</div></div>
                    </label>`).join('')}
                </div>
            </div>
            <div class="d-none mb-3" id="vaSection">
                <label class="form-label fw-semibold">Nomor Virtual Account</label>
                <div class="va-display d-flex align-items-center justify-content-center gap-3">
                    <span id="vaNumber" class="fw-bold">-</span>
                    <i class="bi bi-copy fs-4 text-primary" style="cursor:pointer" onclick="copyVA()" title="Salin"></i>
                </div>
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold">Upload Bukti Transfer <span class="text-danger">*</span></label>
                <input type="file" id="paymentProof" accept=".png,.jpg,.jpeg,.pdf" class="d-none">
                <label for="paymentProof" class="btn btn-outline-primary w-100 py-4 text-center" style="cursor:pointer; border-style:dashed;">
                    <i class="bi bi-cloud-upload fs-3 d-block mb-2 text-muted"></i>
                    <small>Klik untuk upload bukti pembayaran</small><br>
                    <small class="text-muted">PNG, JPG, PDF (Max 2MB)</small>
                </label>
                <div id="proofPreview" class="d-none mt-2">
                    <div class="d-flex align-items-center justify-content-between p-2 bg-light border rounded">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-file-earmark-check text-success"></i>
                            <span id="proofFileName" class="small"></span>
                        </div>
                        <i class="bi bi-x text-danger" style="cursor:pointer" onclick="removeProof()"></i>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <button class="btn btn-outline-secondary" onclick="goStep(4)"><i class="bi bi-arrow-left me-2"></i>Kembali</button>
                <button class="btn btn-success" id="submitBtn" onclick="submitListing()" disabled>
                    <i class="bi bi-send me-2"></i>Submit Listing
                </button>
            </div>`;
        }
    }
];

let currentStep = 1;
let selectedPaymentMethod = null;
let paymentProofFile = null;
let countdownInterval = null;
let paymentDeadline = null;
let selectedVehicleImages = [];

// ---------- STATE per step ----------
const formState = {};

// ---------- RESTORE state for current step ----------
function restoreFormStateForStep(stepId) {
    const map = {
        1: ['brand','model','year','licensePlate','vin','machineNumber','mileage','transmission','fuelType','exteriorColor','interiorColor'],
        2: ['inspectionDate','inspectionTime','province','city','contactPhone','address'],
        3: ['vehiclePrice','notes'],
    };
    const ids = map[stepId] || [];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !formState[id]) return;
        if (el.tagName === 'SELECT') {
            const exists = Array.from(el.options).some(o => o.value === formState[id]);
            if (exists) el.value = formState[id];
        } else {
            el.value = formState[id];
        }
    });
}

// ---------- SAVE state from DOM ----------
function saveFormStateToState(stepId) {
    const map = {
        1: ['brand','model','year','licensePlate','vin','machineNumber','mileage','transmission','fuelType','exteriorColor','interiorColor'],
        2: ['inspectionDate','inspectionTime','province','city','contactPhone','address'],
        3: ['vehiclePrice','notes'],
    };
    const ids = map[stepId] || [];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) formState[id] = el.value?.trim() || '';
    });
}

function goStep(step) {
    // Save ALL form values from DOM (from ALL steps that have been visited)
    const allFormIds = ['brand','model','year','licensePlate','vin','machineNumber','mileage',
     'transmission','fuelType','exteriorColor','interiorColor',
     'inspectionDate','inspectionTime','province','city','contactPhone','address',
     'vehiclePrice','notes'];
    allFormIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) formState[id] = el.value?.trim() || '';
    });

    if (step === 5 && currentStep < 5) startCountdown();
    if (step > currentStep) {
        const current = STEPS.find(s => s.id === currentStep);
        if (current && !current.validate()) return;
    }
    currentStep = step;
    renderCurrentStep();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initYearDropdown();
    initDateMin();
    renderStepProgress();
    renderCurrentStep();
});

// ---------- AUTH GUARD ----------
function checkAuth() {
    const token = localStorage.getItem('otoman_token');
    const user = JSON.parse(localStorage.getItem('otoman_user') || '{}');
    if (!token || !user.id) {
        document.getElementById('formContent')?.classList.add('d-none');
        document.getElementById('authGuard')?.classList.remove('d-none');
        return;
    }
    document.getElementById('authGuard')?.classList.add('d-none');
    document.getElementById('formContent')?.classList.remove('d-none');
}

// ---------- PROGRESS BAR ----------
function renderStepProgress() {
    const container = document.getElementById('stepProgress');
    if (!container) return;
    container.innerHTML = STEPS.map((s, i) => {
        const connector = i < STEPS.length - 1 ? `<div class="step-connector" id="conn${s.id}"></div>` : '';
        return `
        <div class="step-progress-item" id="stepItem${s.id}" data-step="${s.id}">
            <div class="step-circle">${s.id}</div>
            <span class="step-progress-label">${s.title}</span>
        </div>
        ${connector}`;
    }).join('');
}

function updateProgress() {
    STEPS.forEach(s => {
        const item = document.getElementById(`stepItem${s.id}`);
        const conn = document.getElementById(`conn${s.id}`);
        if (item) {
            item.classList.remove('active', 'completed');
            if (s.id < currentStep) item.classList.add('completed');
            if (s.id === currentStep) item.classList.add('active');
        }
        if (conn) {
            conn.classList.toggle('completed', s.id < currentStep);
        }
    });
}

// ---------- STEP RENDERING ----------
function renderCurrentStep() {
    const container = document.getElementById('stepContainer');
    if (!container) return;
    const step = STEPS.find(s => s.id === currentStep);
    if (step) {
        container.innerHTML = step.render();
        restoreFormStateForStep(currentStep);
        if (currentStep === 1) initYearDropdown();
        if (currentStep === 1 || currentStep === 2) initDateMin();
        if (currentStep === 3) updatePricePreview();
        if (currentStep === 1) renderImagePreviews();
    }
}

// ---------- YEAR DROPDOWN ----------
function initYearDropdown() {
    const select = document.getElementById('year');
    if (!select || select.options.length > 1) return; // already populated
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1990; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        select.appendChild(opt);
    }
}

// ---------- MIN DATE ----------
function initDateMin() {
    const dateInput = document.getElementById('inspectionDate');
    if (!dateInput) return;
    const min = new Date();
    min.setDate(min.getDate() + 2);
    dateInput.min = min.toISOString().split('T')[0];
}

// ---------- PRICE ----------
function formatPriceInput(el) {
    const raw = el.value.replace(/\D/g, '');
    if (!raw) {
        el.value = '';
        document.getElementById('vehiclePrice').value = '';
    } else {
        const num = parseInt(raw);
        el.value = num.toLocaleString('id-ID');
        document.getElementById('vehiclePrice').value = num;
    }
    updatePricePreview();
}

function updatePricePreview() {
    const price = parseInt(document.getElementById('vehiclePrice')?.value || '0');
    const total = price + INSPECTION_FEE + PLATFORM_FEE;
    const vehEl = document.getElementById('pricePreviewVehicle');
    const totEl = document.getElementById('pricePreviewTotal');
    if (vehEl) vehEl.textContent = formatPrice(price);
    if (totEl) totEl.textContent = formatPrice(total);
}

function formatPrice(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMileage(km) {
    return Number(km || 0).toLocaleString('id-ID') + ' km';
}

// ---------- PAYMENT ----------
function selectPayment(methodId, code) {
    selectedPaymentMethod = methodId;
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`pm-${methodId}`)?.classList.add('selected');
    const vaSection = document.getElementById('vaSection');
    const vaNumber = document.getElementById('vaNumber');
    if (vaSection) vaSection.classList.remove('d-none');
    if (vaNumber) vaNumber.textContent = generateMockVA(code);
    checkSubmitReady();
}

function generateMockVA(code) {
    const map = {
        'MANDIRI': '8803 1234 5678 9012', 'BRI': '8802 1234 5678 9012',
    };
    return map[code] || '0000 0000 0000 0000';
}

function copyVA() {
    const va = document.getElementById('vaNumber')?.textContent?.replace(/\s/g, '') || '';
    navigator.clipboard.writeText(va)
        .then(() => alert('VA berhasil disalin!'))
        .catch(() => alert('Gagal salin VA'));
}

// ---------- PAYMENT PROOF ----------
document.addEventListener('change', function(e) {
    if (e.target.id === 'vehicleImages') {
        handleVehicleImages(e.target.files);
        return;
    }
    if (e.target.id === 'paymentProof') {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/png','image/jpeg','image/jpg','application/pdf'].includes(file.type)) {
            alert('Format tidak valid'); e.target.value = ''; return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('File max 2MB'); e.target.value = ''; return;
        }
        paymentProofFile = file;
        document.getElementById('proofFileName').textContent = file.name;
        document.getElementById('proofPreview')?.classList.remove('d-none');
        checkSubmitReady();
    }
});

function removeProof() {
    document.getElementById('paymentProof').value = '';
    document.getElementById('proofPreview')?.classList.add('d-none');
    paymentProofFile = null;
    checkSubmitReady();
}

// ---------- VEHICLE IMAGES ----------
function handleVehicleImages(files) {
    const container = document.getElementById('imagePreviewContainer');
    if (!container || !files) return;

    const maxImages = 5;
    const currentCount = selectedVehicleImages.length;

    Array.from(files).forEach(file => {
        if (selectedVehicleImages.length >= maxImages) {
            alert('Maksimal 5 foto!');
            return;
        }
        if (!['image/png','image/jpeg','image/jpg'].includes(file.type)) {
            alert('Format tidak valid. Hanya PNG dan JPG.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File max 5MB!');
            return;
        }
        selectedVehicleImages.push(file);
    });

    renderImagePreviews();
}

function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;

    container.innerHTML = selectedVehicleImages.map((file, i) => `
        <div class="position-relative" style="width:100px;height:100px; border:2px solid #dee2e6; border-radius:8px; overflow:hidden;">
            <img src="${URL.createObjectURL(file)}" style="width:100%;height:100%;object-fit:cover;">
            ${i === 0 ? '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:#fff;font-size:0.6rem;padding:2px 4px;text-align:center;">Thumbnail</span>' : ''}
            <i class="bi bi-x-circle-fill text-danger" style="position:absolute;top:4px;right:4px;cursor:pointer;font-size:1.1rem;background:#fff;border-radius:50%;" onclick="removeVehicleImage(${i})"></i>
        </div>
    `).join('') + `
        ${selectedVehicleImages.length < 5 ? `
        <label for="vehicleImages" class="btn btn-outline-primary" style="cursor:pointer; min-width:100px; min-height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-style:dashed;">
            <i class="bi bi-plus-circle fs-4"></i>
            <small class="mt-1">Tambah Foto</small>
        </label>` : ''}
    `;
}

function removeVehicleImage(index) {
    selectedVehicleImages.splice(index, 1);
    renderImagePreviews();
}

function checkSubmitReady() {
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = !(selectedPaymentMethod && paymentProofFile);
}

// ---------- COUNTDOWN ----------
function startCountdown() {
    paymentDeadline = new Date();
    paymentDeadline.setHours(paymentDeadline.getHours() + 24);
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const now = new Date();
        const diff = paymentDeadline - now;
        const el = document.getElementById('countdownText');
        if (!el) return;
        if (diff <= 0) { el.textContent = 'WAKTU HABIS'; clearInterval(countdownInterval); return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
}

// ---------- SUBMIT ----------
async function submitListing() {
    const submitBtn = document.getElementById('submitBtn');
    const origText = submitBtn?.innerHTML || '';
    submitBtn && (submitBtn.disabled = true, submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...');

    // Read values from formState (persisted across step navigation)
    const get = id => formState[id]?.trim() || '';

    const formData = new FormData();
    formData.append('vehicle_brand', get('brand'));
    formData.append('vehicle_model', get('model'));
    formData.append('vehicle_year', parseInt(get('year')) || 0);
    formData.append('license_plate', get('licensePlate'));
    formData.append('vin', get('vin'));
    formData.append('machine_number', get('machineNumber'));
    formData.append('mileage', parseInt(get('mileage')) || 0);
    formData.append('transmission', get('transmission'));
    formData.append('fuel_type', get('fuelType'));
    formData.append('exterior_color', get('exteriorColor'));
    formData.append('interior_color', get('interiorColor'));
    formData.append('inspection_date', get('inspectionDate'));
    formData.append('inspection_time', get('inspectionTime'));
    formData.append('province', get('province'));
    formData.append('city', get('city'));
    formData.append('address', get('address'));
    formData.append('contact_phone', get('contactPhone'));
    formData.append('vehicle_price', parseInt(formState['vehiclePrice'] || '0'));
    formData.append('notes', get('notes'));

    selectedVehicleImages.forEach((file) => {
        formData.append('images[]', file);
    });

    console.log('[Submit] formState:', JSON.stringify(formState));

    try {
        const token = localStorage.getItem('otoman_token');
        const response = await fetch(`${API_BASE}/marketplace/seller/listings`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`
            },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) {
            const errMsg = result.message || result.errors ? Object.values(result.errors || {}).flat().join(', ') : 'Gagal submit listing';
            throw new Error(errMsg);
        }
        showSuccess(result.data?.order_code);
    } catch (error) {
        alert('Gagal submit: ' + error.message);
        submitBtn && (submitBtn.disabled = false, submitBtn.innerHTML = origText);
    } finally {
        submitBtn && (submitBtn.disabled = false, submitBtn.innerHTML = origText);
    }
}

function showSuccess(orderCode) {
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('stepContainer').innerHTML = '';
    document.getElementById('stepProgress').innerHTML = '';
    document.getElementById('stepSuccess').style.display = 'block';
    document.getElementById('successOrderCode').textContent = orderCode;
}

function resetForm() {
    Object.keys(formState).forEach(k => delete formState[k]);
    currentStep = 1;
    selectedVehicleImages = [];
    selectedPaymentMethod = null;
    paymentProofFile = null;
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('stepSuccess').style.display = 'none';
    renderStepProgress();
    renderCurrentStep();
    updateProgress();
}
