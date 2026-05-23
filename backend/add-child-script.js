// Add Child Script for StoryBond

const ChildForm = {
    init() {
        const form = document.getElementById('childForm');
        const birthdayInput = document.getElementById('birthday');
        
        // Auto-format birthday input
        birthdayInput.addEventListener('input', ChildForm.formatDate);
        
        // Form submission
        form.addEventListener('submit', ChildForm.handleSubmit);
    },

    formatDate(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
            value = value.slice(0, 5) + '/' + value.slice(5);
        }
        
        e.target.value = value.slice(0, 10); // Max length dd/mm/yyyy
    },

    validateForm(name, birthday) {
        const errors = {};
        
        // Validate name
        if (!name || name.trim().length === 0) {
            errors.name = 'Please enter child\'s name';
        } else if (name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        // Validate birthday
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!birthday || !dateRegex.test(birthday)) {
            errors.birthday = 'Please enter birthday in dd/mm/yyyy format';
        } else {
            const match = birthday.match(dateRegex);
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = parseInt(match[3]);
            
            if (day < 1 || day > 31) {
                errors.birthday = 'Invalid day';
            } else if (month < 1 || month > 12) {
                errors.birthday = 'Invalid month';
            } else if (year < 1900 || year > new Date().getFullYear()) {
                errors.birthday = 'Invalid year';
            }
        }
        
        return errors;
    },

    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + 'Error');
        const input = document.getElementById(fieldId);
        
        if (errorEl && input) {
            errorEl.textContent = '⚠️ ' + message;
            errorEl.classList.add('show');
            input.style.borderColor = '#ff6b6b';
        }
    },

    clearErrors() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = '#F0E8F5';
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('childName').value.trim();
        const birthday = document.getElementById('birthday').value;
        const selectedColor = document.querySelector('input[name="color"]:checked');
        
        // Clear previous errors
        ChildForm.clearErrors();
        
        // Validate form
        const errors = ChildForm.validateForm(name, birthday);
        
        if (errors.name) {
            ChildForm.showError('childName', errors.name);
        }
        if (errors.birthday) {
            ChildForm.showError('birthday', errors.birthday);
        }
        
        // If there are errors, stop
        if (Object.keys(errors).length > 0) {
            return;
        }
        
        // Get selected color
        const color = selectedColor ? selectedColor.value : 'blue';
        
        // Success! (In production, this would save to backend)
        console.log('Child added:', { name, birthday, color });
        
        // Show success message
        alert(`✅ ${name} has been added successfully!`);
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', ChildForm.init);

// Language Switcher (if needed)
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// User Profile Click
const userCard = document.querySelector('.user-card');
if (userCard) {
    userCard.addEventListener('click', function() {
        alert('Opening profile settings...');
    });
}
