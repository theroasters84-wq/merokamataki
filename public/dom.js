import { appState } from './state.js';
import { formatCurrency, formatTimeSlots } from './utils.js';

// --- Auth DOM Στοιχεία ---
export const installAppBtn = document.getElementById('installAppBtn');
export const logoutBtn = document.getElementById('logoutBtn');
export const helpBtn = document.getElementById('helpBtn');
export const helpModal = document.getElementById('helpModal');
export const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');
export const closeHelpModalBtnBottom = document.getElementById('closeHelpModalBtnBottom');

// --- Επιλογή Στοιχείων DOM ---
export const recordDateEl = document.getElementById('recordDate');
export const posRevenueEl = document.getElementById('posRevenue');
export const cashRevenueEl = document.getElementById('cashRevenue');
export const actualCashEl = document.getElementById('actualCash');
export const drawerStatusEl = document.getElementById('drawerStatus');
export const foodCostDisplayEl = document.getElementById('foodCostDisplay');
export const saveDailyBtn = document.getElementById('saveDailyBtn');
export const dashCashierName = document.getElementById('dashCashierName');

// Νέα DOM στοιχεία εξόδων για το Κεντρικό Dashboard
export const dashExpenseDesc = document.getElementById('dashExpenseDesc');
export const dashExpenseCategory = document.getElementById('dashExpenseCategory');
export const dashExpenseAmount = document.getElementById('dashExpenseAmount');
export const dashExpensePaidFromDrawer = document.getElementById('dashExpensePaidFromDrawer');
export const addDashExpenseBtn = document.getElementById('addDashExpenseBtn');
export const dashExpensesList = document.getElementById('dashExpensesList');
export const dashTotalExpensesDisplay = document.getElementById('dashTotalExpensesDisplay');

export const employeeListEl = document.getElementById('employeeList');
export const addEmployeeBtn = document.getElementById('addEmployeeBtn');

export const totalWeeklyCostEl = document.getElementById('totalWeeklyCost');
export const breakEvenPointEl = document.getElementById('breakEvenPoint');

export const dailyOperatingCostEl = document.getElementById('dailyOperatingCost');
export const dailyBreakEvenPointEl = document.getElementById('dailyBreakEvenPoint');
export const dailyNetProfitEl = document.getElementById('dailyNetProfit');

// --- Ημερολόγιο & Modal DOM ---
export const calendarGrid = document.getElementById('calendarGrid');
export const currentMonthDisplay = document.getElementById('currentMonthDisplay');
export const prevMonthBtn = document.getElementById('prevMonthBtn');
export const nextMonthBtn = document.getElementById('nextMonthBtn');

export const dayActionModal = document.getElementById('dayActionModal');
export const actionExpensesBtn = document.getElementById('actionExpensesBtn');
export const actionClosureBtn = document.getElementById('actionClosureBtn');
export const closeDayActionModalBtn = document.getElementById('closeDayActionModalBtn');

export const dayModal = document.getElementById('dayModal');
export const modalDateDisplay = document.getElementById('modalDateDisplay');
export const closeModalBtn = document.getElementById('closeModalBtn');

// --- Tabs & Monthly Report DOM ---
export const tabDashboard = document.getElementById('tabDashboard');
export const tabMonthlyReport = document.getElementById('tabMonthlyReport');
export const dashboardView = document.getElementById('dashboardView');
export const monthlyReportView = document.getElementById('monthlyReportView');

export const reportMonthDisplay = document.getElementById('reportMonthDisplay');
export const reportTotalRevenue = document.getElementById('reportTotalRevenue');
export const reportTotalExpenses = document.getElementById('reportTotalExpenses');
export const reportAverageFoodCost = document.getElementById('reportAverageFoodCost');
export const reportFixedCosts = document.getElementById('reportFixedCosts');
export const reportNetProfit = document.getElementById('reportNetProfit');
export const fetchReportBtn = document.getElementById('fetchReportBtn');
export const closeMonthBtn = document.getElementById('closeMonthBtn');
export const reopenMonthBtn = document.getElementById('reopenMonthBtn');
export const closeMonthOptions = document.getElementById('closeMonthOptions');
export const closeMonthDesc = document.getElementById('closeMonthDesc');

export const monthlyRecordsList = document.getElementById('monthlyRecordsList');
export const clearDataCheckbox = document.getElementById('clearDataCheckbox');

