import { appState } from './state.js';
import { formatCurrency, formatTimeSlots, showDetailsModal } from './utils.js';

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
export const reportAverageDailyRevenue = document.getElementById('reportAverageDailyRevenue');
export const reportFixedCosts = document.getElementById('reportFixedCosts');
export const reportNetProfit = document.getElementById('reportNetProfit');
export const fetchReportBtn = document.getElementById('fetchReportBtn');
export const closeMonthBtn = document.getElementById('closeMonthBtn');
export const reopenMonthBtn = document.getElementById('reopenMonthBtn');
export const closeMonthOptions = document.getElementById('closeMonthOptions');
export const closeMonthDesc = document.getElementById('closeMonthDesc');

export const monthlyRecordsList = document.getElementById('monthlyRecordsList');
export const monthlyMobileCards = document.getElementById('monthlyMobileCards');
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
        emptyDiv.className = 'bg-slate-50/70 rounded-xl p-1.5 sm:p-2 min-h-[85px] sm:min-h-[100px] border border-slate-100 opacity-50';
        calendarGrid.appendChild(emptyDiv);
    }

    const now = new Date();
    const isCurrentMonthYear = now.getFullYear() === year && now.getMonth() === month;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'bg-white rounded-xl p-1.5 sm:p-2 min-h-[85px] sm:min-h-[100px] border border-slate-200/80 hover:border-primary hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-start overflow-hidden group';
        
        const isToday = isCurrentMonthYear && day === now.getDate();
        const selectedDate = new Date(recordDateEl.value || new Date());
        const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

        if (isSelected) {
            dayDiv.classList.add('ring-2', 'ring-primary', 'bg-blue-50/30', 'today-cell');
        } else if (isToday) {
            dayDiv.classList.add('ring-1', 'ring-blue-400/70', 'bg-blue-50/10');
        }

        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const savedRecords = appState.currentMonthlyRecords.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        let employeesHtml = '';

        if (savedRecords.length > 0) {
            let allWorked = [];
            let dayTotalRev = 0;
            savedRecords.forEach(savedRecord => {
                dayTotalRev += parseFloat(savedRecord.daily_revenue) || 0;
                let worked = [];
                try { worked = typeof savedRecord.worked_employees === 'string' ? JSON.parse(savedRecord.worked_employees) : (savedRecord.worked_employees || []); } catch(e){}
                allWorked = allWorked.concat(worked);
            });
            
            if (allWorked.length > 0) {
                employeesHtml = '<div class="mt-1 flex flex-col gap-1">' +
                    allWorked.map(emp => {
                        if (typeof emp === 'string') return `<span class="text-[10px] md:text-xs bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 leading-tight whitespace-normal break-words" title="${emp}">${emp}</span>`;
                        const name = emp.staff_id || 'Άγνωστος';
                        let emoji = emp.shift_type === 'morning' ? '☀️ ' : (emp.shift_type === 'night' ? '🌙 ' : (emp.shift_type === 'split' ? '⚡ ' : ''));
                        let timeRanges = [];
                        if (emp.time_from && emp.time_to) timeRanges.push(`${emp.time_from}-${emp.time_to}`);
                        if (emp.time_from_2 && emp.time_to_2) timeRanges.push(`${emp.time_from_2}-${emp.time_to_2}`);
                        let slotsStr = timeRanges.length > 0 ? `<br><span class="text-[9px] md:text-[11px] text-gray-500 font-normal tracking-tighter leading-none">${timeRanges.join(', ')}</span>` : (emp.time_slots && emp.time_slots.length > 0 ? `<br><span class="text-[9px] md:text-[11px] text-gray-500 font-normal tracking-tighter leading-none">${formatTimeSlots(emp.time_slots)}</span>` : '');
                        return `<div class="text-[10px] md:text-xs bg-emerald-50 text-emerald-800 rounded-md px-1 sm:px-1.5 py-0.5 border border-emerald-200/80 leading-tight shadow-sm whitespace-normal break-words" title="${name}"><b>${emoji}${name}</b>${slotsStr}</div>`;
                    }).join('') + 
                    '</div>';
            } else {
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                const compactRev = dayTotalRev > 0 ? `<span class="admin-only ${isAdmin ? '' : 'hidden'} ml-0.5">${Math.round(dayTotalRev)}€</span>` : '';
                employeesHtml = `<div class="mt-1 flex flex-col gap-1"><span class="text-[10px] md:text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md px-1 sm:px-1.5 py-0.5 font-semibold leading-tight whitespace-normal break-words">✓ Ταμείο ΟΚ${compactRev}</span></div>`;
            }
        } else {
            const currentDayOfWeek = new Date(year, month, day).getDay();
            const employeeRows = Array.from(employeeListEl.querySelectorAll('.employee-row'));
            const workingEmployees = employeeRows.filter(row => {
                const checkbox = row.querySelector(`.day-checkbox[data-day="${currentDayOfWeek}"]`);
                return checkbox && checkbox.checked;
            }).map(row => {
                const dayWrapper = row.querySelector(`.day-wrapper[data-day="${currentDayOfWeek}"]`);
                const panel = row.querySelector(`.time-range-panel-day[data-day="${currentDayOfWeek}"]`);
                let time_from = '';
                let time_to = '';
                let time_from_2 = '';
                let time_to_2 = '';
                if (panel) {
                    time_from = panel.querySelector('.time-from-day').value;
                    time_to = panel.querySelector('.time-to-day').value;
                    time_from_2 = panel.querySelector('.time-from-day-2').value;
                    time_to_2 = panel.querySelector('.time-to-day-2').value;
                }
                return {
                    name: row.querySelector('.name-input').value.trim(),
                    shift: dayWrapper ? dayWrapper.querySelector('.shift-input-day').value : 'morning',
                    time_from,
                    time_to,
                    time_from_2,
                    time_to_2,
                    time_slots: []
                };
            }).filter(emp => emp.name !== '');
            
            if (workingEmployees.length > 0) {
                employeesHtml = '<div class="mt-1 flex flex-col gap-1 opacity-75" title="Προγραμματισμένο (Μη Αποθηκευμένο)">' +
                    workingEmployees.map(emp => {
                        let emoji = emp.shift === 'morning' ? '☀️ ' : (emp.shift === 'night' ? '🌙 ' : (emp.shift === 'split' ? '⚡ ' : ''));
                        let timeRanges = [];
                        if (emp.time_from && emp.time_to) timeRanges.push(`${emp.time_from}-${emp.time_to}`);
                        if (emp.time_from_2 && emp.time_to_2) timeRanges.push(`${emp.time_from_2}-${emp.time_to_2}`);
                        let slotsStr = timeRanges.length > 0 ? `<br><span class="text-[9px] md:text-[11px] text-gray-500 font-normal tracking-tighter leading-none">${timeRanges.join(', ')}</span>` : (emp.time_slots && emp.time_slots.length > 0 ? `<br><span class="text-[9px] md:text-[11px] text-gray-500 font-normal tracking-tighter leading-none">${formatTimeSlots(emp.time_slots)}</span>` : '');
                        return `<div class="text-[10px] md:text-xs bg-slate-50 text-slate-600 rounded-md px-1 sm:px-1.5 py-0.5 border border-dashed border-slate-300 leading-tight whitespace-normal break-words"><b>${emoji}${emp.name}</b>${slotsStr}</div>`;
                    }).join('') + 
                    '</div>';
            }
        }

        const dayBadgeClass = isToday
            ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm'
            : 'text-xs sm:text-sm font-bold text-slate-700 group-hover:text-primary';

        dayDiv.innerHTML = `
            <div class="flex items-center justify-between gap-0.5">
                <span class="${dayBadgeClass} tabular-nums">${day}</span>
                ${savedRecords.length > 0 ? '<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Καταχωρημένο Ταμείο"></span>' : ''}
            </div>
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
};

export const updateModalDrawerStatus = () => {
    let drawerExpenses = 0;
    appState.currentModalExpenses.forEach(exp => {
        if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
    });
    
    let totalWages = 0;
    modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
        const activeCb = li.querySelector('.modal-emp-active');
        if (activeCb && !activeCb.checked) return;

        const cost = parseFloat(li.querySelector('.emp-total-cost').textContent.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;
        const paidCb = li.querySelector('.modal-emp-paid-from-drawer');
        if (!paidCb || paidCb.checked) {
            totalWages += cost;
        }
    });
    
    const pos = parseFloat(posTotal.value) || 0;
    const cash = parseFloat(drawerCash.value) || 0;
    const actualTotalRevenue = pos + cash + drawerExpenses + totalWages;
    
    if (zReceipt.value !== '') {
        const z = parseFloat(zReceipt.value) || 0;
        const diff = actualTotalRevenue - z;
        
        modalDrawerStatus.classList.remove(
            'hidden',
            'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-orange-100', 'text-orange-800',
            'bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-300',
            'bg-rose-50', 'text-rose-800', 'border-rose-300',
            'bg-amber-50', 'text-amber-800', 'border-amber-300',
            'shadow-sm', 'tabular-nums'
        );
        modalDrawerStatus.classList.add('border', 'shadow-sm', 'tabular-nums');
        if (diff === 0) {
            modalDrawerStatus.textContent = '✓ Ταμείο ΟΚ';
            modalDrawerStatus.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
        } else if (diff < 0) {
            modalDrawerStatus.textContent = `⚠️ Λείπουν ${Math.abs(diff).toFixed(2)} €`;
            modalDrawerStatus.classList.add('bg-rose-50', 'text-rose-800', 'border-rose-300');
        } else {
            modalDrawerStatus.textContent = `ℹ️ Πλεόνασμα ${diff.toFixed(2)} €`;
            modalDrawerStatus.classList.add('bg-amber-50', 'text-amber-800', 'border-amber-300');
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
            recordsByDate[dateStr] = { dateStr: dateStr, totalRev: 0, totalExp: 0, totalWages: 0, workedNames: new Set() };
        }
        const group = recordsByDate[dateStr];
        group.totalRev += parseFloat(record.daily_revenue) || 0;
        group.totalExp += parseFloat(record.total_expenses) || 0;

        let workedData = [];
        try { workedData = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : (record.worked_employees || []); } catch(e) {}
        workedData.forEach(emp => {
            let empId = typeof emp === 'string' ? emp : emp.staff_id;
            let wage = typeof emp === 'string' ? (wageMap[emp] || 0) : (parseFloat(emp.total_cost) || 0);
            
            if (!group.workedNames.has(empId)) {
                group.totalWages += wage;
                group.workedNames.add(empId);
            }
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
            const activeCb = li.querySelector('.modal-emp-active');
            let cost = 0;
            if (activeCb && activeCb.checked) {
                const rate = parseFloat(li.dataset.empRate) || 0;
                const hours = parseFloat(li.querySelector('.modal-emp-hours').value) || 0;
                cost = rate * hours;
            }
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

            let alreadyBadge = hasAlreadyWorked ? '<span class="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md ml-1.5 font-semibold" title="Έχει ήδη χρεωθεί σε προηγούμενο ταμείο της μέρας">Έχει χρεωθεί</span>' : '';

            let timeRanges = [];
            let tFrom = '', tTo = '', tFrom2 = '', tTo2 = '';
            const panel = row.querySelector(`.time-range-panel-day[data-day="${dayOfWeek}"]`);
            if (panel) {
                tFrom = panel.querySelector('.time-from-day').value;
                tTo = panel.querySelector('.time-to-day').value;
                tFrom2 = panel.querySelector('.time-from-day-2').value;
                tTo2 = panel.querySelector('.time-to-day-2').value;
                if (tFrom && tTo) timeRanges.push(`${tFrom}-${tTo}`);
                if (tFrom2 && tTo2) timeRanges.push(`${tFrom2}-${tTo2}`);
            }
            let timeBadges = timeRanges.map(r => `<span class="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md ml-1 font-medium shadow-sm whitespace-nowrap tabular-nums">🕒 ${r}</span>`).join('');

            const li = document.createElement('li');
            li.className = 'flex flex-col gap-2.5 rounded-xl border border-slate-200 p-3 bg-slate-50/60 transition-opacity';
            li.dataset.empName = name;
            li.dataset.empRate = rate;
            li.dataset.timeFrom = tFrom;
            li.dataset.timeTo = tTo;
            li.dataset.timeFrom2 = tFrom2;
            li.dataset.timeTo2 = tTo2;
            li.innerHTML = `
                <div class="flex justify-between items-center gap-2">
                    <label class="flex items-center gap-2.5 cursor-pointer flex-grow min-w-0">
                        <input type="checkbox" class="modal-emp-active w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary flex-shrink-0" ${hours > 0 ? 'checked' : ''}>
                        <span class="font-semibold text-slate-800 flex items-center flex-wrap gap-y-1 min-w-0">${name} <span class="text-xs font-normal text-slate-500 mx-1 tabular-nums">(${formatCurrency(rate)}/ώ)</span>${timeBadges}${alreadyBadge}</span>
                    </label>
                    <span class="font-bold emp-total-cost text-slate-900 whitespace-nowrap flex-shrink-0 tabular-nums text-base">${formatCurrency(wage)}</span>
                </div>
                <div class="flex flex-wrap sm:flex-nowrap gap-2 items-center pl-7">
                    <input type="number" class="modal-emp-hours w-20 px-2.5 py-1.5 text-base sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none tabular-nums ${hours > 0 ? '' : 'opacity-50'}" value="${hours}" step="0.5" min="0" ${hours > 0 ? '' : 'disabled'}>
                    <select class="modal-emp-shift flex-grow px-2.5 py-1.5 text-base sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${hours > 0 ? '' : 'opacity-50'}" ${hours > 0 ? '' : 'disabled'}>
                        <option value="morning" ${defaultShift === 'morning' ? 'selected' : ''}>☀️ Πρωί</option>
                        <option value="night" ${defaultShift === 'night' ? 'selected' : ''}>🌙 Βράδυ</option>
                        <option value="split" ${defaultShift === 'split' ? 'selected' : ''}>⚡ Σπαστό</option>
                    </select>
                    <label class="flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 ${hours > 0 ? '' : 'opacity-50'} modal-emp-paid-drawer-label">
                        <input type="checkbox" class="modal-emp-paid-from-drawer w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" checked title="Πληρώθηκε από το σημερινό ταμείο" ${hours > 0 ? '' : 'disabled'}>
                        <span class="text-xs font-medium text-slate-600 leading-none">Από Ταμείο</span>
                    </label>
                </div>
                <details class="pl-7 mt-0.5 group">
                    <summary class="text-xs font-medium text-blue-600 cursor-pointer select-none py-1">⏱️ Αλλαγή ακριβούς ωραρίου</summary>
                    <div class="flex items-center gap-2 w-full justify-start flex-wrap bg-white p-2.5 mt-1 rounded-xl border border-slate-200 shadow-sm">
                        <div class="flex flex-col items-center">
                            <label class="text-[10px] text-slate-500 font-bold mb-1">Από</label>
                            <input type="time" class="modal-emp-time-from p-1.5 border border-slate-300 rounded-lg focus:ring-primary outline-none bg-slate-50/50 text-slate-700 w-[96px] text-center text-xs font-medium tabular-nums" value="${tFrom}">
                        </div>
                        <span class="text-slate-400 font-bold mt-3">-</span>
                        <div class="flex flex-col items-center">
                            <label class="text-[10px] text-slate-500 font-bold mb-1">Έως</label>
                            <input type="time" class="modal-emp-time-to p-1.5 border border-slate-300 rounded-lg focus:ring-primary outline-none bg-slate-50/50 text-slate-700 w-[96px] text-center text-xs font-medium tabular-nums" value="${tTo}">
                        </div>
                        <div class="w-px h-6 bg-slate-200 mx-1 mt-3 hidden sm:block"></div>
                        <div class="flex flex-col items-center">
                            <label class="text-[10px] text-slate-500 font-bold mb-1">Από (2)</label>
                            <input type="time" class="modal-emp-time-from-2 p-1.5 border border-slate-300 rounded-lg focus:ring-primary outline-none bg-slate-50/50 text-slate-700 w-[96px] text-center text-xs font-medium tabular-nums" value="${tFrom2}">
                        </div>
                        <span class="text-slate-400 font-bold mt-3">-</span>
                        <div class="flex flex-col items-center">
                            <label class="text-[10px] text-slate-500 font-bold mb-1">Έως (2)</label>
                            <input type="time" class="modal-emp-time-to-2 p-1.5 border border-slate-300 rounded-lg focus:ring-primary outline-none bg-slate-50/50 text-slate-700 w-[96px] text-center text-xs font-medium tabular-nums" value="${tTo2}">
                        </div>
                    </div>
                </details>
                `;
            
            const activeCb = li.querySelector('.modal-emp-active');
            const hoursInput = li.querySelector('.modal-emp-hours');
            const shiftSelect = li.querySelector('.modal-emp-shift');
            const paidCb = li.querySelector('.modal-emp-paid-from-drawer');
            const paidLabel = li.querySelector('.modal-emp-paid-drawer-label');

            // Time inputs
            const timeFromInput = li.querySelector('.modal-emp-time-from');
            const timeToInput = li.querySelector('.modal-emp-time-to');
            const timeFrom2Input = li.querySelector('.modal-emp-time-from-2');
            const timeTo2Input = li.querySelector('.modal-emp-time-to-2');

            const handleTimeInputChange = () => {
                const from = timeFromInput.value;
                const to = timeToInput.value;
                const from2 = timeFrom2Input.value;
                const to2 = timeTo2Input.value;
                
                let diff1 = 0;
                let diff2 = 0;
                let detectedShift = shiftSelect.value;

                if (from) {
                    const [fromH] = from.split(':').map(Number);
                    if (fromH >= 5 && fromH < 16) detectedShift = 'morning';
                    else detectedShift = 'night';
                }

                if (from && to) {
                    const [fromH, fromM] = from.split(':').map(Number);
                    const [toH, toM] = to.split(':').map(Number);
                    let fromDec = fromH + fromM / 60;
                    let toDec = toH + toM / 60;
                    if (toDec < fromDec) toDec += 24; 
                    diff1 = toDec - fromDec;
                }

                if (from2 || to2) {
                    detectedShift = 'split';
                }

                if (from2 && to2) {
                    const [fromH, fromM] = from2.split(':').map(Number);
                    const [toH, toM] = to2.split(':').map(Number);
                    let fromDec = fromH + fromM / 60;
                    let toDec = toH + toM / 60;
                    if (toDec < fromDec) toDec += 24; 
                    diff2 = toDec - fromDec;
                }

                shiftSelect.value = detectedShift;
                const totalHours = diff1 + diff2;
                if (totalHours > 0) {
                    hoursInput.value = (Math.round(totalHours * 100) / 100).toString();
                }
                updateModalStaffTotal();
            };

            [timeFromInput, timeToInput, timeFrom2Input, timeTo2Input].forEach(input => {
                input.addEventListener('input', handleTimeInputChange);
            });

            if (hours === 0) li.classList.add('opacity-60');

            activeCb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (parseFloat(hoursInput.value) === 0 && !hasAlreadyWorked) {
                        const dayWrapper = row.querySelector(`.day-wrapper[data-day="${dayOfWeek}"]`);
                        hoursInput.value = dayWrapper ? (parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0) : 8;
                    }
                    hoursInput.disabled = false;
                    shiftSelect.disabled = false;
                    paidCb.disabled = false;
                    hoursInput.classList.remove('opacity-50');
                    shiftSelect.classList.remove('opacity-50');
                    paidLabel.classList.remove('opacity-50');
                    li.classList.remove('opacity-60');
                } else {
                    hoursInput.value = 0;
                    hoursInput.disabled = true;
                    shiftSelect.disabled = true;
                    paidCb.disabled = true;
                    hoursInput.classList.add('opacity-50');
                    shiftSelect.classList.add('opacity-50');
                    paidLabel.classList.add('opacity-50');
                    li.classList.add('opacity-60');
                }
                updateModalStaffTotal();
            });

            hoursInput.addEventListener('input', updateModalStaffTotal);
            paidCb.addEventListener('change', updateModalDrawerStatus);
            modalShiftsList.appendChild(li);
        }
    });

    if (workingEmployeesCount === 0) {
        modalShiftsList.innerHTML = '<li class="italic text-slate-400 py-1">Κανένας εργαζόμενος.</li>';
    } else {
        const totalLi = document.createElement('li');
        totalLi.className = 'flex justify-between items-center py-2.5 px-3 font-bold text-slate-800 mt-1 bg-blue-50/60 rounded-xl border border-blue-100 tabular-nums';
        totalLi.innerHTML = `<span class="text-xs uppercase tracking-wider text-slate-600">Σύνολο Κόστους Προσωπικού:</span><span class="modal-staff-total-val text-primary text-base">0,00 €</span>`;
        modalShiftsList.appendChild(totalLi);
        updateModalStaffTotal();
    }

    appState.currentModalExpenses = [];
    posTotal.value = '';
    drawerCash.value = '';
    zReceipt.value = '';
    if (modalCashierName) modalCashierName.value = '';

    updateModalExpensesUI();    modalDrawerStatus.classList.add('hidden');
    dayModal.classList.remove('hidden');
};

export const closeDayModal = () => {
    dayModal.classList.add('hidden');
};

export const updateModalExpensesUI = () => {
    modalExpensesList.innerHTML = '';
    let total = 0;
    if (appState.currentModalExpenses.length === 0) {
        modalExpensesList.innerHTML = '<li class="italic text-slate-400 text-xs py-1">Κανένα έξοδο.</li>';
    } else {
        appState.currentModalExpenses.forEach((exp, index) => {
            total += exp.amount;
            let badge = exp.category === 'agatho' ? '<span class="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Αγαθό</span>' : (exp.category === 'logariasmos' ? '<span class="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Λογαριασμός</span>' : '<span class="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Υλικά</span>');
            let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">🏦 Εκτός Ταμείου</span>' : '';
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80';
            li.innerHTML = `
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                    <span class="truncate font-medium text-slate-700">${exp.desc}</span>${badge}${paymentBadge}
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-bold text-slate-900 tabular-nums">${formatCurrency(exp.amount)}</span>
                    <button type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-lg leading-none transition-colors" onclick="removeModalExpense(${index})">&times;</button>
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
        editModalExpensesList.innerHTML = '<li class="italic text-slate-400 text-xs py-1">Κανένα έξοδο.</li>';
    } else {
        appState.currentEditExpenses.forEach((exp, index) => {
            total += exp.amount;
            let badge = exp.category === 'agatho' ? '<span class="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Αγαθό</span>' : (exp.category === 'logariasmos' ? '<span class="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Λογαριασμός</span>' : '<span class="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md flex-shrink-0">Υλικά</span>');
            let paymentBadge = exp.paidFromDrawer === false ? '<span class="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">🏦 Εκτός Ταμείου</span>' : '';
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80';
            li.innerHTML = `
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                    <span class="truncate font-medium text-slate-700">${exp.desc}</span>${badge}${paymentBadge}
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-bold text-slate-900 tabular-nums">${formatCurrency(exp.amount)}</span>
                    <button type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-lg leading-none transition-colors" onclick="removeEditExpense(${index})">&times;</button>
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
            totalWagesForToday += rate * fallbackHours;
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
    if (monthlyMobileCards) monthlyMobileCards.innerHTML = '';

    if (!records || records.length === 0) {
        const emptyHtml = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500 italic bg-gray-50 border-b border-gray-200"><span class="text-2xl block mb-2">📂</span>Δεν υπάρχουν αναλυτικά ημερήσια ταμεία για αυτόν τον μήνα.<br><span class="text-xs text-gray-400 mt-1 block">Τα νούμερα προέρχονται από αποθηκευμένη Σύνοψη ή Γρήγορη Εισαγωγή.</span></td></tr>';
        monthlyRecordsList.innerHTML = emptyHtml;
        if (monthlyMobileCards) {
            monthlyMobileCards.innerHTML = `
                <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 italic shadow-sm">
                    <span class="text-2xl block mb-2">📂</span>
                    Δεν υπάρχουν αναλυτικά ημερήσια ταμεία για αυτόν τον μήνα.
                    <span class="text-xs text-slate-400 mt-1 block not-italic">Τα νούμερα προέρχονται από αποθηκευμένη Σύνοψη ή Γρήγορη Εισαγωγή.</span>
                </div>
            `;
        }
        return;
    }
    
    const recordsByDate = {};
    [...records].reverse().forEach(record => {
            const dateStr = record.date;
            if (!recordsByDate[dateStr]) {
                recordsByDate[dateStr] = {
                    dateStr: dateStr, records: [], totalRev: 0, totalPos: 0, totalCash: 0, totalExp: 0,
                    totalAgatho: 0, totalYlika: 0, totalLogariasmos: 0, totalWages: 0, workedNames: new Set(),
                    totalExpOut: 0, totalWagesOut: 0
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
                    
                    if (exp.paidFromDrawer === false) group.totalExpOut += parseFloat(exp.amount) || 0;
                });
            } else {
                const fc = parseFloat(record.food_cost_percentage) || 0;
                const rev = parseFloat(record.daily_revenue) || 0;
                group.totalAgatho += (fc * rev) / 100;
            }
            let workedData = [];
            try { workedData = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : (record.worked_employees || []); } catch(e) {}
            workedData.forEach(emp => {
                let empId = typeof emp === 'string' ? emp : emp.staff_id;
                let wage = typeof emp === 'string' ? (wageMap[emp] || 0) : (parseFloat(emp.total_cost) || 0);
                
                if (!group.workedNames.has(empId)) {
                    group.totalWages += wage;
                    group.workedNames.add(empId);
                    
                    if (emp.paid_from_drawer === false) group.totalWagesOut += wage;
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
            const fcBadgeColor = fcPercentage > 40 ? 'bg-rose-50 text-rose-700 border-rose-200' : (fcPercentage <= 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200');

            const hasExpBreakdown = (group.totalAgatho > 0 || group.totalYlika > 0 || group.totalLogariasmos > 0);
            const expDetailsText = `🍎 Αγαθά: ${formatCurrency(group.totalAgatho)}\n📦 Υλικά: ${formatCurrency(group.totalYlika)}\n📄 Λογαριασμοί: ${formatCurrency(group.totalLogariasmos)}${group.totalExpOut > 0 ? `\n🏦 Πληρώθηκαν Εκτός Ταμείου: ${formatCurrency(group.totalExpOut)}` : ''}`;

            const revDetailsText = `💳 POS: ${formatCurrency(group.totalPos)}\n💵 Μετρητά: ${formatCurrency(group.totalCash)}`;

            const workedArray = Array.from(group.workedNames);
            const wagesDetailsText = workedArray.length > 0
                ? `👤 ${workedArray.join('\n👤 ')}${group.totalWagesOut > 0 ? `\n\n🏦 Πληρώθηκαν Εκτός Ταμείου: ${formatCurrency(group.totalWagesOut)}` : ''}`
                : 'Κανένας εργαζόμενος';

            let shiftDetailsText = '';
            group.records.forEach((rec, idx) => {
                const cashier = rec.cashier_name || 'Άγνωστος';
                shiftDetailsText += `Βάρδια ${idx + 1} (${cashier})\nΤζίρος: ${formatCurrency(parseFloat(rec.daily_revenue) || 0)} (POS: ${formatCurrency(parseFloat(rec.pos_revenue) || 0)} | Μετρ: ${formatCurrency(parseFloat(rec.cash_revenue) || 0)})\nΈξοδα: ${formatCurrency(parseFloat(rec.total_expenses) || 0)}\n──────────────────────\n`;
            });

            let expBreakdown = hasExpBreakdown
                ? `<br><button type="button" class="exp-details-btn text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium text-left">Αγ: ${formatCurrency(group.totalAgatho)} | Υλ: ${formatCurrency(group.totalYlika)} | Λογ: ${formatCurrency(group.totalLogariasmos)}</button>` : '';

            let wagesBreakdown = workedArray.length > 0 
                ? `<br><button type="button" class="wages-details-btn text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium text-left">${workedArray.length > 2 ? workedArray.slice(0,2).join(', ') + '...' : workedArray.join(', ')}</button>`
                : `<br><span class="text-[11px] text-gray-400">Κανείς</span>`;
                
            let expOutBadge = group.totalExpOut > 0 ? `<br><span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 mt-1 inline-block shadow-sm" title="Πληρώθηκαν εκτός ταμείου">🏦 Εκτός: ${formatCurrency(group.totalExpOut)}</span>` : '';
            let wagesOutBadge = group.totalWagesOut > 0 ? `<br><span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 mt-1 inline-block shadow-sm" title="Πληρώθηκαν εκτός ταμείου">🏦 Εκτός: ${formatCurrency(group.totalWagesOut)}</span>` : '';

            let actionsHtml = `<div class="flex flex-col gap-1.5">`;
            group.records.forEach((rec, idx) => {
                const cashierLabel = rec.cashier_name || ('Βάρδια ' + (idx + 1));
                actionsHtml += `
                    <div class="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                        <span class="text-xs text-slate-600 font-medium truncate max-w-[95px]" title="${cashierLabel}">${cashierLabel}</span>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <button type="button" onclick="editRecord(${rec.id}, '${rec.date}')" class="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors shadow-sm" title="Επεξεργασία">✏️</button>
                            <button type="button" onclick="deleteRecord(${rec.id})" class="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors shadow-sm" title="Διαγραφή">🗑️</button>
                        </div>
                    </div>
                `;
            });
            actionsHtml += `</div>`;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50/80 transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-3.5 text-sm text-slate-800 align-top">
                    <button type="button" class="shift-details-btn text-blue-600 hover:text-blue-800 cursor-pointer font-bold underline decoration-blue-300 decoration-2 underline-offset-2 text-left">${dateFormatted}</button>
                    ${group.records.length > 1 ? `<br><span class="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md mt-1.5 inline-block shadow-sm">${group.records.length} Ταμεία</span>` : ''}
                </td>
                <td class="px-6 py-3.5 text-sm text-slate-800 align-top">
                    <span class="font-semibold">${formatCurrency(group.totalRev)}</span>
                    <br><button type="button" class="rev-details-btn text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium text-left">POS: ${formatCurrency(group.totalPos)} | Μετρ: ${formatCurrency(group.totalCash)}</button>
                </td>
                <td class="px-6 py-3.5 text-sm text-slate-800 align-top">
                    <span class="font-semibold">${formatCurrency(group.totalExp)}</span>${expBreakdown}${expOutBadge}
                </td>
                <td class="px-6 py-3.5 text-sm text-slate-800 align-top">
                    <span class="font-semibold">${formatCurrency(group.totalWages)}</span>${wagesBreakdown}${wagesOutBadge}
                </td>
                <td class="px-6 py-3.5 text-sm font-bold align-top ${fcColor}">${fcPercentage.toFixed(1)}%</td>
                <td class="px-4 py-2.5 text-sm text-center align-top">${actionsHtml}</td>
            `;

            tr.querySelector('.shift-details-btn')?.addEventListener('click', () => {
                showDetailsModal(`Αναλυτικά Ταμεία (${dateFormatted})`, shiftDetailsText);
            });
            tr.querySelector('.rev-details-btn')?.addEventListener('click', () => {
                showDetailsModal(`Συνολική Ανάλυση Τζίρου (${dateFormatted})`, revDetailsText);
            });
            tr.querySelector('.exp-details-btn')?.addEventListener('click', () => {
                showDetailsModal(`Συνολική Ανάλυση Εξόδων (${dateFormatted})`, expDetailsText);
            });
            tr.querySelector('.wages-details-btn')?.addEventListener('click', () => {
                showDetailsModal(`Προσωπικό που εργάστηκε (${dateFormatted})`, wagesDetailsText);
            });

            monthlyRecordsList.appendChild(tr);

            // Mobile SaaS Κάρτα Ημέρας (< md)
            if (monthlyMobileCards) {
                const card = document.createElement('div');
                card.className = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5 tabular-nums';

                let mobileShiftsHtml = '';
                group.records.forEach((rec, idx) => {
                    const cashierFull = rec.cashier_name || ('Βάρδια ' + (idx + 1));
                    mobileShiftsHtml += `
                        <div class="flex items-center justify-between gap-2 bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-200/80">
                            <div class="min-w-0 flex-1">
                                <span class="text-xs font-semibold text-slate-700 block truncate">👤 ${cashierFull}</span>
                                <span class="text-[11px] text-slate-500">${formatCurrency(parseFloat(rec.daily_revenue) || 0)}</span>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <button type="button" onclick="editRecord(${rec.id}, '${rec.date}')" class="min-h-[38px] px-3 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-slate-200/90 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all">
                                    <span>✏️</span> Επεξεργασία
                                </button>
                                <button type="button" onclick="deleteRecord(${rec.id})" class="min-h-[38px] px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200/90 font-semibold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all" title="Διαγραφή">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </div>
                    `;
                });

                card.innerHTML = `
                    <!-- Header Κάρτας -->
                    <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div class="flex items-center gap-2 flex-wrap">
                            <button type="button" class="m-shift-details-btn text-base font-bold text-slate-900 underline decoration-blue-300 decoration-2 underline-offset-2 text-left">${dateFormatted}</button>
                            <span class="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">${group.records.length} ${group.records.length === 1 ? 'Ταμείο' : 'Ταμεία'}</span>
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${fcBadgeColor}">FC ${fcPercentage.toFixed(1)}%</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Τζίρος</span>
                            <span class="text-lg font-bold text-slate-900 tabular-nums">${formatCurrency(group.totalRev)}</span>
                        </div>
                    </div>

                    <!-- Body Κάρτας (Grid 2 Στηλών) -->
                    <div class="grid grid-cols-2 gap-2.5 text-xs">
                        <div class="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                            <span class="text-[10px] uppercase font-semibold text-slate-400 mb-1">POS vs Μετρητά</span>
                            <div class="space-y-0.5 text-slate-700 font-medium">
                                <div class="flex justify-between"><span>💳 POS:</span><span class="font-semibold text-slate-900">${formatCurrency(group.totalPos)}</span></div>
                                <div class="flex justify-between"><span>💵 Μετρ.:</span><span class="font-semibold text-slate-900">${formatCurrency(group.totalCash)}</span></div>
                            </div>
                        </div>

                        <div class="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-[10px] uppercase font-semibold text-slate-400">Έξοδα & Προσωπικό</span>
                                ${hasExpBreakdown ? `<button type="button" class="m-exp-details-btn text-[11px] text-blue-600 font-semibold underline">Ανάλυση</button>` : ''}
                            </div>
                            <div class="space-y-0.5 text-slate-700 font-medium">
                                <div class="flex justify-between"><span>🧾 Έξοδα:</span><span class="font-semibold text-rose-600">${formatCurrency(group.totalExp)}</span></div>
                                <div class="flex justify-between items-center">
                                    <button type="button" class="m-wages-details-btn text-left underline decoration-slate-300">👥 Μεροκ.:</button>
                                    <span class="font-semibold text-slate-900">${formatCurrency(group.totalWages)}</span>
                                </div>
                            </div>
                            ${(group.totalExpOut > 0 || group.totalWagesOut > 0) ? `<div class="mt-1.5 pt-1 border-t border-slate-200/60 flex flex-wrap gap-1"><span class="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md">🏦 Εκτός Ταμείου: ${formatCurrency(group.totalExpOut + group.totalWagesOut)}</span></div>` : ''}
                        </div>
                    </div>

                    <!-- Footer Κάρτας (Βάρδιες & Κουμπιά Αφής) -->
                    <div class="space-y-2 pt-1">
                        ${mobileShiftsHtml}
                    </div>
                `;

                card.querySelector('.m-shift-details-btn')?.addEventListener('click', () => {
                    showDetailsModal(`Αναλυτικά Ταμεία (${dateFormatted})`, shiftDetailsText);
                });
                card.querySelector('.m-exp-details-btn')?.addEventListener('click', () => {
                    showDetailsModal(`Συνολική Ανάλυση Εξόδων (${dateFormatted})`, expDetailsText);
                });
                card.querySelector('.m-wages-details-btn')?.addEventListener('click', () => {
                    showDetailsModal(`Προσωπικό που εργάστηκε (${dateFormatted})`, wagesDetailsText);
                });

                monthlyMobileCards.appendChild(card);
            }
        });
};
