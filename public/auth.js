import { getToken, apiLogin, apiRegister, apiSetPin, apiVerifyPin, apiForgotPin } from './api.js';

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

    const enableAdminMode = () => {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.classList.remove('hidden'));

        let exitAdminBtn = document.getElementById('exitAdminBtn');
        if (!exitAdminBtn) {
            exitAdminBtn = document.createElement('button');
            exitAdminBtn.id = 'exitAdminBtn';
            exitAdminBtn.innerHTML = '🔒 Έξοδος Admin';
            exitAdminBtn.className = 'bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded shadow font-bold hover:bg-red-700 transition-colors cursor-pointer text-xs md:text-sm mr-2';
            
            if (logoutBtn && logoutBtn.parentNode) {
                logoutBtn.parentNode.insertBefore(exitAdminBtn, logoutBtn);
            } else {
                document.body.appendChild(exitAdminBtn);
            }

            exitAdminBtn.addEventListener('click', () => {
                localStorage.removeItem('isAdmin');
                disableAdminMode();
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
        } else {
            loginContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            disableAdminMode();
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            if (!email || !password) return alert('Συμπληρώστε email και κωδικό.');

            try {
                const res = await apiLogin(email, password);
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('hasPin', data.hasPin);
                    loginEmail.value = '';
                    loginPassword.value = '';
                    checkAuth(); // Προχωράει στο Dashboard
                } else {
                    alert(data.error || 'Λάθος στοιχεία.');
                }
            } catch (err) {
                console.error(err);
                alert('Αδυναμία σύνδεσης με τον server.');
            }
        });
    }

    if (showRegisterBtn && showLoginBtn) {
        showRegisterBtn.addEventListener('click', () => {
            loginFormArea.classList.add('hidden');
            registerFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Δημιουργήστε λογαριασμό για το νέο σας κατάστημα';
        });

        showLoginBtn.addEventListener('click', () => {
            registerFormArea.classList.add('hidden');
            loginFormArea.classList.remove('hidden');
            if (authSubtitle) authSubtitle.textContent = 'Συνδεθείτε για να διαχειριστείτε το κατάστημά σας';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = registerEmail.value.trim();
            const password = registerPassword.value;
            const storeName = registerStoreName.value.trim();

            if (!email || !password) return alert('Συμπληρώστε email και κωδικό.');

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
                        checkAuth(); 
                    } else {
                        alert('Η εγγραφή πέτυχε, αλλά απέτυχε η αυτόματη σύνδεση. Παρακαλώ συνδεθείτε χειροκίνητα.');
                        showLoginBtn.click();
                        loginEmail.value = email; 
                    }
                } else {
                    alert(data.error || 'Σφάλμα κατά την εγγραφή.');
                }
            } catch (err) {
                console.error(err);
                alert('Αδυναμία σύνδεσης με τον server.');
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = 'Δημιουργία Λογαριασμού';
            }
        });
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        checkAuth(); // Επιστροφή στην οθόνη login
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
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
        saveSetPinBtn.addEventListener('click', async () => {
            const pin = newPinInput.value.trim();
            if (!pin) return alert('Παρακαλώ εισάγετε PIN.');
            try {
                const res = await apiSetPin(pin);
                if (res.ok) {
                    localStorage.setItem('hasPin', 'true');
                    setPinModal.classList.add('hidden');
                    alert('Το PIN αποθηκεύτηκε επιτυχώς!');
                } else {
                    const data = await res.json();
                    alert(data.error || 'Σφάλμα κατά την αποθήκευση PIN.');
                }
            } catch (err) {
                alert('Σφάλμα επικοινωνίας με τον server.');
            }
        });
    }

    if (closeVerifyPinBtn) closeVerifyPinBtn.addEventListener('click', () => verifyPinModal.classList.add('hidden'));

    if (verifyPinBtn) {
        verifyPinBtn.addEventListener('click', async () => {
            const pin = verifyPinInput.value.trim();
            if (!pin) return;
            try {
                const res = await apiVerifyPin(pin);
                const data = await res.json();
                if (res.ok && data.success) {
                    verifyPinModal.classList.add('hidden');
                    localStorage.setItem('isAdmin', 'true');
                    enableAdminMode();
                } else {
                    alert(data.error || 'Λάθος PIN. Η πρόσβαση απορρίφθηκε.');
                }
            } catch (err) {
                alert('Σφάλμα επικοινωνίας με τον server.');
            }
        });
    }

    if (forgotPinBtn) {
        forgotPinBtn.addEventListener('click', async () => {
            try {
                const res = await apiForgotPin();
                const data = await res.json();
                if (res.ok) alert('Ελέγξτε το email σας για οδηγίες ανάκτησης του PIN.');
                else alert(data.error || 'Σφάλμα κατά την αποστολή.');
            } catch (err) {
                alert('Σφάλμα επικοινωνίας με τον server.');
            }
        });
    }

    return { checkAuth, logout };
}