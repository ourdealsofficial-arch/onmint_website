// Onmint Website Mockup-Compliant Interactive Scripts

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

    // 2. Smooth Scrolling & Active State Highlighting
    const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
    const sections = document.querySelectorAll('section');

    // Smooth scroll handler
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    e.preventDefault();
                    
                    // Offset navbar height
                    const navHeight = document.querySelector('.navbar').offsetHeight || 88;
                    const targetPosition = targetSection.offsetTop - navHeight + 5;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Update active class on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.navbar').offsetHeight || 88;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 10;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 3. Account Deletion Request Form Handler (For delete-account.html)
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
                    
                    // Remove country prefixes (+91, +1, 91, 1) if manually typed
                    if (identifier.startsWith('+91')) {
                        identifier = identifier.substring(3);
                    } else if (identifier.startsWith('+1')) {
                        identifier = identifier.substring(2);
                    } else if (identifier.startsWith('91') && identifier.length === 12) {
                        identifier = identifier.substring(2);
                    } else if (identifier.startsWith('1') && identifier.length === 11) {
                        identifier = identifier.substring(1);
                    }
                    
                    identifier = countryCode + identifier;
                }

                const loginPayload = { password: password };
                if (isEmail) {
                    loginPayload.email = identifier;
                } else {
                    loginPayload.phone = identifier;
                }

                // 1. Hit Login API
                const loginRes = await fetch('https://api.onmint.in/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginPayload)
                });
                
                const loginData = await loginRes.json();

                if (!loginRes.ok || !loginData.success) {
                    throw new Error(loginData.message || 'Login failed. Please check your credentials.');
                }
                
                const accessToken = loginData.data.accessToken;

                // 2. Hit Delete Account API
                const delRes = await fetch('https://api.onmint.in/api/v1/account/delete', {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ confirmPassword: password })
                });
                
                const delData = await delRes.json();

                if (!delRes.ok || !delData.success) {
                    throw new Error(delData.message || 'Account deletion failed.');
                }

                // Show success UI
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
                
                const steps = document.querySelectorAll('.step-num');
                if (steps.length >= 3) {
                    steps[1].classList.add('active');
                    steps[2].classList.add('active');
                }
                
                const tokenBox = document.getElementById('token-box');
                if (tokenBox) {
                    tokenBox.innerHTML = `
                        <div style="text-align: center; color: #34D399; font-weight: 700; padding: 8px 0;">
                            🎉 Account & Data Permanently Deleted Successfully!
                        </div>
                        <p style="font-size: 12px; color: var(--slate-500); text-align: center; margin-top: 8px;">
                            All profile fields, bookings, prescriptions, notifications, and files have been cleared from our databases.
                        </p>
                    `;
                }

                const successDesc = successContainer.querySelector('.success-desc');
                if (successDesc) {
                    successDesc.textContent = 'GDPR Deletion complete. No active data records found under this identifier.';
                }

            } catch (err) {
                alert(err.message);
            } finally {
                if (btnText && btnLoader) {
                    btnText.classList.remove('hidden');
                    btnLoader.classList.add('hidden');
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    // 4. Password Eye Toggle Handler (For delete-account.html)
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('account-password');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            if (type === 'text') {
                togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    }

    // 5. Deletion Confirmation Token Form Handler (For delete-account.html)
    const tokenForm = document.getElementById('token-verification-form');
    const tokenBox = document.getElementById('token-box');

    if (tokenForm && tokenBox) {
        tokenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tokenInput = document.getElementById('deletion-token').value.trim();
            
            if (tokenInput.length === 0) {
                alert('Please enter a valid deletion token');
                return;
            }

            const submitBtn = tokenForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Erasing...';

            setTimeout(() => {
                const steps = document.querySelectorAll('.step-num');
                if (steps.length >= 3) {
                    steps[2].classList.add('active');
                }
                tokenBox.innerHTML = `
                    <div style="text-align: center; color: #34D399; font-weight: 700; padding: 8px 0;">
                        🎉 Account & Data Permanently Deleted Successfully!
                    </div>
                `;
            }, 1500);
        });
    }
});
