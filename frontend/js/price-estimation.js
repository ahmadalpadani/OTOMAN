// price-estimation.js
console.log('price-estimation.js loaded!');

const API_BASE_URL = 'http://localhost:8000/api';
let formOptionsCache = {
    brands: [],
    models_by_brand: {},
    fuel_types: []
};

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Price estimation page loaded');

    try {
        checkAuth();
    } catch (e) {
        console.log('checkAuth skipped:', e.message);
    }

    try {
        initForm();
    } catch (e) {
        console.log('initForm skipped:', e.message);
    }

    try {
        populateYearDropdown();
    } catch (e) {
        console.log('populateYearDropdown skipped:', e.message);
    }

    try {
        await loadFormOptions();
    } catch (e) {
        console.log('loadFormOptions failed, fallback will be used:', e.message);
        populateFallbackBrandDropdown();
        populateFallbackFuelDropdown();
    }
});

// ============================
// AUTH
// ============================
function checkAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('otoman_user') || '{}');

        const navLogin = document.getElementById('navLogin');
        const navUser = document.getElementById('navUser');
        const userName = document.getElementById('userName');

        if (user && user.id && navLogin && navUser && userName) {
            navLogin.classList.add('d-none');
            navUser.classList.remove('d-none');
            userName.textContent = user.name || 'User';
        }
    } catch (e) {
        console.log('Auth check error:', e.message);
    }
}

function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    window.location.href = 'login.html';
}

// ============================
// INIT
// ============================
function initForm() {
    const form = document.getElementById('priceEstimationForm');
    const brandSelect = document.getElementById('brand');

    if (form) {
        form.addEventListener('submit', handleEstimate);
    }

    if (brandSelect) {
        brandSelect.addEventListener('change', function () {
            updateModelDropdown(this.value);
        });
    }
}

function populateYearDropdown() {
    const yearSelect = document.getElementById('modelYear');
    if (!yearSelect) return;

    yearSelect.innerHTML = '<option value="">-- Pilih Tahun --</option>';

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 30;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// ============================
// LOAD FORM OPTIONS FROM API
// ============================
async function loadFormOptions() {
    const response = await fetch(`${API_BASE_URL}/car-price/form-options`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengambil opsi form');
    }

    const data = result.data || {};

    formOptionsCache = {
        brands: data.brands || [],
        models_by_brand: data.models_by_brand || {},
        fuel_types: data.fuel_types || []
    };

    populateBrandDropdown(formOptionsCache.brands);
    populateFuelDropdown(formOptionsCache.fuel_types);
}

function populateBrandDropdown(brands) {
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');

    if (!brandSelect || !modelSelect) return;

    brandSelect.innerHTML = '<option value="">-- Pilih Brand --</option>';
    modelSelect.innerHTML = '<option value="">-- Pilih Model --</option>';
    modelSelect.disabled = true;

    brands.sort().forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

function updateModelDropdown(selectedBrand) {
    const modelSelect = document.getElementById('model');
    if (!modelSelect) return;

    modelSelect.innerHTML = '<option value="">-- Pilih Model --</option>';
    modelSelect.disabled = true;

    if (!selectedBrand) return;

    const models = formOptionsCache.models_by_brand[selectedBrand] || [];

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });

    modelSelect.disabled = models.length === 0;
}

function populateFuelDropdown(fuelTypes) {
    const fuelSelect = document.getElementById('fuelType');
    if (!fuelSelect) return;

    fuelSelect.innerHTML = '<option value="">-- Pilih Fuel Type --</option>';

    fuelTypes.sort().forEach(fuel => {
        const option = document.createElement('option');
        option.value = fuel;
        option.textContent = fuel;
        fuelSelect.appendChild(option);
    });
}

// ============================
// FALLBACK OPTIONS
// ============================
function populateFallbackBrandDropdown() {
    const fallbackBrands = [
        'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
        'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
        'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz',
        'Nissan', 'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
    ];

    formOptionsCache.brands = fallbackBrands;
    formOptionsCache.models_by_brand = fallbackModelsByBrand;
    populateBrandDropdown(fallbackBrands);
}

function populateFallbackFuelDropdown() {
    const fallbackFuelTypes = ['Gasoline', 'Hybrid', 'Diesel', 'Electric', 'Plug-In Hybrid', 'Unknown'];
    formOptionsCache.fuel_types = fallbackFuelTypes;
    populateFuelDropdown(fallbackFuelTypes);
}

