// Inspection Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
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
            // Show toast and redirect
            showToast('Silakan login terlebih dahulu untuk memesan inspeksi', 'warning');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    }

    function initializeYearDropdown() {
        const yearSelect = document.getElementById('vehicleYear');
        const currentYear = new Date().getFullYear();
        const startYear = 1990;

        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    function initializeFormSteps() {
        const nextButtons = document.querySelectorAll('.btn-next-step');
        const prevButtons = document.querySelectorAll('.btn-prev-step');
        const form = document.getElementById('inspectionForm');

        // Next step buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.form-step');
                const nextStepNum = this.getAttribute('data-next');

                if (validateStep(currentStep)) {
                    goToStep(nextStepNum);

                    // If going to step 3, update summary
                    if (nextStepNum === '3') {
                        updateSummary();
                    }
                }
            });
        });

        // Previous step buttons
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const prevStepNum = this.getAttribute('data-prev');
                goToStep(prevStepNum);
            });
        });

        // Form submission
        form.addEventListener('submit', async function(e) {
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

        typeInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Remove error message if selected
                const errorEl = document.getElementById('vehicleTypeError');
                if (errorEl && this.checked) {
                    errorEl.textContent = '';
                }

                // Update brand options based on vehicle type
                updateBrandOptions(this.value);
            });
        });
    }

    function initializeConditionSelector() {
        const conditionInputs = document.querySelectorAll('input[name="vehicleCondition"]');

        conditionInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Remove error message if selected
                const errorEl = document.getElementById('conditionError');
                if (errorEl && this.checked) {
                    errorEl.textContent = '';
                }
            });
        });
    }

    function updateBrandOptions(vehicleType) {
        const brandSelect = document.getElementById('vehicleBrand');
        const brands = brandSelect.querySelectorAll('optgroup');

        brands.forEach(group => {
            const label = group.getAttribute('label').toLowerCase();
            if (vehicleType === 'mobil') {
                group.style.display = label.includes('mobil') ? '' : 'none';
            } else if (vehicleType === 'motor') {
                group.style.display = label.includes('motor') ? '' : 'none';
            }
        });

        // Reset brand selection
        brandSelect.value = '';
    }

    function validateStep(stepElement) {
        let isValid = true;
        const inputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');

        // First check for radio button groups
        const vehicleTypeInputs = stepElement.querySelectorAll('input[name="vehicleType"]');
        if (vehicleTypeInputs.length > 0) {
            const isVehicleTypeSelected = Array.from(vehicleTypeInputs).some(input => input.checked);
            if (!isVehicleTypeSelected) {
                document.getElementById('vehicleTypeError').textContent = 'Silakan pilih jenis kendaraan';
                isValid = false;
            }
        }

        const conditionInputs = stepElement.querySelectorAll('input[name="vehicleCondition"]');
        if (conditionInputs.length > 0) {
            const isConditionSelected = Array.from(conditionInputs).some(input => input.checked);
            if (!isConditionSelected) {
                document.getElementById('conditionError').textContent = 'Silakan pilih kondisi kendaraan';
                isValid = false;
            }
        }

        // Check other required inputs
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                // Skip radio/checkbox as they're handled above
                return;
            }

            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        // Validate specific fields
        const mileage = document.getElementById('vehicleMileage');
        if (mileage && mileage.value) {
            if (parseInt(mileage.value) < 0) {
                mileage.classList.add('is-invalid');
                isValid = false;
            }
        }

        const phone = document.getElementById('contactPhone');
        if (phone && phone.value) {
            const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
            if (!phoneRegex.test(phone.value.replace(/[\s-]/g, ''))) {
                phone.classList.add('is-invalid');
                phone.nextElementSibling?.textContent = 'Format no. telepon tidak valid';
                isValid = false;
            }
        }

        if (!isValid) {
            showToast('Mohon lengkapi semua field yang wajib diisi', 'danger');
        }

        return isValid;
    }

    function goToStep(stepNum) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        document.getElementById('step' + stepNum).classList.add('active');

        // Update progress indicators
        updateProgress(stepNum);

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgress(currentStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
            }
        });

        // Update connectors
        document.querySelectorAll('.step-connector').forEach((connector, index) => {
            connector.classList.remove('active');
            if (index + 1 < currentStep) {
                connector.classList.add('active');
            }
        });
    }

    function updateSummary() {
        // Get form values
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

        // Format values
        const typeLabel = vehicleType === 'mobil' ? 'Mobil' : vehicleType === 'motor' ? 'Motor' : '-';
        const conditionLabels = {
            'excellent': 'Sangat Baik',
            'good': 'Baik',
            'fair': 'Cukup',
            'poor': 'Kurang'
        };
        const formattedMileage = mileage !== '-' ? parseInt(mileage).toLocaleString('id-ID') + ' km' : '-';
        const formattedDate = date !== '-' ? formatDateIndo(date) : '-';
        const location = province && city !== '-' ? `${city}, ${province}` : city;

        // Update summary
        document.getElementById('summaryType').textContent = typeLabel;
        document.getElementById('summaryModel').textContent = `${brand} ${model}`;
        document.getElementById('summaryYear').textContent = year;
        document.getElementById('summaryMileage').textContent = formattedMileage;
        document.getElementById('summaryCondition').textContent = conditionLabels[condition] || '-';
        document.getElementById('summaryDate').textContent = formattedDate;
        document.getElementById('summaryTime').textContent = time;
        document.getElementById('summaryLocation').textContent = location;
    }

    async function submitInspection() {
        const agreeTerms = document.getElementById('agreeTerms');

        if (!agreeTerms.checked) {
            agreeTerms.classList.add('is-invalid');
            showToast('Anda harus menyetujui syarat & ketentuan', 'danger');
            return;
        }

        // Gather form data
        const formData = {
            vehicle_type: document.querySelector('input[name="vehicleType"]:checked').value,
            brand: document.getElementById('vehicleBrand').value,
            model: document.getElementById('vehicleModel').value,
            year: document.getElementById('vehicleYear').value,
            mileage: document.getElementById('vehicleMileage').value,
            condition: document.querySelector('input[name="vehicleCondition"]:checked').value,
            notes: document.getElementById('vehicleNotes').value,
            inspection_date: document.getElementById('inspectionDate').value,
            inspection_time: document.getElementById('inspectionTime').value,
            province: document.getElementById('inspectionProvince').value,
            city: document.getElementById('inspectionCity').value,
            address: document.getElementById('inspectionAddress').value,
            contact_phone: document.getElementById('contactPhone').value
        };

        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

        try {
            // API call to backend
            // const response = await apiPost('/inspections', formData);

            // Mock success for now
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate order code
            const orderCode = 'INS-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            document.getElementById('orderCode').textContent = orderCode;

            // Hide form steps and show success
            document.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
            });
            document.getElementById('successStep').classList.add('active');

            showToast('Pesanan inspeksi berhasil dibuat!', 'success');

        } catch (error) {
            console.error('Error submitting inspection:', error);
            showToast(error.message || 'Gagal membuat pesanan. Silakan coba lagi.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // Utility: Format date Indonesia
    function formatDateIndo(dateString) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Utility: Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.getElementById('inspectionToast');
        const toastMessage = document.getElementById('toastMessage');

        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toastMessage.textContent = message;

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
});
