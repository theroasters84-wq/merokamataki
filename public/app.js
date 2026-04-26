import { apiFetchEmployees, apiSaveEmployeesBulk, apiFetchDailyRecords, apiFetchMonthlyReport, apiSaveMonthlyReport, apiSaveDailyRecord, apiUpdateDailyRecord, apiDeleteDailyRecord, apiGetFixedCosts, apiSetFixedCosts } from './api.js';
import { initAuth } from './auth.js';
import { appState } from './state.js';
import { initEmployees, fetchEmployees } from './employees.js';
import { formatCurrency, formatTimeSlots } from './utils.js';
import {
  installAppBtn, logoutBtn, recordDateEl, posRevenueEl, cashRevenueEl, actualCashEl, drawerStatusEl, foodCostDisplayEl, saveDailyBtn, dashCashierName, dashExpenseDesc, dashExpenseCategory, dashExpenseAmount, dashExpensePaidFromDrawer, addDashExpenseBtn, dashExpensesList, dashTotalExpensesDisplay, monthlyFixedCostsEl, weeklyFixedDisplayEl, editFixedCostsBtn, employeeListEl, addEmployeeBtn, totalWeeklyCostEl, breakEvenPointEl, dailyOperatingCostEl, dailyBreakEvenPointEl, dailyNetProfitEl, calendarGrid, currentMonthDisplay, prevMonthBtn, nextMonthBtn, dayActionModal, actionExpensesBtn, actionClosureBtn, closeDayActionModalBtn, dayModal, modalDateDisplay, closeModalBtn, tabDashboard, tabMonthlyReport, dashboardView, monthlyReportView, reportMonthDisplay, reportTotalRevenue, reportTotalExpenses, reportAverageFoodCost, reportFixedCosts, reportNetProfit, fetchReportBtn, closeMonthBtn, monthlyRecordsList, clearDataCheckbox, editRecordModal, editModalDateDisplay, editModalPosRevenue, editModalCashRevenue, editModalEmployeesList, closeEditModalBtn, closeEditModalIconBtn, saveEditModalBtn, editModalCashierName, editExpenseDescInput, editExpenseCategoryInput, editExpenseAmountInput, editExpensePaidFromDrawer, addEditExpenseBtn, editModalExpensesList, editModalTotalExpensesDisplay, expenseDescInput, expenseCategoryInput, expenseAmountInput, modalExpensePaidFromDrawer, addExpenseBtn, modalExpensesList, modalTotalExpensesDisplay, posTotal, drawerCash, zReceipt, modalDrawerStatus, saveModalDayBtn, modalCashierName, modalShiftsList, modalShiftsSection, modalRevenueSection, foodCostChartCanvas
} from './dom.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Auth Λογική ---
    const { checkAuth, logout } = initAuth({
        onAuthSuccess: async () => {
            try {
                const res = await apiGetFixedCosts();
                if (res.ok) {
                    const data = await res.json();
                    if (data.fixed_costs > 0) {
                        monthlyFixedCostsEl.value = data.fixed_costs;
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
                }
            } catch (e) {
                console.error('Failed to fetch fixed costs', e);
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

    // --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος ---
    const refreshChartData = (records) => {
        if (!appState.foodCostChart) return;
        
        let cumulativeRev = 0;
        let cumulativeAgatho = 0;
        const labels = [];
        const data = [];

        records.forEach(record => {
            const rev = parseFloat(record.daily_revenue) || 0;
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

        appState.foodCostChart.data.labels = labels;
        appState.foodCostChart.data.datasets[0].data = data;
        appState.foodCostChart.update();
    };

    const fetchDashboardData = async () => {
        const month = appState.currentDate.getMonth() + 1;
        const year = appState.currentDate.getFullYear();
        try {
            const response = await apiFetchDailyRecords(month, year);
            if (response.status === 401 || response.status === 403) return logout();

            if (response.ok) {
                const records = await response.json();
                appState.currentMonthlyRecords = records;
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
        const month = appState.currentDate.getMonth() + 1; // 1-12
        const year = appState.currentDate.getFullYear();
        
        const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
        reportMonthDisplay.textContent = `${monthNames[month - 1]} ${year}`;
        
        try {
            // Πρώτα τραβάμε τα αναλυτικά ταμεία για να έχουμε τα ημερήσια δεδομένα
            let records = [];
            const recordsResponse = await apiFetchDailyRecords(month, year);
            if (recordsResponse.ok) {
                records = await recordsResponse.json();
                appState.currentMonthlyRecords = records;
            } else {
                console.error('Failed to fetch daily records');
            }

            const response = await apiFetchMonthlyReport(month, year);
            if (response.ok) {
                const data = await response.json();
                appState.currentReportData = data;
                
                const totalRev = parseFloat(data.total_revenue) || 0;
                const totalExp = parseFloat(data.total_expenses) || 0;
                const fixedCosts = parseFloat(monthlyFixedCostsEl.value) || 0;
                
                let totalPersonnelWeekly = 0;
                const employeeRows = employeeListEl.querySelectorAll('.employee-row');
                employeeRows.forEach(row => {
                    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
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
                        if (expenses && expenses.length > 0) {
                            expenses.forEach(exp => {
                                if (exp.category === 'agatho' || exp.category === 'materials' || exp.category === 'ylika') {
                                    dailyAgatho += parseFloat(exp.amount) || 0;
                                }
                            });
                        } else {
                            const fc = parseFloat(record.food_cost_percentage) || 0;
                            dailyAgatho = (fc * rev) / 100;
                        }
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
            
            // Βοηθητικός χάρτης μισθών για υπολογισμό παλιών εγγραφών
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

                monthlyRecordsList.innerHTML = '';
                if (records.length === 0) {
                    monthlyRecordsList.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500 italic">Δεν υπάρχουν καταγραφές για αυτόν τον μήνα.</td></tr>';
                } else {
                    const recordsByDate = {};
                    [...records].reverse().forEach(record => {
                        const dateStr = record.date;
                        if (!recordsByDate[dateStr]) {
                            recordsByDate[dateStr] = {
                                dateStr: dateStr,
                                records: [],
                                totalRev: 0,
                                totalPos: 0,
                                totalCash: 0,
                                totalExp: 0,
                                totalAgatho: 0,
                                totalYlika: 0,
                                totalLogariasmos: 0,
                                totalWages: 0,
                                workedNames: new Set()
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
                        
                        const fcPercentage = group.totalRev > 0 ? ((group.totalAgatho + group.totalYlika) / group.totalRev) * 100 : 0;
                        const fcColor = fcPercentage > 40 ? 'text-red-500' : (fcPercentage <= 30 ? 'text-green-500' : 'text-orange-500');

                        let expBreakdown = (group.totalAgatho > 0 || group.totalYlika > 0 || group.totalLogariasmos > 0)
                            ? `<br><span class="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onclick="alert('Συνολική Ανάλυση Εξόδων:\\n\\n🍎 Αγαθά: ${formatCurrency(group.totalAgatho)}\\n📦 Υλικά: ${formatCurrency(group.totalYlika)}\\n📄 Λογαριασμοί: ${formatCurrency(group.totalLogariasmos)}')">Αγ: ${formatCurrency(group.totalAgatho)} | Υλ: ${formatCurrency(group.totalYlika)} | Λογ: ${formatCurrency(group.totalLogariasmos)}</span>`
                            : '';

                        const workedArray = Array.from(group.workedNames);
                        let wagesBreakdown = workedArray.length > 0 
                            ? `<br><span class="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onclick="alert('Προσωπικό που εργάστηκε:\\n\\n👤 ${workedArray.join('\\n👤 ')}')">${workedArray.length > 2 ? workedArray.slice(0,2).join(', ') + '...' : workedArray.join(', ')}</span>`
                            : `<br><span class="text-[11px] text-gray-400">Κανείς</span>`;

                        let shiftDetailsAlert = `Αναλυτικά Ταμεία (${dateFormatted}):\\n\\n`;
                        group.records.forEach((rec, idx) => {
                            const cashier = (rec.cashier_name || 'Άγνωστος').replace(/'/g, " ");
                            shiftDetailsAlert += `Βάρδια ${idx + 1} (${cashier})\\n`;
                            shiftDetailsAlert += `Τζίρος: ${formatCurrency(parseFloat(rec.daily_revenue) || 0)} (POS: ${formatCurrency(parseFloat(rec.pos_revenue) || 0)} | Μετρ: ${formatCurrency(parseFloat(rec.cash_revenue) || 0)})\\n`;
                            shiftDetailsAlert += `Έξοδα: ${formatCurrency(parseFloat(rec.total_expenses) || 0)}\\n`;
                            shiftDetailsAlert += `----------------------\\n`;
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
                                <span class="font-medium">${formatCurrency(group.totalExp)}</span>
                                ${expBreakdown}
                            </td>
                            <td class="px-6 py-3 text-sm text-gray-800 align-top">
                                <span class="font-medium">${formatCurrency(group.totalWages)}</span>
                                ${wagesBreakdown}
                            </td>
                            <td class="px-6 py-3 text-sm font-semibold align-top ${fcColor}">${fcPercentage.toFixed(1)}%</td>
                            <td class="px-4 py-2 text-sm text-center align-top">
                                ${actionsHtml}
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
        if (!appState.currentReportData) return alert('Παρακαλώ ανανεώστε τα δεδομένα πρώτα.');
        
        const clearData = clearDataCheckbox ? clearDataCheckbox.checked : false;
        const confirmMessage = clearData 
            ? 'ΠΡΟΣΟΧΗ: Έχετε επιλέξει να διαγραφούν τα αναλυτικά δεδομένα του μήνα. Είστε σίγουροι;' 
            : 'Είστε σίγουροι ότι θέλετε να κλείσετε τον μήνα; Αυτό θα αποθηκεύσει τα τρέχοντα αποτελέσματα μόνιμα.';

        if (!confirm(confirmMessage)) return;

        const month = appState.currentDate.getMonth() + 1;
        const year = appState.currentDate.getFullYear();

        const fixedCosts = parseFloat(monthlyFixedCostsEl.value) || 0;
        const totalRev = parseFloat(appState.currentReportData.total_revenue) || 0;
        const totalExp = parseFloat(appState.currentReportData.total_expenses) || 0;
        
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
        appState.currentMonthlyRecords.forEach(record => {
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
    // --- Λογική Ημερολογίου ---
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = appState.currentDate.getFullYear();
        const month = appState.currentDate.getMonth();

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

    const openDayModal = (year, month, day, mode = 'closure') => {
        window.currentDayModalMode = mode;
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

        // Διαμόρφωση ημερομηνίας
        const dateStr = targetDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        modalDateDisplay.textContent = dateStr;
        
        // --- Υπολογισμός Βαρδιών Ημέρας ---
        const dayOfWeek = targetDate.getDay(); // 0=Κυρ, 1=Δευ, ... 6=Σαβ
        modalShiftsList.innerHTML = '';
        let workingEmployeesCount = 0;

        const pad = (num) => String(num).padStart(2, '0');
        const targetDateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
        const savedRecord = appState.currentMonthlyRecords.find(r => r.date && r.date.startsWith(targetDateStr));
        let savedEmployees = [];
        if (savedRecord) {
            try { savedEmployees = typeof savedRecord.worked_employees === 'string' ? JSON.parse(savedRecord.worked_employees) : (savedRecord.worked_employees || []); } catch(e){}
        }
        
        // Εύρεση όλων των ταμείων (βαρδιών) για αυτή τη μέρα
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
                
                if (hasAlreadyWorked) {
                    hours = 0; // Μηδενισμός ωρών για αποφυγή διπλής χρέωσης στη νέα βάρδια
                }

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
                appState.currentModalExpenses = typeof savedRecord.detailed_expenses === 'string' ? JSON.parse(savedRecord.detailed_expenses) : (savedRecord.detailed_expenses || []); 
            } catch(e) {
                appState.currentModalExpenses = [];
            }
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
        // Πάντα κενό για νέα βάρδια (ή προσθήκη εξόδων)
        appState.currentModalExpenses = [];
        posTotal.value = '';
        drawerCash.value = '';
        zReceipt.value = '';
        if (modalCashierName) modalCashierName.value = '';
        
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

    // --- Λογική Εξόδων Modal ---
    const updateModalExpensesUI = () => {
        modalExpensesList.innerHTML = '';
        let total = 0;

        if (appState.currentModalExpenses.length === 0) {
            modalExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
        } else {
            appState.currentModalExpenses.forEach((exp, index) => {
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
        appState.currentModalExpenses.splice(index, 1);
        updateModalExpensesUI();
    };

    // --- Συναρτήσεις Επεξεργασίας / Διαγραφής Αναλυτικών Ταμείων ---
    window.editRecord = (id, date) => {
        const record = appState.currentMonthlyRecords.find(r => r.id === id);
        if (!record) return;

        appState.currentEditRecordId = id;
        appState.currentEditRecordDate = date;

        const dateObj = new Date(date);
        editModalDateDisplay.textContent = `(${dateObj.toLocaleDateString('el-GR')})`;
        
        // Φορτώνουμε πλέον τα πραγματικά πεδία από το backend
        editModalPosRevenue.value = record.pos_revenue !== undefined ? record.pos_revenue : record.daily_revenue;
        editModalCashRevenue.value = record.cash_revenue || '';
        
        try {
            appState.currentEditExpenses = typeof record.detailed_expenses === 'string' ? JSON.parse(record.detailed_expenses) : (record.detailed_expenses || []);
        } catch(e) {
            appState.currentEditExpenses = [];
        }
        updateEditExpensesUI();

        if (editModalCashierName) editModalCashierName.value = record.cashier_name || '';

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
        appState.currentEditRecordId = null;
        appState.currentEditRecordDate = null;
    };

    closeEditModalBtn.addEventListener('click', closeEditModal);
    closeEditModalIconBtn.addEventListener('click', closeEditModal);

    // --- Λογική Εξόδων Quick Edit Modal ---
    const updateEditExpensesUI = () => {
        if (!editModalExpensesList) return;
        editModalExpensesList.innerHTML = '';
        let total = 0;

        if (appState.currentEditExpenses.length === 0) {
            editModalExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
        } else {
            appState.currentEditExpenses.forEach((exp, index) => {
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
                        <button type="button" class="text-red-500 hover:text-red-700 font-bold" onclick="removeEditExpense(${index})">&times;</button>
                    </div>
                `;
                editModalExpensesList.appendChild(li);
            });
        }
        if (editModalTotalExpensesDisplay) editModalTotalExpensesDisplay.textContent = formatCurrency(total);
    };

    window.removeEditExpense = (index) => {
        appState.currentEditExpenses.splice(index, 1);
        updateEditExpensesUI();
    };

    if (addEditExpenseBtn) {
        addEditExpenseBtn.addEventListener('click', () => {
            const desc = editExpenseDescInput.value.trim();
            const amountStr = editExpenseAmountInput.value.replace(',', '.');
            const amount = parseFloat(amountStr);
            const category = editExpenseCategoryInput.value;
            const paidFromDrawer = editExpensePaidFromDrawer ? editExpensePaidFromDrawer.checked : true;

            if (desc && amount > 0) {
                appState.currentEditExpenses.push({ desc, category, amount, paidFromDrawer });
                editExpenseDescInput.value = '';
                editExpenseAmountInput.value = '';
                if (editExpensePaidFromDrawer) editExpensePaidFromDrawer.checked = true;
                updateEditExpensesUI();
            } else {
                alert('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).');
            }
        });
    }

    saveEditModalBtn.addEventListener('click', async () => {
        if (!appState.currentEditRecordId) return;

        const posRev = parseFloat(editModalPosRevenue.value) || 0;
        const cashRev = parseFloat(editModalCashRevenue.value) || 0;

        let totalExpenses = 0;
        let agathoExpenses = 0;
        let drawerExpenses = 0;
        
        appState.currentEditExpenses.forEach(exp => {
            totalExpenses += exp.amount;
            if (exp.category === 'agatho' || exp.category === 'ylika') agathoExpenses += exp.amount;
            if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
        });

        let totalWages = 0;
        // Συλλογή τικαρισμένων εργαζομένων
        const checkboxes = editModalEmployeesList.querySelectorAll('.edit-employee-checkbox:checked');
        const workedEmployees = Array.from(checkboxes).map(cb => {
            const name = cb.value;
            const existing = (window.currentEditRecordWorkedEmployees || []).find(emp => (typeof emp === 'string' ? emp : emp.staff_id) === name);
            if (existing && typeof existing === 'object') {
                totalWages += parseFloat(existing.total_cost) || 0;
                return existing;
            } else {
                let rate = 0;
                const empRow = Array.from(employeeListEl.querySelectorAll('.employee-row')).find(row => row.querySelector('.name-input').value.trim() === name);
                if (empRow) rate = parseFloat(empRow.querySelector('.rate-input').value) || 0;
                const wage = rate * 8;
                totalWages += wage;
                return { staff_id: name, hours_worked: 8, shift_type: 'morning', total_cost: 0, time_slots: [] };
            }
        });

        const newRevenue = posRev + cashRev + drawerExpenses + totalWages;

        if (isNaN(newRevenue) || newRevenue < 0) {
            alert('Παρακαλώ εισάγετε έγκυρους αριθμούς.');
            return;
        }

        let newFoodCost = 0;
        if (newRevenue > 0) {
            newFoodCost = (agathoExpenses / newRevenue) * 100;
        }

        try {
            const response = await apiUpdateDailyRecord(appState.currentEditRecordId, {
                    date: appState.currentEditRecordDate,
                    daily_revenue: newRevenue,
                    cash_revenue: cashRev,
                    pos_revenue: posRev,
                    total_expenses: totalExpenses,
                    food_cost_percentage: newFoodCost,
                    worked_employees: workedEmployees,
                    detailed_expenses: appState.currentEditExpenses,
                    cashier_name: editModalCashierName ? editModalCashierName.value.trim() : ''
                });

            if (response.ok) {
                closeEditModal();
                fetchMonthlyReport(); // Ανανεώνουμε τον πίνακα και τα σύνολα της αναφοράς!
                await fetchDashboardData(); // Παίρνουμε τα νέα δεδομένα
                renderCalendar(); // Ενημερώνουμε τα κουτάκια του ημερολογίου
                updateCalculations(); // Ενημερώνουμε τα νούμερα
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
                await fetchDashboardData();
                renderCalendar();
                updateCalculations();
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
            appState.currentModalExpenses.push({ desc, category, amount, paidFromDrawer });
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

        if (appState.currentDashboardExpenses.length === 0) {
            dashExpensesList.innerHTML = '<li class="italic text-gray-400">Κανένα έξοδο.</li>';
        } else {
            appState.currentDashboardExpenses.forEach((exp, index) => {
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
        appState.currentDashboardExpenses.splice(index, 1);
        updateDashExpensesUI();
    };

    addDashExpenseBtn.addEventListener('click', () => {
        const desc = dashExpenseDesc.value.trim();
        const amountStr = dashExpenseAmount.value.replace(',', '.');
        const amount = parseFloat(amountStr);
        const category = dashExpenseCategory.value;
        const paidFromDrawer = dashExpensePaidFromDrawer ? dashExpensePaidFromDrawer.checked : true;

        if (desc && amount > 0) {
            appState.currentDashboardExpenses.push({ desc, category, amount, paidFromDrawer });
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

        appState.currentModalExpenses.forEach(exp => {
            totalExpenses += exp.amount;
            if (exp.category === 'agatho' || exp.category === 'ylika') {
                agathoExpenses += exp.amount;
            }
            if (exp.paidFromDrawer !== false) {
                drawerExpenses += exp.amount;
            }
        });
        
        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const workedEmployees = [];
        let totalWages = 0;
        
        modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
            const name = li.dataset.empName;
            const hours = parseFloat(li.querySelector('.modal-emp-hours').value) || 0;
            const shiftType = li.querySelector('.modal-emp-shift').value;
            const totalCost = parseFloat(li.querySelector('.emp-total-cost').textContent.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;
            
            totalWages += totalCost;
            
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

        const actualTotalRevenue = pos + cash + drawerExpenses + totalWages;
        const officialRevenue = z > 0 ? z : actualTotalRevenue;
        const actualCashRevenue = cash + drawerExpenses;

        // Επιτρέπουμε μηδενικό τζίρο μόνο αν ο χρήστης βρίσκεται στο "Προσθήκη Εξόδων"
        if (window.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
            alert('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.');
            return;
        }

        const fcPercentage = officialRevenue > 0 ? (agathoExpenses / officialRevenue) * 100 : 0;

        const payload = {
            date: dateStr,
            daily_revenue: officialRevenue,
            cash_revenue: cash,
            pos_revenue: pos,
            total_expenses: totalExpenses,
            food_cost_percentage: fcPercentage,
            worked_employees: workedEmployees,
            detailed_expenses: appState.currentModalExpenses,
            cashier_name: modalCashierName ? modalCashierName.value.trim() : ''
        };

        try {
            saveModalDayBtn.disabled = true;
            saveModalDayBtn.textContent = 'Αποθήκευση...';

            // Αποθηκεύουμε πάντα ως νέα εγγραφή (νέα βάρδια)
            const response = await apiSaveDailyRecord(payload);

            if (response.ok) {
                saveModalDayBtn.classList.replace('bg-primary', 'bg-green-600');
                saveModalDayBtn.textContent = 'Επιτυχία!';
                
                await fetchDashboardData(); 
                renderCalendar();
                updateCalculations();
                
                setTimeout(() => {
                    saveModalDayBtn.classList.replace('bg-green-600', 'bg-primary');
                    saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
                    saveModalDayBtn.disabled = false;
                    closeDayModal();
                }, 1500);

            } else {
                alert('Προέκυψε σφάλμα κατά την αποθήκευση.');
                saveModalDayBtn.disabled = false;
                saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Αδυναμία σύνδεσης με τον server.');
            saveModalDayBtn.disabled = false;
            saveModalDayBtn.textContent = window.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
        }
    });

    // Event Listeners Ημερολογίου
    prevMonthBtn.addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
        renderCalendar();
        fetchDashboardData();
    });

    nextMonthBtn.addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
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
        appState.currentDashboardExpenses.forEach(exp => {
            allDashExpenses += exp.amount;
            if (exp.category === 'agatho' || exp.category === 'ylika') materials += exp.amount;
            if (exp.paidFromDrawer !== false) drawerExpenses += exp.amount;
        });

        // Υπολογισμός μεροκάματων σημερινής ημέρας
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

        // ΝΕΟ: Ταμειακή Συμφωνία
        const actualTotalRevenue = posRev + cashRev + drawerExpenses + totalWagesForToday;
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
        
        appState.currentMonthlyRecords.forEach(r => {
            const rev = parseFloat(r.daily_revenue) || 0;
            cumulativeRev += rev;
            
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
        
        // Προσθήκη σημερινών (μη αποθηκευμένων) στη σούμα (από τη φόρμα αν είναι ορατή)
        cumulativeRev += officialRevenue;
        cumulativeAgatho += materials;

        // Βρίσκουμε τα σημερινά αποθηκευμένα έσοδα
        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const existingRecords = appState.currentMonthlyRecords.filter(r => r.date && r.date.startsWith(dateStr));
        let todaysSavedRev = 0;
        existingRecords.forEach(r => {
            todaysSavedRev += (parseFloat(r.daily_revenue) || 0);
        });
        const totalTodayRevenue = todaysSavedRev + officialRevenue;

        if (cumulativeRev > 0) {
            appState.foodCostPercentage = (cumulativeAgatho / cumulativeRev) * 100;
            
            foodCostDisplayEl.textContent = appState.foodCostPercentage.toFixed(1) + '%';
            foodCostDisplayEl.className = 'text-2xl font-bold'; // Επαναφορά κλάσεων

            if (appState.foodCostPercentage <= 30) {
                foodCostDisplayEl.classList.add('text-green-500');
            } else if (appState.foodCostPercentage <= 40) {
                foodCostDisplayEl.classList.add('text-orange-500');
            } else {
                foodCostDisplayEl.classList.add('text-red-500');
            }
        } else {
            appState.foodCostPercentage = 0;
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
        const dailyProfit = totalTodayRevenue - totalDailyCost;
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
        editFixedCostsBtn.addEventListener('click', async () => {
            if (monthlyFixedCostsEl.disabled) {
                // Ξεκλείδωμα για επεξεργασία
                monthlyFixedCostsEl.disabled = false;
                monthlyFixedCostsEl.focus();
                editFixedCostsBtn.textContent = 'Αποθήκευση';
                editFixedCostsBtn.className = 'flex-1 sm:flex-none text-center bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
            } else {
                // Αποθήκευση και κλείδωμα
                const val = parseFloat(monthlyFixedCostsEl.value) || 0;
                try {
                    editFixedCostsBtn.textContent = '...';
                    await apiSetFixedCosts(val);
                } catch (e) {
                    console.error('Failed to save fixed costs', e);
                }
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

    // --- Αποθήκευση στον Server (POST request) ---
    saveDailyBtn.addEventListener('click', async () => {
        const posRev = parseFloat(posRevenueEl.value) || 0;
        const cashRev = parseFloat(cashRevenueEl.value) || 0;
        const zReceiptDash = parseFloat(actualCashEl.value) || 0;

        let totalExpenses = 0;
        let agathoExpenses = 0;
        let drawerExpenses = 0;

        appState.currentDashboardExpenses.forEach(exp => {
            totalExpenses += exp.amount;
            if (exp.category === 'agatho' || exp.category === 'ylika') {
                agathoExpenses += exp.amount;
            }
            if (exp.paidFromDrawer !== false) {
                drawerExpenses += exp.amount;
            }
        });

        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date(dateStr).getDay();
        const workedEmployees = [];
        let totalWages = 0;
        
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
                    const wage = rate * hours;
                    totalWages += wage;

                    workedEmployees.push({
                        staff_id: name,
                        hours_worked: hours,
                        shift_type: shiftType,
                        total_cost: wage,
                        time_slots: timeSlots
                    });
                }
            }
        });

        const actualTotalRevenue = posRev + cashRev + drawerExpenses + totalWages;
        const officialRevenue = zReceiptDash > 0 ? zReceiptDash : actualTotalRevenue;
        const actualCashRevenue = cashRev + drawerExpenses;
        
        // Επιτρέπουμε μηδενικό τζίρο μόνο αν ο χρήστης βρίσκεται στο "Προσθήκη Εξόδων"
        if (window.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
            alert('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.');
            return;
        }

        const fcPercentage = officialRevenue > 0 ? (agathoExpenses / officialRevenue) * 100 : 0;

        const payload = {
            date: dateStr,
            daily_revenue: officialRevenue,
            cash_revenue: cashRev,
            pos_revenue: posRev,
            total_expenses: totalExpenses,
            food_cost_percentage: fcPercentage,
            worked_employees: workedEmployees,
            detailed_expenses: appState.currentDashboardExpenses,
            cashier_name: dashCashierName ? dashCashierName.value.trim() : ''
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
                
                await fetchDashboardData(); // Ανανέωση δεδομένων & γραφήματος
                renderCalendar();
                updateCalculations();

                setTimeout(() => {
                    // Καθαρισμός φόρμας μετά την επιτυχία
                    appState.currentDashboardExpenses = [];
                    updateDashExpensesUI();
                    posRevenueEl.value = '';
                    cashRevenueEl.value = '';
                    actualCashEl.value = '';
                    drawerStatusEl.classList.add('hidden');
                    if (dashCashierName) dashCashierName.value = '';

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
    const ctx = foodCostChartCanvas.getContext('2d');
    appState.foodCostChart = new Chart(ctx, {
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
            
            // Απενεργοποίηση για αποφυγή διπλού κλικ που "μπλοκάρει" τον browser
            installAppBtn.disabled = true;
            
            // Εμφάνιση του prompt εγκατάστασης στον χρήστη
            deferredPrompt.prompt();
            // Αναμονή για την επιλογή του χρήστη
            const { outcome } = await deferredPrompt.userChoice;
            // Καθαρισμός του prompt και απόκρυψη του κουμπιού
            deferredPrompt = null;
            installAppBtn.classList.add('hidden');
            installAppBtn.disabled = false;
        });
    }

    // Αν η εφαρμογή εγκατασταθεί επιτυχώς (ακόμα και από το μενού του browser), κρύβουμε το κουμπί
    window.addEventListener('appinstalled', () => {
        if (installAppBtn) installAppBtn.classList.add('hidden');
        deferredPrompt = null;
        console.log('Η εφαρμογή εγκαταστάθηκε επιτυχώς!');
    });

    // Εκκίνηση Εφαρμογής - Έλεγχος Auth αντί για άμεσο φόρτωμα
    checkAuth();
});