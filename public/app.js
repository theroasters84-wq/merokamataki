document.addEventListener('DOMContentLoaded', () => {
    // --- Auth DOM Στοιχεία ---
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

    // --- Επιλογή Στοιχείων DOM ---
    const recordDateEl = document.getElementById('recordDate');
    const posRevenueEl = document.getElementById('posRevenue');
    const cashRevenueEl = document.getElementById('cashRevenue');
    const actualCashEl = document.getElementById('actualCash');
    const drawerStatusEl = document.getElementById('drawerStatus');
    const foodCostDisplayEl = document.getElementById('foodCostDisplay');
    const saveDailyBtn = document.getElementById('saveDailyBtn');

    // Νέα DOM στοιχεία εξόδων για το Κεντρικό Dashboard
    const dashExpenseDesc = document.getElementById('dashExpenseDesc');
    const dashExpenseCategory = document.getElementById('dashExpenseCategory');
    const dashExpenseAmount = document.getElementById('dashExpenseAmount');
    const dashExpensePaidFromDrawer = document.getElementById('dashExpensePaidFromDrawer');
    const addDashExpenseBtn = document.getElementById('addDashExpenseBtn');
    const dashExpensesList = document.getElementById('dashExpensesList');
    const dashTotalExpensesDisplay = document.getElementById('dashTotalExpensesDisplay');

    const monthlyFixedCostsEl = document.getElementById('monthlyFixedCosts');
    const weeklyFixedDisplayEl = document.getElementById('weeklyFixedDisplay');

    const employeeListEl = document.getElementById('employeeList');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');

    const totalWeeklyCostEl = document.getElementById('totalWeeklyCost');
    const breakEvenPointEl = document.getElementById('breakEvenPoint');

    const dailyOperatingCostEl = document.getElementById('dailyOperatingCost');
    const dailyNetProfitEl = document.getElementById('dailyNetProfit');

    // --- Ημερολόγιο & Modal DOM ---
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    
    const dayModal = document.getElementById('dayModal');
    const modalDateDisplay = document.getElementById('modalDateDisplay');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // --- Tabs & Monthly Report DOM ---
    const tabDashboard = document.getElementById('tabDashboard');
    const tabMonthlyReport = document.getElementById('tabMonthlyReport');
    const dashboardView = document.getElementById('dashboardView');
    const monthlyReportView = document.getElementById('monthlyReportView');

    const reportMonthDisplay = document.getElementById('reportMonthDisplay');
    const reportTotalRevenue = document.getElementById('reportTotalRevenue');
    const reportTotalExpenses = document.getElementById('reportTotalExpenses');
    const reportAverageFoodCost = document.getElementById('reportAverageFoodCost');
    const reportFixedCosts = document.getElementById('reportFixedCosts');
    const reportNetProfit = document.getElementById('reportNetProfit');
    const fetchReportBtn = document.getElementById('fetchReportBtn');
    const closeMonthBtn = document.getElementById('closeMonthBtn');

    const monthlyRecordsList = document.getElementById('monthlyRecordsList');
    const clearDataCheckbox = document.getElementById('clearDataCheckbox');

    const editRecordModal = document.getElementById('editRecordModal');
    const editModalDateDisplay = document.getElementById('editModalDateDisplay');
    const editModalPosRevenue = document.getElementById('editModalPosRevenue');
    const editModalCashRevenue = document.getElementById('editModalCashRevenue');
    const editModalExpenses = document.getElementById('editModalExpenses');
    const editModalEmployeesList = document.getElementById('editModalEmployeesList');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const closeEditModalIconBtn = document.getElementById('closeEditModalIconBtn');
    const saveEditModalBtn = document.getElementById('saveEditModalBtn');

    let currentReportData = null;
    let currentMonthlyRecords = [];
    let currentEditRecordId = null;
    let currentEditRecordDate = null;
    let foodCostChart = null;

    // --- Auth Λογική ---
    const getToken = () => localStorage.getItem('token');

    const checkAuth = () => {
        const token = getToken();
        if (token) {
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            // Εφόσον συνδέθηκε, φορτώνουμε τα δεδομένα
            renderCalendar();
            updateDashExpensesUI();
            updateCalculations();
            fetchDashboardData();
            
            // Έλεγχος αν ο ιδιοκτήτης δεν έχει ορίσει PIN ακόμα
            if (localStorage.getItem('hasPin') === 'false') {
                const setPinModal = document.getElementById('setPinModal');
                if (setPinModal) setPinModal.classList.remove('hidden');
            }
        } else {
            loginContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            if (!email || !password) return alert('Συμπληρώστε email και κωδικό.');

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
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

    // --- Λογική Εναλλαγής & Εγγραφής ---
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

                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, store_name: storeName })
                });
                const data = await res.json();
                
                if (res.ok) {
                    // Αυτόματο Login μετά την επιτυχημένη εγγραφή
                    const loginRes = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const loginData = await loginRes.json();
                    
                    if (loginRes.ok) {
                        localStorage.setItem('token', loginData.token);
                        localStorage.setItem('hasPin', loginData.hasPin);
                        registerEmail.value = '';
                        registerPassword.value = '';
                        registerStoreName.value = '';
                        checkAuth(); // Προχωράει κατευθείαν στο Dashboard!
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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            checkAuth(); // Επιστροφή στην οθόνη login
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
                    const verifyPinModal = document.getElementById('verifyPinModal');
                    const verifyPinInput = document.getElementById('verifyPinInput');
                    if (verifyPinModal && verifyPinInput) {
                        verifyPinInput.value = '';
                        verifyPinModal.classList.remove('hidden');
                        verifyPinInput.focus();
                    }
                } else {
                    // Αν δεν έχει οριστεί PIN, του ζητάμε να ορίσει
                    const setPinModal = document.getElementById('setPinModal');
                    if (setPinModal) setPinModal.classList.remove('hidden');
                }
            }
        });
    }

    // --- Λογική PIN Modals ---
    const setPinModal = document.getElementById('setPinModal');
    const newPinInput = document.getElementById('newPinInput');
    const saveSetPinBtn = document.getElementById('saveSetPinBtn');

    if (saveSetPinBtn) {
        saveSetPinBtn.addEventListener('click', async () => {
            const pin = newPinInput.value.trim();
            if (!pin) return alert('Παρακαλώ εισάγετε PIN.');
            try {
                const res = await fetch('/api/pin/set', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ pin })
                });
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

    const verifyPinModal = document.getElementById('verifyPinModal');
    const verifyPinInput = document.getElementById('verifyPinInput');
    const verifyPinBtn = document.getElementById('verifyPinBtn');
    const closeVerifyPinBtn = document.getElementById('closeVerifyPinBtn');
    const forgotPinBtn = document.getElementById('forgotPinBtn');

    if (closeVerifyPinBtn) closeVerifyPinBtn.addEventListener('click', () => verifyPinModal.classList.add('hidden'));

    if (verifyPinBtn) {
        verifyPinBtn.addEventListener('click', async () => {
            const pin = verifyPinInput.value.trim();
            if (!pin) return;
            try {
                const res = await fetch('/api/pin/verify', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ pin })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    verifyPinModal.classList.add('hidden');
                    const adminElements = document.querySelectorAll('.admin-only');
                    adminElements.forEach(el => el.classList.remove('hidden'));
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
                const res = await fetch('/api/pin/forgot', { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } });
                const data = await res.json();
                if (res.ok) alert('Ελέγξτε το email σας για οδηγίες ανάκτησης του PIN.');
                else alert(data.error || 'Σφάλμα κατά την αποστολή.');
            } catch (err) {
                alert('Σφάλμα επικοινωνίας με τον server.');
            }
        });
    }

    // --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος ---
    const refreshChartData = (records) => {
        if (!foodCostChart) return;
        
        let cumulativeRev = 0;
        let cumulativeAgatho = 0;
        const labels = [];
        const data = [];

        records.forEach(record => {
            const rev = parseFloat(record.daily_revenue) || 0;
            const fc = parseFloat(record.food_cost_percentage) || 0;
            const agatho = (fc * rev) / 100; // Ανακτούμε την πρώτη ύλη βάσει ποσοστού!

            cumulativeRev += rev;
            cumulativeAgatho += agatho;
            
            const dateObj = new Date(record.date);
            labels.push(`${dateObj.getDate()}/${dateObj.getMonth() + 1}`);
            
            const rollingFC = cumulativeRev > 0 ? (cumulativeAgatho / cumulativeRev) * 100 : 0;
            data.push(rollingFC.toFixed(1));
        });

        foodCostChart.data.labels = labels;
        foodCostChart.data.datasets[0].data = data;
        foodCostChart.update();
    };

    const fetchDashboardData = async () => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        try {
            const response = await fetch(`/api/daily-records/${month}/${year}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.status === 401 || response.status === 403) return logoutBtn.click();

            if (response.ok) {
                const records = await response.json();
                currentMonthlyRecords = records;
                refreshChartData(records);
            }
        } catch (error) {
            console.error('Error fetching dashboard records:', error);
        }
    };

    // --- Λογική Tabs ---
    tabDashboard.addEventListener('click', () => {
        dashboardView.classList.remove('hidden');
        monthlyReportView.classList.add('hidden');
        
        tabDashboard.classList.add('border-primary', 'text-primary');
        tabDashboard.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        
        tabMonthlyReport.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        tabMonthlyReport.classList.remove('border-primary', 'text-primary');
    });

    tabMonthlyReport.addEventListener('click', () => {
        monthlyReportView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        
        tabMonthlyReport.classList.add('border-primary', 'text-primary');
        tabMonthlyReport.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        
        tabDashboard.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        tabDashboard.classList.remove('border-primary', 'text-primary');

        fetchMonthlyReport();
    });

    const fetchMonthlyReport = async () => {
        const month = currentDate.getMonth() + 1; // 1-12
        const year = currentDate.getFullYear();
        
        const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
        reportMonthDisplay.textContent = `${monthNames[month - 1]} ${year}`;
        
        try {
            // Πρώτα τραβάμε τα αναλυτικά ταμεία για να έχουμε τα ημερήσια δεδομένα
            let records = [];
            const recordsResponse = await fetch(`/api/daily-records/${month}/${year}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (recordsResponse.ok) {
                records = await recordsResponse.json();
                currentMonthlyRecords = records;
            } else {
                console.error('Failed to fetch daily records');
            }

            const response = await fetch(`/api/monthly-report/${month}/${year}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.ok) {
                const data = await response.json();
                currentReportData = data;
                
                const totalRev = parseFloat(data.total_revenue) || 0;
                const totalExp = parseFloat(data.total_expenses) || 0;
                const fixedCosts = parseFloat(monthlyFixedCostsEl.value) || 0;
                
                let totalPersonnelWeekly = 0;
                const employeeRows = employeeListEl.querySelectorAll('.employee-row');
                employeeRows.forEach(row => {
                    const wage = parseFloat(row.querySelector('.wage-input').value) || 0;
                    const days = row.querySelectorAll('.day-checkbox:checked').length;
                    totalPersonnelWeekly += (wage * days);
                });
                const monthlyPersonnelCost = totalPersonnelWeekly * 4.3;

                const finalNetProfit = totalRev - totalExp - monthlyPersonnelCost - fixedCosts;

                // Υπολογισμός Κυλιόμενου Food Cost Μήνα ΜΟΝΟ με Αγαθά (Πρώτες Ύλες)
                let monthlyAgatho = 0;
                records.forEach(record => {
                    const rev = parseFloat(record.daily_revenue) || 0;
                    const fc = parseFloat(record.food_cost_percentage) || 0;
                    monthlyAgatho += (fc * rev) / 100;
                });
                
                const avgFoodCost = totalRev > 0 ? (monthlyAgatho / totalRev) * 100 : 0;
                reportAverageFoodCost.textContent = totalRev > 0 ? avgFoodCost.toFixed(1) + '%' : '-%';
                reportAverageFoodCost.className = 'text-4xl font-bold';
                if (totalRev > 0) {
                    if (avgFoodCost <= 30) reportAverageFoodCost.classList.add('text-green-500');
                    else if (avgFoodCost <= 40) reportAverageFoodCost.classList.add('text-orange-500');
                    else reportAverageFoodCost.classList.add('text-red-500');
                } else {
                    reportAverageFoodCost.classList.add('text-gray-400');
                }

                reportTotalRevenue.textContent = formatCurrency(totalRev);
                reportTotalExpenses.textContent = formatCurrency(totalExp);
                reportFixedCosts.textContent = formatCurrency(fixedCosts);
                reportNetProfit.textContent = formatCurrency(finalNetProfit);

                // Color net profit
                if (finalNetProfit > 0) {
                    reportNetProfit.className = 'text-4xl font-bold text-blue-700';
                } else if (finalNetProfit < 0) {
                    reportNetProfit.className = 'text-4xl font-bold text-red-700';
                } else {
                    reportNetProfit.className = 'text-4xl font-bold text-gray-700';
                }
            } else {
                console.error('Failed to fetch monthly report');
            }
            
                monthlyRecordsList.innerHTML = '';
                if (records.length === 0) {
                    monthlyRecordsList.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 italic">Δεν υπάρχουν καταγραφές για αυτόν τον μήνα.</td></tr>';
                } else {
                    records.forEach(record => {
                        const dateObj = new Date(record.date);
                        const dateStr = dateObj.toLocaleDateString('el-GR');
                        const fcColor = record.food_cost_percentage > 40 ? 'text-red-500' : (record.food_cost_percentage <= 30 ? 'text-green-500' : 'text-orange-500');
                        const tr = document.createElement('tr');
                        tr.className = 'hover:bg-gray-50';
                        tr.innerHTML = `
                            <td class="px-6 py-3 text-sm text-gray-800">${dateStr}</td>
                            <td class="px-6 py-3 text-sm text-gray-800 font-medium">${formatCurrency(parseFloat(record.daily_revenue))}</td>
                            <td class="px-6 py-3 text-sm text-gray-800">${formatCurrency(parseFloat(record.total_expenses))}</td>
                            <td class="px-6 py-3 text-sm font-semibold ${fcColor}">${parseFloat(record.food_cost_percentage).toFixed(1)}%</td>
                            <td class="px-6 py-3 text-sm text-center">
                                <button onclick="editRecord(${record.id}, '${record.date}')" class="text-blue-500 hover:text-blue-700 mx-1 transition-colors" title="Επεξεργασία">✏️</button>
                                <button onclick="deleteRecord(${record.id})" class="text-red-500 hover:text-red-700 mx-1 transition-colors" title="Διαγραφή">❌</button>
                            </td>
                        `;
                        monthlyRecordsList.appendChild(tr);
                    });
                }
                refreshChartData(records);
        } catch (error) {
            console.error('Error fetching monthly report:', error);
        }
    };

    fetchReportBtn.addEventListener('click', fetchMonthlyReport);

    closeMonthBtn.addEventListener('click', async () => {
        if (!currentReportData) return alert('Παρακαλώ ανανεώστε τα δεδομένα πρώτα.');
        
        const clearData = clearDataCheckbox ? clearDataCheckbox.checked : false;
        const confirmMessage = clearData 
            ? 'ΠΡΟΣΟΧΗ: Έχετε επιλέξει να διαγραφούν τα αναλυτικά δεδομένα του μήνα. Είστε σίγουροι;' 
            : 'Είστε σίγουροι ότι θέλετε να κλείσετε τον μήνα; Αυτό θα αποθηκεύσει τα τρέχοντα αποτελέσματα μόνιμα.';

        if (!confirm(confirmMessage)) return;

        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const fixedCosts = parseFloat(monthlyFixedCostsEl.value) || 0;
        const totalRev = parseFloat(currentReportData.total_revenue) || 0;
        const totalExp = parseFloat(currentReportData.total_expenses) || 0;
        
        const wageMap = {};
        employeeListEl.querySelectorAll('.employee-row').forEach(row => {
            const name = row.querySelector('.name-input').value.trim();
            const wage = parseFloat(row.querySelector('.wage-input').value) || 0;
            if (name) wageMap[name] = wage;
        });

        let actualMonthlyPayroll = 0;
        currentMonthlyRecords.forEach(record => {
            let worked = [];
            try {
                worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || [];
            } catch(e) {}
            worked.forEach(empName => {
                actualMonthlyPayroll += (wageMap[empName] || 0);
            });
        });

        const finalNetProfit = totalRev - totalExp - actualMonthlyPayroll - fixedCosts;

        const payload = {
            month,
            year,
            total_revenue: totalRev,
            total_expenses: totalExp,
            fixed_costs: fixedCosts,
            net_profit: finalNetProfit,
            clearData
        };

        try {
            const response = await fetch('/api/monthly-report', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Ο μήνας έκλεισε επιτυχώς!');
                fetchMonthlyReport(); // Ανανεώνουμε τα δεδομένα για να φανούν οι αλλαγές
            } else {
                alert('Προέκυψε σφάλμα κατά το κλείσιμο του μήνα.');
            }
        } catch (error) {
            console.error('Error saving monthly summary:', error);
            alert('Αδυναμία αποθήκευσης συνόψεων.');
        }
    });

    // Νέα DOM στοιχεία του Modal
    const expenseDescInput = document.getElementById('expenseDescInput');
    const expenseCategoryInput = document.getElementById('expenseCategoryInput');
    const expenseAmountInput = document.getElementById('expenseAmountInput');
    const modalExpensePaidFromDrawer = document.getElementById('modalExpensePaidFromDrawer');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const modalExpensesList = document.getElementById('modalExpensesList');
    const modalTotalExpensesDisplay = document.getElementById('modalTotalExpensesDisplay');
    const posTotal = document.getElementById('posTotal');
    const drawerCash = document.getElementById('drawerCash');
    const zReceipt = document.getElementById('zReceipt');
    const modalDrawerStatus = document.getElementById('modalDrawerStatus');
    const saveModalDayBtn = document.getElementById('saveModalDayBtn');

    // --- Κατάσταση ---
    let foodCostPercentage = 0;
    let currentDate = new Date(); // Τρέχουσα ημερομηνία για το ημερολόγιο
    let currentModalExpenses = []; // Προσωρινή λίστα εξόδων για το ανοιχτό Modal
    let currentDashboardExpenses = []; // Προσωρινή λίστα εξόδων για το Κεντρικό Dashboard

    // Helper για μορφοποίηση νομίσματος
    const formatCurrency = (amount) => {
        return amount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
    };

    // --- Λογική Ημερολογίου ---
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Εμφάνιση Μήνα / Έτους
        const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Προσαρμογή: Η Κυριακή είναι 0 στην js, τη θέλουμε στο τέλος (Δευ-Κυρ)
        let emptyDays = firstDay === 0 ? 6 : firstDay - 1;

        // Κενά κουτάκια πριν την πρώτη μέρα
        for (let i = 0; i < emptyDays; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'bg-gray-50 rounded-lg p-2 min-h-[80px] border border-gray-100 opacity-50';
            calendarGrid.appendChild(emptyDiv);
        }

        // Κουτάκια ημερών
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'bg-white rounded-lg p-2 min-h-[80px] border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer flex flex-col justify-start overflow-hidden group';
            
            // Highlight επιλεγμένης (ή σημερινής) μέρας
            const selectedDate = new Date(recordDateEl.value || new Date());
            if (day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                dayDiv.classList.add('ring-2', 'ring-primary', 'bg-blue-50/30');
            }

            // --- Εύρεση εργαζομένων για αυτή τη μέρα ---
            const currentDayOfWeek = new Date(year, month, day).getDay(); // 0=Κυρ, 1=Δευ, κτλ.
            
            // Φιλτράρισμα προσωπικού
            const employeeRows = Array.from(employeeListEl.querySelectorAll('.employee-row'));
            const workingEmployees = employeeRows.filter(row => {
                const checkbox = row.querySelector(`.day-checkbox[data-day="${currentDayOfWeek}"]`);
                return checkbox && checkbox.checked;
            }).map(row => row.querySelector('.name-input').value.trim()).filter(name => name !== '');

            let employeesHtml = '';
            if (workingEmployees.length > 0) {
                employeesHtml = '<div class="mt-1 flex flex-col gap-1 overflow-y-auto max-h-16">' + 
                    workingEmployees.map(name => `<span class="text-[10px] md:text-xs bg-indigo-100 text-indigo-800 rounded px-1 truncate" title="${name}">${name}</span>`).join('') + 
                    '</div>';
            }

            dayDiv.innerHTML = `
                <span class="text-sm font-bold text-gray-700 group-hover:text-primary">${day}</span>
                ${employeesHtml}
            `;
            
            // Click Event για άνοιγμα Modal
            dayDiv.addEventListener('click', () => {
                // Συγχρονισμός πεδίου "Ημερομηνία" στο Κλείσιμο Ημέρας
                const pad = (num) => String(num).padStart(2, '0');
                recordDateEl.value = `${year}-${pad(month + 1)}-${pad(day)}`;
                renderCalendar(); // Επανασχεδιασμός για να μεταφερθεί το μπλε "highlight"
                openDayModal(year, month, day);
            });
            
            calendarGrid.appendChild(dayDiv);
        }
    };

    const modalShiftsList = document.getElementById('modalShiftsList');

    const openDayModal = (year, month, day) => {
        const targetDate = new Date(year, month, day);
        // Διαμόρφωση ημερομηνίας
        const dateStr = targetDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        modalDateDisplay.textContent = dateStr;
        
        // --- Υπολογισμός Βαρδιών Ημέρας ---
        const dayOfWeek = targetDate.getDay(); // 0=Κυρ, 1=Δευ, ... 6=Σαβ
        modalShiftsList.innerHTML = '';
        let dayStaffCost = 0;
        let workingEmployeesCount = 0;

        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        employeeRows.forEach(row => {
            const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeek}"]`);
            if (checkbox && checkbox.checked) {
                const name = row.querySelector('.name-input').value.trim() || 'Άγνωστος';
                const wage = parseFloat(row.querySelector('.wage-input').value) || 0;
                dayStaffCost += wage;
                workingEmployeesCount++;

                const li = document.createElement('li');
                li.className = 'flex justify-between items-center py-1 border-b border-gray-100 last:border-0';
                li.innerHTML = `<span>${name}</span><span class="font-medium">${formatCurrency(wage)}</span>`;
                modalShiftsList.appendChild(li);
            }
        });

        if (workingEmployeesCount === 0) {
            modalShiftsList.innerHTML = '<li class="italic text-gray-400 py-1">Κανένας εργαζόμενος.</li>';
        } else {
            const totalLi = document.createElement('li');
            totalLi.className = 'flex justify-between items-center py-1 font-bold text-gray-800 mt-1 pt-1 border-t border-gray-300';
            totalLi.innerHTML = `<span>Σύνολο Κόστους Προσωπικού:</span><span>${formatCurrency(dayStaffCost)}</span>`;
            modalShiftsList.appendChild(totalLi);
        }

        // Καθαρισμός εξόδων από προηγούμενη χρήση του Modal
        currentModalExpenses = [];
        updateModalExpensesUI();
        posTotal.value = '';
        drawerCash.value = '';
        zReceipt.value = '';
        modalDrawerStatus.classList.add('hidden');

        // Εμφάνιση Modal
        dayModal.classList.remove('hidden');
    };

    const closeDayModal = () => {
        dayModal.classList.add('hidden');
    };

    const updateModalDrawerStatus = () => {
        let drawerExpenses = 0;
        currentModalExpenses.forEach(exp => {
            if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
        });
        
        const pos = parseFloat(posTotal.value) || 0;
        const cash = parseFloat(drawerCash.value) || 0;
        const actualTotalRevenue = pos + cash + drawerExpenses;
        
        if (zReceipt.value !== '') {
            const z = parseFloat(zReceipt.value) || 0;
            const diff = actualTotalRevenue - z;
            
            modalDrawerStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-orange-100', 'text-orange-800');
            if (diff === 0) {
                modalDrawerStatus.textContent = 'Ταμείο ΟΚ';
                modalDrawerStatus.classList.add('bg-green-100', 'text-green-800');
            } else if (diff < 0) {
                modalDrawerStatus.textContent = `Λείπουν ${Math.abs(diff).toFixed(2)} €`;
                modalDrawerStatus.classList.add('bg-red-100', 'text-red-800');
            } else {
                modalDrawerStatus.textContent = `Πλεόνασμα ${diff.toFixed(2)} €`;
                modalDrawerStatus.classList.add('bg-orange-100', 'text-orange-800');
            }
        } else {
            modalDrawerStatus.classList.add('hidden');
        }
    };

    // --- Λογική Εξόδων Modal ---
    const updateModalExpensesUI = () => {
        modalExpensesList.innerHTML = '';
        let total = 0;

        if (currentModalExpenses.length === 0) {
            modalExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
        } else {
            currentModalExpenses.forEach((exp, index) => {
                total += exp.amount;
                
                let badge = '';
                if (exp.category === 'agatho') badge = '<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-2">Αγαθό</span>';
                else if (exp.category === 'logariasmos') badge = '<span class="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded ml-2">Λογαριασμός</span>';
                else badge = '<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-2">Υλικά</span>';
                
                let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded ml-2" title="Πληρώθηκε εκτός ταμείου">🏦 Εκτός Ταμείου</span>' : '';

                const li = document.createElement('li');
                li.className = 'flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-100';
                li.innerHTML = `
                    <div class="flex items-center truncate pr-2">
                        <span class="truncate">${exp.desc}</span>
                        ${badge}
                        ${paymentBadge}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="font-semibold">${formatCurrency(exp.amount)}</span>
                        <button class="text-red-500 hover:text-red-700 font-bold" onclick="removeModalExpense(${index})">&times;</button>
                    </div>
                `;
                modalExpensesList.appendChild(li);
            });
        }
        modalTotalExpensesDisplay.textContent = formatCurrency(total);
        updateModalDrawerStatus();
    };

    // Κάνουμε τη συνάρτηση διαθέσιμη στο window για το inline onclick
    window.removeModalExpense = (index) => {
        currentModalExpenses.splice(index, 1);
        updateModalExpensesUI();
    };

    // --- Συναρτήσεις Επεξεργασίας / Διαγραφής Αναλυτικών Ταμείων ---
    window.editRecord = (id, date) => {
        const record = currentMonthlyRecords.find(r => r.id === id);
        if (!record) return;

        currentEditRecordId = id;
        currentEditRecordDate = date;

        const dateObj = new Date(date);
        editModalDateDisplay.textContent = `(${dateObj.toLocaleDateString('el-GR')})`;
        
        // Φορτώνουμε πλέον τα πραγματικά πεδία από το backend
        editModalPosRevenue.value = record.pos_revenue !== undefined ? record.pos_revenue : record.daily_revenue;
        editModalCashRevenue.value = record.cash_revenue || '';
        editModalExpenses.value = record.total_expenses;

        // Δυναμική δημιουργία λίστας εργαζομένων
        editModalEmployeesList.innerHTML = '';
        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        
        let workedEmployees = [];
        try {
            workedEmployees = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || [];
        } catch(e) {
            workedEmployees = [];
        }

        let addedEmployees = 0;
        employeeRows.forEach((row) => {
            const name = row.querySelector('.name-input').value.trim();
            if (!name) return; // Παράλειψη κενών
            
            addedEmployees++;
            const isChecked = workedEmployees.includes(name) ? 'checked' : '';
            
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors';
            label.innerHTML = `
                <input type="checkbox" class="edit-employee-checkbox w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" value="${name}" ${isChecked}>
                <span class="text-sm text-gray-700">${name}</span>
            `;
            editModalEmployeesList.appendChild(label);
        });

        if (addedEmployees === 0) {
            editModalEmployeesList.innerHTML = '<p class="text-sm text-gray-500 italic px-1">Δεν υπάρχουν καταχωρημένοι εργαζόμενοι στο σύστημα.</p>';
        }

        // Εμφάνιση Modal
        editRecordModal.classList.remove('hidden');
    };

    const closeEditModal = () => {
        editRecordModal.classList.add('hidden');
        currentEditRecordId = null;
        currentEditRecordDate = null;
    };

    closeEditModalBtn.addEventListener('click', closeEditModal);
    closeEditModalIconBtn.addEventListener('click', closeEditModal);

    saveEditModalBtn.addEventListener('click', async () => {
        if (!currentEditRecordId) return;

        const posRev = parseFloat(editModalPosRevenue.value) || 0;
        const cashRev = parseFloat(editModalCashRevenue.value) || 0;
        const newRevenue = posRev + cashRev;
        const newExpenses = parseFloat(editModalExpenses.value);

        if (isNaN(newRevenue) || isNaN(newExpenses) || newRevenue < 0 || newExpenses < 0) {
            alert('Παρακαλώ εισάγετε έγκυρους αριθμούς.');
            return;
        }

        let newFoodCost = 0;
        if (newRevenue > 0) {
            newFoodCost = (newExpenses / newRevenue) * 100;
        }

        // Συλλογή τικαρισμένων εργαζομένων
        const checkboxes = editModalEmployeesList.querySelectorAll('.edit-employee-checkbox:checked');
        const workedEmployees = Array.from(checkboxes).map(cb => cb.value);

        try {
            const response = await fetch(`/api/daily-records/${currentEditRecordId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify({
                    date: currentEditRecordDate,
                    daily_revenue: newRevenue,
                    cash_revenue: cashRev,
                    pos_revenue: posRev,
                    total_expenses: newExpenses,
                    food_cost_percentage: newFoodCost,
                    worked_employees: workedEmployees
                })
            });

            if (response.ok) {
                closeEditModal();
                fetchMonthlyReport(); // Ανανεώνουμε τον πίνακα και τα σύνολα της αναφοράς!
            } else {
                alert('Προέκυψε σφάλμα κατά την ενημέρωση.');
            }
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Αδυναμία σύνδεσης με τον server.');
        }
    });

    window.deleteRecord = async (id) => {
        if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εγγραφή;')) return;
        try {
            const response = await fetch(`/api/daily-records/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${getToken()}` 
                }
            });
            if (response.ok) {
                fetchMonthlyReport(); // Ανανεώνουμε αμέσως τη λίστα
            } else {
                alert('Προέκυψε σφάλμα κατά τη διαγραφή.');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    addExpenseBtn.addEventListener('click', () => {
        const desc = expenseDescInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategoryInput.value;
        const paidFromDrawer = modalExpensePaidFromDrawer ? modalExpensePaidFromDrawer.checked : true;

        if (desc && amount > 0) {
            currentModalExpenses.push({ desc, category, amount, paidFromDrawer });
            expenseDescInput.value = '';
            expenseAmountInput.value = '';
            if (modalExpensePaidFromDrawer) modalExpensePaidFromDrawer.checked = true;
            updateModalExpensesUI();
        }
    });

    // --- Λογική Εξόδων Κεντρικού Dashboard ---
    const updateDashExpensesUI = () => {
        dashExpensesList.innerHTML = '';
        let total = 0;

        if (currentDashboardExpenses.length === 0) {
            dashExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
        } else {
            currentDashboardExpenses.forEach((exp, index) => {
                total += exp.amount;
                
                let badge = '';
                if (exp.category === 'agatho') badge = '<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-2">Αγαθό</span>';
                else if (exp.category === 'logariasmos') badge = '<span class="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded ml-2">Λογαριασμός</span>';
                else badge = '<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-2">Υλικά</span>';
                
                let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded ml-2" title="Πληρώθηκε εκτός ταμείου">🏦 Εκτός Ταμείου</span>' : '';

                const li = document.createElement('li');
                li.className = 'flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-100';
                li.innerHTML = `
                    <div class="flex items-center truncate pr-2">
                        <span class="truncate">${exp.desc}</span>
                        ${badge}
                        ${paymentBadge}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="font-semibold">${formatCurrency(exp.amount)}</span>
                        <button class="text-red-500 hover:text-red-700 font-bold" onclick="removeDashExpense(${index})">&times;</button>
                    </div>
                `;
                dashExpensesList.appendChild(li);
            });
        }
        dashTotalExpensesDisplay.textContent = formatCurrency(total);
        updateCalculations();
    };

    window.removeDashExpense = (index) => {
        currentDashboardExpenses.splice(index, 1);
        updateDashExpensesUI();
    };

    addDashExpenseBtn.addEventListener('click', () => {
        const desc = dashExpenseDesc.value.trim();
        const amount = parseFloat(dashExpenseAmount.value);
        const category = dashExpenseCategory.value;
        const paidFromDrawer = dashExpensePaidFromDrawer ? dashExpensePaidFromDrawer.checked : true;

        if (desc && amount > 0) {
            currentDashboardExpenses.push({ desc, category, amount, paidFromDrawer });
            dashExpenseDesc.value = '';
            dashExpenseAmount.value = '';
            if (dashExpensePaidFromDrawer) dashExpensePaidFromDrawer.checked = true;
            updateDashExpensesUI();
        }
    });

    saveModalDayBtn.addEventListener('click', async () => {
        const pos = parseFloat(posTotal.value) || 0;
        const cash = parseFloat(drawerCash.value) || 0;
        const z = parseFloat(zReceipt.value) || 0;

        let totalExpenses = 0;
        let agathoExpenses = 0;
        let drawerExpenses = 0;

        currentModalExpenses.forEach(exp => {
            totalExpenses += exp.amount;
            if (exp.category === 'agatho') {
                agathoExpenses += exp.amount;
            }
            if (exp.paidFromDrawer !== false) {
                drawerExpenses += exp.amount;
            }
        });
        
        const actualTotalRevenue = pos + cash + drawerExpenses;
        const officialRevenue = z > 0 ? z : actualTotalRevenue;
        const actualCashRevenue = cash + drawerExpenses;
        
        if (officialRevenue === 0) {
            alert('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.');
            return;
        }

        const fcPercentage = officialRevenue > 0 ? (agathoExpenses / officialRevenue) * 100 : 0;

        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date(dateStr).getDay();
        const workedEmployees = [];
        
        employeeListEl.querySelectorAll('.employee-row').forEach(row => {
            const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeek}"]`);
            if (checkbox && checkbox.checked) {
                const name = row.querySelector('.name-input').value.trim();
                if (name) workedEmployees.push(name);
            }
        });

        const payload = {
            date: dateStr,
            daily_revenue: officialRevenue,
            cash_revenue: actualCashRevenue,
            pos_revenue: pos,
            total_expenses: totalExpenses,
            food_cost_percentage: fcPercentage,
            worked_employees: workedEmployees,
            detailed_expenses: currentModalExpenses
        };

        try {
            saveModalDayBtn.disabled = true;
            saveModalDayBtn.textContent = 'Αποθήκευση...';

            const response = await fetch('/api/daily-records', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                saveModalDayBtn.classList.replace('bg-primary', 'bg-green-600');
                saveModalDayBtn.textContent = 'Επιτυχία!';
                
                fetchDashboardData(); 
                
                setTimeout(() => {
                    saveModalDayBtn.classList.replace('bg-green-600', 'bg-primary');
                    saveModalDayBtn.textContent = 'Αποθήκευση Ημέρας';
                    saveModalDayBtn.disabled = false;
                    closeDayModal();
                }, 1500);

            } else {
                alert('Προέκυψε σφάλμα κατά την αποθήκευση.');
                saveModalDayBtn.disabled = false;
                saveModalDayBtn.textContent = 'Αποθήκευση Ημέρας';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Αδυναμία σύνδεσης με τον server.');
            saveModalDayBtn.disabled = false;
            saveModalDayBtn.textContent = 'Αποθήκευση Ημέρας';
        }
    });

    // Event Listeners Ημερολογίου
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        fetchDashboardData();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        fetchDashboardData();
    });

    closeModalBtn.addEventListener('click', closeDayModal);
    
    // Κλείσιμο modal όταν κάνουμε κλικ έξω από αυτό
    dayModal.addEventListener('click', (e) => {
        if (e.target === dayModal) closeDayModal();
    });
    
    // Αρχικοποίηση ημερομηνίας στο "Κλείσιμο Ημέρας"
    recordDateEl.value = new Date().toISOString().split('T')[0];
    
    // Αλλαγή ημερομηνίας -> ανανέωση ημερολογίου
    recordDateEl.addEventListener('change', renderCalendar);

    // --- Κεντρική Συνάρτηση Υπολογισμών ---
    const updateCalculations = () => {
        // 1. Υπολογισμός Food Cost (Ημέρας)
        const posRev = parseFloat(posRevenueEl.value) || 0;
        const cashRev = parseFloat(cashRevenueEl.value) || 0;
        const zReceiptDash = parseFloat(actualCashEl.value) || 0;
        let materials = 0;
        let allDashExpenses = 0;
        let drawerExpenses = 0;
        currentDashboardExpenses.forEach(exp => {
            allDashExpenses += exp.amount;
            if (exp.category === 'agatho') materials += exp.amount;
            if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
        });

        // ΝΕΟ: Ταμειακή Συμφωνία
        const actualTotalRevenue = posRev + cashRev + drawerExpenses;
        const officialRevenue = zReceiptDash > 0 ? zReceiptDash : actualTotalRevenue;

        if (actualCashEl.value !== '') {
            const diff = actualTotalRevenue - zReceiptDash;
            if (diff === 0) {
                drawerStatusEl.textContent = 'Ταμείο ΟΚ';
                drawerStatusEl.classList.add('bg-green-100', 'text-green-800');
            } else if (diff < 0) {
                drawerStatusEl.textContent = `Λείπουν ${Math.abs(diff).toFixed(2)} €`;
                drawerStatusEl.classList.add('bg-red-100', 'text-red-800');
            } else {
                drawerStatusEl.textContent = `Πλεόνασμα ${diff.toFixed(2)} €`;
                drawerStatusEl.classList.add('bg-orange-100', 'text-orange-800');
            }
        } else {
            drawerStatusEl.classList.add('hidden');
        }

        if (officialRevenue > 0) {
            foodCostPercentage = (materials / officialRevenue) * 100;
         

            if (foodCostPercentage <= 30) {
                foodCostDisplayEl.classList.add('text-green-500');
            } else if (foodCostPercentage <= 40) {
                foodCostDisplayEl.classList.add('text-orange-500');
            } else {
                foodCostDisplayEl.classList.add('text-red-500');
            }
        } else {
            foodCostPercentage = 0;
            foodCostDisplayEl.textContent = '-%';
            foodCostDisplayEl.className = 'text-2xl font-bold text-gray-400';
        }

        // 2. Υπολογισμός Εβδομαδιαίων Παγίων
        const monthlyFixed = parseFloat(monthlyFixedCostsEl.value) || 0;
        const weeklyFixed = monthlyFixed / 4.3;
        weeklyFixedDisplayEl.textContent = formatCurrency(weeklyFixed);

        // 3. Υπολογισμός Εβδομαδιαίου Κόστους Προσωπικού
        let totalPersonnelWeekly = 0;
        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        employeeRows.forEach(row => {
            const wage = parseFloat(row.querySelector('.wage-input').value) || 0;
            const days = row.querySelectorAll('.day-checkbox:checked').length;
            totalPersonnelWeekly += (wage * days);
        });

        // 4. Υπολογισμός Συνολικού Εβδομαδιαίου Κόστους 
        // (Προσωπικό + Πάγια + Εκτιμώμενα Έξοδα Πρώτων Υλών για 7 ημέρες)
        const weeklyMaterialsEst = allDashExpenses * 7; 
        const totalWeeklyCost = weeklyFixed + totalPersonnelWeekly + weeklyMaterialsEst;
        totalWeeklyCostEl.innerHTML = formatCurrency(totalWeeklyCost);

        // 5. Υπολογισμός Νεκρού Σημείου (Break-Even Point Εβδομάδας)
        let breakEven = 0;
        // Νέα φόρμουλα: BreakEven = (Συνολικά Πάγια + Συνολικό Προσωπικό) / (1 - Μέσο Ποσοστό Food Cost)
        const averageFoodCostRate = 0.30; // 30% default τιμή (θα συνδεθεί με τη βάση αργότερα)
        const grossMargin = 1 - averageFoodCostRate;
        
        if (grossMargin > 0) {
            breakEven = (weeklyFixed + totalPersonnelWeekly) / grossMargin;
        }
        
        if (breakEven > 0 && isFinite(breakEven)) {
            breakEvenPointEl.innerHTML = formatCurrency(breakEven);
        } else {
            breakEvenPointEl.innerHTML = formatCurrency(0);
        }

        // 6. Υπολογισμός Εικόνας Ημέρας
        const dailyFixedCost = monthlyFixed / 30;
        const dailyStaffCost = totalPersonnelWeekly / 7;
        const totalDailyCost = dailyFixedCost + dailyStaffCost + allDashExpenses;

        dailyOperatingCostEl.innerHTML = formatCurrency(totalDailyCost);

        // Καθαρό Κέρδος/Ζημιά Ημέρας = Τζίρος - Ημερήσιο Κόστος
        const dailyProfit = officialRevenue - totalDailyCost;
        dailyNetProfitEl.innerHTML = formatCurrency(dailyProfit);
        
        if (dailyProfit > 0) {
            dailyNetProfitEl.className = 'text-2xl font-bold text-green-500';
        } else if (dailyProfit < 0) {
            dailyNetProfitEl.className = 'text-2xl font-bold text-red-500';
        } else {
            dailyNetProfitEl.className = 'text-2xl font-bold text-gray-900';
        }
    };

    // --- Event Listeners για Real-time Υπολογισμούς ---
    [posRevenueEl, cashRevenueEl, actualCashEl, monthlyFixedCostsEl].forEach(el => {
        el.addEventListener('input', updateCalculations);
    });

    [posTotal, drawerCash, zReceipt].forEach(el => {
        el.addEventListener('input', updateModalDrawerStatus);
    });

    // --- Διαχείριση Προσωπικού (Δυναμική Λίστα) ---
    const createEmployeeRow = () => {
        const div = document.createElement('div');
        div.className = 'flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg employee-row transition-all';
        div.innerHTML = `
            <div class="flex gap-2 items-center w-full">
                <input type="text" placeholder="Όνομα" class="flex-grow px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none name-input">
                <input type="number" placeholder="Ημερομίσθιο (€)" class="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none wage-input" min="0" step="0.01">
                <button class="text-red-500 hover:text-red-700 p-1 delete-btn font-bold text-xl leading-none">&times;</button>
            </div>
            <div class="flex justify-between items-center w-full text-xs font-medium text-gray-600 mt-1 px-1">
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Δευτέρα">Δε</span><input type="checkbox" class="day-checkbox" data-day="1"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Τρίτη">Τρ</span><input type="checkbox" class="day-checkbox" data-day="2"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Τετάρτη">Τε</span><input type="checkbox" class="day-checkbox" data-day="3"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Πέμπτη">Πε</span><input type="checkbox" class="day-checkbox" data-day="4"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Παρασκευή">Πα</span><input type="checkbox" class="day-checkbox" data-day="5"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Σάββατο">Σα</span><input type="checkbox" class="day-checkbox" data-day="6"></label>
                <label class="flex flex-col items-center gap-1 cursor-pointer hover:text-primary"><span title="Κυριακή">Κυ</span><input type="checkbox" class="day-checkbox" data-day="0"></label>
            </div>
        `;

        // Προσθήκη listeners στα νέα inputs
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                updateCalculations();
                // Ανανέωση ημερολογίου αν αλλάξει όνομα ή ημέρα εργασίας
                if (input.classList.contains('day-checkbox') || input.classList.contains('name-input')) {
                    renderCalendar();
                }
            });
        });

        // Διαγραφή εργαζόμενου
        div.querySelector('.delete-btn').addEventListener('click', () => {
            div.remove();
            updateCalculations();
            renderCalendar();
        });

        return div;
    };

    // Καθαρίζουμε το dummy HTML και βάζουμε την πρώτη κενή γραμμή
    employeeListEl.innerHTML = '';
    employeeListEl.appendChild(createEmployeeRow());

    addEmployeeBtn.addEventListener('click', () => {
        employeeListEl.appendChild(createEmployeeRow());
    });

    // --- Αποθήκευση στον Server (POST request) ---
    saveDailyBtn.addEventListener('click', async () => {
        const posRev = parseFloat(posRevenueEl.value) || 0;
        const cashRev = parseFloat(cashRevenueEl.value) || 0;
        const zReceiptDash = parseFloat(actualCashEl.value) || 0;

        let totalExpenses = 0;
        let agathoExpenses = 0;
        let drawerExpenses = 0;

        currentDashboardExpenses.forEach(exp => {
            totalExpenses += exp.amount;
            if (exp.category === 'agatho') {
                agathoExpenses += exp.amount;
            }
            if (exp.paidFromDrawer !== false) {
                drawerExpenses += exp.amount;
            }
        });

        const actualTotalRevenue = posRev + cashRev + drawerExpenses;
        const officialRevenue = zReceiptDash > 0 ? zReceiptDash : actualTotalRevenue;
        const actualCashRevenue = cashRev + drawerExpenses;

        if (officialRevenue === 0) {
            alert('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.');
            return;
        }

        const fcPercentage = officialRevenue > 0 ? (agathoExpenses / officialRevenue) * 100 : 0;

        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date(dateStr).getDay();
        const workedEmployees = [];
        
        employeeListEl.querySelectorAll('.employee-row').forEach(row => {
            const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeek}"]`);
            if (checkbox && checkbox.checked) {
                const name = row.querySelector('.name-input').value.trim();
                if (name) workedEmployees.push(name);
            }
        });

        const payload = {
            date: dateStr,
            daily_revenue: officialRevenue,
            cash_revenue: actualCashRevenue,
            pos_revenue: posRev,
            total_expenses: totalExpenses,
            food_cost_percentage: fcPercentage,
            worked_employees: workedEmployees,
            detailed_expenses: currentDashboardExpenses
        };

        try {
            saveDailyBtn.disabled = true;
            saveDailyBtn.classList.add('opacity-75', 'cursor-not-allowed');
            saveDailyBtn.textContent = 'Αποθήκευση...';

            const response = await fetch('/api/daily-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Φτιάχνουμε ένα μικρό εφέ επιτυχίας στο κουμπί
                saveDailyBtn.classList.replace('bg-blue-600', 'bg-green-600');
                saveDailyBtn.classList.replace('hover:bg-blue-700', 'hover:bg-green-700');
                saveDailyBtn.textContent = 'Επιτυχία!';
                
                fetchDashboardData(); // Ανανέωση δεδομένων & γραφήματος

                setTimeout(() => {
                    // Καθαρισμός φόρμας μετά την επιτυχία
                    currentDashboardExpenses = [];
                    updateDashExpensesUI();
                    posRevenueEl.value = '';
                    cashRevenueEl.value = '';
                    actualCashEl.value = '';
                    drawerStatusEl.classList.add('hidden');

                    saveDailyBtn.classList.replace('bg-green-600', 'bg-blue-600');
                    saveDailyBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-700');
                    saveDailyBtn.textContent = 'Αποθήκευση & Υπολογισμός';
                    saveDailyBtn.disabled = false;
                    saveDailyBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                }, 2000);

            } else {
                alert('Προέκυψε σφάλμα κατά την αποθήκευση (Server Error).');
                resetSaveButton();
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Αδυναμία σύνδεσης με τον server. Βεβαιωθείτε ότι ο server τρέχει.');
            resetSaveButton();
        }
    });

    function resetSaveButton() {
        saveDailyBtn.disabled = false;
        saveDailyBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        saveDailyBtn.textContent = 'Αποθήκευση & Υπολογισμός';
    }

    // --- Αρχικοποίηση Γραφήματος Food Cost ---
    const ctx = document.getElementById('foodCostChart').getContext('2d');
    foodCostChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Κυλιόμενο Food Cost (%)',
                data: [],
                borderColor: '#3b82f6', // primary color
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ποσοστό (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            }
        }
    });

    // Εκκίνηση Εφαρμογής - Έλεγχος Auth αντί για άμεσο φόρτωμα
    checkAuth();
});