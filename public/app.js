import { apiFetchEmployees, apiSaveEmployeesBulk, apiFetchDailyRecords, apiFetchMonthlyReport, apiDeleteMonthlyReport, apiSaveMonthlyReport, apiSaveDailyRecord, apiUpdateDailyRecord, apiDeleteDailyRecord, apiGetSettings, apiSetSettings } from './api.js';
import { initAuth } from './auth.js';
import { appState } from './state.js';
import { initEmployees, fetchEmployees } from './employees.js';
import { formatCurrency, formatTimeSlots, showToast } from './utils.js';
import {
  installAppBtn, logoutBtn, helpBtn, helpModal, closeHelpModalBtn, closeHelpModalBtnBottom, recordDateEl, posRevenueEl, cashRevenueEl, actualCashEl, drawerStatusEl, foodCostDisplayEl, saveDailyBtn, dashCashierName, dashExpenseDesc, dashExpenseCategory, dashExpenseAmount, dashExpensePaidFromDrawer, addDashExpenseBtn, dashExpensesList, dashTotalExpensesDisplay, employeeListEl, addEmployeeBtn, totalWeeklyCostEl, breakEvenPointEl, dailyOperatingCostEl, dailyBreakEvenPointEl, dailyNetProfitEl, calendarGrid, currentMonthDisplay, prevMonthBtn, nextMonthBtn, dayActionModal, actionExpensesBtn, actionClosureBtn, closeDayActionModalBtn, dayModal, modalDateDisplay, closeModalBtn, tabDashboard, tabMonthlyReport, dashboardView, monthlyReportView, reportMonthDisplay, reportTotalRevenue, reportTotalExpenses, reportAverageFoodCost, reportFixedCosts, reportNetProfit, fetchReportBtn, closeMonthBtn, monthlyRecordsList, clearDataCheckbox, editRecordModal, editModalDateDisplay, editModalPosRevenue, editModalCashRevenue, editModalZReceipt, editModalEmployeesList, closeEditModalBtn, closeEditModalIconBtn, saveEditModalBtn, editModalCashierName, editExpenseDescInput, editExpenseCategoryInput, editExpenseAmountInput, editExpensePaidFromDrawer, addEditExpenseBtn, editModalExpensesList, editModalTotalExpensesDisplay, expenseDescInput, expenseCategoryInput, expenseAmountInput, modalExpensePaidFromDrawer, addExpenseBtn, modalExpensesList, modalTotalExpensesDisplay, posTotal, drawerCash, zReceipt, modalDrawerStatus, saveModalDayBtn, modalCashierName, modalShiftsList, modalShiftsSection, modalRevenueSection, foodCostChartCanvas,
  refreshChartData, renderCalendar, openDayModal, closeDayModal, updateModalDrawerStatus, updateEditModalBreakdown, updateModalExpensesUI, updateEditExpensesUI, updateDashExpensesUI, updateCalculations, renderMonthlyTable, reportNetRevenueDisplay, reportNetProfitAfterIka, reportVatBreakdownDisplay, dailyNetRevenueDisplayEl, dailyBurnRateDisplayEl, reportForecastProfit, reportVatProvision, reportIkaProvision, renderMonthlyChart, fixedOverheadsInput, ownerInsuranceInput, vatRateInput, saveSettingsBtn, quickImportMonth, quickImportYear, quickImportRev, quickImportExp, quickImportWages, quickImportBtn, reopenMonthBtn, closeMonthOptions, closeMonthDesc
  , reportAverageDailyRevenue, getRecordDateStr, jumpToTodayBtn, quickAddExpenseBtn, quickCloseShiftBtn
} from './dom.js';
const initApp = () => {

    // --- Αρχικοποίηση Πεδίων Ρυθμίσεων ---
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', async () => {
            const overheads = parseFloat(fixedOverheadsInput.value) || 0;
            const insurance = parseFloat(ownerInsuranceInput.value) || 0;
            const vat = parseFloat(vatRateInput.value) || 13;

            try {
                saveSettingsBtn.disabled = true;
                saveSettingsBtn.textContent = 'Αποθήκευση...';
                
                const response = await apiSetSettings({
                    fixed_overheads: overheads,
                    owner_insurance: insurance,
                    vat_rate: vat
                });

                if (response.ok) {
                    appState.MONTHLY_OVERHEADS = overheads;
                    appState.MONTHLY_OWNER_INSURANCE = insurance;
                    appState.MONTHLY_FIXED_COSTS = overheads + insurance;
                    appState.AVERAGE_VAT_RATE = vat / 100;

                    showToast('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!', 'success');
                    updateCalculations();
                    
                    if (!monthlyReportView.classList.contains('hidden')) {
                        fetchReportBtn.click(); // Αναγκαστικό refresh
                    } else {
                        fetchDashboardData();
                    }
                } else {
                    showToast('Προέκυψε σφάλμα κατά την αποθήκευση των ρυθμίσεων.', 'error');
                }
            } catch (error) {
                console.error("Error saving settings:", error);
                showToast('Αδυναμία επικοινωνίας με τον server.', 'error');
            } finally {
                saveSettingsBtn.disabled = false;
                saveSettingsBtn.textContent = 'Αποθήκευση Ρυθμίσεων';
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
            
            if (rev === 0 && exp === 0) return showToast('Παρακαλώ εισάγετε δεδομένα τζίρου ή εξόδων.', 'warning');
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
                    showToast('Το ιστορικό του μήνα αποθηκεύτηκε επιτυχώς!', 'success');
                    quickImportRev.value = ''; quickImportExp.value = ''; quickImportWages.value = '';
                    if (appState.currentDate.getMonth() + 1 === m && appState.currentDate.getFullYear() === y) {
                        if (!monthlyReportView.classList.contains('hidden')) fetchReportBtn.click();
                    }
                } else showToast('Προέκυψε σφάλμα κατά την αποθήκευση.', 'error');
            } catch (error) { showToast('Αδυναμία σύνδεσης με τον server.', 'error'); } 
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
            try {
                const settingsRes = await apiGetSettings();
                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    if (fixedOverheadsInput) fixedOverheadsInput.value = settings.fixed_overheads || 0;
                    if (ownerInsuranceInput) ownerInsuranceInput.value = settings.owner_insurance || 0;
                    if (vatRateInput) vatRateInput.value = settings.vat_rate !== undefined ? settings.vat_rate : 13;
                    
                    appState.MONTHLY_OVERHEADS = parseFloat(settings.fixed_overheads) || 0;
                    appState.MONTHLY_OWNER_INSURANCE = parseFloat(settings.owner_insurance) || 0;
                    appState.MONTHLY_FIXED_COSTS = appState.MONTHLY_OVERHEADS + appState.MONTHLY_OWNER_INSURANCE;
                    appState.AVERAGE_VAT_RATE = (parseFloat(settings.vat_rate) || 13) / 100;
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
            
            fetchEmployees();
            renderCalendar();
            updateDashExpensesUI();
            updateCalculations();
            fetchDashboardData();

            // --- Ενημερωτικό Μήνυμα 48 ωρών (Λήγει 17/5/2026) ---
            const noticeExp = new Date('2026-05-17T23:59:59').getTime();
            if (Date.now() < noticeExp && localStorage.getItem('seenWageNotice_v1') !== 'true') {
                const wageModal = document.getElementById('wageNoticeModal');
                if (wageModal) wageModal.classList.remove('hidden');
                
                const closeNotice = () => {
                    if (wageModal) wageModal.classList.add('hidden');
                    localStorage.setItem('seenWageNotice_v1', 'true');
                };
                document.getElementById('closeWageNoticeBtn')?.addEventListener('click', closeNotice);
                document.getElementById('ackWageNoticeBtn')?.addEventListener('click', closeNotice);
            }
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

    // --- Λογική Γρήγορης Μπάρας Ημέρας (Άμεσο Έξοδο / Κλείσιμο Βάρδιας / Σήμερα) ---
    const getSelectedDateParts = () => {
        const pad = (n) => String(n).padStart(2, '0');
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const val = recordDateEl?.value || todayStr;
        const [y, m, d] = val.split('-').map(Number);
        return {
            year: y || now.getFullYear(),
            month: (m || (now.getMonth() + 1)) - 1,
            day: d || now.getDate()
        };
    };

    if (jumpToTodayBtn) {
        jumpToTodayBtn.addEventListener('click', () => {
            const pad = (n) => String(n).padStart(2, '0');
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
            const needMonthReload = appState.currentDate.getFullYear() !== now.getFullYear() || appState.currentDate.getMonth() !== now.getMonth();
            appState.currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
            recordDateEl.value = todayStr;
            renderCalendar();
            updateCalculations();
            if (needMonthReload) fetchDashboardData();
        });
    }

    if (quickAddExpenseBtn) {
        quickAddExpenseBtn.addEventListener('click', () => {
            const { year, month, day } = getSelectedDateParts();
            appState.actionModalTarget = { year, month, day };
            openDayModal(year, month, day, 'expenses');
        });
    }

    if (quickCloseShiftBtn) {
        quickCloseShiftBtn.addEventListener('click', () => {
            const { year, month, day } = getSelectedDateParts();
            appState.actionModalTarget = { year, month, day };
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
                renderCalendar();
                updateCalculations();
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
                const workedByDate = {};
                records.forEach(record => {
                    const dateStr = getRecordDateStr(record.date) || record.date;
                    if (!workedByDate[dateStr]) workedByDate[dateStr] = new Set();
                    let worked = [];
                    try { worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || []; } catch(e) {}
                    worked.forEach(emp => {
                        let empId = typeof emp === 'string' ? emp : emp.staff_id;
                        let wage = typeof emp === 'string' ? (wageMap[emp] || 0) : (parseFloat(emp.total_cost) || 0);
                        if (typeof emp === 'object' && emp !== null) {
                            actualMonthlyPayroll += wage;
                            workedByDate[dateStr].add(empId);
                        } else if (!workedByDate[dateStr].has(empId)) {
                            actualMonthlyPayroll += wage;
                            workedByDate[dateStr].add(empId);
                        }
                    });
                });

                // Υπολογισμός Προβλέψεων Οφειλών (Κουμπαράς)
                // Αφαιρούμε τον εκτιμώμενο ΦΠΑ των εξόδων από τον ΦΠΑ των πωλήσεων
                const salesVat = totalRev - netTotalRev;
                const netTotalExp = totalExp / (1 + appState.AVERAGE_VAT_RATE);
                const expensesVat = totalExp - netTotalExp;
                const monthlyVatProvision = Math.max(0, salesVat - expensesVat);
                const monthlyIkaProvision = actualMonthlyPayroll * 0.35;

                const daysInMonth = new Date(year, month, 0).getDate() || 30;
                let finalNetProfit;
                let proRataFixedCosts;
                let activeDays = 1;

                if (isClosedMonth) {
                    proRataFixedCosts = fixedCosts;
                    finalNetProfit = parseFloat(data.net_profit);
                } else {
                    // Υπολογισμός Αναλογικών Παγίων με βάση τις πραγματικές ημέρες του μήνα
                    const uniqueDaysRecorded = new Set(records.map(r => getRecordDateStr(r.date)).filter(Boolean)).size;
                    activeDays = uniqueDaysRecorded > 0 ? uniqueDaysRecorded : 1;
                    proRataFixedCosts = (fixedCosts / daysInMonth) * activeDays;
                    finalNetProfit = netTotalRev - totalExp - actualMonthlyPayroll - proRataFixedCosts;
                }

                // Υπολογισμός Μέσου Ημερήσιου Τζίρου
                const uniqueDaysForAvg = new Set(records.map(r => getRecordDateStr(r.date)).filter(Boolean)).size;
                const daysDivisor = uniqueDaysForAvg > 0 ? uniqueDaysForAvg : (isClosedMonth ? daysInMonth : 1);
                const averageDailyRevenue = daysDivisor > 0 ? totalRev / daysDivisor : 0;
                if (reportAverageDailyRevenue) {
                    reportAverageDailyRevenue.textContent = formatCurrency(averageDailyRevenue);
                }

                // AI Forecast Module
                const calculateMonthProjection = () => {
                    const avgDailyNetRev = netTotalRev / activeDays;
                    const avgDailyExp = (totalExp + actualMonthlyPayroll) / activeDays;
                    const forecastProfit = (avgDailyNetRev * daysInMonth) - (avgDailyExp * daysInMonth) - fixedCosts;
                    
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

                if (reportNetProfitAfterIka) {
                    const netAfterIka = finalNetProfit - monthlyIkaProvision;
                    reportNetProfitAfterIka.textContent = `Μετά από ΙΚΑ: ${formatCurrency(netAfterIka)}`;
                    reportNetProfitAfterIka.className = netAfterIka >= 0
                        ? 'text-xs font-semibold text-indigo-900 bg-indigo-100/80 border border-indigo-200/80 px-2.5 py-1 rounded-lg mt-2 tabular-nums'
                        : 'text-xs font-semibold text-rose-800 bg-rose-100/80 border border-rose-200/80 px-2.5 py-1 rounded-lg mt-2 tabular-nums';
                }

                if (reportVatProvision) reportVatProvision.textContent = formatCurrency(monthlyVatProvision);
                if (reportVatBreakdownDisplay) {
                    reportVatBreakdownDisplay.textContent = `Εσόδων: ${formatCurrency(salesVat)} − Εξόδων: ${formatCurrency(expensesVat)}`;
                }
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
        if (!appState.currentReportData) return showToast('Παρακαλώ ανανεώστε τα δεδομένα πρώτα.', 'warning');
        
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
        const workedByDateClosing = {};
        appState.currentMonthlyRecords.forEach(record => {
            const dateStr = getRecordDateStr(record.date) || record.date;
            if (!workedByDateClosing[dateStr]) workedByDateClosing[dateStr] = new Set();
            let worked = [];
            try {
                worked = typeof record.worked_employees === 'string' ? JSON.parse(record.worked_employees) : record.worked_employees || [];
            } catch(e) {}
            worked.forEach(emp => {
                let empId = typeof emp === 'string' ? emp : emp.staff_id;
                let wage = typeof emp === 'string' ? (wageMap[emp] || 0) : (parseFloat(emp.total_cost) || 0);
                if (typeof emp === 'object' && emp !== null) {
                    actualMonthlyPayroll += wage;
                    workedByDateClosing[dateStr].add(empId);
                } else if (!workedByDateClosing[dateStr].has(empId)) {
                    actualMonthlyPayroll += wage;
                    workedByDateClosing[dateStr].add(empId);
                }
            });
        });

        // Κατά το οριστικό κλείσιμο του μήνα αφαιρείται το 100% των μηνιαίων παγίων
        const finalNetProfit = netTotalRev - totalExp - actualMonthlyPayroll - fixedCosts;

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
            closeMonthBtn.disabled = true;
            closeMonthBtn.textContent = 'Κλείσιμο...';

            const response = await apiSaveMonthlyReport(payload);

            if (response.ok) {
                showToast('Ο μήνας έκλεισε επιτυχώς!', 'success');
                fetchMonthlyReport(); // Ανανεώνουμε τα δεδομένα για να φανούν οι αλλαγές
            } else {
                showToast('Προέκυψε σφάλμα κατά το κλείσιμο του μήνα.', 'error');
            }
        } catch (error) {
            console.error('Error saving monthly summary:', error);
            showToast('Αδυναμία αποθήκευσης συνόψεων.', 'error');
        } finally {
            closeMonthBtn.disabled = false;
            closeMonthBtn.textContent = 'Οριστικό Κλείσιμο Μήνα';
        }
    });

    if (reopenMonthBtn) {
        reopenMonthBtn.addEventListener('click', async () => {
            if (!confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε το κλείσιμο του μήνα;\nΑυτό θα διαγράψει την οριστική σύνοψη και θα επανέλθει στον δυναμικό υπολογισμό.')) return;
            const month = appState.currentDate.getMonth() + 1;
            const year = appState.currentDate.getFullYear();
            try {
                reopenMonthBtn.disabled = true;
                reopenMonthBtn.textContent = 'Ακύρωση...';

                const response = await apiDeleteMonthlyReport(month, year);
                if (response.ok) {
                    showToast('Το κλείσιμο ακυρώθηκε. Ο μήνας άνοιξε ξανά!', 'info');
                    fetchMonthlyReport();
                    fetchDashboardData();
                } else {
                    showToast('Προέκυψε σφάλμα κατά την ακύρωση.', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Αδυναμία σύνδεσης με τον server.', 'error');
            } finally {
                reopenMonthBtn.disabled = false;
                reopenMonthBtn.textContent = '🔓 Ακύρωση Κλεισίματος';
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

        // Υπολογισμός αν είχε δηλωθεί διαφορετικό "Ζ" από το άθροισμα ταμείου
        let savedDrawerExp = 0;
        appState.currentEditExpenses.forEach(exp => {
            if (exp.paidFromDrawer !== false) savedDrawerExp += parseFloat(exp.amount) || 0;
        });
        let savedDrawerWages = 0;
        workedEmployees.forEach(emp => {
            if (typeof emp === 'object' && emp !== null && emp.paid_from_drawer !== false) {
                savedDrawerWages += parseFloat(emp.total_cost) || 0;
            }
        });
        const savedCalculatedRev = (parseFloat(record.pos_revenue) || 0) + (parseFloat(record.cash_revenue) || 0) + savedDrawerExp + savedDrawerWages;
        const savedOfficialRev = parseFloat(record.daily_revenue) || 0;
        if (editModalZReceipt) {
            if (Math.abs(savedOfficialRev - savedCalculatedRev) >= 0.01 && savedOfficialRev > 0) {
                editModalZReceipt.value = savedOfficialRev;
            } else {
                editModalZReceipt.value = '';
            }
        }

        let addedEmployees = 0;
        const renderedEmployeeNames = new Set();

        const appendEditEmployeeRow = (name, isChecked, isPaidFromDrawer, isArchived = false) => {
            addedEmployees++;
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-1 hover:bg-gray-100 rounded transition-colors';
            const archivedBadge = isArchived ? ' <span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200" title="Παλαιός/Διαγραμμένος εργαζόμενος από αυτή την εγγραφή">Ιστορικό</span>' : '';
            div.innerHTML = `
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="edit-employee-checkbox w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" value="${name}" ${isChecked ? 'checked' : ''}>
                    <span class="text-sm text-gray-700">${name}${archivedBadge}</span>
                </label>
                <label class="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" class="edit-employee-paid-drawer w-3 h-3 text-primary rounded" ${isPaidFromDrawer ? 'checked' : ''}>
                    Από Ταμείο
                </label>
            `;
            div.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('change', updateEditModalBreakdown);
            });
            editModalEmployeesList.appendChild(div);
        };

        employeeRows.forEach((row) => {
            const name = row.querySelector('.name-input').value.trim();
            if (!name || renderedEmployeeNames.has(name)) return; // Παράλειψη κενών ή διπλότυπων
            renderedEmployeeNames.add(name);

            const empData = workedEmployees.find(emp => (typeof emp === 'string' ? emp : emp?.staff_id) === name);
            const isChecked = Boolean(empData);
            const isPaidFromDrawer = (empData && typeof empData === 'object') ? (empData.paid_from_drawer !== false) : true;
            appendEditEmployeeRow(name, isChecked, isPaidFromDrawer, false);
        });

        // Διατήρηση/εμφάνιση παλιών ή διαγραμμένων εργαζομένων που υπήρχαν στην αποθηκευμένη εγγραφή
        workedEmployees.forEach((emp) => {
            const name = (typeof emp === 'string' ? emp : (emp?.staff_id || '')).trim();
            if (!name || renderedEmployeeNames.has(name)) return;
            renderedEmployeeNames.add(name);

            const isPaidFromDrawer = (typeof emp === 'object' && emp !== null) ? (emp.paid_from_drawer !== false) : true;
            appendEditEmployeeRow(name, true, isPaidFromDrawer, true);
        });

        if (addedEmployees === 0) {
            editModalEmployeesList.innerHTML = '<p class="text-sm text-gray-500 italic px-1">Δεν υπάρχουν καταχωρημένοι εργαζόμενοι στο σύστημα.</p>';
        }

        updateEditExpensesUI();
        updateEditModalBreakdown();

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
                showToast('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).', 'warning');
            }
        });
    }

    saveEditModalBtn.addEventListener('click', async () => {
        if (!appState.currentEditRecordId) return;

        // Αυτόματη προσθήκη τυχόν συμπληρωμένου εξόδου που ο χρήστης ξέχασε να πατήσει '+'
        if (editExpenseDescInput && editExpenseAmountInput) {
            const pendingDesc = editExpenseDescInput.value.trim();
            const pendingAmt = parseFloat((editExpenseAmountInput.value || '').replace(',', '.'));
            if (pendingDesc && pendingAmt > 0) {
                const category = editExpenseCategoryInput ? editExpenseCategoryInput.value : 'agatho';
                const paidFromDrawer = editExpensePaidFromDrawer ? editExpensePaidFromDrawer.checked : true;
                appState.currentEditExpenses.push({ desc: pendingDesc, category, amount: pendingAmt, paidFromDrawer });
                editExpenseDescInput.value = '';
                editExpenseAmountInput.value = '';
                updateEditExpensesUI();
            }
        }

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
        // Συλλογή τικαρισμένων εργαζομένων (με ασφαλή διατήρηση παλιών/διαγραμμένων ή πολλαπλών βαρδιών)
        const checkboxes = editModalEmployeesList.querySelectorAll('.edit-employee-checkbox:checked');
        const workedEmployees = Array.from(checkboxes).flatMap(cb => {
            const name = cb.value;
            const container = cb.closest('.flex.items-center.justify-between');
            const paidCb = container ? container.querySelector('.edit-employee-paid-drawer') : null;
            const isPaidFromDrawer = paidCb ? paidCb.checked : true;

            const matchingExisting = (appState.currentEditRecordWorkedEmployees || []).filter(emp => (typeof emp === 'string' ? emp : emp?.staff_id) === name);
            if (matchingExisting.length > 0 && matchingExisting.some(e => typeof e === 'object' && e !== null)) {
                return matchingExisting.map(existing => {
                    const resultObj = (typeof existing === 'object' && existing !== null)
                        ? { ...existing, paid_from_drawer: isPaidFromDrawer }
                        : { staff_id: name, hours_worked: 8, shift_type: 'morning', total_cost: 0, time_from: '', time_to: '', time_from_2: '', time_to_2: '', time_slots: [], paid_from_drawer: isPaidFromDrawer };
                    if (isPaidFromDrawer) {
                        totalWages += parseFloat(resultObj.total_cost) || 0;
                    }
                    return resultObj;
                });
            }

            let rate = 0;
            let hours = 8;
            let tFrom = '', tTo = '', tFrom2 = '', tTo2 = '', sType = 'morning';
            const empRow = Array.from(employeeListEl.querySelectorAll('.employee-row')).find(row => row.querySelector('.name-input').value.trim() === name);
            if (empRow) {
                rate = parseFloat(empRow.querySelector('.rate-input').value) || 0;
                const dateObj = new Date(appState.currentEditRecordDate);
                const dayOfWeek = dateObj.getDay();
                const dayWrapper = empRow.querySelector(`.day-wrapper[data-day="${dayOfWeek}"]`);
                if (dayWrapper) {
                    hours = parseFloat(dayWrapper.querySelector('.hours-input-day').value) || 0;
                    sType = dayWrapper.querySelector('.shift-input-day').value;
                }
                const panel = empRow.querySelector(`.time-range-panel-day[data-day="${dayOfWeek}"]`);
                if (panel) {
                    tFrom = panel.querySelector('.time-from-day').value;
                    tTo = panel.querySelector('.time-to-day').value;
                    tFrom2 = panel.querySelector('.time-from-day-2').value;
                    tTo2 = panel.querySelector('.time-to-day-2').value;
                }
            }
            const wage = rate * hours;
            const resultObj = { staff_id: name, hours_worked: hours, shift_type: sType, total_cost: wage, time_from: tFrom, time_to: tTo, time_from_2: tFrom2, time_to_2: tTo2, time_slots: [], paid_from_drawer: isPaidFromDrawer };
            if (isPaidFromDrawer) {
                totalWages += parseFloat(resultObj.total_cost) || 0;
            }
            return [resultObj];
        });

        const calculatedRevenue = posRev + cashRev + drawerExpenses + totalWages;
        const editZ = editModalZReceipt && editModalZReceipt.value !== '' ? (parseFloat(editModalZReceipt.value) || 0) : 0;
        const newRevenue = editZ > 0 ? editZ : calculatedRevenue;

        if (isNaN(newRevenue) || newRevenue < 0) {
            showToast('Παρακαλώ εισάγετε έγκυρους αριθμούς.', 'warning');
            return;
        }

        let newFoodCost = 0;
        const netNewRevenue = newRevenue / (1 + appState.AVERAGE_VAT_RATE);
        if (netNewRevenue > 0) {
            newFoodCost = (agathoExpenses / netNewRevenue) * 100;
        }

        try {
            saveEditModalBtn.disabled = true;
            saveEditModalBtn.textContent = 'Αποθήκευση...';

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
                showToast('Η εγγραφή ενημερώθηκε επιτυχώς!', 'success');
                closeEditModal();
                fetchMonthlyReport(); // Ανανεώνουμε τον πίνακα και τα σύνολα της αναφοράς!
                await fetchDashboardData(); // Παίρνουμε τα νέα δεδομένα
                renderCalendar(); // Ενημερώνουμε τα κουτάκια του ημερολογίου
                updateCalculations(); // Ενημερώνουμε τα νούμερα
            } else {
                showToast('Προέκυψε σφάλμα κατά την ενημέρωση.', 'error');
            }
        } catch (error) {
            console.error('Error updating record:', error);
            showToast('Αδυναμία σύνδεσης με τον server.', 'error');
        } finally {
            saveEditModalBtn.disabled = false;
            saveEditModalBtn.textContent = 'Αποθήκευση Αλλαγών';
        }
    });

    window.deleteRecord = async (id) => {
        if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εγγραφή;')) return;
        try {
            const response = await apiDeleteDailyRecord(id);
            if (response.ok) {
                showToast('Η εγγραφή διαγράφηκε επιτυχώς!', 'info');
                fetchMonthlyReport(); // Ανανεώνουμε αμέσως τη λίστα
                await fetchDashboardData();
                renderCalendar();
                updateCalculations();
            } else {
                showToast('Προέκυψε σφάλμα κατά τη διαγραφή.', 'error');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            showToast('Αδυναμία σύνδεσης με τον server.', 'error');
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
            showToast('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).', 'warning');
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
            showToast('Παρακαλώ συμπληρώστε Περιγραφή και ένα έγκυρο Ποσό (μεγαλύτερο του 0).', 'warning');
        }
    });

    // --- Γρήγορη Καταχώρηση Εξόδων με Enter ---
    if (expenseDescInput && expenseAmountInput && addExpenseBtn) {
        expenseDescInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                expenseAmountInput.focus();
            }
        });
        expenseAmountInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addExpenseBtn.click();
                expenseDescInput.focus();
            }
        });
    }

    if (editExpenseDescInput && editExpenseAmountInput && addEditExpenseBtn) {
        editExpenseDescInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                editExpenseAmountInput.focus();
            }
        });
        editExpenseAmountInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addEditExpenseBtn.click();
                editExpenseDescInput.focus();
            }
        });
    }

    if (dashExpenseDesc && dashExpenseAmount && addDashExpenseBtn) {
        dashExpenseDesc.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dashExpenseAmount.focus();
            }
        });
        dashExpenseAmount.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addDashExpenseBtn.click();
                dashExpenseDesc.focus();
            }
        });
    }

    saveModalDayBtn.addEventListener('click', async () => {
        // Αυτόματη προσθήκη τυχόν συμπληρωμένου εξόδου που ο χρήστης ξέχασε να πατήσει '+ Προσθήκη'
        if (expenseDescInput && expenseAmountInput) {
            const pendingDesc = expenseDescInput.value.trim();
            const pendingAmt = parseFloat((expenseAmountInput.value || '').replace(',', '.'));
            if (pendingDesc && pendingAmt > 0) {
                const category = expenseCategoryInput ? expenseCategoryInput.value : 'agatho';
                const paidFromDrawer = modalExpensePaidFromDrawer ? modalExpensePaidFromDrawer.checked : true;
                appState.currentModalExpenses.push({ desc: pendingDesc, category, amount: pendingAmt, paidFromDrawer });
                expenseDescInput.value = '';
                expenseAmountInput.value = '';
                updateModalExpensesUI();
            }
        }

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
        
        const isExpensesOnlyMode = appState.currentDayModalMode === 'expenses';
        if (isExpensesOnlyMode && appState.currentModalExpenses.length === 0) {
            showToast('Παρακαλώ προσθέστε τουλάχιστον ένα έξοδο (Περιγραφή & Ποσό) πριν την αποθήκευση.', 'warning');
            return;
        }
        const dateStr = recordDateEl.value || new Date().toISOString().split('T')[0];
        const workedEmployees = [];
        let totalWages = 0;
        
        if (!isExpensesOnlyMode) {
            modalShiftsList.querySelectorAll('li[data-emp-name]').forEach(li => {
                const activeCb = li.querySelector('.modal-emp-active');
                if (activeCb && !activeCb.checked) return;

                const name = li.dataset.empName;
                const hours = parseFloat(li.querySelector('.modal-emp-hours').value) || 0;
                const shiftType = li.querySelector('.modal-emp-shift').value;
                const totalCost = parseFloat(li.querySelector('.emp-total-cost').textContent.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0;
                const paidCb = li.querySelector('.modal-emp-paid-from-drawer');
                const isPaidFromDrawer = paidCb ? paidCb.checked : true;
                const tFrom = li.dataset.timeFrom || '';
                const tTo = li.dataset.timeTo || '';
                const tFrom2 = li.dataset.timeFrom2 || '';
                const tTo2 = li.dataset.timeTo2 || '';
                
                if (isPaidFromDrawer) {
                    totalWages += totalCost;
                }
                
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
                        time_from: tFrom,
                        time_to: tTo,
                        time_from_2: tFrom2,
                        time_to_2: tTo2,
                        time_slots: timeSlots,
                        paid_from_drawer: isPaidFromDrawer
                    });
                }
            });
        }

        const hasExplicitRevenue = z > 0 || pos > 0 || cash > 0;
        const actualTotalRevenue = (isExpensesOnlyMode && !hasExplicitRevenue)
            ? 0
            : (pos + cash + drawerExpenses + totalWages);
        const officialRevenue = z > 0 ? z : actualTotalRevenue;
        const actualCashRevenue = cash + drawerExpenses;

        // Επιτρέπουμε μηδενικό τζίρο μόνο αν ο χρήστης βρίσκεται στο "Προσθήκη Εξόδων"
        if (!isExpensesOnlyMode && officialRevenue === 0) {
            showToast('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.', 'warning');
            return;
        }

        const netOfficialRevenue = officialRevenue / (1 + appState.AVERAGE_VAT_RATE);
        const fcPercentage = netOfficialRevenue > 0 ? (agathoExpenses / netOfficialRevenue) * 100 : 0;

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
                showToast(appState.currentDayModalMode === 'expenses' ? 'Τα έξοδα αποθηκεύτηκαν!' : 'Η βάρδια έκλεισε επιτυχώς!', 'success');
                
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
                showToast('Προέκυψε σφάλμα κατά την αποθήκευση.', 'error');
                saveModalDayBtn.disabled = false;
                saveModalDayBtn.textContent = appState.currentDayModalMode === 'expenses' ? 'Αποθήκευση Εξόδων' : 'Κλείσιμο Βάρδιας';
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Αδυναμία σύνδεσης με τον server.', 'error');
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
    
    // Ενιαία Συμπεριφορά Modals: Κλείσιμο με κλικ στο μαύρο backdrop & πλήκτρο Escape
    dayModal.addEventListener('click', (e) => {
        if (e.target === dayModal) closeDayModal();
    });

    if (dayActionModal) {
        dayActionModal.addEventListener('click', (e) => {
            if (e.target === dayActionModal) dayActionModal.classList.add('hidden');
        });
    }

    if (editRecordModal) {
        editRecordModal.addEventListener('click', (e) => {
            if (e.target === editRecordModal) closeEditModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (dayActionModal && !dayActionModal.classList.contains('hidden')) {
                dayActionModal.classList.add('hidden');
            }
            if (editRecordModal && !editRecordModal.classList.contains('hidden')) {
                closeEditModal();
            }
            const verifyPinModalEl = document.getElementById('verifyPinModal');
            if (verifyPinModalEl && !verifyPinModalEl.classList.contains('hidden')) {
                verifyPinModalEl.classList.add('hidden');
            }
            if (dayModal && !dayModal.classList.contains('hidden')) {
                closeDayModal();
            }
            if (helpModal && !helpModal.classList.contains('hidden')) {
                closeHelp();
            }
        }
    });
    
    // Αρχικοποίηση ημερομηνίας στο "Κλείσιμο Ημέρας" (τοπική ώρα, όχι UTC)
    const initNow = new Date();
    const padInit = (n) => String(n).padStart(2, '0');
    recordDateEl.value = `${initNow.getFullYear()}-${padInit(initNow.getMonth() + 1)}-${padInit(initNow.getDate())}`;
    
    // Αλλαγή ημερομηνίας -> ανανέωση ημερολογίου & υπολογισμών
    recordDateEl.addEventListener('change', () => {
        renderCalendar();
        updateCalculations();
    });

    // --- Γρήγορα Πρότυπα Βάρδιας/Ταμία στο Modal ---
    document.querySelectorAll('.modal-shift-preset-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!modalCashierName) return;
            const preset = btn.dataset.shiftPreset || '';
            const currentVal = modalCashierName.value.trim();
            if (!currentVal || currentVal.startsWith('☀️') || currentVal.startsWith('🌙') || currentVal.startsWith('⚡')) {
                modalCashierName.value = preset;
            } else {
                modalCashierName.value = `${preset} - ${currentVal}`;
            }
            modalCashierName.focus();
        });
    });

    // --- Event Listeners για Real-time Υπολογισμούς ---
    [posRevenueEl, cashRevenueEl, actualCashEl].forEach(el => {
        el.addEventListener('input', updateCalculations);
    });

    [posTotal, drawerCash, zReceipt].forEach(el => {
        if (el) el.addEventListener('input', updateModalDrawerStatus);
    });

    [editModalPosRevenue, editModalCashRevenue, editModalZReceipt].forEach(el => {
        if (el) el.addEventListener('input', updateEditModalBreakdown);
    });

    // --- Γρήγορα Πρότυπα Εξόδων (Quick Chips) ---
    document.querySelectorAll('.modal-quick-exp-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (expenseDescInput) expenseDescInput.value = btn.dataset.quickDesc || '';
            if (expenseCategoryInput) expenseCategoryInput.value = btn.dataset.quickCat || 'agatho';
            if (expenseAmountInput) expenseAmountInput.focus();
        });
    });

    document.querySelectorAll('.edit-quick-exp-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (editExpenseDescInput) editExpenseDescInput.value = btn.dataset.quickDesc || '';
            if (editExpenseCategoryInput) editExpenseCategoryInput.value = btn.dataset.quickCat || 'agatho';
            if (editExpenseAmountInput) editExpenseAmountInput.focus();
        });
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

                    const panel = row.querySelector(`.time-range-panel-day[data-day="${dayOfWeek}"]`);
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
                    
                    const hours = fallbackHours;
                    const wage = rate * hours;
                    totalWages += wage;

                    workedEmployees.push({
                        staff_id: name,
                        hours_worked: hours,
                        shift_type: shiftType,
                        total_cost: wage,
                        time_from,
                        time_to,
                        time_from_2,
                        time_to_2,
                        time_slots: [],
                        paid_from_drawer: true
                    });
                }
            }
        });

        const actualTotalRevenue = posRev + cashRev + drawerExpenses + totalWages;
        const officialRevenue = zReceiptDash > 0 ? zReceiptDash : actualTotalRevenue;
        const actualCashRevenue = cashRev + drawerExpenses;
        
        // Επιτρέπουμε μηδενικό τζίρο μόνο αν ο χρήστης βρίσκεται στο "Προσθήκη Εξόδων"
        if (appState.currentDayModalMode !== 'expenses' && officialRevenue === 0) {
            showToast('Παρακαλώ εισάγετε έγκυρο τζίρο (Ζ ή Μετρητά/POS) πριν αποθηκεύσετε.', 'warning');
            return;
        }

        const netOfficialRevenue = officialRevenue / (1 + appState.AVERAGE_VAT_RATE);
        const fcPercentage = netOfficialRevenue > 0 ? (agathoExpenses / netOfficialRevenue) * 100 : 0;

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
                showToast('Η εγγραφή αποθηκεύτηκε επιτυχώς!', 'success');
                
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
                showToast('Προέκυψε σφάλμα κατά την αποθήκευση (Server Error).', 'error');
                resetSaveButton();
            }
        } catch (error) {
            console.error('Error saving data:', error);
            showToast('Αδυναμία σύνδεσης με τον server. Βεβαιωθείτε ότι ο server τρέχει.', 'error');
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

    initEmployees(updateCalculations, renderCalendar);
    // Εκκίνηση Εφαρμογής - Έλεγχος Auth αντί για άμεσο φόρτωμα
    checkAuth();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}