export const editRecordModal = document.getElementById('editRecordModal');
export const editModalDateDisplay = document.getElementById('editModalDateDisplay');
export const editModalPosRevenue = document.getElementById('editModalPosRevenue');
export const editModalCashRevenue = document.getElementById('editModalCashRevenue');
export const editModalEmployeesList = document.getElementById('editModalEmployeesList');
export const closeEditModalBtn = document.getElementById('closeEditModalBtn');
export const closeEditModalIconBtn = document.getElementById('closeEditModalIconBtn');
export const saveEditModalBtn = document.getElementById('saveEditModalBtn');
export const editModalCashierName = document.getElementById('editModalCashierName');

// Νέα DOM στοιχεία εξόδων για το Quick Edit Modal
export const editExpenseDescInput = document.getElementById('editExpenseDescInput');
export const editExpenseCategoryInput = document.getElementById('editExpenseCategoryInput');
export const editExpenseAmountInput = document.getElementById('editExpenseAmountInput');
export const editExpensePaidFromDrawer = document.getElementById('editExpensePaidFromDrawer');
export const addEditExpenseBtn = document.getElementById('addEditExpenseBtn');
export const editModalExpensesList = document.getElementById('editModalExpensesList');
export const editModalTotalExpensesDisplay = document.getElementById('editModalTotalExpensesDisplay');

// Νέα DOM στοιχεία του Modal
export const expenseDescInput = document.getElementById('expenseDescInput');
export const expenseCategoryInput = document.getElementById('expenseCategoryInput');
export const expenseAmountInput = document.getElementById('expenseAmountInput');
export const modalExpensePaidFromDrawer = document.getElementById('modalExpensePaidFromDrawer');
export const addExpenseBtn = document.getElementById('addExpenseBtn');
export const modalExpensesList = document.getElementById('modalExpensesList');
export const modalTotalExpensesDisplay = document.getElementById('modalTotalExpensesDisplay');
export const posTotal = document.getElementById('posTotal');
export const drawerCash = document.getElementById('drawerCash');
export const zReceipt = document.getElementById('zReceipt');
export const modalDrawerStatus = document.getElementById('modalDrawerStatus');
export const saveModalDayBtn = document.getElementById('saveModalDayBtn');
export const modalCashierName = document.getElementById('modalCashierName');

export const modalShiftsList = document.getElementById('modalShiftsList');
export const modalShiftsSection = document.getElementById('modalShiftsSection');
export const modalRevenueSection = document.getElementById('modalRevenueSection');

export const foodCostChartCanvas = document.getElementById('foodCostChart');

export const reportNetRevenueDisplay = document.getElementById('reportNetRevenueDisplay');
export const dailyNetRevenueDisplayEl = document.getElementById('dailyNetRevenueDisplay');
export const dailyBurnRateDisplayEl = document.getElementById('dailyBurnRateDisplay');
export const reportForecastProfit = document.getElementById('reportForecastProfit');
export const reportVatProvision = document.getElementById('reportVatProvision');
export const reportIkaProvision = document.getElementById('reportIkaProvision');
export const monthlyChartCanvas = document.getElementById('monthlyChart');

// --- Νέα στοιχεία DOM Ρυθμίσεων ---
export const fixedOverheadsInput = document.getElementById('fixedOverheadsInput');
export const ownerInsuranceInput = document.getElementById('ownerInsuranceInput');
export const vatRateInput = document.getElementById('vatRateInput');
export const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// --- Νέα στοιχεία DOM Γρήγορης Εισαγωγής ---
export const quickImportMonth = document.getElementById('quickImportMonth');
export const quickImportYear = document.getElementById('quickImportYear');
export const quickImportRev = document.getElementById('quickImportRev');
export const quickImportExp = document.getElementById('quickImportExp');
export const quickImportWages = document.getElementById('quickImportWages');
export const quickImportBtn = document.getElementById('quickImportBtn');

// --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος (UI View) ---
export const refreshChartData = (records) => {
    if (!appState.foodCostChart) return;
    
    let cumulativeRev = 0;
    let cumulativeAgatho = 0;
    const labels = [];
    const data = [];

    records.forEach(record => {
        const rev = parseFloat(record.daily_revenue) || 0;
        const netRev = rev / (1 + appState.AVERAGE_VAT_RATE);
        let agatho = 0;
        try {
            const expenses = typeof record.detailed_expenses === 'string' ? JSON.parse(record.detailed_expenses) : (record.detailed_expenses || []);
            if (expenses && expenses.length > 0) {
                expenses.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'materials' || exp.category === 'ylika') {
                        agatho += parseFloat(exp.amount) || 0;
                    }
                });
            } else {
                const fc = parseFloat(record.food_cost_percentage) || 0;
                agatho = (fc * rev) / 100;
            }
        } catch(e) {
            const fc = parseFloat(record.food_cost_percentage) || 0;
            agatho = (fc * rev) / 100;
        }

        cumulativeRev += netRev;
        cumulativeAgatho += agatho;
        
        const dateObj = new Date(record.date);
        labels.push(`${dateObj.getDate()}/${dateObj.getMonth() + 1}`);
        
        const rollingFC = cumulativeRev > 0 ? (cumulativeAgatho / cumulativeRev) * 100 : 0;
        data.push(rollingFC.toFixed(1));
    });

    appState.foodCostChart.data.labels = labels;
    appState.foodCostChart.data.datasets[0].data = data;
    appState.foodCostChart.update();
};

