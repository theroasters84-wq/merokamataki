import { getToken, apiLogin, apiRegister, apiSetPin, apiVerifyPin, apiForgotPin, apiCheckToken } from './api.js';
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
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const authSubtitle = document.getElementById('authSubtitle');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerStoreName = document.getElementById('registerStoreName');
    const registerBtn = document.getElementById('registerBtn');

    const setPinModal = document.getElementById('setPinModal');
    const newPinInput = document.getElementById('newPinInput');
    const saveSetPinBtn = document.getElementById('saveSetPinBtn');

    const verifyPinModal = document.getElementById('verifyPinModal');
    const verifyPinInput = document.getElementById('verifyPinInput');
    const verifyPinBtn = document.getElementById('verifyPinBtn');
    const closeVerifyPinBtn = document.getElementById('closeVerifyPinBtn');
    const forgotPinBtn = document.getElementById('forgotPinBtn');

    let sessionCheckInterval = null;

    const enableAdminMode = () => {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.classList.remove('hidden'));

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
        const exitAdminBtn = document.getElementById('exitAdminBtn');
        if (exitAdminBtn) exitAdminBtn.classList.add('hidden');
    };

    const checkAuth = () => {
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
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('hasPin', data.hasPin);
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
            loginFormArea.classList.add('hidden');
            registerFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Δημιουργήστε λογαριασμό για το νέο σας κατάστημα';
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormArea.classList.add('hidden');
            loginFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Συνδεθείτε για να διαχειριστείτε το κατάστημά σας';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = registerEmail.value.trim();
            const password = registerPassword.value;
            const storeName = registerStoreName.value.trim();

            if (!email || !password) return showToast('Συμπληρώστε email και κωδικό.', 'warning');

            try {
                registerBtn.disabled = true;
                registerBtn.textContent = 'Δημιουργία...';

                const res = await apiRegister(email, password, storeName);
                const data = await res.json();
                
                if (res.ok) {
                    const loginRes = await apiLogin(email, password);
                    const loginData = await loginRes.json();
                    
                    if (loginRes.ok) {
                        localStorage.setItem('token', loginData.token);
                        localStorage.setItem('hasPin', loginData.hasPin);
                        registerEmail.value = '';
                        registerPassword.value = '';
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
                        verifyPinInput.value = '';
                        verifyPinModal.classList.remove('hidden');
                        verifyPinInput.focus();
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
                    const data = await res.json();
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
            verifyPinModal.classList.add('hidden');
        });
    }

    if (verifyPinModal) {
        verifyPinModal.addEventListener('click', (e) => {
            if (e.target === verifyPinModal) {
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
                const data = await res.json();
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

    if (forgotPinBtn) {
        forgotPinBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                forgotPinBtn.disabled = true;
                forgotPinBtn.textContent = 'Αποστολή...';

                const res = await apiForgotPin();
                const data = await res.json();
                if (res.ok) showToast('Ελέγξτε το email σας για οδηγίες ανάκτησης του PIN.', 'info');
                else showToast(data.error || 'Σφάλμα κατά την αποστολή.', 'error');
            } catch (err) {
                showToast('Σφάλμα επικοινωνίας με τον server.', 'error');
            } finally {
                forgotPinBtn.disabled = false;
                forgotPinBtn.textContent = 'Ξέχασα το PIN';
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
