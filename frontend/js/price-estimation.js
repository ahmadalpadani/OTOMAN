// Price Estimation JavaScript
// ============================
console.log('price-estimation.js loaded!');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
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
        populateBrandDropdown();
    } catch (e) {
        console.log('populateBrandDropdown skipped:', e.message);
    }
});

// Check auth (optional - this feature might be accessible without login)
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

// Initialize form
function initForm() {
    const form = document.getElementById('priceEstimationForm');
    if (!form) return;

    form.addEventListener('submit', handleEstimate);
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('modelYear');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 30;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Populate brand dropdown
function populateBrandDropdown() {
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');

    if (!brandSelect || !modelSelect) return;

    const brands = [
        'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
        'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
        'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz',
        'Nissan', 'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
    ];

    brands.sort().forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    brandSelect.addEventListener('change', function () {
        const selectedBrand = this.value;

        modelSelect.innerHTML = '<option value="">-- Pilih Model --</option>';
        modelSelect.disabled = !selectedBrand;

        if (selectedBrand && mockModels[selectedBrand]) {
            mockModels[selectedBrand].forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
            modelSelect.disabled = false;
        }
    });
}

// Mock models data
const mockModels = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', '4Runner', 'Prius', 'Sequoia', 'Tundra', 'Sienna'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco', 'Ranger', 'Maverick'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7', '7 Series', 'M3', 'M5'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue'],
    'Kia': ['Forte', 'K5', 'Sportage', 'Telluride', 'Seltos', 'Soul', 'Carnival'],
    'Nissan': ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'Armada', 'Z', 'Leaf'],
    'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Traverse']
};

// Handle estimate button click
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

// Validate form before API call
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

// Real price estimation via Laravel API
async function estimatePrice(data) {
    const response = await fetch('http://localhost:8000/api/car-price/predict', {
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
            clean_title: data.clean_title
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
        currency: result.data.currency || 'USD'
    };
}

// Display result
function displayResult(data, result) {
    const resultVehicle = document.getElementById('resultVehicle');
    const resultSpecs = document.getElementById('resultSpecs');
    const priceLow = document.getElementById('priceLow');
    const priceMid = document.getElementById('priceMid');
    const priceHigh = document.getElementById('priceHigh');
    const resultSection = document.getElementById('resultSection');

    if (resultVehicle) {
        resultVehicle.textContent = `${data.model_year} ${data.brand} ${data.model}`;
    }

    if (resultSpecs) {
        resultSpecs.textContent =
            `${data.milage.toLocaleString('en-US')} mi | ${data.transmission} | ${data.fuel_type}`;
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

    if (resultSection) {
        resultSection.classList.remove('d-none');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Format currency
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

// Show/hide loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    if (show) {
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('priceEstimationForm');
    const model = document.getElementById('model');
    const resultSection = document.getElementById('resultSection');

    if (form) form.reset();
    if (model) model.disabled = true;
    if (resultSection) resultSection.classList.add('d-none');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logout function
function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    window.location.href = 'login.html';
}