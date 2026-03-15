// Price Estimation JavaScript
// ============================
console.log('price-estimation.js loaded!');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
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

        // Update navbar based on login status
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
    form.addEventListener('submit', handleEstimate);
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('modelYear');
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 30; // 30 years back

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Populate brand dropdown (mock data based on common car brands)
function populateBrandDropdown() {
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');

    // Mock brands data
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

    // Handle brand selection to show models
    brandSelect.addEventListener('change', function() {
        const selectedBrand = this.value;

        // Reset model dropdown
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

// Mock models data (sample - in real app, this would come from API or larger dataset)
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
    // Add more as needed
};

// Handle estimate button click
async function handleEstimate(e) {
    e.preventDefault();

    // Show loading
    showLoading(true);

    // Collect form data
    const formData = {
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        model_year: parseInt(document.getElementById('modelYear').value),
        milage: parseInt(document.getElementById('milage').value),
        fuel_type: document.getElementById('fuelType').value,
        engine: document.getElementById('engine').value || '',
        transmission: document.querySelector('input[name="transmission"]:checked')?.value || '',
        ext_col: document.getElementById('extCol').value || '',
        int_col: document.getElementById('intCol').value || '',
        accident: document.querySelector('input[name="accident"]:checked')?.value || '',
        clean_title: document.querySelector('input[name="cleanTitle"]:checked')?.value || ''
    };

    try {
        // Simulate API call (replace with actual ML service endpoint)
        const result = await estimatePrice(formData);

        // Display result
        displayResult(formData, result);
    } catch (error) {
        console.error('Error estimating price:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        showLoading(false);
    }
}

// Mock price estimation (replace with actual ML service)
async function estimatePrice(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock calculation - in real app, this would call ML service
    const basePrice = 300000000; // 300 juta base
    const yearFactor = (data.model_year - 2010) * 10000000;
    const mileageFactor = data.milage * 500000;
    const accidentFactor = data.accident === 'Yes' ? -50000000 : 0;
    const cleanTitleFactor = data.clean_title === 'No' ? -30000000 : 0;

    const estimatedPrice = basePrice + yearFactor - mileageFactor + accidentFactor + cleanTitleFactor;

    // Add some variance for low/mid/high
    const variance = estimatedPrice * 0.15;

    return {
        price_low: Math.round((estimatedPrice - variance) / 1000000) * 1000000,
        price_mid: Math.round(estimatedPrice / 1000000) * 1000000,
        price_high: Math.round((estimatedPrice + variance) / 1000000) * 1000000
    };
}

// Display result
function displayResult(data, result) {
    // Update vehicle summary
    document.getElementById('resultVehicle').textContent =
        `${data.model_year} ${data.brand} ${data.model}`;
    document.getElementById('resultSpecs').textContent =
        `${data.milage.toLocaleString()} km | ${data.transmission} | ${data.fuel_type}`;

    // Update prices
    document.getElementById('priceLow').textContent = formatCurrency(result.price_low);
    document.getElementById('priceMid').textContent = formatCurrency(result.price_mid);
    document.getElementById('priceHigh').textContent = formatCurrency(result.price_high);

    // Show result section
    document.getElementById('resultSection').classList.remove('d-none');

    // Scroll to result
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// Format currency to IDR
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Show/hide loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

// Reset form
function resetForm() {
    document.getElementById('priceEstimationForm').reset();
    document.getElementById('model').disabled = true;
    document.getElementById('resultSection').classList.add('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logout function
function logout() {
    localStorage.removeItem('otoman_token');
    localStorage.removeItem('otoman_user');
    window.location.href = 'login.html';
}