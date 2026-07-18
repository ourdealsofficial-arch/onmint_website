// Onmint Website Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Drawer Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
            mobileToggle.classList.toggle('active');
            
            // Animate burger to cross
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close drawer when a link is clicked
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                mobileToggle.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 2. Account Deletion Request Form Handler
    const deletionForm = document.getElementById('deletion-request-form');
    const formContainer = document.getElementById('form-container');
    const successContainer = document.getElementById('success-container');
    const btnSubmit = document.getElementById('btn-submit-deletion');

    if (deletionForm && formContainer && successContainer) {
        deletionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show loading animation on button
            const btnText = btnSubmit.querySelector('.btn-text');
            const btnLoader = btnSubmit.querySelector('.btn-loader');
            
            if (btnText && btnLoader) {
                btnText.classList.add('hidden');
                btnLoader.classList.remove('hidden');
                btnSubmit.disabled = true;
            }

            // Simulate API request (2-step deletion process)
            setTimeout(() => {
                // Reset button state
                if (btnText && btnLoader) {
                    btnText.classList.remove('hidden');
                    btnLoader.classList.add('hidden');
                    btnSubmit.disabled = false;
                }

                // Transition to success/verification token view
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
                
                // Track request identifier
                const identifier = document.getElementById('account-identifier').value;
                const successDesc = successContainer.querySelector('.success-desc');
                if (successDesc && identifier) {
                    successDesc.innerHTML = `We have sent a 24-hour verification token to <strong>${identifier}</strong>. Please enter the token below to confirm deletion.`;
                }
            }, 1800);
        });
    }

    // 3. Deletion Confirmation Token Form Handler
    const tokenForm = document.getElementById('token-verification-form');
    const tokenBox = document.getElementById('token-box');
    const stepTwoBadge = document.getElementById('step-two-badge');

    if (tokenForm && tokenBox) {
        tokenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tokenInput = document.getElementById('deletion-token').value.trim();
            
            if (tokenInput.length === 0) {
                alert('Please enter a valid deletion token');
                return;
            }

            // Simulate immediate database cleanup on server
            const submitBtn = tokenForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Erasing...';

            setTimeout(() => {
                // Update Step indicators to Step 3 Complete
                const steps = document.querySelectorAll('.step-num');
                if (steps.length >= 3) {
                    steps[2].classList.add('active');
                }

                // Hide token box and display completion message
                tokenBox.innerHTML = `
                    <div style="text-align: center; color: var(--success); font-weight: 700; padding: 8px 0;">
                        🎉 Account & Data Permanently Deleted Successfully!
                    </div>
                    <p style="font-size: 12px; color: var(--slate-600); text-align: center; margin-top: 8px;">
                        All profile fields, bookings, prescriptions, notifications, and S3 files have been cleared from our databases. An audit logs report has been logged.
                    </p>
                `;
                
                const successDesc = successContainer.querySelector('.success-desc');
                if (successDesc) {
                    successDesc.textContent = 'GDPR Deletion complete. No active data records found under this identifier.';
                }
            }, 1500);
        });
    }

    // 4. Dark/Light Theme Switcher with Persistence
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('onmint-theme') || 'light';

    // Apply the saved theme on load
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            
            if (activeTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('onmint-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('onmint-theme', 'dark');
            }
        });
    }
});
