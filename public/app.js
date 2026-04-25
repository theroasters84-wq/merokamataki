import { apiFetchEmployees, apiSaveEmployeesBulk, apiFetchDailyRecords, apiFetchMonthlyReport, apiSaveMonthlyReport, apiSaveDailyRecord, apiUpdateDailyRecord, apiDeleteDailyRecord } from './api.js';
import { initAuth } from './auth.js';
document.addEventListener('DOMContentLoaded', () => {
    // --- Auth DOM Στοιχεία ---
    const installAppBtn = document.getElementById('installAppBtn');
    const logoutBtn = document.getElementById('logoutBtn');

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
    const editFixedCostsBtn = document.getElementById('editFixedCostsBtn');

    const employeeListEl = document.getElementById('employeeList');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');

    const totalWeeklyCostEl = document.getElementById('totalWeeklyCost');
    const breakEvenPointEl = document.getElementById('breakEvenPoint');

    const dailyOperatingCostEl = document.getElementById('dailyOperatingCost');
    const dailyBreakEvenPointEl = document.getElementById('dailyBreakEvenPoint');
    const dailyNetProfitEl = document.getElementById('dailyNetProfit');

    // --- Ημερολόγιο & Modal DOM ---
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    
    const dayActionModal = document.getElementById('dayActionModal');
    const actionExpensesBtn = document.getElementById('actionExpensesBtn');
    const actionClosureBtn = document.getElementById('actionClosureBtn');
    const closeDayActionModalBtn = document.getElementById('closeDayActionModalBtn');

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
    const { checkAuth, logout } = initAuth({
        onAuthSuccess: () => {
            const savedFixedCosts = localStorage.getItem('merokamataki_fixed_costs');
            if (savedFixedCosts) {
                monthlyFixedCostsEl.value = savedFixedCosts;
                monthlyFixedCostsEl.disabled = true;
                if (editFixedCostsBtn) {
                    editFixedCostsBtn.textContent = 'Επεξεργασία';
                    editFixedCostsBtn.className = 'flex-1 sm:flex-none text-center bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
                }
            } else {
                monthlyFixedCostsEl.disabled = false;
                if (editFixedCostsBtn) {
                    editFixedCostsBtn.textContent = 'Αποθήκευση';
                    editFixedCostsBtn.className = 'flex-1 sm:flex-none text-center bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
                }
            }

            fetchEmployees();
            renderCalendar();
            updateDashExpensesUI();
            updateCalculations();
            fetchDashboardData();
        }
    });

    // --- Λογική Day Action Modal ---
    if (closeDayActionModalBtn) {
        closeDayActionModalBtn.addEventListener('click', () => {
            dayActionModal.classList.add('hidden');
        });
    }
    
    if (actionExpensesBtn) {
        actionExpensesBtn.addEventListener('click', () => {
            dayActionModal.classList.add('hidden');
            const { year, month, day } = window.actionModalTarget;
            openDayModal(year, month, day, 'expenses');
        });
    }
    
    if (actionClosureBtn) {
        actionClosureBtn.addEventListener('click', () => {
            dayActionModal.classList.add('hidden');
            const { year, month, day } = window.actionModalTarget;
            openDayModal(year, month, day, 'closure');
        });
    }

    // --- Διαχείριση Ανάκτησης & Αποθήκευσης Προσωπικού (Μόνιμη Βάση) ---
    const fetchEmployees = async () => {
        try {
            const response = await apiFetchEmployees();
            if (response.ok) {
                const data = await response.json();
                employeeListEl.innerHTML = '';
                data.forEach(emp => {
                    const row = createEmployeeRow();
                    employeeListEl.appendChild(row);

                    row.querySelector('.name-input').value = emp.name;
                    row.querySelector('.display-name').textContent = emp.name;
                    row.querySelector('.rate-input').value = emp.hourly_rate || 0;

                    const schedule = typeof emp.schedule === 'string' ? JSON.parse(emp.schedule) : (emp.schedule || {});

                    Object.keys(schedule).forEach(dayId => {
                        const dayData = schedule[dayId];
                        const wrapper = row.querySelector(`.day-wrapper[data-day="${dayId}"]`);
                        if (wrapper) {
                            wrapper.querySelector('.day-checkbox').checked = true;
                            wrapper.querySelector('.shift-input-day').value = dayData.shift || 'morning';
                            wrapper.querySelector('.hours-input-day').value = dayData.hours !== undefined ? dayData.hours : 8;

                            const panel = row.querySelector(`.time-slots-panel-day[data-day="${dayId}"]`);
                            if (panel && dayData.time_slots) {
                                dayData.time_slots.forEach(hour => {
                                    const btn = panel.querySelector(`.time-slot-btn-day[data-hour="${hour}"]`);
                                    if (btn) {
                                        btn.classList.remove('bg-white', 'text-gray-600');
                                        btn.classList.add('bg-primary', 'text-white', 'border-primary');
                                    }
                                });
                            }
                        }
                    });

                    row.querySelector('.edit-mode').classList.add('hidden');
                    row.querySelector('.view-mode').classList.remove('hidden');
                });
                updateCalculations();
                renderCalendar();
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const saveEmployeesToServer = async () => {
        const employees = [];
        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        employeeRows.forEach(row => {
            const name = row.querySelector('.name-input').value.trim();
            if (!name) return;
            const hourly_rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            const schedule = {};
            row.querySelectorAll('.day-wrapper').forEach(wrapper => {
                const dayId = wrapper.dataset.day;
                const isActive = wrapper.querySelector('.day-checkbox').checked;
                if (isActive) {
                    const shift = wrapper.querySelector('.shift-input-day').value;
                    const hours = parseFloat(wrapper.querySelector('.hours-input-day').value) || 0;
                    const time_slots = [];
                    const panel = row.querySelector(`.time-slots-panel-day[data-day="${dayId}"]`);
                    if (panel) {
                        panel.querySelectorAll('.time-slot-btn-day.bg-primary').forEach(btn => time_slots.push(parseInt(btn.dataset.hour)));
                    }
                    schedule[dayId] = { shift, hours, time_slots };
                }
            });
            employees.push({ name, hourly_rate, schedule });
        });
        try {
            await apiSaveEmployeesBulk(employees);
        } catch (error) {
            console.error('Failed to save employees:', error);
        }
    };

    // --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος ---
    const refreshChartData = (records) => {
        if (!foodCostChart) return;
        
        let cumulativeRev = 0;
        let cumulativeAgatho = 0;
        const labels = [];
        const data = [];

        records.forEach(record => {
            const rev = parseFloat(record.daily_revenue) || 0;
            let agatho = 0;
            try {
                const expenses = typeof record.detailed_expenses === 'string' ? JSON.parse(record.detailed_expenses) : (record.detailed_expenses || []);
                expenses.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'ylika' || exp.category === 'materials') {
                        agatho += parseFloat(exp.amount) || 0;
                    }
                });
            } catch(e) {
                // Fallback για παλιές εγγραφές χωρίς αναλυτικά δεδομένα
                const fc = parseFloat(record.food_cost_percentage) || 0;
                agatho = (fc * rev) / 100;
            }

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
            const response = await apiFetchDailyRecords(month, year);
            if (response.status === 401 || response.status === 403) return logout();

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
            const recordsResponse = await apiFetchDailyRecords(month, year);
            if (recordsResponse.ok) {
                records = await recordsResponse.json();
                currentMonthlyRecords = records;
            } else {
                console.error('Failed to fetch daily records');
            }

            const response = await apiFetchMonthlyReport(month, year);
            if (response.ok) {
                const data = await response.json();
                currentReportData = data;
                
                const totalRev = parseFloat(data.total_revenue) || 0;
                const totalExp = parseFloat(data.total_expenses) || 0;
                const fixedCosts = parseFloat(monthlyFixedCostsEl.value) || 0;
                
                let totalPersonnelWeekly = 0;
                const employeeRows = employeeListEl.querySelectorAll('.employee-row');
                employeeRows.forEach(row => {
                    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
                    const hours = parseFloat(row.querySelector('.hours-input').value) || 0;
                    const wage = rate * hours;
                    const days = row.querySelectorAll('.day-checkbox:checked').length;
                    totalPersonnelWeekly += (wage * days);
                    row.querySelectorAll('.day-checkbox:checked').forEach(cb => {
                        const dayWrapper = row.querySelector(`.day-wrapper[data-day="${cb.dataset.day}"]`);
                        const dayHours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
                        totalPersonnelWeekly += rate * dayHours;
                    });
                });
                const monthlyPersonnelCost = totalPersonnelWeekly * 4.3;

                const finalNetProfit = totalRev - totalExp - monthlyPersonnelCost - fixedCosts;

                // Υπολογισμός Κυλιόμενου Food Cost Μήνα ΜΟΝΟ με Αγαθά (Πρώτες Ύλες)
                let monthlyAgatho = 0;
                records.forEach(record => {
                    const rev = parseFloat(record.daily_revenue) || 0;
                    let dailyAgatho = 0;
                    try {
                        const expenses = typeof record.detailed_expenses === 'string' ? JSON.parse(record.detailed_expenses) : (record.detailed_expenses || []);
                        expenses.forEach(exp => {
                            if (exp.category === 'agatho' || exp.category === 'ylika' || exp.category === 'materials') {
                                dailyAgatho += parseFloat(exp.amount) || 0;
                            }
                        });
                    } catch(e) {
                        const fc = parseFloat(record.food_cost_percentage) || 0;
                        dailyAgatho = (fc * rev) / 100;
                    }
                    monthlyAgatho += dailyAgatho;
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
                    [...records].reverse().forEach(record => {
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
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            let fallbackHours = 8;
            const firstChecked = row.querySelector('.day-checkbox:checked');
            if (firstChecked) {
                const dayWrapper = row.querySelector(`.day-wrapper[data-day="${firstChecked.dataset.day}"]`);
                if (dayWrapper) fallbackHours = parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0;
            }
            if (name) wageMap[name] = rate * fallbackHours;
        });

        let actualMonthlyPayroll = 0;
        currentMonthlyRecords.forEach(record => {
            let worked = [];
            try {
                worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || [];
            } catch(e) {}
            worked.forEach(emp => {
                if (typeof emp === 'string') {
                    actualMonthlyPayroll += (wageMap[emp] || 0); // Υποστήριξη παλιών εγγραφών
                } else {
                    actualMonthlyPayroll += (parseFloat(emp.total_cost) || 0); // Νέες εγγραφές
                }
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
            const response = await apiSaveMonthlyReport(payload);

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
    
    // Helper για μορφοποίηση των time slots (π.χ. [10,11,18,19] -> "10:00-12:00, 18:00-20:00")
    const formatTimeSlots = (slots) => {
        if (!slots || slots.length === 0) return '';
        let ranges = [];
        let sorted = [...slots].sort((a,b)=>a-b);
        let start = sorted[0];
        let prev = start;
        const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === prev + 1) {
                prev = sorted[i];
            } else {
                ranges.push(`${formatHour(start)}-${formatHour(prev + 1)}`);
                start = sorted[i];
                prev = start;
            }
        }
        ranges.push(`${formatHour(start)}-${formatHour(prev + 1)}`);
        return ranges.join(', ');
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
                dayDiv.classList.add('ring-2', 'ring-primary', 'bg-blue-50/30', 'today-cell');
            }

            // --- Εύρεση εργαζομένων για αυτή τη μέρα ---
            const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const savedRecord = currentMonthlyRecords.find(r => {
                const d = new Date(r.date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            });

            let employeesHtml = '';
            if (savedRecord) {
                let worked = [];
                try { worked = typeof savedRecord.worked_employees === 'string' ? JSON.parse(savedRecord.worked_employees) : (savedRecord.worked_employees || []); } catch(e){}
                if (worked.length > 0) {
                    employeesHtml = '<div class="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[100px]">' + 
                        worked.map(emp => {
                            if (typeof emp === 'string') return `<span class="text-[10px] md:text-xs bg-indigo-100 text-indigo-800 rounded px-1 whitespace-normal break-words" title="${emp}">${emp}</span>`;
                            const name = emp.staff_id || 'Άγνωστος';
                            let emoji = emp.shift_type === 'morning' ? '☀️ ' : (emp.shift_type === 'night' ? '🌙 ' : (emp.shift_type === 'split' ? '⚡ ' : ''));
                            let slotsStr = emp.time_slots && emp.time_slots.length > 0 ? `<br><span class="text-[9px] text-gray-500 font-normal tracking-tighter leading-none">${formatTimeSlots(emp.time_slots)}</span>` : '';
                            return `<div class="text-[10px] md:text-xs bg-green-50 text-green-800 rounded px-1 py-0.5 border border-green-200 leading-tight shadow-sm whitespace-normal break-words" title="${name}"><b>${emoji}${name}</b>${slotsStr}</div>`;
                        }).join('') + 
                        '</div>';
                }
            } else {
                const currentDayOfWeek = new Date(year, month, day).getDay();
                const employeeRows = Array.from(employeeListEl.querySelectorAll('.employee-row'));
                const workingEmployees = employeeRows.filter(row => {
                    const checkbox = row.querySelector(`.day-checkbox[data-day="${currentDayOfWeek}"]`);
                    return checkbox && checkbox.checked;
                }).map(row => {
                    const dayWrapper = row.querySelector(`.day-wrapper[data-day="${currentDayOfWeek}"]`);
                    const panel = row.querySelector(`.time-slots-panel-day[data-day="${currentDayOfWeek}"]`);
                    const timeSlots = [];
                    if (panel) {
                        panel.querySelectorAll('.time-slot-btn-day.bg-primary').forEach(btn => timeSlots.push(parseInt(btn.dataset.hour)));
                    }
                    return {
                        name: row.querySelector('.name-input').value.trim(),
                        shift: dayWrapper ? dayWrapper.querySelector('.shift-input-day').value : 'morning',
                        time_slots: timeSlots
                    };
                }).filter(emp => emp.name !== '');
                
                if (workingEmployees.length > 0) {
                    employeesHtml = '<div class="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] opacity-70" title="Προγραμματισμένο (Μη Αποθηκευμένο)">' + 
                        workingEmployees.map(emp => {
                            let emoji = emp.shift === 'morning' ? '☀️ ' : (emp.shift === 'night' ? '🌙 ' : (emp.shift === 'split' ? '⚡ ' : ''));
                            let slotsStr = emp.time_slots && emp.time_slots.length > 0 ? `<br><span class="text-[9px] text-gray-500 font-normal tracking-tighter leading-none">${formatTimeSlots(emp.time_slots)}</span>` : '';
                            return `<div class="text-[10px] md:text-xs bg-gray-50 text-gray-600 rounded px-1 py-0.5 border border-dashed border-gray-300 leading-tight whitespace-normal break-words"><b>${emoji}${emp.name}</b>${slotsStr}</div>`;
                        }).join('') + 
                        '</div>';
                }
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
                
                window.actionModalTarget = { year, month, day };
                if (dayActionModal) dayActionModal.classList.remove('hidden');
            });
            
            calendarGrid.appendChild(dayDiv);
        }

        // Αυτόματο scroll στη σημερινή ημέρα για καλύτερο UX
        setTimeout(() => {
            const todayCell = calendarGrid.querySelector('.today-cell');
            if (todayCell) {
                todayCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
    };

    const modalShiftsList = document.getElementById('modalShiftsList');

    const openDayModal = (year, month, day, mode = 'closure') => {
        window.currentDayModalMode = mode;
        const targetDate = new Date(year, month, day);
        
        const modalShiftsSection = document.getElementById('modalShiftsSection');
        const modalRevenueSection = document.getElementById('modalRevenueSection');
        
        if (mode === 'expenses') {
            if (modalShiftsSection) modalShiftsSection.classList.add('hidden');
            if (modalRevenueSection) modalRevenueSection.classList.add('hidden');
            saveModalDayBtn.textContent = 'Αποθήκευση Εξόδων';
        } else {
            if (modalShiftsSection) modalShiftsSection.classList.remove('hidden');
            if (modalRevenueSection) modalRevenueSection.classList.remove('hidden');
            saveModalDayBtn.textContent = 'Αποθήκευση Ημέρας';
        }

        // Διαμόρφωση ημερομηνίας
        const dateStr = targetDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        modalDateDisplay.textContent = dateStr;
        
        // --- Υπολογισμός Βαρδιών Ημέρας ---
        const dayOfWeek = targetDate.getDay(); // 0=Κυρ, 1=Δευ, ... 6=Σαβ
        modalShiftsList.innerHTML = '';
        let workingEmployeesCount = 0;

        const pad = (num) => String(num).padStart(2, '0');
        const targetDateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
        const savedRecord = currentMonthlyRecords.find(r => r.date && r.date.startsWith(targetDateStr));
        let savedEmployees = [];
        if (savedRecord) {
            try { savedEmployees = typeof savedRecord.worked_employees === 'string' ? JSON.parse(savedRecord.worked_employees) : (savedRecord.worked_employees || []); } catch(e){}
        }
        
        const updateModalStaffTotal = () => {
            let currentTotal = 0;
            modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
                const rate = parseFloat(li.dataset.empRate) || 0;
                const hours = parseFloat(li.querySelector('.modal-emp-hours').value) || 0;
                const cost = rate * hours;
                li.querySelector('.emp-total-cost').textContent = formatCurrency(cost);
                currentTotal += cost;
            });
            const totalSpan = modalShiftsList.querySelector('.modal-staff-total-val');
            if (totalSpan) totalSpan.textContent = formatCurrency(currentTotal);
        };

        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        employeeRows.forEach(row => {
            const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeek}"]`);
            if (checkbox && checkbox.checked) {
                const name = row.querySelector('.name-input').value.trim() || 'Άγνωστος';
                const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
                
                const dayWrapper = row.querySelector(`.day-wrapper[data-day="${dayOfWeek}"]`);
                const hours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
                const defaultShift = dayWrapper ? dayWrapper.querySelector('.shift-input-day').value : 'morning';

                const wage = rate * hours;
                workingEmployeesCount++;

                const li = document.createElement('li');
                li.className = 'flex flex-col gap-2 py-2 border-b border-gray-100 last:border-0';
                li.dataset.empName = name;
                li.dataset.empRate = rate;
                li.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-800">${name} <span class="text-xs font-normal text-gray-500">(${formatCurrency(rate)}/ώ)</span></span>
                        <span class="font-bold emp-total-cost text-gray-900">${formatCurrency(wage)}</span>
                    </div>
                    <div class="flex gap-2 items-center">
                        <input type="number" class="modal-emp-hours w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary outline-none" value="${hours}" step="0.5" min="0" title="Ώρες εργασίας">
                        <select class="modal-emp-shift flex-grow px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary outline-none bg-white">
                            <option value="morning" ${defaultShift === 'morning' ? 'selected' : ''}>☀️ Πρωί</option>
                            <option value="night" ${defaultShift === 'night' ? 'selected' : ''}>🌙 Βράδυ</option>
                            <option value="split" ${defaultShift === 'split' ? 'selected' : ''}>⚡ Σπαστό</option>
                        </select>
                    </div>`;
                li.querySelector('.modal-emp-hours').addEventListener('input', updateModalStaffTotal);
                modalShiftsList.appendChild(li);
            }
        });

        if (workingEmployeesCount === 0) {
            modalShiftsList.innerHTML = '<li class="italic text-gray-400 py-1">Κανένας εργαζόμενος.</li>';
        } else {
            const totalLi = document.createElement('li');
            totalLi.className = 'flex justify-between items-center py-2 font-bold text-gray-800 mt-1 pt-1 border-t border-gray-300';
            totalLi.innerHTML = `<span>Σύνολο Κόστους Προσωπικού:</span><span class="modal-staff-total-val text-primary">0,00 €</span>`;
            modalShiftsList.appendChild(totalLi);
            updateModalStaffTotal();
        }

        // Φόρτωση εξόδων και ταμείου αν υπάρχει ήδη αποθηκευμένη μέρα
        if (savedRecord) {
            try { 
                currentModalExpenses = typeof savedRecord.detailed_expenses === 'string' ? JSON.parse(savedRecord.detailed_expenses) : (savedRecord.detailed_expenses || []); 
            } catch(e) {
                currentModalExpenses = [];
            }
            posTotal.value = savedRecord.pos_revenue || '';
            drawerCash.value = savedRecord.cash_revenue || '';
            zReceipt.value = savedRecord.daily_revenue || '';
        } else {
            currentModalExpenses = [];
            posTotal.value = '';
            drawerCash.value = '';
            zReceipt.value = '';
        }
        
        updateModalExpensesUI();
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
        
        // Υπολογισμός και εμφάνιση ΜΟΝΟ των Αγαθών (Πρώτων Υλών)
        const fc = parseFloat(record.food_cost_percentage) || 0;
        const rev = parseFloat(record.daily_revenue) || 0;
        const originalMaterials = (fc * rev) / 100;
        
        editModalExpenses.value = originalMaterials.toFixed(2);
        window.currentEditTotalExpenses = record.total_expenses;
        window.currentEditOriginalMaterials = originalMaterials;

        // Δυναμική δημιουργία λίστας εργαζομένων
        editModalEmployeesList.innerHTML = '';
        const employeeRows = employeeListEl.querySelectorAll('.employee-row');
        
        let workedEmployees = [];
        try {
            workedEmployees = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || [];
        } catch(e) {
            workedEmployees = [];
        }
        window.currentEditRecordWorkedEmployees = workedEmployees;

        let addedEmployees = 0;
        employeeRows.forEach((row) => {
            const name = row.querySelector('.name-input').value.trim();
            if (!name) return; // Παράλειψη κενών
            
            addedEmployees++;
            const isChecked = workedEmployees.some(emp => (typeof emp === 'string' ? emp : emp.staff_id) === name) ? 'checked' : '';
            
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
        const newMaterials = parseFloat(editModalExpenses.value) || 0;

        if (isNaN(newRevenue) || isNaN(newMaterials) || newRevenue < 0 || newMaterials < 0) {
            alert('Παρακαλώ εισάγετε έγκυρους αριθμούς.');
            return;
        }

        let newFoodCost = 0;
        if (newRevenue > 0) {
            newFoodCost = (newMaterials / newRevenue) * 100;
        }
        
        // Διατήρηση και ενημέρωση των συνολικών εξόδων
        const materialsDiff = newMaterials - (window.currentEditOriginalMaterials || 0);
        const newTotalExpenses = (parseFloat(window.currentEditTotalExpenses) || 0) + materialsDiff;

        // Συλλογή τικαρισμένων εργαζομένων
        const checkboxes = editModalEmployeesList.querySelectorAll('.edit-employee-checkbox:checked');
        const workedEmployees = Array.from(checkboxes).map(cb => {
            const name = cb.value;
            const existing = (window.currentEditRecordWorkedEmployees || []).find(emp => (typeof emp === 'string' ? emp : emp.staff_id) === name);
            if (existing && typeof existing === 'object') {
                return existing;
            } else {
                return { staff_id: name, hours_worked: 8, shift_type: 'morning', total_cost: 0, time_slots: [] };
            }
        });

        try {
            const response = await apiUpdateDailyRecord(currentEditRecordId, {
                    date: currentEditRecordDate,
                    daily_revenue: newRevenue,
                    cash_revenue: cashRev,
                    pos_revenue: posRev,
                    total_expenses: newTotalExpenses,
                    food_cost_percentage: newFoodCost,
                    worked_employees: workedEmployees
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
            const response = await apiDeleteDailyRecord(id);
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
        const amountStr = expenseAmountInput.value.replace(',', '.');
        const amount = parseFloat(amountStr);
        const category = expenseCategoryInput.value;
        const paidFromDrawer = modalExpensePaidFromDrawer ? modalExpensePaidFromDrawer.checked : true;

        if (desc && amount > 0) {
            currentModalExpenses.push({ desc, category, amount, paidFromDrawer });
            expenseDescInput.value = '';
            expenseAmountInput.value = '';
            if (modalExpensePaidFromDrawer) modalExpensePaidFromDrawer.checked = true;
            updateModalExpensesUI();
        } else {
            alert('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).');
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
        const amountStr = dashExpenseAmount.value.replace(',', '.');
        const amount = parseFloat(amountStr);
        const category = dashExpenseCategory.value;
        const paidFromDrawer = dashExpensePaidFromDrawer ? dashExpensePaidFromDrawer.checked : true;

        if (desc && amount > 0) {
            currentDashboardExpenses.push({ desc, category, amount, paidFromDrawer });
            dashExpenseDesc.value = '';
            dashExpenseAmount.value = '';
            if (dashExpensePaidFromDrawer) dashExpensePaidFromDrawer.checked = true;
            updateDashExpensesUI();
        } else {
            alert('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).');
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
        
        // Επιτρέπουμε μηδενικό τζίρο μόνο αν ο χρήστης βρίσκεται στο "Προσθήκη Εξόδων"
        if (window.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
            alert('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.');
            return;
        }

        const fcPercentage = officialRevenue > 0 ? (agathoExpenses / officialRevenue) * 100 : 0;

        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const workedEmployees = [];
        
        modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
            const name = li.dataset.empName;
            const hours = parseFloat(li.querySelector('.modal-emp-hours').value) || 0;
            const shiftType = li.querySelector('.modal-emp-shift').value;
            const totalCost = parseFloat(li.querySelector('.emp-total-cost').textContent.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;
            
            const timeSlots = [];
            li.querySelectorAll('.time-slot-btn.bg-primary').forEach(btn => {
                timeSlots.push(parseInt(btn.dataset.hour));
            });

            if (hours > 0) {
                workedEmployees.push({
                    staff_id: name,
                    hours_worked: hours,
                    shift_type: shiftType,
                    total_cost: totalCost,
                    time_slots: timeSlots
                });
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

        const existingRecord = currentMonthlyRecords.find(r => r.date && r.date.startsWith(dateStr));
        const isEdit = !!existingRecord;
        const url = isEdit ? `/api/daily-records/${existingRecord.id}` : '/api/daily-records';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            saveModalDayBtn.disabled = true;
            saveModalDayBtn.textContent = 'Αποθήκευση...';

            const response = isEdit ? await apiUpdateDailyRecord(existingRecord.id, payload) : await apiSaveDailyRecord(payload);

            if (response.ok) {
                saveModalDayBtn.classList.replace('bg-primary', 'bg-green-600');
                saveModalDayBtn.textContent = 'Επιτυχία!';
                
                fetchDashboardData(); 
                
                setTimeout(() => {
                    saveModalDayBtn.classList.replace('bg-green-600', 'bg-primary');
                    saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Αποθήκευση Ημέρας';
                    saveModalDayBtn.disabled = false;
                    closeDayModal();
                }, 1500);

            } else {
                alert('Προέκυψε σφάλμα κατά την αποθήκευση.');
                saveModalDayBtn.disabled = false;
                saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Αποθήκευση Ημέρας';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Αδυναμία σύνδεσης με τον server.');
            saveModalDayBtn.disabled = false;
            saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Αποθήκευση Ημέρας';
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
        // 1. Υπολογισμός Κυλιόμενου Food Cost (Μήνα/Εβδομάδας)
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
        // Ταμειακή Συμφωνία
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
         
        // Υπολογισμός Κυλιόμενου Μέσου Όρου (Rolling Average)
        let cumulativeRev = 0;
        let cumulativeAgatho = 0;
        
        currentMonthlyRecords.forEach(r => {
            const rev = parseFloat(r.daily_revenue) || 0;
            cumulativeRev += rev;
            
            let dailyAgatho = 0;
            try {
                const expenses = typeof r.detailed_expenses === 'string' ? JSON.parse(r.detailed_expenses) : (r.detailed_expenses || []);
                expenses.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'ylika' || exp.category === 'materials') {
                        dailyAgatho += parseFloat(exp.amount) || 0;
                    }
                });
            } catch(e) {
                const fc = parseFloat(r.food_cost_percentage) || 0;
                dailyAgatho = (fc * rev) / 100;
            }
            cumulativeAgatho += dailyAgatho;
        });
        
        // Έλεγχος αν η σημερινή μέρα έχει ήδη αποθηκευτεί
        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const existingRecord = currentMonthlyRecords.find(r => r.date && r.date.startsWith(dateStr));
        
        if (!existingRecord) {
            // Προσθήκη σημερινών (μη αποθηκευμένων) στη σούμα
            cumulativeRev += officialRevenue;
            cumulativeAgatho += materials;
        } else {
            // Αν επεξεργαζόμαστε υπάρχουσα μέρα, αφαιρούμε τα παλιά της και βάζουμε τα νέα
            const oldRev = parseFloat(existingRecord.daily_revenue) || 0;
            let oldAgatho = 0;
            try {
                const oldExpenses = typeof existingRecord.detailed_expenses === 'string' ? JSON.parse(existingRecord.detailed_expenses) : (existingRecord.detailed_expenses || []);
                oldExpenses.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'ylika' || exp.category === 'materials') {
                        oldAgatho += parseFloat(exp.amount) || 0;
                    }
                });
            } catch(e) {
                const oldFc = parseFloat(existingRecord.food_cost_percentage) || 0;
                oldAgatho = (oldFc * oldRev) / 100;
            }
            cumulativeRev = cumulativeRev - oldRev + officialRevenue;
            cumulativeAgatho = cumulativeAgatho - oldAgatho + materials;
        }

        if (cumulativeRev > 0) {
            foodCostPercentage = (cumulativeAgatho / cumulativeRev) * 100;
            
            foodCostDisplayEl.textContent = foodCostPercentage.toFixed(1) + '%';
            foodCostDisplayEl.className = 'text-2xl font-bold'; // Επαναφορά κλάσεων

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
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            let empWeeklyWage = 0;
            
            row.querySelectorAll('.day-checkbox:checked').forEach(cb => {
                const dayWrapper = row.querySelector(`.day-wrapper[data-day="${cb.dataset.day}"]`);
                const dayHours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
                empWeeklyWage += rate * dayHours;
            });
            totalPersonnelWeekly += empWeeklyWage;
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

        // Υπολογισμός Νεκρού Σημείου Ημέρας
        let dailyBreakEven = 0;
        if (grossMargin > 0) {
            dailyBreakEven = (dailyFixedCost + dailyStaffCost) / grossMargin;
        }
        if (dailyBreakEvenPointEl) {
            dailyBreakEvenPointEl.innerHTML = formatCurrency(isFinite(dailyBreakEven) && dailyBreakEven > 0 ? dailyBreakEven : 0);
        }

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
    [posRevenueEl, cashRevenueEl, actualCashEl].forEach(el => {
        el.addEventListener('input', updateCalculations);
    });

    // Ενημέρωση των υπολογισμών κατά την πληκτρολόγηση παγίων (χωρίς αποθήκευση)
    monthlyFixedCostsEl.addEventListener('input', updateCalculations);

    // Διαχείριση Κουμπιού Παγίων Εξόδων
    if (editFixedCostsBtn) {
        editFixedCostsBtn.addEventListener('click', () => {
            if (monthlyFixedCostsEl.disabled) {
                // Ξεκλείδωμα για επεξεργασία
                monthlyFixedCostsEl.disabled = false;
                monthlyFixedCostsEl.focus();
                editFixedCostsBtn.textContent = 'Αποθήκευση';
                editFixedCostsBtn.className = 'flex-1 sm:flex-none text-center bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
            } else {
                // Αποθήκευση και κλείδωμα
                localStorage.setItem('merokamataki_fixed_costs', monthlyFixedCostsEl.value);
                monthlyFixedCostsEl.disabled = true;
                editFixedCostsBtn.textContent = 'Επεξεργασία';
                editFixedCostsBtn.className = 'flex-1 sm:flex-none text-center bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
                updateCalculations();
            }
        });
    }

    [posTotal, drawerCash, zReceipt].forEach(el => {
        el.addEventListener('input', updateModalDrawerStatus);
    });

    // --- Διαχείριση Προσωπικού (Δυναμική Λίστα) ---
    const createEmployeeRow = () => {
        const div = document.createElement('div');
        div.className = 'flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg employee-row transition-all';
        
        const daysArr = [
            { id: 1, label: 'Δε', title: 'Δευτέρα' },
            { id: 2, label: 'Τρ', title: 'Τρίτη' },
            { id: 3, label: 'Τε', title: 'Τετάρτη' },
            { id: 4, label: 'Πε', title: 'Πέμπτη' },
            { id: 5, label: 'Πα', title: 'Παρασκευή' },
            { id: 6, label: 'Σα', title: 'Σάββατο' },
            { id: 0, label: 'Κυ', title: 'Κυριακή' }
        ];

        let daysHtml = '<div class="flex justify-between items-end w-full text-xs font-medium text-gray-600 mt-2 px-1">';
        let allSlotsPanels = '';

        daysArr.forEach(d => {
            let sHtml = `<div class="time-slots-panel-day hidden grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 mt-2 p-2 bg-white rounded border border-gray-200 w-full" data-day="${d.id}">`;
            for (let i = 0; i < 24; i++) {
                sHtml += `<button type="button" data-hour="${i}" class="time-slot-btn-day text-xs py-1 border rounded transition-colors bg-white text-gray-600 border-gray-300 hover:bg-gray-50">${String(i).padStart(2,'0')}:00</button>`;
            }
            sHtml += '</div>';
            allSlotsPanels += sHtml;

            daysHtml += `
                <div class="flex flex-col items-center gap-1 day-wrapper" data-day="${d.id}">
                    <div class="flex justify-center items-center gap-1 w-full">
                        <select class="shift-input-day text-[12px] p-0.5 border border-gray-300 rounded bg-white outline-none focus:ring-primary text-center cursor-pointer w-7 h-6" title="Βάρδια">
                            <option value="morning">☀️</option>
                            <option value="night">🌙</option>
                            <option value="split">⚡</option>
                        </select>
                        <button type="button" class="toggle-slots-btn-day text-[10px] text-gray-500 hover:text-primary bg-gray-200 hover:bg-gray-300 rounded px-1.5 py-0.5 transition-colors h-6" title="24ωρο Ωράριο">🕒</button>
                    </div>
                    <input type="number" class="hours-input-day w-10 text-[10px] p-0.5 border border-gray-300 rounded text-center outline-none focus:ring-primary" min="0" step="0.5" value="8" title="Ώρες εργασίας ημέρας">
                    <label class="flex flex-col items-center gap-0.5 cursor-pointer hover:text-primary">
                        <span title="${d.title}">${d.label}</span>
                        <input type="checkbox" class="day-checkbox w-3.5 h-3.5 text-primary rounded border-gray-300 focus:ring-primary" data-day="${d.id}">
                    </label>
                </div>
            `;
        });
        daysHtml += '</div>';

        div.innerHTML = `
            <!-- ΠΡΟΒΟΛΗ (Όταν αποθηκευτεί) -->
            <div class="view-mode hidden flex justify-between items-center w-full cursor-pointer hover:bg-gray-200 p-2 rounded transition-colors border border-transparent hover:border-gray-300">
                <div class="flex items-center gap-2">
                    <span class="text-xl">👤</span>
                    <span class="font-bold text-gray-800 display-name text-lg"></span>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">✏️ Επεξεργασία</span>
            </div>
            <!-- ΕΠΕΞΕΡΓΑΣΙΑ -->
            <div class="edit-mode flex flex-col gap-2 w-full">
                <div class="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
                    <input type="text" placeholder="Όνομα" class="flex-grow px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none name-input">
                    <input type="number" placeholder="Ωρομίσθιο (€)" class="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none rate-input" min="0" step="0.01">
                    <button type="button" class="save-emp-btn text-sm bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1.5 px-3 rounded transition-colors ml-auto shadow-sm">Αποθήκευση</button>
                    <button type="button" class="text-red-500 hover:text-red-700 p-1 delete-btn font-bold text-xl leading-none">&times;</button>
                </div>
                ${daysHtml}
                <div class="w-full slots-container">
                    ${allSlotsPanels}
                </div>
            </div>
        `;

        const editMode = div.querySelector('.edit-mode');
        const viewMode = div.querySelector('.view-mode');
        const displayName = div.querySelector('.display-name');
        const nameInput = div.querySelector('.name-input');
        const saveEmpBtn = div.querySelector('.save-emp-btn');

        // Λογική Κουμπιού Αποθήκευσης/Επεξεργασίας
        saveEmpBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) {
                alert('Παρακαλώ εισάγετε όνομα εργαζόμενου.');
                return;
            }
            displayName.textContent = name;
            editMode.classList.add('hidden');
            viewMode.classList.remove('hidden');
            
            updateCalculations();
            renderCalendar();
            saveEmployeesToServer(); // Αποθήκευση στη Βάση Δεδομένων!
        });

        viewMode.addEventListener('click', () => {
            viewMode.classList.add('hidden');
            editMode.classList.remove('hidden');
        });

        // Προσθήκη listeners στα νέα inputs ΚΑΙ selects (για τη βάρδια)
        div.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('input', () => {
                updateCalculations();
                if (element.classList.contains('day-checkbox') || element.classList.contains('name-input') || element.classList.contains('shift-input-day') || element.classList.contains('hours-input-day')) {
                    renderCalendar();
                }
            });
        });

        div.querySelectorAll('.toggle-slots-btn-day').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.currentTarget.closest('.day-wrapper').dataset.day;
                const panel = div.querySelector(`.time-slots-panel-day[data-day="${day}"]`);
                if (panel) {
                    panel.classList.toggle('hidden');
                    div.querySelectorAll('.time-slots-panel-day').forEach(p => {
                        if (p !== panel) p.classList.add('hidden');
                    });
                }
            });
        });
        
        div.querySelectorAll('.time-slot-btn-day').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isSelected = e.target.classList.contains('bg-primary');
                if (isSelected) {
                    e.target.className = 'time-slot-btn-day text-xs py-1 border rounded transition-colors bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
                } else {
                    e.target.className = 'time-slot-btn-day text-xs py-1 border rounded transition-colors bg-primary text-white border-primary';
                }
                
                const day = e.target.closest('.time-slots-panel-day').dataset.day;
                const panel = div.querySelector(`.time-slots-panel-day[data-day="${day}"]`);
                const selectedCount = panel.querySelectorAll('.time-slot-btn-day.bg-primary').length;
                
                const hoursInputDay = div.querySelector(`.day-wrapper[data-day="${day}"] .hours-input-day`);
                if (hoursInputDay) {
                    hoursInputDay.value = selectedCount;
                }
                
                updateCalculations();
                renderCalendar();
            });
        });

        // Διαγραφή εργαζόμενου
        div.querySelector('.delete-btn').addEventListener('click', () => {
            div.remove();
            updateCalculations();
            renderCalendar();
            saveEmployeesToServer(); // Διαγραφή από τη Βάση Δεδομένων!
        });

        return div;
    };

    // Καθαρίζουμε το HTML (κρυμμένο by default - εμφανίζεται μόνο με προσθήκη)
    employeeListEl.innerHTML = '';

    addEmployeeBtn.addEventListener('click', () => {
        employeeListEl.prepend(createEmployeeRow());
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
                if (name) {
                    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
                    
                    const dayWrapper = row.querySelector(`.day-wrapper[data-day="${dayOfWeek}"]`);
                    const fallbackHours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
                    const shiftType = dayWrapper ? dayWrapper.querySelector('.shift-input-day').value : 'morning';

                    const panel = row.querySelector(`.time-slots-panel-day[data-day="${dayOfWeek}"]`);
                    const timeSlots = [];
                    if (panel) {
                        panel.querySelectorAll('.time-slot-btn-day.bg-primary').forEach(btn => timeSlots.push(parseInt(btn.dataset.hour)));
                    }
                    
                    const hours = timeSlots.length > 0 ? timeSlots.length : fallbackHours;

                    workedEmployees.push({
                        staff_id: name,
                        hours_worked: hours,
                        shift_type: shiftType,
                        total_cost: rate * hours,
                        time_slots: timeSlots
                    });
                }
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

            const response = await apiSaveDailyRecord(payload);

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

    // --- PWA / Service Worker Εγκατάσταση ---
    let deferredPrompt;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered!', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        // Ακύρωση της προεπιλεγμένης συμπεριφοράς (αυτόματη εμφάνιση)
        e.preventDefault();
        // Αποθήκευση του event για να το καλέσουμε αργότερα
        deferredPrompt = e;
        // Εμφάνιση του κουμπιού εγκατάστασης
        if (installAppBtn) installAppBtn.classList.remove('hidden');
    });

    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // Εμφάνιση του prompt εγκατάστασης στον χρήστη
            deferredPrompt.prompt();
            // Αναμονή για την επιλογή του χρήστη
            const { outcome } = await deferredPrompt.userChoice;
            // Καθαρισμός του prompt και απόκρυψη του κουμπιού
            deferredPrompt = null;
            installAppBtn.classList.add('hidden');
        });
    }

    // Εκκίνηση Εφαρμογής - Έλεγχος Auth αντί για άμεσο φόρτωμα
    checkAuth();
});