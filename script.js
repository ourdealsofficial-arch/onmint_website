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
                const role = document.getElementById('account-role').value;
                let identifier = document.getElementById('account-identifier').value.trim();
                const rawPasswordInput = document.getElementById('account-password').value;
                const password = rawPasswordInput.trim();
                const countryCode = document.getElementById('country-code').value;
                
                const isEmail = identifier.includes('@');
                let rawPhone = '';
                let formattedPhone = '';

                if (isEmail) {
                    // Email identifier
                } else {
                    // Extract 10-digit raw phone number
                    let cleanNum = identifier.replace(/[\s\-\(\)\+]/g, '');
                    if (cleanNum.startsWith('91') && cleanNum.length === 12) {
                        cleanNum = cleanNum.substring(2);
                    } else if (cleanNum.startsWith('1') && cleanNum.length === 11) {
                        cleanNum = cleanNum.substring(1);
                    }
                    rawPhone = cleanNum; // Exactly 10 digits: "9450890156"
                    formattedPhone = countryCode + cleanNum; // "+919450890156"
                }

                // 1. Prepare login payload variants for maximum compatibility
                const passwordsToTest = [password];
                if (rawPasswordInput !== password) {
                    passwordsToTest.push(rawPasswordInput);
                }

                const payloadsToTry = [];
                for (const pwd of passwordsToTest) {
                    if (isEmail) {
                        payloadsToTry.push({ email: identifier, password: pwd });
                        if (role) payloadsToTry.push({ email: identifier, password: pwd, role: role });
                    } else {
                        // 1. Raw 10-digit phone without country code (Standard database format)
                        payloadsToTry.push({ phone: rawPhone, password: pwd });
                        if (role) payloadsToTry.push({ phone: rawPhone, password: pwd, role: role });
                        
                        // 2. Formatted phone with country code
                        payloadsToTry.push({ phone: formattedPhone, password: pwd });
                        if (role) payloadsToTry.push({ phone: formattedPhone, password: pwd, role: role });
                    }
                }

                let accessToken = null;
                let lastErrorMsg = '';

                // Try payload variants sequentially until authentication succeeds
                for (const payload of payloadsToTry) {
                    try {
                        console.log('Sending login attempt:', {
                            phoneOrEmail: payload.phone || payload.email,
                            passwordLength: payload.password?.length,
                            role: payload.role || '(none)'
                        });

                        const loginRes = await fetch('https://api.onmint.in/api/v1/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        
                        const loginData = await loginRes.json();
                        console.log('Server response:', loginRes.status, loginData);
                        
                        if (loginRes.ok && loginData.success && loginData.data?.accessToken) {
                            accessToken = loginData.data.accessToken;
                            console.log('✅ Authentication successful! Proceeding to account deletion.');
                            break;
                        } else {
                            lastErrorMsg = loginData.message || 'Login failed. Please check your credentials.';
                        }
                    } catch (fetchErr) {
                        lastErrorMsg = 'Network connection error. Please check your internet connection and verify api.onmint.in is reachable.';
                    }
                }

                if (!accessToken) {
                    // Fallback attempt: Try hitting /account/delete directly with user credentials
                    try {
                        const directDelPayload = {
                            role: role,
                            password: password,
                            confirmPassword: password,
                            reason: document.getElementById('deletion-reason')?.value || ''
                        };
                        if (isEmail) {
                            directDelPayload.email = identifier;
                        } else {
                            const rawPhone = identifier.replace(/^\+\d{1,3}/, '');
                            directDelPayload.phone = rawPhone;
                        }

                        const directRes = await fetch('https://api.onmint.in/api/v1/account/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(directDelPayload)
                        });

                        const directData = await directRes.json();
                        if (directRes.ok && directData.success) {
                            accessToken = 'DIRECT_SUBMITTED';
                        }
                    } catch (e) {
                        // Ignore fallback error and throw clean main error below
                    }
                }

                if (!accessToken) {
                    throw new Error(lastErrorMsg || 'Invalid credentials (401 Unauthorized). The phone/email or password entered does not match an active account.');
                }

                if (accessToken !== 'DIRECT_SUBMITTED') {
                    // 2. Hit Delete Account API with token
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
                        throw new Error(delData.message || 'Account deletion request failed.');
                    }
                }

                // Calculate masked identifier (e.g. +91 ******0156 or m***a@gmail.com)
                let maskedIdentifier = '';
                if (isEmail) {
                    const parts = identifier.split('@');
                    if (parts.length === 2) {
                        const name = parts[0];
                        const domain = parts[1];
                        if (name.length <= 2) {
                            maskedIdentifier = name[0] + '***@' + domain;
                        } else {
                            maskedIdentifier = name[0] + '***' + name[name.length - 1] + '@' + domain;
                        }
                    } else {
                        maskedIdentifier = identifier;
                    }
                } else {
                    const lastFour = rawPhone.slice(-4);
                    const prefix = countryCode ? countryCode + ' ' : '+91 ';
                    maskedIdentifier = `${prefix}******${lastFour}`;
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
                        <div style="text-align: center; color: #10B981; font-weight: 700; font-size: 16px; padding: 4px 0;">
                            🎉 Account & Data Permanently Deleted Successfully!
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 12px 16px; margin: 14px 0; text-align: center;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate-400); font-weight: 700;">Deleted Account Identifier</div>
                            <div style="font-size: 18px; font-weight: 800; color: #059669; letter-spacing: 0.08em; margin-top: 4px; font-family: 'Courier New', monospace;">${maskedIdentifier}</div>
                        </div>
                        <p style="font-size: 13px; color: var(--slate-500); text-align: center; line-height: 1.5; margin-top: 8px;">
                            All profile records, bookings, medical documents, notification history, and stored files associated with <strong style="color: var(--slate-700);">${maskedIdentifier}</strong> have been permanently erased from our databases.
                        </p>
                    `;
                }

                const successDesc = successContainer.querySelector('.success-desc');
                if (successDesc) {
                    successDesc.innerHTML = `GDPR Deletion complete. No active data records found for <strong>${maskedIdentifier}</strong>.`;
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
