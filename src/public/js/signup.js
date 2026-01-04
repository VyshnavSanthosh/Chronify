// ========== SIGNUP FORM VALIDATION & UX ==========

// Clear input field
function clearField(fieldId) {
    const field = document.getElementById(fieldId);
    field.value = '';
    field.focus();
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Toggle referral code section
function toggleReferral() {
    const input = document.getElementById('referralInput');
    const arrow = document.querySelector('.referral-arrow');
    
    if (input.style.display === 'none') {
        input.style.display = 'block';
        arrow.classList.add('open');
    } else {
        input.style.display = 'none';
        arrow.classList.remove('open');
    }
}

// Password strength checker
document.getElementById('password')?.addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthBar.className = 'password-strength';
        return;
    }
    
    strengthBar.classList.add('active');
    
    let strength = 0;
    
    // Length checks
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    // Apply strength class
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
});

// Real-time password match validation
document.getElementById('confirmPassword')?.addEventListener('input', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = e.target.value;
    
    if (confirmPassword.length > 0 && password !== confirmPassword) {
        e.target.style.backgroundColor = '#fff5f5';
    } else {
        e.target.style.backgroundColor = '#f5f5f5';
    }
});

// Form submission validation
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        e.preventDefault();
        
        const confirmInput = document.getElementById('confirmPassword');
        confirmInput.focus();
        
        // Show error
        let errorDiv = confirmInput.parentElement.parentElement.querySelector('.error-text');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-text';
            confirmInput.parentElement.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = 'Passwords do not match';
        
        // Remove error on input
        confirmInput.addEventListener('input', function() {
            if (errorDiv) {
                errorDiv.remove();
            }
        }, { once: true });
    }
});

// Phone number formatting (digits only)
document.getElementById('phone')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    e.target.value = value;
});