export const renderCalendar = () => {
    calendarGrid.innerHTML = '';
    const year = appState.currentDate.getFullYear();
    const month = appState.currentDate.getMonth();

    const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let emptyDays = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'bg-gray-50 rounded-lg p-2 min-h-[80px] border border-gray-100 opacity-50';
        calendarGrid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'bg-white rounded-lg p-2 min-h-[80px] border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer flex flex-col justify-start overflow-hidden group';
        
        const selectedDate = new Date(recordDateEl.value || new Date());
        if (day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            dayDiv.classList.add('ring-2', 'ring-primary', 'bg-blue-50/30', 'today-cell');
        }

        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const savedRecords = appState.currentMonthlyRecords.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        let employeesHtml = '';
        if (savedRecords.length > 0) {
            let allWorked = [];
            savedRecords.forEach(savedRecord => {
                let worked = [];
                try { worked = typeof savedRecord.worked_employees === 'string' ? JSON.parse(savedRecord.worked_employees) : (savedRecord.worked_employees || []); } catch(e){}
                allWorked = allWorked.concat(worked);
            });
            
            if (allWorked.length > 0) {
                employeesHtml = '<div class="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[100px]">' + 
                    allWorked.map(emp => {
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
        
        dayDiv.addEventListener('click', () => {
            const pad = (num) => String(num).padStart(2, '0');
            recordDateEl.value = `${year}-${pad(month + 1)}-${pad(day)}`;
            renderCalendar(); 
            
            appState.actionModalTarget = { year, month, day };
            if (dayActionModal) dayActionModal.classList.remove('hidden');
        });
        
        calendarGrid.appendChild(dayDiv);
    }

    setTimeout(() => {
        const todayCell = calendarGrid.querySelector('.today-cell');
        if (todayCell) {
            todayCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 100);
};

export const updateModalDrawerStatus = () => {
    let drawerExpenses = 0;
    appState.currentModalExpenses.forEach(exp => {
        if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
    });
    
    let totalWages = 0;
    modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
        const cost = parseFloat(li.querySelector('.emp-total-cost').textContent.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;
        totalWages += cost;
    });
    
    const pos = parseFloat(posTotal.value) || 0;
    const cash = parseFloat(drawerCash.value) || 0;
    const actualTotalRevenue = pos + cash + drawerExpenses + totalWages;
    
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

export const renderMonthlyChart = (records, wageMap) => {
    if (!monthlyChartCanvas) return;

    const container = monthlyChartCanvas.parentElement;
    let emptyMsg = container.querySelector('.empty-chart-msg');

    if (!records || records.length === 0) {
        if (appState.monthlyChart) {
            appState.monthlyChart.destroy();
            appState.monthlyChart = null;
        }
        monthlyChartCanvas.classList.add('hidden');
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-chart-msg absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500 italic rounded-lg border border-dashed border-gray-200 p-4 text-center';
            emptyMsg.innerHTML = '<span class="text-2xl mb-2">📉</span><span>Δεν υπάρχουν αναλυτικά ημερήσια δεδομένα για τη δημιουργία γραφήματος.</span>';
            container.appendChild(emptyMsg);
        }
        emptyMsg.classList.remove('hidden');
        return;
    } else {
        monthlyChartCanvas.classList.remove('hidden');
        if (emptyMsg) emptyMsg.classList.add('hidden');
    }

    // 1. Ομαδοποίηση δεδομένων ανά ημέρα
    const recordsByDate = {};
    [...records].reverse().forEach(record => {
        const dateStr = record.date;
        if (!recordsByDate[dateStr]) {
            recordsByDate[dateStr] = { dateStr: dateStr, totalRev: 0, totalExp: 0, totalWages: 0 };
        }
        const group = recordsByDate[dateStr];
        group.totalRev += parseFloat(record.daily_revenue) || 0;
        group.totalExp += parseFloat(record.total_expenses) || 0;

        let workedData = [];
        try { workedData = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : (record.worked_employees || []); } catch(e) {}
        workedData.forEach(emp => {
            if (typeof emp === 'string') group.totalWages += (wageMap[emp] || 0);
            else group.totalWages += (parseFloat(emp.total_cost) || 0);
        });
    });

    // Ταξινόμηση ημερομηνιών αύξουσα για τον άξονα Χ
    const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(a) - new Date(b));
    
    const labels = [];
    const netRevenues = [];
    const totalExpenses = [];

    sortedDates.forEach(dateStr => {
        const group = recordsByDate[dateStr];
        const dateObj = new Date(group.dateStr);
        labels.push(`${dateObj.getDate()}/${dateObj.getMonth() + 1}`);

        // Υπολογισμός πραγματικών ποσών (Καθαρός Τζίρος & Πραγματικά Έξοδα)
        const netRev = group.totalRev / (1 + appState.AVERAGE_VAT_RATE);
        const totalDailyCost = group.totalExp + group.totalWages;

        netRevenues.push(netRev.toFixed(2));
        totalExpenses.push(totalDailyCost.toFixed(2));
    });

    // 2. Καταστροφή προηγούμενου γραφήματος αν υπάρχει
    if (appState.monthlyChart) {
        appState.monthlyChart.destroy();
    }

    // 3. Render νέου γραφήματος
    const ctx = monthlyChartCanvas.getContext('2d');
    appState.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Καθαρός Τζίρος (€)', data: netRevenues, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgb(16, 185, 129)', borderWidth: 1 },
                { label: 'Συνολικά Έξοδα (€)', data: totalExpenses, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgb(239, 68, 68)', borderWidth: 1 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'top' } } }
    });
};

export const openDayModal = (year, month, day, mode = 'closure') => {
    appState.currentDayModalMode = mode;
    const targetDate = new Date(year, month, day);
    
    if (mode === 'expenses') {
        if (modalShiftsSection) modalShiftsSection.classList.add('hidden');
        if (modalRevenueSection) modalRevenueSection.classList.add('hidden');
        saveModalDayBtn.textContent = 'Αποθήκευση Εξόδων';
    } else {
        if (modalShiftsSection) modalShiftsSection.classList.remove('hidden');
        if (modalRevenueSection) modalRevenueSection.classList.remove('hidden');
        saveModalDayBtn.textContent = 'Κλείσιμο Βάρδιας';
    }

    const dateStr = targetDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    modalDateDisplay.textContent = dateStr;
    
    const dayOfWeek = targetDate.getDay();
    modalShiftsList.innerHTML = '';
    let workingEmployeesCount = 0;

    const pad = (num) => String(num).padStart(2, '0');
    const targetDateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    const savedRecord = appState.currentMonthlyRecords.find(r => r.date && r.date.startsWith(targetDateStr));
    
    const savedRecordsForDay = appState.currentMonthlyRecords.filter(r => r.date && r.date.startsWith(targetDateStr));
    
    let alreadyWorkedEmpNames = [];
    savedRecordsForDay.forEach(record => {
        let worked = [];
        try { worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : (record.worked_employees || []); } catch(e){}
        worked.forEach(emp => {
            const empName = typeof emp === 'string' ? emp : emp.staff_id;
            alreadyWorkedEmpNames.push(empName);
        });
    });
    
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
        
        updateModalDrawerStatus();
    };

    const employeeRows = employeeListEl.querySelectorAll('.employee-row');
    employeeRows.forEach(row => {
        const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeek}"]`);
        if (checkbox && checkbox.checked) {
            const name = row.querySelector('.name-input').value.trim() || 'Άγνωστος';
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            
            const hasAlreadyWorked = alreadyWorkedEmpNames.includes(name);

            const dayWrapper = row.querySelector(`.day-wrapper[data-day="${dayOfWeek}"]`);
            let hours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
            
            if (hasAlreadyWorked) { hours = 0; }

            const defaultShift = dayWrapper ? dayWrapper.querySelector('.shift-input-day').value : 'morning';
            const wage = rate * hours;
            workingEmployeesCount++;

            let alreadyBadge = hasAlreadyWorked ? '<span class="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-2" title="Έχει ήδη χρεωθεί σε προηγούμενο ταμείο της μέρας">Έχει χρεωθεί</span>' : '';

            const li = document.createElement('li');
            li.className = 'flex flex-col gap-2 py-2 border-b border-gray-100 last:border-0';
            li.dataset.empName = name;
            li.dataset.empRate = rate;
            li.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-800">${name} <span class="text-xs font-normal text-gray-500">(${formatCurrency(rate)}/ώ)</span></span>
                    <span class="font-medium text-gray-800">${name} <span class="text-xs font-normal text-gray-500">(${formatCurrency(rate)}/ώ)</span>${alreadyBadge}</span>
                    <span class="font-bold emp-total-cost text-gray-900">${formatCurrency(wage)}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <input type="number" class="modal-emp-hours w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary outline-none" value="${hours}" step="0.5" min="0">
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

    if (savedRecord) {
        try { appState.currentModalExpenses = typeof savedRecord.detailed_expenses === 'string' ? JSON.parse(savedRecord.detailed_expenses) : (savedRecord.detailed_expenses || []); 
        } catch(e) { appState.currentModalExpenses = []; }
        posTotal.value = savedRecord.pos_revenue || '';
        drawerCash.value = savedRecord.cash_revenue || '';
        zReceipt.value = savedRecord.daily_revenue || '';
        if (modalCashierName) modalCashierName.value = savedRecord.cashier_name || '';
    } else {
        appState.currentModalExpenses = [];
        posTotal.value = '';
        drawerCash.value = '';
        zReceipt.value = '';
        if (modalCashierName) modalCashierName.value = '';
    }
    
    updateModalExpensesUI();
    modalDrawerStatus.classList.add('hidden');
    dayModal.classList.remove('hidden');
};

export const closeDayModal = () => {
    dayModal.classList.add('hidden');
};

export const updateModalExpensesUI = () => {
    modalExpensesList.innerHTML = '';
    let total = 0;
    if (appState.currentModalExpenses.length === 0) {
        modalExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
    } else {
        appState.currentModalExpenses.forEach((exp, index) => {
            total += exp.amount;
            let badge = exp.category === 'agatho' ? '<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-2">Αγαθό</span>' : (exp.category === 'logariasmos' ? '<span class="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded ml-2">Λογαριασμός</span>' : '<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-2">Υλικά</span>');
            let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded ml-2">🏦 Εκτός Ταμείου</span>' : '';
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-100';
            li.innerHTML = `
                <div class="flex items-center truncate pr-2">
                    <span class="truncate">${exp.desc}</span>${badge}${paymentBadge}
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

export const updateEditExpensesUI = () => {
    if (!editModalExpensesList) return;
    editModalExpensesList.innerHTML = '';
    let total = 0;
    if (appState.currentEditExpenses.length === 0) {
        editModalExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
    } else {
        appState.currentEditExpenses.forEach((exp, index) => {
            total += exp.amount;
            let badge = exp.category === 'agatho' ? '<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-2">Αγαθό</span>' : (exp.category === 'logariasmos' ? '<span class="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded ml-2">Λογαριασμός</span>' : '<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-2">Υλικά</span>');
            let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded ml-2">🏦 Εκτός Ταμείου</span>' : '';
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-100';
            li.innerHTML = `
                <div class="flex items-center truncate pr-2">
                    <span class="truncate">${exp.desc}</span>${badge}${paymentBadge}
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-semibold">${formatCurrency(exp.amount)}</span>
                    <button type="button" class="text-red-500 hover:text-red-700 font-bold" onclick="removeEditExpense(${index})">&times;</button>
                </div>
            `;
            editModalExpensesList.appendChild(li);
        });
    }
    if (editModalTotalExpensesDisplay) editModalTotalExpensesDisplay.textContent = formatCurrency(total);
};

export const updateDashExpensesUI = () => {
    dashExpensesList.innerHTML = '';
    let total = 0;
    if (appState.currentDashboardExpenses.length === 0) {
        dashExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
    } else {
        appState.currentDashboardExpenses.forEach((exp, index) => {
            total += exp.amount;
            let badge = exp.category === 'agatho' ? '<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-2">Αγαθό</span>' : (exp.category === 'logariasmos' ? '<span class="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded ml-2">Λογαριασμός</span>' : '<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-2">Υλικά</span>');
            let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded ml-2">🏦 Εκτός Ταμείου</span>' : '';
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-50 px-2 py-1 rounded border border-gray-100';
            li.innerHTML = `
                <div class="flex items-center truncate pr-2">
                    <span class="truncate">${exp.desc}</span>${badge}${paymentBadge}
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

export const updateCalculations = () => {
    const posRev = parseFloat(posRevenueEl.value) || 0;
    const cashRev = parseFloat(cashRevenueEl.value) || 0;
    const zReceiptDash = parseFloat(actualCashEl.value) || 0;
    let materials = 0;
    let allDashExpenses = 0;
    let drawerExpenses = 0;
    appState.currentDashboardExpenses.forEach(exp => {
        allDashExpenses += exp.amount;
        if (exp.category === 'agatho' || exp.category === 'ylika') materials += exp.amount;
        if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
    });

    let totalWagesForToday = 0;
    const dateStrForToday = recordDateEl.value || new Date().toISOString().split('T')[0];
    const dayOfWeekForToday = new Date(dateStrForToday).getDay();
    
    employeeListEl.querySelectorAll('.employee-row').forEach(row => {
        const checkbox = row.querySelector(`.day-checkbox[data-day="${dayOfWeekForToday}"]`);
        if (checkbox && checkbox.checked) {
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            const dayWrapper = row.querySelector(`.day-wrapper[data-day="${dayOfWeekForToday}"]`);
            const fallbackHours = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 0;
            const panel = row.querySelector(`.time-slots-panel-day[data-day="${dayOfWeekForToday}"]`);
            let hours = fallbackHours;
            if (panel) {
                const timeSlots = panel.querySelectorAll('.time-slot-btn-day.bg-primary');
                if (timeSlots.length > 0) hours = timeSlots.length;
            }
            totalWagesForToday += rate * hours;
        }
    });

    const actualTotalRevenue = posRev + cashRev + drawerExpenses + totalWagesForToday;
    const officialRevenue = zReceiptDash > 0 ? zReceiptDash : actualTotalRevenue;
    const netRevenue = officialRevenue / (1 + appState.AVERAGE_VAT_RATE);

    if (dailyNetRevenueDisplayEl) dailyNetRevenueDisplayEl.textContent = formatCurrency(netRevenue);

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
     
    let cumulativeRev = 0;
    let cumulativeAgatho = 0;
    
    appState.currentMonthlyRecords.forEach(r => {
        const rev = parseFloat(r.daily_revenue) || 0;
        const netRev = rev / (1 + appState.AVERAGE_VAT_RATE);
        cumulativeRev += netRev;
        let dailyAgatho = 0;
        try {
            const expenses = typeof r.detailed_expenses === 'string' ? JSON.parse(r.detailed_expenses) : (r.detailed_expenses || []);
            if (expenses && expenses.length > 0) {
                expenses.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'materials' || exp.category === 'ylika') {
                        dailyAgatho += parseFloat(exp.amount) || 0;
                    }
                });
            } else {
                const fc = parseFloat(r.food_cost_percentage) || 0;
                dailyAgatho = (fc * rev) / 100;
            }
        } catch(e) {
            const fc = parseFloat(r.food_cost_percentage) || 0;
            dailyAgatho = (fc * rev) / 100;
        }
        cumulativeAgatho += dailyAgatho;
    });
    
    cumulativeRev += netRevenue;
    cumulativeAgatho += materials;

    const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
    const existingRecords = appState.currentMonthlyRecords.filter(r => r.date && r.date.startsWith(dateStr));
    let todaysSavedRev = 0;
    let todaysSavedNetRev = 0;
    existingRecords.forEach(r => { todaysSavedRev += (parseFloat(r.daily_revenue) || 0); todaysSavedNetRev += (parseFloat(r.daily_revenue) || 0) / (1 + appState.AVERAGE_VAT_RATE); });
    const totalTodayRevenue = todaysSavedRev + officialRevenue; // Διατηρείται για άλλα logs
    const netTotalTodayRevenue = todaysSavedNetRev + netRevenue;

    if (cumulativeRev > 0) {
        appState.foodCostPercentage = (cumulativeAgatho / cumulativeRev) * 100;
        foodCostDisplayEl.textContent = appState.foodCostPercentage.toFixed(1) + '%';
        foodCostDisplayEl.className = 'text-2xl font-bold'; 
        if (appState.foodCostPercentage <= 30) foodCostDisplayEl.classList.add('text-green-500');
        else if (appState.foodCostPercentage <= 40) foodCostDisplayEl.classList.add('text-orange-500');
        else foodCostDisplayEl.classList.add('text-red-500');
    } else {
        appState.foodCostPercentage = 0;
        foodCostDisplayEl.textContent = '-%';
        foodCostDisplayEl.className = 'text-2xl font-bold text-gray-400';
    }

    const monthlyFixed = appState.MONTHLY_FIXED_COSTS;
    const weeklyFixed = monthlyFixed / 4.3;
    
    const dailyBurnRate = monthlyFixed / 30;
    if (dailyBurnRateDisplayEl) dailyBurnRateDisplayEl.textContent = formatCurrency(dailyBurnRate);

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

    let averageFoodCostRate = appState.foodCostPercentage > 0 ? (appState.foodCostPercentage / 100) : 0.30;
    if (averageFoodCostRate >= 1) averageFoodCostRate = 0.99;

    const estimatedWeeklyRevenue = netRevenue * 7;
    const weeklyMaterialsEst = estimatedWeeklyRevenue * averageFoodCostRate;
    const totalWeeklyCost = weeklyFixed + totalPersonnelWeekly + weeklyMaterialsEst;
    totalWeeklyCostEl.innerHTML = formatCurrency(totalWeeklyCost);

    let breakEven = 0;
    const grossMargin = 1 - averageFoodCostRate;
    
    if (grossMargin > 0) breakEven = (weeklyFixed + totalPersonnelWeekly) / grossMargin;
    if (breakEven > 0 && isFinite(breakEven)) breakEvenPointEl.innerHTML = formatCurrency(breakEven);
    else breakEvenPointEl.innerHTML = formatCurrency(0);

    const dailyFixedCost = dailyBurnRate;
    const dailyStaffCost = totalPersonnelWeekly / 7;
    const totalDailyCost = dailyFixedCost + dailyStaffCost + allDashExpenses;

    dailyOperatingCostEl.innerHTML = formatCurrency(totalDailyCost);

    let dailyBreakEven = 0;
    if (grossMargin > 0) dailyBreakEven = (dailyFixedCost + dailyStaffCost) / grossMargin;
    if (dailyBreakEvenPointEl) dailyBreakEvenPointEl.innerHTML = formatCurrency(isFinite(dailyBreakEven) && dailyBreakEven > 0 ? dailyBreakEven : 0);

    const dailyProfit = netTotalTodayRevenue - totalDailyCost;
    dailyNetProfitEl.innerHTML = formatCurrency(dailyProfit);
    
    if (dailyProfit > 0) dailyNetProfitEl.className = 'text-2xl font-bold text-green-500';
    else if (dailyProfit < 0) dailyNetProfitEl.className = 'text-2xl font-bold text-red-500';
    else dailyNetProfitEl.className = 'text-2xl font-bold text-gray-900';
};

export const renderMonthlyTable = (records, wageMap) => {
    monthlyRecordsList.innerHTML = '';
    if (!records || records.length === 0) {
        monthlyRecordsList.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500 italic bg-gray-50 border-b border-gray-200"><span class="text-2xl block mb-2">📂</span>Δεν υπάρχουν αναλυτικά ημερήσια ταμεία για αυτόν τον μήνα.<br><span class="text-xs text-gray-400 mt-1 block">Τα νούμερα προέρχονται από αποθηκευμένη Σύνοψη ή Γρήγορη Εισαγωγή.</span></td></tr>';
        return;
    }
    
    const recordsByDate = {};
    [...records].reverse().forEach(record => {
            const dateStr = record.date;
            if (!recordsByDate[dateStr]) {
                recordsByDate[dateStr] = {
                    dateStr: dateStr, records: [], totalRev: 0, totalPos: 0, totalCash: 0, totalExp: 0,
                    totalAgatho: 0, totalYlika: 0, totalLogariasmos: 0, totalWages: 0, workedNames: new Set()
                };
            }
            const group = recordsByDate[dateStr];
            group.records.push(record);
            group.totalRev += parseFloat(record.daily_revenue) || 0;
            group.totalPos += parseFloat(record.pos_revenue) || 0;
            group.totalCash += parseFloat(record.cash_revenue) || 0;
            group.totalExp += parseFloat(record.total_expenses) || 0;
            
            let expensesData = [];
            try { expensesData = typeof record.detailed_expenses === 'string' ? JSON.parse(record.detailed_expenses) : (record.detailed_expenses || []); } catch(e) {}
            if (expensesData && expensesData.length > 0) {
                expensesData.forEach(exp => {
                    if (exp.category === 'agatho' || exp.category === 'materials') group.totalAgatho += parseFloat(exp.amount) || 0;
                    else if (exp.category === 'ylika') group.totalYlika += parseFloat(exp.amount) || 0;
                    else group.totalLogariasmos += parseFloat(exp.amount) || 0;
                });
            } else {
                const fc = parseFloat(record.food_cost_percentage) || 0;
                const rev = parseFloat(record.daily_revenue) || 0;
                group.totalAgatho += (fc * rev) / 100;
            }
            let workedData = [];
            try { workedData = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : (record.worked_employees || []); } catch(e) {}
            workedData.forEach(emp => {
                if (typeof emp === 'string') {
                    group.totalWages += (wageMap[emp] || 0);
                    group.workedNames.add(emp);
                } else {
                    group.totalWages += (parseFloat(emp.total_cost) || 0);
                    group.workedNames.add(emp.staff_id);
                }
            });
        });

        const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(b) - new Date(a));
        sortedDates.forEach(dateStr => {
            const group = recordsByDate[dateStr];
            const dateObj = new Date(group.dateStr);
            const dateFormatted = dateObj.toLocaleDateString('el-GR');
            const netGroupRev = group.totalRev / (1 + appState.AVERAGE_VAT_RATE);
            const fcPercentage = netGroupRev > 0 ? ((group.totalAgatho + group.totalYlika) / netGroupRev) * 100 : 0;
            const fcColor = fcPercentage > 40 ? 'text-red-500' : (fcPercentage <= 30 ? 'text-green-500' : 'text-orange-500');

            let expBreakdown = (group.totalAgatho > 0 || group.totalYlika > 0 || group.totalLogariasmos > 0)
                ? `<br><span class="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onclick="alert('Συνολική Ανάλυση Εξόδων:\\n\\n🍎 Αγαθά: ${formatCurrency(group.totalAgatho)}\\n📦 Υλικά: ${formatCurrency(group.totalYlika)}\\n📄 Λογαριασμοί: ${formatCurrency(group.totalLogariasmos)}')">Αγ: ${formatCurrency(group.totalAgatho)} | Υλ: ${formatCurrency(group.totalYlika)} | Λογ: ${formatCurrency(group.totalLogariasmos)}</span>` : '';

            const workedArray = Array.from(group.workedNames);
            let wagesBreakdown = workedArray.length > 0 
                ? `<br><span class="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onclick="alert('Προσωπικό που εργάστηκε:\\n\\n👤 ${workedArray.join('\\n👤 ')}')">${workedArray.length > 2 ? workedArray.slice(0,2).join(', ') + '...' : workedArray.join(', ')}</span>`
                : `<br><span class="text-[11px] text-gray-400">Κανείς</span>`;

            let shiftDetailsAlert = `Αναλυτικά Ταμεία (${dateFormatted}):\\n\\n`;
            group.records.forEach((rec, idx) => {
                const cashier = (rec.cashier_name || 'Άγνωστος').replace(/'/g, " ");
                shiftDetailsAlert += `Βάρδια ${idx + 1} (${cashier})\\nΤζίρος: ${formatCurrency(parseFloat(rec.daily_revenue) || 0)} (POS: ${formatCurrency(parseFloat(rec.pos_revenue) || 0)} | Μετρ: ${formatCurrency(parseFloat(rec.cash_revenue) || 0)})\\nΈξοδα: ${formatCurrency(parseFloat(rec.total_expenses) || 0)}\\n----------------------\\n`;
            });

            let actionsHtml = `<div class="flex flex-col gap-1">`;
            group.records.forEach((rec, idx) => {
                const cashierShort = (rec.cashier_name || 'Βάρδια '+(idx+1)).substring(0,8);
                actionsHtml += `
                    <div class="flex items-center justify-between gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                        <span class="text-[10px] text-gray-500 font-medium truncate max-w-[45px]" title="${rec.cashier_name || 'Βάρδια '+(idx+1)}">${cashierShort}</span>
                        <div class="flex items-center gap-1 flex-shrink-0">
                            <button onclick="editRecord(${rec.id}, '${rec.date}')" class="text-blue-500 hover:text-blue-700 transition-colors" title="Επεξεργασία">✏️</button>
                            <button onclick="deleteRecord(${rec.id})" class="text-red-500 hover:text-red-700 transition-colors" title="Διαγραφή">❌</button>
                        </div>
                    </div>
                `;
            });
            actionsHtml += `</div>`;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-3 text-sm text-gray-800 align-top">
                    <span class="text-blue-600 hover:text-blue-800 cursor-pointer font-bold underline decoration-blue-300 decoration-2 underline-offset-2" onclick="alert('${shiftDetailsAlert}')">${dateFormatted}</span>
                    ${group.records.length > 1 ? `<br><span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded mt-2 inline-block shadow-sm">${group.records.length} Ταμεία</span>` : ''}
                </td>
                <td class="px-6 py-3 text-sm text-gray-800 align-top">
                    <span class="font-medium">${formatCurrency(group.totalRev)}</span>
                    <br><span class="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onclick="alert('Συνολική Ανάλυση Τζίρου:\\n\\n💳 POS: ${formatCurrency(group.totalPos)}\\n💵 Μετρητά: ${formatCurrency(group.totalCash)}')">POS: ${formatCurrency(group.totalPos)} | Μετρ: ${formatCurrency(group.totalCash)}</span>
                </td>
                <td class="px-6 py-3 text-sm text-gray-800 align-top">
                    <span class="font-medium">${formatCurrency(group.totalExp)}</span>${expBreakdown}
                </td>
                <td class="px-6 py-3 text-sm text-gray-800 align-top">
                    <span class="font-medium">${formatCurrency(group.totalWages)}</span>${wagesBreakdown}
                </td>
                <td class="px-6 py-3 text-sm font-semibold align-top ${fcColor}">${fcPercentage.toFixed(1)}%</td>
                <td class="px-4 py-2 text-sm text-center align-top">${actionsHtml}</td>
            `;
            monthlyRecordsList.appendChild(tr);
        });
};
