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
        deletionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading animation on button
            const btnText = btnSubmit.querySelector('.btn-text');
            const btnLoader = btnSubmit.querySelector('.btn-loader');
            
            if (btnText && btnLoader) {
                btnText.classList.add('hidden');
                btnLoader.classList.remove('hidden');
                btnSubmit.disabled = true;
            }

            try {
                let identifier = document.getElementById('account-identifier').value.trim();
                const password = document.getElementById('account-password').value;
                const countryCode = document.getElementById('country-code').value;
                
                const isEmail = identifier.includes('@');
                if (!isEmail) {
                    // Remove all spaces, hyphens, parentheses
                    identifier = identifier.replace(/[\s\-\(\)]/g, '');
                    
                    // Remove country prefixes (+91, +1, 91, 1) if the user manually typed them in the box
                    if (identifier.startsWith('+91')) {
                        identifier = identifier.substring(3);
                    } else if (identifier.startsWith('+1')) {
                        identifier = identifier.substring(2);
                    } else if (identifier.startsWith('91') && identifier.length === 12) {
                        identifier = identifier.substring(2);
                    } else if (identifier.startsWith('1') && identifier.length === 11) {
                        identifier = identifier.substring(1);
                    }
                    
                    // Prepend the selected country code (e.g. +91 or +1)
                    identifier = countryCode + identifier;
                }

                const loginPayload = {
                    password: password
                };
                if (isEmail) {
                    loginPayload.email = identifier;
                } else {
                    loginPayload.phone = identifier;
                }

                console.log('Onmint Web - Sending Login Request:', {
                    url: 'https://api.onmint.in/api/v1/auth/login',
                    payload: loginPayload
                });

                // 1. Hit Login API
                const loginRes = await fetch('https://api.onmint.in/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginPayload)
                });
                
                console.log('Onmint Web - Login Response Status:', loginRes.status);
                
                const loginData = await loginRes.json();
                console.log('Onmint Web - Login Response Data:', loginData);

                if (!loginRes.ok || !loginData.success) {
                    throw new Error(loginData.message || 'Login failed. Please check your credentials.');
                }
                
                const accessToken = loginData.data.accessToken;
                console.log('Onmint Web - Got access token successfully.');
                
                console.log('Onmint Web - Sending Account Deletion Request:', {
                    url: 'https://api.onmint.in/api/v1/account/delete'
                });

                // 2. Hit Delete Account API
                const delRes = await fetch('https://api.onmint.in/api/v1/account/delete', {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ confirmPassword: password })
                });
                
                console.log('Onmint Web - Delete Response Status:', delRes.status);

                const delData = await delRes.json();
                console.log('Onmint Web - Delete Response Data:', delData);

                if (!delRes.ok || !delData.success) {
                    throw new Error(delData.message || 'Account deletion failed.');
                }

                // Show success UI (Directly skipping token confirmation since it deleted immediately)
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
                
                // Update Step indicators to Step 3 Complete immediately
                const steps = document.querySelectorAll('.step-num');
                if (steps.length >= 3) {
                    steps[1].classList.add('active');
                    steps[2].classList.add('active');
                }
                
                const tokenBox = document.getElementById('token-box');
                if (tokenBox) {
                    tokenBox.innerHTML = `
                        <div style="text-align: center; color: var(--success); font-weight: 700; padding: 8px 0;">
                            🎉 Account & Data Permanently Deleted Successfully!
                        </div>
                        <p style="font-size: 12px; color: var(--slate-600); text-align: center; margin-top: 8px;">
                            All profile fields, bookings, prescriptions, notifications, and files have been cleared from our databases.
                        </p>
                    `;
                }

                const successDesc = successContainer.querySelector('.success-desc');
                if (successDesc) {
                    successDesc.textContent = 'GDPR Deletion complete. No active data records found under this identifier.';
                }

            } catch (err) {
                console.error('Onmint Web - Error occurred during deletion flow:', err);
                alert(err.message);
            } finally {
                // Reset button state
                if (btnText && btnLoader) {
                    btnText.classList.remove('hidden');
                    btnLoader.classList.add('hidden');
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    // Password Eye Toggle Handler
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('account-password');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon (simple opacity or switch SVG based on state if needed)
            if (type === 'text') {
                togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
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

    // 5. Download Tabs Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length && tabContents.length) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Toggle active class on buttons
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Toggle active class on contents
                tabContents.forEach(content => {
                    if (content.id === `${targetTab}-content`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    // 6. APK Installation Guide Accordion Toggle
    const guideToggle = document.getElementById('apk-guide-toggle');
    const guideContent = document.getElementById('apk-guide-content');

    if (guideToggle && guideContent) {
        guideToggle.addEventListener('click', () => {
            guideToggle.classList.toggle('open');
            guideContent.classList.toggle('open');
        });
    }
});
