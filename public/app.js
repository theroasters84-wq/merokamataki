import { apiFetchEmployees, apiSaveEmployeesBulk, apiFetchDailyRecords, apiFetchMonthlyReport, apiDeleteMonthlyReport, apiSaveMonthlyReport, apiSaveDailyRecord, apiUpdateDailyRecord, apiDeleteDailyRecord } from './api.js';
import { initAuth } from './auth.js';
import { appState } from './state.js';
import { initEmployees, fetchEmployees } from './employees.js';
import { formatCurrency, formatTimeSlots } from './utils.js';
import {
  installAppBtn, logoutBtn, helpBtn, helpModal, closeHelpModalBtn, closeHelpModalBtnBottom, recordDateEl, posRevenueEl, cashRevenueEl, actualCashEl, drawerStatusEl, foodCostDisplayEl, saveDailyBtn, dashCashierName, dashExpenseDesc, dashExpenseCategory, dashExpenseAmount, dashExpensePaidFromDrawer, addDashExpenseBtn, dashExpensesList, dashTotalExpensesDisplay, employeeListEl, addEmployeeBtn, totalWeeklyCostEl, breakEvenPointEl, dailyOperatingCostEl, dailyBreakEvenPointEl, dailyNetProfitEl, calendarGrid, currentMonthDisplay, prevMonthBtn, nextMonthBtn, dayActionModal, actionExpensesBtn, actionClosureBtn, closeDayActionModalBtn, dayModal, modalDateDisplay, closeModalBtn, tabDashboard, tabMonthlyReport, dashboardView, monthlyReportView, reportMonthDisplay, reportTotalRevenue, reportTotalExpenses, reportAverageFoodCost, reportFixedCosts, reportNetProfit, fetchReportBtn, closeMonthBtn, monthlyRecordsList, clearDataCheckbox, editRecordModal, editModalDateDisplay, editModalPosRevenue, editModalCashRevenue, editModalEmployeesList, closeEditModalBtn, closeEditModalIconBtn, saveEditModalBtn, editModalCashierName, editExpenseDescInput, editExpenseCategoryInput, editExpenseAmountInput, editExpensePaidFromDrawer, addEditExpenseBtn, editModalExpensesList, editModalTotalExpensesDisplay, expenseDescInput, expenseCategoryInput, expenseAmountInput, modalExpensePaidFromDrawer, addExpenseBtn, modalExpensesList, modalTotalExpensesDisplay, posTotal, drawerCash, zReceipt, modalDrawerStatus, saveModalDayBtn, modalCashierName, modalShiftsList, modalShiftsSection, modalRevenueSection, foodCostChartCanvas,
  refreshChartData, renderCalendar, openDayModal, closeDayModal, updateModalDrawerStatus, updateModalExpensesUI, updateEditExpensesUI, updateDashExpensesUI, updateCalculations, renderMonthlyTable, reportNetRevenueDisplay, dailyNetRevenueDisplayEl, dailyBurnRateDisplayEl, reportForecastProfit, reportVatProvision, reportIkaProvision, renderMonthlyChart, fixedOverheadsInput, ownerInsuranceInput, vatRateInput, saveSettingsBtn, quickImportMonth, quickImportYear, quickImportRev, quickImportExp, quickImportWages, quickImportBtn, reopenMonthBtn, closeMonthOptions, closeMonthDesc
} from './dom.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Αρχικοποίηση Πεδίων Ρυθμίσεων ---
    if (fixedOverheadsInput) fixedOverheadsInput.value = localStorage.getItem('fixedOverheads') || 0;
    if (ownerInsuranceInput) ownerInsuranceInput.value = localStorage.getItem('ownerInsurance') || 0;
    if (vatRateInput) vatRateInput.value = localStorage.getItem('vatRate') !== null ? localStorage.getItem('vatRate') : 13;

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const overheads = parseFloat(fixedOverheadsInput.value) || 0;
            const insurance = parseFloat(ownerInsuranceInput.value) || 0;
            const vat = parseFloat(vatRateInput.value) || 13;

            localStorage.setItem('fixedOverheads', overheads);
            localStorage.setItem('ownerInsurance', insurance);
            localStorage.setItem('vatRate', vat);

            appState.MONTHLY_FIXED_COSTS = overheads + insurance;
            appState.AVERAGE_VAT_RATE = vat / 100;

            alert('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
            updateCalculations();
            
            if (!monthlyReportView.classList.contains('hidden')) {
                fetchReportBtn.click(); // Αναγκαστικό refresh
            } else {
                fetchDashboardData();
            }
        });
    }

    // --- Λογική Γρήγορης Εισαγωγής (Ιστορικό) ---
    if (quickImportBtn) {
        quickImportBtn.addEventListener('click', async () => {
            const m = parseInt(quickImportMonth.value);
            const y = parseInt(quickImportYear.value);
            const rev = parseFloat(quickImportRev.value) || 0;
            const exp = parseFloat(quickImportExp.value) || 0;
            const wages = parseFloat(quickImportWages.value) || 0;
            
            if (rev === 0 && exp === 0) return alert('Παρακαλώ εισάγετε δεδομένα τζίρου ή εξόδων.');
            if (!confirm(`Είστε σίγουροι ότι θέλετε να αποθηκεύσετε το ιστορικό για τον ${m}/${y};\nΑν υπάρχει ήδη σύνοψη για αυτόν τον μήνα, θα αντικατασταθεί.`)) return;

            const fixedCosts = appState.MONTHLY_FIXED_COSTS;
            const netRev = rev / (1 + appState.AVERAGE_VAT_RATE);
            // Υποθέτουμε ότι ο παλιός μήνας ήταν ολόκληρος, άρα αφαιρούμε ολόκληρο το πάγιο
            const netProfit = netRev - exp - wages - fixedCosts; 
            
            const payload = {
                month: m,
                year: y,
                total_revenue: rev,
                total_expenses: exp,
                fixed_costs: fixedCosts,
                net_profit: netProfit,
                clearData: false
            };

            try {
                quickImportBtn.disabled = true;
                quickImportBtn.textContent = 'Αποθήκευση...';
                const response = await apiSaveMonthlyReport(payload);
                
                if (response.ok) {
                    alert('Το ιστορικό του μήνα αποθηκεύτηκε επιτυχώς!');
                    quickImportRev.value = ''; quickImportExp.value = ''; quickImportWages.value = '';
                    if (appState.currentDate.getMonth() + 1 === m && appState.currentDate.getFullYear() === y) {
                        if (!monthlyReportView.classList.contains('hidden')) fetchReportBtn.click();
                    }
                } else alert('Προέκυψε σφάλμα κατά την αποθήκευση.');
            } catch (error) { alert('Αδυναμία σύνδεσης με τον server.'); } 
            finally { quickImportBtn.disabled = false; quickImportBtn.textContent = 'Αποθήκευση Μήνα'; }
        });
    }

    // --- Λογική Help Modal (Οδηγίες Χρήσης) ---
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            if (helpModal) helpModal.classList.remove('hidden');
        });
    }
    const closeHelp = () => {
        if (helpModal) helpModal.classList.add('hidden');
    };
    if (closeHelpModalBtn) closeHelpModalBtn.addEventListener('click', closeHelp);
    if (closeHelpModalBtnBottom) closeHelpModalBtnBottom.addEventListener('click', closeHelp);
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) closeHelp();
        });
    }

    // --- Auth Λογική ---
    const { checkAuth, logout } = initAuth({
        onAuthSuccess: async () => {
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
            const { year, month, day } = appState.actionModalTarget;
            openDayModal(year, month, day, 'expenses');
        });
    }
    
    if (actionClosureBtn) {
        actionClosureBtn.addEventListener('click', () => {
            dayActionModal.classList.add('hidden');
            const { year, month, day } = appState.actionModalTarget;
            openDayModal(year, month, day, 'closure');
        });
    }

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

            // Υπολογισμός πραγματικού κόστους προσωπικού ΒΑΣΕΙ των καταγεγραμμένων ημερών
            const wageMap = {};
            const employeeRows = employeeListEl.querySelectorAll('.employee-row');
            employeeRows.forEach(row => {
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

            const response = await apiFetchMonthlyReport(month, year);
            if (response.ok) {
                const data = await response.json();
                appState.currentReportData = data;
                
                const totalRev = parseFloat(data.total_revenue) || 0;
                const totalExp = parseFloat(data.total_expenses) || 0;
                const isClosedMonth = data.fixed_costs !== undefined;
                const fixedCosts = isClosedMonth ? parseFloat(data.fixed_costs) : appState.MONTHLY_FIXED_COSTS;
                const netTotalRev = totalRev / (1 + appState.AVERAGE_VAT_RATE);
                
                if (reportNetRevenueDisplay) {
                    reportNetRevenueDisplay.textContent = `Καθαρός Τζίρος (άνευ ΦΠΑ): ${formatCurrency(netTotalRev)}`;
                }
                
                let actualMonthlyPayroll = 0;
                records.forEach(record => {
                    let worked = [];
                    try { worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || []; } catch(e) {}
                    worked.forEach(emp => {
                        if (typeof emp === 'string') actualMonthlyPayroll += (wageMap[emp] || 0);
                        else actualMonthlyPayroll += (parseFloat(emp.total_cost) || 0);
                    });
                });

                // Υπολογισμός Προβλέψεων Οφειλών (Κουμπαράς)
                const monthlyVatProvision = totalRev - netTotalRev;
                const monthlyIkaProvision = actualMonthlyPayroll * 0.35;

                let finalNetProfit;
                let proRataFixedCosts;
                let activeDays = 1;

                if (isClosedMonth) {
                    proRataFixedCosts = fixedCosts;
                    finalNetProfit = parseFloat(data.net_profit);
                } else {
                    // Υπολογισμός Αναλογικών Παγίων
                    const uniqueDaysRecorded = new Set(records.map(r => r.date ? r.date.substring(0, 10) : '')).size;
                    activeDays = uniqueDaysRecorded > 0 ? uniqueDaysRecorded : 1;
                    proRataFixedCosts = (fixedCosts / 30) * activeDays;
                    finalNetProfit = netTotalRev - totalExp - actualMonthlyPayroll - proRataFixedCosts;
                }

                // AI Forecast Module
                const calculateMonthProjection = () => {
                    const avgDailyNetRev = netTotalRev / activeDays;
                    
                    let actualPayrollSoFar = 0;
                    const tempWageMap = {};
                    employeeRows.forEach(row => {
                        const name = row.querySelector('.name-input').value.trim();
                        const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
                        let fallbackHours = 8;
                        const firstChecked = row.querySelector('.day-checkbox:checked');
                        if (firstChecked) {
                            const dayWrapper = row.querySelector(`.day-wrapper[data-day="${firstChecked.dataset.day}"]`);
                            if (dayWrapper) fallbackHours = parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0;
                        }
                        if (name) tempWageMap[name] = rate * fallbackHours;
                    });
                    
                    records.forEach(record => {
                        let worked = [];
                        try { worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || []; } catch(e) {}
                        worked.forEach(emp => {
                            if (typeof emp === 'string') actualPayrollSoFar += (tempWageMap[emp] || 0);
                            else actualPayrollSoFar += (parseFloat(emp.total_cost) || 0);
                        });
                    });

                    const avgDailyExp = (totalExp + actualPayrollSoFar) / activeDays;
                    const forecastProfit = (avgDailyNetRev * 30) - (avgDailyExp * 30) - fixedCosts;
                    
                    if (reportForecastProfit) {
                        reportForecastProfit.textContent = formatCurrency(forecastProfit);
                        if (forecastProfit > 0) reportForecastProfit.className = 'text-4xl font-bold text-green-600 mt-4 md:mt-0';
                        else if (forecastProfit < 0) reportForecastProfit.className = 'text-4xl font-bold text-red-600 mt-4 md:mt-0';
                        else reportForecastProfit.className = 'text-4xl font-bold text-gray-700 mt-4 md:mt-0';
                    }
                };
                
                if (isClosedMonth) {
                    if (reportForecastProfit) {
                        reportForecastProfit.textContent = formatCurrency(finalNetProfit);
                        reportForecastProfit.className = finalNetProfit > 0 ? 'text-4xl font-bold text-blue-600 mt-4 md:mt-0' : 'text-4xl font-bold text-gray-700 mt-4 md:mt-0';
                        const titleEl = reportForecastProfit.previousElementSibling?.querySelector('p.uppercase');
                        const subEl = reportForecastProfit.previousElementSibling?.querySelector('p.normal-case');
                        if (titleEl) titleEl.textContent = '📌 Αποτέλεσμα Μήνα';
                        if (subEl) subEl.textContent = 'Οριστικό καθαρό κέρδος (Ο μήνας έχει κλείσει).';
                    }
                    
                    if (closeMonthBtn) closeMonthBtn.classList.add('hidden');
                    if (closeMonthOptions) closeMonthOptions.classList.add('hidden');
                    if (reopenMonthBtn) reopenMonthBtn.classList.remove('hidden');
                    if (closeMonthDesc) closeMonthDesc.textContent = 'Ο μήνας είναι οριστικά κλεισμένος. Μπορείτε να ακυρώσετε το κλείσιμο για να συνεχίσετε την καταγραφή.';
                } else {
                    if (reportForecastProfit) {
                        const titleEl = reportForecastProfit.previousElementSibling?.querySelector('p.uppercase');
                        const subEl = reportForecastProfit.previousElementSibling?.querySelector('p.normal-case');
                        if (titleEl) titleEl.textContent = '🔮 Πρόβλεψη Τέλους Μήνα';
                        if (subEl) subEl.textContent = 'Εκτιμώμενο Κέρδος με βάση τον μέσο όρο των ημερών που έχουν καταγραφεί.';
                    }
                    calculateMonthProjection();
                    
                    if (closeMonthBtn) closeMonthBtn.classList.remove('hidden');
                    if (closeMonthOptions) closeMonthOptions.classList.remove('hidden');
                    if (reopenMonthBtn) reopenMonthBtn.classList.add('hidden');
                    if (closeMonthDesc) closeMonthDesc.textContent = 'Αποθηκεύει τα τρέχοντα αποτελέσματα μόνιμα στη βάση δεδομένων.';
                }

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
                
                if (records.length === 0 && isClosedMonth) {
                    reportAverageFoodCost.textContent = 'N/A';
                    reportAverageFoodCost.className = 'text-4xl font-bold text-gray-400';
                } else {
                    const avgFoodCost = netTotalRev > 0 ? (monthlyAgatho / netTotalRev) * 100 : 0;
                    reportAverageFoodCost.textContent = netTotalRev > 0 ? avgFoodCost.toFixed(1) + '%' : '-%';
                    reportAverageFoodCost.className = 'text-4xl font-bold';
                    if (netTotalRev > 0) {
                        if (avgFoodCost <= 30) reportAverageFoodCost.classList.add('text-green-500');
                        else if (avgFoodCost <= 40) reportAverageFoodCost.classList.add('text-orange-500');
                        else reportAverageFoodCost.classList.add('text-red-500');
                    } else {
                        reportAverageFoodCost.classList.add('text-gray-400');
                    }
                }

                reportTotalRevenue.textContent = formatCurrency(totalRev);
                reportTotalExpenses.textContent = formatCurrency(totalExp);
                reportFixedCosts.textContent = formatCurrency(proRataFixedCosts);
                reportNetProfit.textContent = formatCurrency(finalNetProfit);

                if (reportVatProvision) reportVatProvision.textContent = formatCurrency(monthlyVatProvision);
                if (reportIkaProvision) reportIkaProvision.textContent = formatCurrency(monthlyIkaProvision);

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
            
                renderMonthlyTable(records, wageMap);
                renderMonthlyChart(records, wageMap);
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

        const fixedCosts = appState.MONTHLY_FIXED_COSTS;
        const totalRev = parseFloat(appState.currentReportData.total_revenue) || 0;
        const netTotalRev = totalRev / (1 + appState.AVERAGE_VAT_RATE);
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

        const uniqueDaysRecorded = new Set(appState.currentMonthlyRecords.map(r => r.date ? r.date.substring(0, 10) : '')).size;
        const activeDays = uniqueDaysRecorded > 0 ? uniqueDaysRecorded : 1;
        const proRataFixedCosts = (fixedCosts / 30) * activeDays;
        const finalNetProfit = netTotalRev - totalExp - actualMonthlyPayroll - proRataFixedCosts;

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

    if (reopenMonthBtn) {
        reopenMonthBtn.addEventListener('click', async () => {
            if (!confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε το κλείσιμο του μήνα;\nΑυτό θα διαγράψει την οριστική σύνοψη και θα επανέλθει στον δυναμικό υπολογισμό.')) return;
            const month = appState.currentDate.getMonth() + 1;
            const year = appState.currentDate.getFullYear();
            try {
                const response = await apiDeleteMonthlyReport(month, year);
                if (response.ok) {
                    alert('Το κλείσιμο ακυρώθηκε. Ο μήνας άνοιξε ξανά!');
                    fetchMonthlyReport();
                    fetchDashboardData();
                } else {
                    alert('Προέκυψε σφάλμα κατά την ακύρωση.');
                }
            } catch (error) {
                console.error(error);
                alert('Αδυναμία σύνδεσης με τον server.');
            }
        });
    }
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
        appState.currentEditRecordWorkedEmployees = workedEmployees;

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
            const existing = (appState.currentEditRecordWorkedEmployees || []).find(emp => (typeof emp === 'string' ? emp : emp.staff_id) === name);
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
        if (appState.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
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
                    saveModalDayBtn.textContent = appState.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
                    saveModalDayBtn.disabled = false;
                    closeDayModal();
                }, 1500);

            } else {
                alert('Προέκυψε σφάλμα κατά την αποθήκευση.');
                saveModalDayBtn.disabled = false;
                saveModalDayBtn.textContent = appState.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Αδυναμία σύνδεσης με τον server.');
            saveModalDayBtn.disabled = false;
            saveModalDayBtn.textContent = appState.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
        }
    });

    // Event Listeners Ημερολογίου
    prevMonthBtn.addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
        renderCalendar();
        fetchDashboardData();
        if (!monthlyReportView.classList.contains('hidden')) {
            fetchMonthlyReport();
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
        renderCalendar();
        fetchDashboardData();
        if (!monthlyReportView.classList.contains('hidden')) {
            fetchMonthlyReport();
        }
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

    // --- Event Listeners για Real-time Υπολογισμούς ---
    [posRevenueEl, cashRevenueEl, actualCashEl].forEach(el => {
        el.addEventListener('input', updateCalculations);
    });

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
        if (appState.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
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