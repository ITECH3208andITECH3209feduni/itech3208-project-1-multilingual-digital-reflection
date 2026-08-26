// Add Child Script for StoryBond

const API_URL =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'YOUR_PRODUCTION_API_URL';

const AVATARS = ['🌙', '🚀', '🌸', '🐻', '⚡', '🌺', '🦁', '🦋', '🐆', '⭐'];

const ChildForm = {
    init() {
        const form = document.getElementById('childForm');
        const birthdayInput = document.getElementById('birthday');

        if (!form || !birthdayInput) {
            return;
        }

        birthdayInput.addEventListener('input', ChildForm.formatDate);
        form.addEventListener('submit', ChildForm.handleSubmit);

        ChildForm.initAvatarSelector();
    },

    initAvatarSelector() {
        const avatarContainer = document.querySelector('.avatar-selector');

        if (!avatarContainer) {
            return;
        }

        AVATARS.forEach((avatar, index) => {
            const button = document.createElement('button');

            button.type = 'button';
            button.textContent = avatar;
            button.className = 'avatar-btn';

            if (index === 0) {
                button.classList.add('selected');
            }

            button.addEventListener('click', () => {
                document.querySelectorAll('.avatar-btn').forEach((avatarButton) => {
                    avatarButton.classList.remove('selected');
                });

                button.classList.add('selected');
            });

            avatarContainer.appendChild(button);
        });
    },

    formatDate(event) {
        let value = event.target.value.replace(/\D/g, '');

        if (value.length >= 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        if (value.length >= 5) {
            value = `${value.slice(0, 5)}/${value.slice(5)}`;
        }

        event.target.value = value.slice(0, 10);
    },

    validateForm(name, birthday) {
        const errors = {};

        if (!name) {
            errors.name = "Please enter child's name";
        } else if (name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

        if (!birthday || !dateRegex.test(birthday)) {
            errors.birthday = 'Please enter birthday in dd/mm/yyyy format';
            return errors;
        }

        const match = birthday.match(dateRegex);

        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);

        const currentYear = new Date().getFullYear();

        if (day < 1 || day > 31) {
            errors.birthday = 'Invalid day';
        } else if (month < 1 || month > 12) {
            errors.birthday = 'Invalid month';
        } else if (year < 1900 || year > currentYear) {
            errors.birthday = 'Invalid year';
        } else {
            const date = new Date(year, month - 1, day);

            const isValidDate =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day;

            if (!isValidDate) {
                errors.birthday = 'Please enter a valid date';
            }
        }

        return errors;
    },

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);

        if (!errorElement || !inputElement) {
            return;
        }

        errorElement.textContent = `⚠️ ${message}`;
        errorElement.classList.add('show');
        inputElement.style.borderColor = '#ff6b6b';
    },

    clearErrors() {
        document.querySelectorAll('.error-message').forEach((errorElement) => {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        });

        document.querySelectorAll('.form-input').forEach((inputElement) => {
            inputElement.style.borderColor = '#F0E8F5';
        });
    },

    convertDateFormat(dateString) {
        const [day, month, year] = dateString.split('/');

        return `${year}-${month}-${day}`;
    },

    getUserId() {
        return (
            localStorage.getItem('userId') ||
            sessionStorage.getItem('userId')
        );
    },

    async handleSubmit(event) {
        event.preventDefault();

        const name = document.getElementById('childName')?.value.trim();
        const birthday = document.getElementById('birthday')?.value;

        const selectedColor = document.querySelector(
            'input[name="color"]:checked'
        );

        const selectedAvatar = document.querySelector(
            '.avatar-btn.selected'
        );

        ChildForm.clearErrors();

        const errors = ChildForm.validateForm(name, birthday);

        if (errors.name) {
            ChildForm.showError('childName', errors.name);
        }

        if (errors.birthday) {
            ChildForm.showError('birthday', errors.birthday);
        }

        if (Object.keys(errors).length > 0) {
            return;
        }

        const userId = ChildForm.getUserId();

        if (!userId) {
            alert('⚠️ Please log in first');
            window.location.href = 'login.html';
            return;
        }

        const color = selectedColor?.value || 'blue';
        const avatar = selectedAvatar?.textContent || '🌙';

        const formattedDate = ChildForm.convertDateFormat(birthday);

        const submitButton = document.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '⏳ Adding...';
        }

        try {
            const response = await fetch(`${API_URL}/api/children`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parent_id: userId,
                    name,
                    date_of_birth: formattedDate,
                    avatar,
                    color
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Unable to add child');
            }

            alert(`✅ ${name} has been added successfully!`);

            document.getElementById('childForm')?.reset();

            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error adding child:', error);

            alert(`❌ Error: ${error.message}`);

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = '✅ Add Child';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ChildForm.init();

    document.querySelectorAll('.lang-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach((langButton) => {
                langButton.classList.remove('active');
            });

            button.classList.add('active');
        });
    });

    const userCard = document.querySelector('.user-card');

    if (userCard) {
        userCard.addEventListener('click', () => {
            alert('Opening profile settings...');
        });
    }
});