const fallbackModelsByBrand = {
    'Acura': ['ILX', 'Integra', 'MDX', 'RDX', 'RLX', 'TLX'],
    'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
    'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M5'],
    'Buick': ['Encore', 'Encore GX', 'Enclave', 'Envision', 'LaCrosse'],
    'Cadillac': ['ATS', 'CT4', 'CT5', 'CT6', 'Escalade', 'XT4', 'XT5', 'XT6'],
    'Chevrolet': ['Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Traverse', 'Trax'],
    'Chrysler': ['200', '300', 'Pacifica', 'Voyager'],
    'Dodge': ['Challenger', 'Charger', 'Durango', 'Hornet', 'Journey'],
    'Ford': ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Fusion', 'Maverick', 'Mustang', 'Ranger'],
    'GMC': ['Acadia', 'Canyon', 'Sierra', 'Terrain', 'Yukon'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
    'Hyundai': ['Elantra', 'Ioniq', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
    'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
    'Jaguar': ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'XE', 'XF'],
    'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler'],
    'Kia': ['Carnival', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Telluride'],
    'Lexus': ['ES', 'GX', 'IS', 'LS', 'LX', 'NX', 'RX', 'UX'],
    'Lincoln': ['Aviator', 'Corsair', 'MKZ', 'Nautilus', 'Navigator'],
    'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class'],
    'Nissan': ['Altima', 'Armada', 'Frontier', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Versa', 'Z'],
    'Porsche': ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
    'Ram': ['1500', '2500', '3500', 'ProMaster'],
    'Subaru': ['Ascent', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
    'Toyota': ['4Runner', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra'],
    'Volkswagen': ['Arteon', 'Atlas', 'Golf', 'Jetta', 'Passat', 'Taos', 'Tiguan'],
    'Volvo': ['S60', 'S90', 'V60', 'XC40', 'XC60', 'XC90']
};

// ============================
// SUBMIT / PREDICT
// ============================
async function handleEstimate(e) {
    e.preventDefault();

    showLoading(true);

    const formData = {
        brand: document.getElementById('brand')?.value || '',
        model: document.getElementById('model')?.value || '',
        model_year: parseInt(document.getElementById('modelYear')?.value, 10),
        milage: parseInt(document.getElementById('milage')?.value, 10),
        fuel_type: document.getElementById('fuelType')?.value || '',
        engine: document.getElementById('engine')?.value || '',
        transmission: document.querySelector('input[name="transmission"]:checked')?.value || '',
        ext_col: document.getElementById('extCol')?.value || '',
        int_col: document.getElementById('intCol')?.value || '',
        accident: document.querySelector('input[name="accident"]:checked')?.value || '',
        clean_title: document.querySelector('input[name="cleanTitle"]:checked')?.value || ''
    };

    try {
        validateFormData(formData);

        const result = await estimatePrice(formData);

        displayResult(formData, result);
    } catch (error) {
        console.error('Error estimating price:', error);
        alert(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        showLoading(false);
    }
}

function validateFormData(data) {
    if (!data.brand) throw new Error('Brand wajib dipilih.');
    if (!data.model) throw new Error('Model wajib dipilih.');
    if (!data.model_year || Number.isNaN(data.model_year)) throw new Error('Tahun model wajib diisi.');
    if (!data.milage || Number.isNaN(data.milage)) throw new Error('Mileage wajib diisi.');
    if (!data.fuel_type) throw new Error('Fuel type wajib dipilih.');
    if (!data.transmission) throw new Error('Transmission wajib dipilih.');
    if (!data.accident) throw new Error('Status accident wajib dipilih.');
    if (!data.clean_title) throw new Error('Status clean title wajib dipilih.');
}

async function estimatePrice(data) {
    const response = await fetch(`${API_BASE_URL}/car-price/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            brand: data.brand,
            model: data.model,
            model_year: data.model_year,
            milage: data.milage,
            fuel_type: data.fuel_type,
            transmission: data.transmission,
            accident: data.accident,
            clean_title: data.clean_title,
            engine: data.engine,
            ext_col: data.ext_col,
            int_col: data.int_col
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengambil prediksi harga');
    }

    return {
        price_low: result.data.price_low,
        price_mid: result.data.predicted_price,
        price_high: result.data.price_high,
        currency: result.data.currency || 'IDR',
        exchange_rate_usd_to_idr: result.data.exchange_rate_usd_to_idr || null,
        raw_usd_prediction: result.data.raw_usd_prediction || null
    };
}

// ============================
// DISPLAY RESULT
// ============================
function displayResult(data, result) {
    const resultVehicle = document.getElementById('resultVehicle');
    const resultSpecs = document.getElementById('resultSpecs');
    const priceLow = document.getElementById('priceLow');
    const priceMid = document.getElementById('priceMid');
    const priceHigh = document.getElementById('priceHigh');
    const resultSection = document.getElementById('resultSection');
    const usdInfo = document.getElementById('usdInfo');

    if (resultVehicle) {
        resultVehicle.textContent = `${data.model_year} ${data.brand} ${data.model}`;
    }

    if (resultSpecs) {
        resultSpecs.textContent =
            `${Number(data.milage).toLocaleString('id-ID')} km/mi | ${data.transmission} | ${data.fuel_type}`;
    }

    if (priceLow) {
        priceLow.textContent = formatCurrency(result.price_low, result.currency);
    }

    if (priceMid) {
        priceMid.textContent = formatCurrency(result.price_mid, result.currency);
    }

    if (priceHigh) {
        priceHigh.textContent = formatCurrency(result.price_high, result.currency);
    }

    if (usdInfo && result.raw_usd_prediction) {
        usdInfo.textContent = `Estimasi dasar: ${formatCurrency(result.raw_usd_prediction, 'USD')}`;
    }

    if (resultSection) {
        resultSection.classList.remove('d-none');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount, currency = 'IDR') {
    const numericAmount = Number(amount || 0);

    if (currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(numericAmount);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(numericAmount);
}

// ============================
// UI HELPERS
// ============================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    if (show) {
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

function resetForm() {
    const form = document.getElementById('priceEstimationForm');
    const model = document.getElementById('model');
    const resultSection = document.getElementById('resultSection');

    if (form) form.reset();
    if (model) {
        model.innerHTML = '<option value="">-- Pilih Model --</option>';
        model.disabled = true;
    }
    if (resultSection) resultSection.classList.add('d-none');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}