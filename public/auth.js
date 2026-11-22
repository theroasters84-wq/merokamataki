import { getToken, safeJson, apiLogin, apiRegister, apiForgotPassword, apiResetPassword, apiSetPin, apiVerifyPin, apiForgotPin, apiResetPinWithPassword, apiCheckToken } from './api.js';
import { showToast } from './utils.js';

export function initAuth({ onAuthSuccess }) {
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const secretTapTitle = document.getElementById('secretTapTitle');

    const loginFormArea = document.getElementById('loginFormArea');
    const registerFormArea = document.getElementById('registerFormArea');
    const forgotPasswordFormArea = document.getElementById('forgotPasswordFormArea');
    const resetPasswordFormArea = document.getElementById('resetPasswordFormArea');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showForgotPasswordBtn = document.getElementById('showForgotPasswordBtn');
    const backToLoginFromForgotBtn = document.getElementById('backToLoginFromForgotBtn');
    const backToLoginFromResetBtn = document.getElementById('backToLoginFromResetBtn');
    const authSubtitle = document.getElementById('authSubtitle');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    const registerPasswordMismatchMsg = document.getElementById('registerPasswordMismatchMsg');
    const registerAcceptTerms = document.getElementById('registerAcceptTerms');
    const registerTermsErrorMsg = document.getElementById('registerTermsErrorMsg');
    const registerStoreName = document.getElementById('registerStoreName');
    const registerBtn = document.getElementById('registerBtn');

    const forgotPasswordEmail = document.getElementById('forgotPasswordEmail');
    const forgotPasswordFeedback = document.getElementById('forgotPasswordFeedback');
    const forgotPasswordSubmitBtn = document.getElementById('forgotPasswordSubmitBtn');

    const resetNewPassword = document.getElementById('resetNewPassword');
    const resetConfirmPassword = document.getElementById('resetConfirmPassword');
    const resetPasswordMismatchMsg = document.getElementById('resetPasswordMismatchMsg');
    const resetPasswordFeedback = document.getElementById('resetPasswordFeedback');
    const resetPasswordSubmitBtn = document.getElementById('resetPasswordSubmitBtn');

    const setPinModal = document.getElementById('setPinModal');
    const newPinInput = document.getElementById('newPinInput');
    const saveSetPinBtn = document.getElementById('saveSetPinBtn');

    const verifyPinModal = document.getElementById('verifyPinModal');
    const verifyPinModalTitle = document.getElementById('verifyPinModalTitle');
    const verifyPinEntryArea = document.getElementById('verifyPinEntryArea');
    const recoverPinArea = document.getElementById('recoverPinArea');
    const verifyPinInput = document.getElementById('verifyPinInput');
    const verifyPinBtn = document.getElementById('verifyPinBtn');
    const closeVerifyPinBtn = document.getElementById('closeVerifyPinBtn');
    const forgotPinBtn = document.getElementById('forgotPinBtn');
    const recoverPinAccountPassword = document.getElementById('recoverPinAccountPassword');
    const recoverPinNewPinInput = document.getElementById('recoverPinNewPinInput');
    const recoverPinConfirmPinInput = document.getElementById('recoverPinConfirmPinInput');
    const recoverPinEmailBadge = document.getElementById('recoverPinEmailBadge');
    const recoverPinFeedback = document.getElementById('recoverPinFeedback');
    const resetPinWithPasswordBtn = document.getElementById('resetPinWithPasswordBtn');
    const sendPinResetEmailBtn = document.getElementById('sendPinResetEmailBtn');
    const backToVerifyPinBtn = document.getElementById('backToVerifyPinBtn');

    let sessionCheckInterval = null;

    const enableAdminMode = () => {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.classList.remove('hidden'));

        const tabDashboardEl = document.getElementById('tabDashboard');
        if (tabDashboardEl) {
            tabDashboardEl.textContent = '📅 Ημερολόγιο & Στατιστικά';
        }

        let exitAdminBtn = document.getElementById('exitAdminBtn');
        if (!exitAdminBtn) {
            exitAdminBtn = document.createElement('button');
            exitAdminBtn.id = 'exitAdminBtn';
            exitAdminBtn.innerHTML = '🔒 Έξοδος Admin';
            exitAdminBtn.className = 'bg-red-600 text-white min-h-[38px] sm:min-h-[40px] px-3 py-1.5 md:px-4 md:py-2 inline-flex items-center justify-center rounded-xl shadow-sm font-bold hover:bg-red-700 transition-colors cursor-pointer text-xs md:text-sm mr-2';
            
            if (logoutBtn && logoutBtn.parentNode) {
                logoutBtn.parentNode.insertBefore(exitAdminBtn, logoutBtn);
            } else {
                document.body.appendChild(exitAdminBtn);
            }

            exitAdminBtn.addEventListener('click', () => {
                localStorage.removeItem('isAdmin');
                disableAdminMode();
                window.location.reload();
            });
        }
        exitAdminBtn.classList.remove('hidden');
    };

    const disableAdminMode = () => {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.classList.add('hidden'));
        const tabDashboardEl = document.getElementById('tabDashboard');
        if (tabDashboardEl) {
            tabDashboardEl.textContent = '📅 Ημερολόγιο Βαρδιών';
        }
        const exitAdminBtn = document.getElementById('exitAdminBtn');
        if (exitAdminBtn) exitAdminBtn.classList.add('hidden');
    };

    // Ανάκτηση resetToken από Query String (?resetToken=... ή ?token=...) ή Hash (#reset-password?token=...)
    const extractResetTokenFromUrl = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const fromSearch = searchParams.get('resetToken') || searchParams.get('token');
        if (fromSearch) return fromSearch.trim();

        const hash = window.location.hash || '';
        if (hash.includes('reset-password')) {
            const qIndex = hash.indexOf('?');
            if (qIndex !== -1) {
                const hashParams = new URLSearchParams(hash.substring(qIndex + 1));
                const fromHash = hashParams.get('token') || hashParams.get('resetToken');
                if (fromHash) return fromHash.trim();
            }
        }
        return null;
    };

    const showAuthPanel = (panelName) => {
        [loginFormArea, registerFormArea, forgotPasswordFormArea, resetPasswordFormArea].forEach(form => {
            if (form) form.classList.add('hidden');
        });

        if (panelName === 'register' && registerFormArea) {
            registerFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Δημιουργήστε λογαριασμό για το νέο σας κατάστημα';
        } else if (panelName === 'forgot' && forgotPasswordFormArea) {
            forgotPasswordFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Εισάγετε το email σας για ανάκτηση κωδικού';
            if (forgotPasswordFeedback) forgotPasswordFeedback.classList.add('hidden');
            if (forgotPasswordEmail && loginEmail && loginEmail.value.trim() && !forgotPasswordEmail.value) {
                forgotPasswordEmail.value = loginEmail.value.trim();
            }
        } else if (panelName === 'reset' && resetPasswordFormArea) {
            resetPasswordFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Ορίστε τον νέο σας κωδικό πρόσβασης';
            if (resetPasswordFeedback) resetPasswordFeedback.classList.add('hidden');
        } else if (loginFormArea) {
            loginFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Συνδεθείτε για να διαχειριστείτε το κατάστημά σας';
        }
    };

    const checkAuth = () => {
        const urlResetToken = extractResetTokenFromUrl();
        if (urlResetToken) {
            loginContainer.classList.remove('hidden');
            loginContainer.style.display = 'flex';
            appContainer.classList.add('hidden');
            appContainer.style.display = 'none';
            disableAdminMode();
            stopSessionCheck();
            showAuthPanel('reset');
            return;
        }

        const token = getToken();
        if (token) {
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Έλεγχος αν ο ιδιοκτήτης δεν έχει ορίσει PIN ακόμα
            if (localStorage.getItem('hasPin') === 'false') {
                if (setPinModal) setPinModal.classList.remove('hidden');
            }

            if (localStorage.getItem('isAdmin') === 'true') {
                enableAdminMode();
            } else {
                disableAdminMode();
            }

            if (onAuthSuccess) onAuthSuccess();
            startSessionCheck(); // Έναρξη περιοδικού ελέγχου
        } else {
            loginContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            disableAdminMode();
            stopSessionCheck(); // Σταμάτημα ελέγχου αν δεν υπάρχει token
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            if (!email || !password) return showToast('Συμπληρώστε email και κωδικό.', 'warning');

            try {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Σύνδεση...';

                const res = await apiLogin(email, password);
                const data = await safeJson(res);
                if (res.ok && data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('hasPin', data.hasPin);
                    if (data.email) localStorage.setItem('userEmail', data.email);
                    loginEmail.value = '';
                    loginPassword.value = '';
                    window.location.reload(); // Προχωράει στο Dashboard με καθαρό DOM
                } else {
                    showToast(data.error || 'Λάθος στοιχεία.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Αδυναμία σύνδεσης με τον server.', 'error');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Είσοδος';
            }
        });
    }

    if (showRegisterBtn && showLoginBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthPanel('register');
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthPanel('login');
        });
    }

    if (showForgotPasswordBtn) {
        showForgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthPanel('forgot');
            if (forgotPasswordEmail) forgotPasswordEmail.focus();
        });
    }

    const clearResetTokenFromUrl = () => {
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    };

    if (backToLoginFromForgotBtn) {
        backToLoginFromForgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthPanel('login');
        });
    }

    if (backToLoginFromResetBtn) {
        backToLoginFromResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearResetTokenFromUrl();
            showAuthPanel('login');
        });
    }

    let isForgotPasswordSubmitting = false;

    const handleForgotPasswordSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isForgotPasswordSubmitting) return;

        const email = forgotPasswordEmail ? forgotPasswordEmail.value.trim() : '';
        if (!email) {
            if (forgotPasswordEmail) forgotPasswordEmail.focus();
            return showToast('Παρακαλώ εισάγετε το email του λογαριασμού σας.', 'warning');
        }

        isForgotPasswordSubmitting = true;
        try {
            if (forgotPasswordSubmitBtn) {
                forgotPasswordSubmitBtn.disabled = true;
                forgotPasswordSubmitBtn.textContent = 'Αποστολή...';
            }

            const res = await apiForgotPassword(email);
            const data = await safeJson(res);

            if (forgotPasswordFeedback) {
                forgotPasswordFeedback.classList.remove('hidden');
                if (res.ok) {
                    forgotPasswordFeedback.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-medium border bg-emerald-50 text-emerald-800 border-emerald-200';
                    forgotPasswordFeedback.textContent = data.message || 'Εάν το email είναι καταχωρημένο, σας στείλαμε σύνδεσμο επαναφοράς.';
                } else {
                    forgotPasswordFeedback.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-medium border bg-rose-50 text-rose-800 border-rose-200';
                    forgotPasswordFeedback.textContent = data.error || 'Σφάλμα κατά την αποστολή email.';
                }
            }

            if (res.ok) {
                showToast('Ελέγξτε τα εισερχόμενα του email σας για τον σύνδεσμο επαναφοράς.', 'success');
            } else {
                showToast(data.error || 'Σφάλμα κατά την αποστολή email.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Αδυναμία σύνδεσης με τον server.', 'error');
        } finally {
            isForgotPasswordSubmitting = false;
            if (forgotPasswordSubmitBtn) {
                forgotPasswordSubmitBtn.disabled = false;
                forgotPasswordSubmitBtn.textContent = 'Αποστολή Συνδέσμου Ανάκτησης';
            }
        }
    };

    if (forgotPasswordSubmitBtn) {
        forgotPasswordSubmitBtn.addEventListener('click', handleForgotPasswordSubmit);
    }

    if (forgotPasswordFormArea) {
        forgotPasswordFormArea.addEventListener('submit', handleForgotPasswordSubmit);
    }

    if (forgotPasswordEmail) {
        forgotPasswordEmail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleForgotPasswordSubmit(e);
            }
        });
    }

    const setResetPasswordMismatchError = (hasMismatch) => {
        if (resetPasswordMismatchMsg) {
            if (hasMismatch) resetPasswordMismatchMsg.classList.remove('hidden');
            else resetPasswordMismatchMsg.classList.add('hidden');
        }
        if (resetConfirmPassword) {
            if (hasMismatch) {
                resetConfirmPassword.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                resetConfirmPassword.classList.remove('border-slate-300', 'focus:border-primary', 'focus:ring-primary/20');
            } else {
                resetConfirmPassword.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                resetConfirmPassword.classList.add('border-slate-300', 'focus:border-primary', 'focus:ring-primary/20');
            }
        }
    };

    if (resetNewPassword && resetConfirmPassword) {
        const checkLiveResetMatch = () => {
            if (!resetConfirmPassword.value) {
                setResetPasswordMismatchError(false);
                return;
            }
            setResetPasswordMismatchError(resetNewPassword.value !== resetConfirmPassword.value);
        };
        resetNewPassword.addEventListener('input', checkLiveResetMatch);
        resetConfirmPassword.addEventListener('input', checkLiveResetMatch);
    }

    if (resetPasswordSubmitBtn) {
        resetPasswordSubmitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const resetToken = extractResetTokenFromUrl();
            const newPassword = resetNewPassword ? resetNewPassword.value : '';
            const confirmPassword = resetConfirmPassword ? resetConfirmPassword.value : '';

            if (!resetToken) {
                return showToast('Ο σύνδεσμος επαναφοράς είναι ελλιπής (λείπει το token).', 'error');
            }
            if (!newPassword || newPassword.length < 6) {
                if (resetNewPassword) resetNewPassword.focus();
                return showToast('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.', 'warning');
            }
            if (newPassword !== confirmPassword) {
                setResetPasswordMismatchError(true);
                if (resetConfirmPassword) resetConfirmPassword.focus();
                return showToast('Οι κωδικοί πρόσβασης δεν ταιριάζουν.', 'error');
            }
            setResetPasswordMismatchError(false);

            try {
                resetPasswordSubmitBtn.disabled = true;
                resetPasswordSubmitBtn.textContent = 'Αποθήκευση...';

                const res = await apiResetPassword(resetToken, newPassword);
                const data = await safeJson(res);

                if (res.ok) {
                    showToast(data.message || 'Ο κωδικός σας ενημερώθηκε επιτυχώς!', 'success');
                    if (resetNewPassword) resetNewPassword.value = '';
                    if (resetConfirmPassword) resetConfirmPassword.value = '';
                    clearResetTokenFromUrl();
                    showAuthPanel('login');
                } else {
                    if (resetPasswordFeedback) {
                        resetPasswordFeedback.classList.remove('hidden');
                        resetPasswordFeedback.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-medium border bg-rose-50 text-rose-800 border-rose-200';
                        resetPasswordFeedback.textContent = data.error || 'Ο σύνδεσμος επαναφοράς δεν είναι έγκυρος ή έχει λήξει.';
                    }
                    showToast(data.error || 'Σφάλμα κατά την επαναφορά κωδικού.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Αδυναμία σύνδεσης με τον server.', 'error');
            } finally {
                resetPasswordSubmitBtn.disabled = false;
                resetPasswordSubmitBtn.textContent = 'Αποθήκευση Νέου Κωδικού';
            }
        });
    }

    const setPasswordMismatchError = (hasMismatch) => {
        if (registerPasswordMismatchMsg) {
            if (hasMismatch) registerPasswordMismatchMsg.classList.remove('hidden');
            else registerPasswordMismatchMsg.classList.add('hidden');
        }
        if (registerConfirmPassword) {
            if (hasMismatch) {
                registerConfirmPassword.classList.add('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                registerConfirmPassword.classList.remove('border-slate-300', 'focus:border-primary', 'focus:ring-primary/20');
            } else {
                registerConfirmPassword.classList.remove('border-rose-400', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                registerConfirmPassword.classList.add('border-slate-300', 'focus:border-primary', 'focus:ring-primary/20');
            }
        }
    };

    if (registerPassword && registerConfirmPassword) {
        const checkLivePasswordMatch = () => {
            if (!registerConfirmPassword.value) {
                setPasswordMismatchError(false);
                return;
            }
            setPasswordMismatchError(registerPassword.value !== registerConfirmPassword.value);
        };
        registerPassword.addEventListener('input', checkLivePasswordMatch);
        registerConfirmPassword.addEventListener('input', checkLivePasswordMatch);
    }

    const setRegisterTermsError = (hasError) => {
        if (registerTermsErrorMsg) {
            if (hasError) registerTermsErrorMsg.classList.remove('hidden');
            else registerTermsErrorMsg.classList.add('hidden');
        }
    };

    if (registerAcceptTerms) {
        registerAcceptTerms.addEventListener('change', () => {
            if (registerAcceptTerms.checked) {
                setRegisterTermsError(false);
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = registerEmail.value.trim();
            const password = registerPassword.value;
            const confirmPassword = registerConfirmPassword ? registerConfirmPassword.value : password;
            const storeName = registerStoreName.value.trim();

            if (!email || !password) return showToast('Συμπληρώστε email και κωδικό.', 'warning');
            if (registerConfirmPassword && !confirmPassword) {
                setPasswordMismatchError(true);
                registerConfirmPassword.focus();
                return showToast('Παρακαλώ επιβεβαιώστε τον κωδικό πρόσβασης.', 'warning');
            }
            if (password !== confirmPassword) {
                setPasswordMismatchError(true);
                if (registerConfirmPassword) registerConfirmPassword.focus();
                return showToast('Οι κωδικοί πρόσβασης δεν ταιριάζουν. Παρακαλώ ελέγξτε την επιβεβαίωση κωδικού.', 'error');
            }
            setPasswordMismatchError(false);

            if (registerAcceptTerms && !registerAcceptTerms.checked) {
                setRegisterTermsError(true);
                registerAcceptTerms.focus();
                return showToast('Πρέπει να αποδεχτείτε τους Όρους Χρήσης και την Πολιτική Απορρήτου για να εγγραφείτε.', 'warning');
            }
            setRegisterTermsError(false);

            try {
                registerBtn.disabled = true;
                registerBtn.textContent = 'Δημιουργία...';

                const termsAccepted = registerAcceptTerms ? registerAcceptTerms.checked : true;
                const res = await apiRegister(email, password, storeName, termsAccepted);
                const data = await safeJson(res);
                
                if (res.ok) {
                    const loginRes = await apiLogin(email, password);
                    const loginData = await safeJson(loginRes);
                    
                    if (loginRes.ok && loginData.token) {
                        localStorage.setItem('token', loginData.token);
                        localStorage.setItem('hasPin', loginData.hasPin);
                        if (loginData.email) localStorage.setItem('userEmail', loginData.email);
                        registerEmail.value = '';
                        registerPassword.value = '';
                        if (registerConfirmPassword) registerConfirmPassword.value = '';
                        if (registerAcceptTerms) registerAcceptTerms.checked = false;
                        registerStoreName.value = '';
                        window.location.reload(); 
                    } else {
                        showToast('Η εγγραφή πέτυχε, αλλά απέτυχε η αυτόματη σύνδεση. Παρακαλώ συνδεθείτε χειροκίνητα.', 'warning');
                        showLoginBtn.click();
                        loginEmail.value = email; 
                    }
                } else {
                    showToast(data.error || 'Σφάλμα κατά την εγγραφή.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Αδυναμία σύνδεσης με τον server.', 'error');
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = 'Δημιουργία Λογαριασμού';
            }
        });
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userEmail');
        stopSessionCheck();
        window.location.reload(); // Επιστροφή στην οθόνη login
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // --- Secret Tap (Λειτουργία Υπαλλήλου) ---
    let tapCount = 0;
    let tapTimer = null;

    const showVerifyPinView = (view = 'entry') => {
        const isRecovery = view === 'recovery';
        if (verifyPinEntryArea) verifyPinEntryArea.classList.toggle('hidden', isRecovery);
        if (recoverPinArea) recoverPinArea.classList.toggle('hidden', !isRecovery);
        if (verifyPinModalTitle) {
            verifyPinModalTitle.textContent = isRecovery ? 'Επαναφορά PIN Ιδιοκτήτη' : 'Κρυφό Ξεκλείδωμα';
        }
        if (recoverPinEmailBadge) {
            const storedEmail = localStorage.getItem('userEmail');
            recoverPinEmailBadge.textContent = storedEmail ? ` (${storedEmail})` : '';
        }
        if (recoverPinFeedback) {
            recoverPinFeedback.classList.add('hidden');
            recoverPinFeedback.textContent = '';
        }
        if (isRecovery) {
            if (recoverPinAccountPassword) {
                recoverPinAccountPassword.value = '';
                recoverPinAccountPassword.focus();
            }
            if (recoverPinNewPinInput) recoverPinNewPinInput.value = '';
            if (recoverPinConfirmPinInput) recoverPinConfirmPinInput.value = '';
        } else if (verifyPinInput) {
            verifyPinInput.value = '';
            verifyPinInput.focus();
        }
    };

    const setRecoverPinFeedback = (message, type = 'error') => {
        if (!recoverPinFeedback) return;
        recoverPinFeedback.classList.remove('hidden');
        if (type === 'success') {
            recoverPinFeedback.className = 'p-3 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200';
        } else if (type === 'info') {
            recoverPinFeedback.className = 'p-3 rounded-xl text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200';
        } else {
            recoverPinFeedback.className = 'p-3 rounded-xl text-xs font-medium border bg-rose-50 text-rose-800 border-rose-200';
        }
        recoverPinFeedback.textContent = message;
    };

    if (secretTapTitle) {
        secretTapTitle.addEventListener('click', () => {
            tapCount++;
            clearTimeout(tapTimer);

            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 2000);

            if (tapCount >= 5) {
                tapCount = 0;
                clearTimeout(tapTimer);
                
                if (localStorage.getItem('hasPin') === 'true') {
                    if (verifyPinModal && verifyPinInput) {
                        verifyPinModal.classList.remove('hidden');
                        showVerifyPinView('entry');
                    }
                } else {
                    if (setPinModal) setPinModal.classList.remove('hidden');
                }
            }
        });
    }

    // --- Λογική PIN Modals ---
    if (saveSetPinBtn) {
        saveSetPinBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const pin = newPinInput.value.trim();
            if (!pin) return showToast('Παρακαλώ εισάγετε PIN.', 'warning');
            try {
                saveSetPinBtn.disabled = true;
                saveSetPinBtn.textContent = 'Αποθήκευση...';

                const res = await apiSetPin(pin);
                if (res.ok) {
                    localStorage.setItem('hasPin', 'true');
                    setPinModal.classList.add('hidden');
                    showToast('Το PIN αποθηκεύτηκε επιτυχώς!', 'success');
                } else {
                    const data = await safeJson(res);
                    showToast(data.error || 'Σφάλμα κατά την αποθήκευση PIN.', 'error');
                }
            } catch (err) {
                showToast('Σφάλμα επικοινωνίας με τον server.', 'error');
            } finally {
                saveSetPinBtn.disabled = false;
                saveSetPinBtn.textContent = 'Αποθήκευση PIN';
            }
        });
    }

    if (closeVerifyPinBtn) {
        closeVerifyPinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showVerifyPinView('entry');
            verifyPinModal.classList.add('hidden');
        });
    }

    if (verifyPinModal) {
        verifyPinModal.addEventListener('click', (e) => {
            if (e.target === verifyPinModal) {
                showVerifyPinView('entry');
                verifyPinModal.classList.add('hidden');
            }
        });
    }

    if (verifyPinBtn) {
        verifyPinBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const pin = verifyPinInput.value.trim();
            if (!pin) return showToast('Παρακαλώ εισάγετε το PIN.', 'warning');
            try {
                verifyPinBtn.disabled = true;
                verifyPinBtn.textContent = 'Έλεγχος...';

                const res = await apiVerifyPin(pin);
                const data = await safeJson(res);
                if (res.ok && data.success) {
                    verifyPinModal.classList.add('hidden');
                    localStorage.setItem('isAdmin', 'true');
                    enableAdminMode();
                    showToast('Καλώς ήρθατε στη λειτουργία Διαχειριστή!', 'success');
                } else {
                    showToast(data.error || 'Λάθος PIN. Η πρόσβαση απορρίφθηκε.', 'error');
                }
            } catch (err) {
                showToast('Σφάλμα επικοινωνίας με τον server.', 'error');
            } finally {
                verifyPinBtn.disabled = false;
                verifyPinBtn.textContent = 'Ξεκλείδωμα';
            }
        });
    }

    if (verifyPinInput) {
        verifyPinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && verifyPinBtn) {
                e.preventDefault();
                verifyPinBtn.click();
            }
        });
    }

    if (forgotPinBtn) {
        forgotPinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showVerifyPinView('recovery');
        });
    }

    if (backToVerifyPinBtn) {
        backToVerifyPinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showVerifyPinView('entry');
        });
    }

    if (resetPinWithPasswordBtn) {
        resetPinWithPasswordBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const accountPassword = recoverPinAccountPassword ? recoverPinAccountPassword.value : '';
            const newPin = recoverPinNewPinInput ? recoverPinNewPinInput.value.trim() : '';
            const confirmPin = recoverPinConfirmPinInput ? recoverPinConfirmPinInput.value.trim() : newPin;

            if (!accountPassword) {
                if (recoverPinAccountPassword) recoverPinAccountPassword.focus();
                setRecoverPinFeedback('Παρακαλώ εισάγετε τον κωδικό πρόσβασης του λογαριασμού σας.', 'error');
                return showToast('Εισάγετε τον κωδικό πρόσβασης του λογαριασμού σας.', 'warning');
            }
            if (!newPin) {
                if (recoverPinNewPinInput) recoverPinNewPinInput.focus();
                setRecoverPinFeedback('Παρακαλώ ορίστε το νέο σας PIN.', 'error');
                return showToast('Παρακαλώ ορίστε το νέο σας PIN.', 'warning');
            }
            if (recoverPinConfirmPinInput && !confirmPin) {
                recoverPinConfirmPinInput.focus();
                setRecoverPinFeedback('Παρακαλώ επιβεβαιώστε το νέο σας PIN.', 'error');
                return showToast('Παρακαλώ επιβεβαιώστε το νέο σας PIN.', 'warning');
            }
            if (newPin !== confirmPin) {
                if (recoverPinConfirmPinInput) recoverPinConfirmPinInput.focus();
                setRecoverPinFeedback('Τα πεδία του νέου PIN δεν ταιριάζουν μεταξύ τους.', 'error');
                return showToast('Τα πεδία του νέου PIN δεν ταιριάζουν.', 'error');
            }

            try {
                resetPinWithPasswordBtn.disabled = true;
                resetPinWithPasswordBtn.textContent = 'Επαλήθευση...';

                const res = await apiResetPinWithPassword(accountPassword, newPin);
                const data = await safeJson(res);

                if (res.ok && data.success) {
                    localStorage.setItem('hasPin', 'true');
                    localStorage.setItem('isAdmin', 'true');
                    if (recoverPinAccountPassword) recoverPinAccountPassword.value = '';
                    if (recoverPinNewPinInput) recoverPinNewPinInput.value = '';
                    if (recoverPinConfirmPinInput) recoverPinConfirmPinInput.value = '';
                    showVerifyPinView('entry');
                    if (verifyPinModal) verifyPinModal.classList.add('hidden');
                    enableAdminMode();
                    showToast(data.message || 'Το νέο PIN ορίστηκε και ξεκλειδώθηκε η λειτουργία Διαχειριστή!', 'success');
                } else {
                    const errMsg = data.error || 'Αποτυχία επαναφοράς PIN. Ελέγξτε τον κωδικό σας.';
                    setRecoverPinFeedback(errMsg, 'error');
                    showToast(errMsg, 'error');
                }
            } catch (err) {
                setRecoverPinFeedback('Σφάλμα επικοινωνίας με τον server.', 'error');
                showToast('Σφάλμα επικοινωνίας με τον server.', 'error');
            } finally {
                resetPinWithPasswordBtn.disabled = false;
                resetPinWithPasswordBtn.textContent = 'Αποθήκευση Νέου PIN & Ξεκλείδωμα';
            }
        });
    }

    if (recoverPinNewPinInput) {
        recoverPinNewPinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && resetPinWithPasswordBtn) {
                e.preventDefault();
                resetPinWithPasswordBtn.click();
            }
        });
    }

    if (recoverPinConfirmPinInput) {
        recoverPinConfirmPinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && resetPinWithPasswordBtn) {
                e.preventDefault();
                resetPinWithPasswordBtn.click();
            }
        });
    }

    if (sendPinResetEmailBtn) {
        sendPinResetEmailBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                sendPinResetEmailBtn.disabled = true;
                sendPinResetEmailBtn.textContent = 'Αποστολή email...';

                const res = await apiForgotPin();
                const data = await safeJson(res);
                if (res.ok) {
                    const msg = data.message || 'Ελέγξτε το email σας για τον σύνδεσμο επαναφοράς του PIN.';
                    setRecoverPinFeedback(msg, 'success');
                    showToast(msg, 'info');
                } else {
                    const errMsg = data.error || 'Σφάλμα κατά την αποστολή email.';
                    setRecoverPinFeedback(errMsg, 'error');
                    showToast(errMsg, 'error');
                }
            } catch (err) {
                setRecoverPinFeedback('Σφάλμα επικοινωνίας με τον server.', 'error');
                showToast('Σφάλμα επικοινωνίας με τον server.', 'error');
            } finally {
                sendPinResetEmailBtn.disabled = false;
                sendPinResetEmailBtn.textContent = '📩 Αποστολή Συνδέσμου Επαναφοράς στο Email';
            }
        });
    }

    // --- Περιοδικός Έλεγχος Συνεδρίας ---
    const startSessionCheck = () => {
        // Καθαρίζουμε τυχόν προηγούμενο interval για να μην έχουμε πολλαπλούς ελέγχους
        if (sessionCheckInterval) clearInterval(sessionCheckInterval);

        // Έλεγχος κάθε 15 λεπτά
        sessionCheckInterval = setInterval(async () => {
            const token = getToken();
            if (!token) {
                logout(); // Αν για κάποιο λόγο το token διαγραφεί, κάνουμε logout
                return;
            }
            const isValid = await apiCheckToken();
            if (!isValid) {
                logout();
            }
        }, 15 * 60 * 1000); // 15 λεπτά
    };

    const stopSessionCheck = () => clearInterval(sessionCheckInterval);

    return { checkAuth, logout };
}
