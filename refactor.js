const fs = require('fs');

try {
    let code = fs.readFileSync('public/app.js', 'utf-8');

    // 1. Add imports at the top
    const imports = `import { getToken, apiFetchEmployees, apiSaveEmployeesBulk, apiFetchDailyRecords, apiFetchMonthlyReport, apiSaveMonthlyReport, apiSaveDailyRecord, apiUpdateDailyRecord, apiDeleteDailyRecord } from './api.js';
import { initAuth } from './auth.js';\n`;
    if (!code.includes('import { getToken')) {
        code = code.replace("document.addEventListener('DOMContentLoaded', () => {", imports + "document.addEventListener('DOMContentLoaded', () => {");
    }

    // 2. Remove Auth DOM
    const domStart = code.indexOf("// --- Auth DOM Στοιχεία ---");
    const domEnd = code.indexOf("// --- Επιλογή Στοιχείων DOM ---");
    if (domStart !== -1 && domEnd !== -1) {
        code = code.substring(0, domStart) + `// --- Auth DOM Στοιχεία ---
    const installAppBtn = document.getElementById('installAppBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    ` + code.substring(domEnd);
    }

    // 3. Remove Auth Logic
    const authLogicStart = code.indexOf("// --- Auth Λογική ---");
    const authLogicEnd = code.indexOf("// --- Λογική Day Action Modal ---");
    if (authLogicStart !== -1 && authLogicEnd !== -1) {
        code = code.substring(0, authLogicStart) + `// --- Auth Λογική ---
    const { checkAuth } = initAuth({
        onAuthSuccess: () => {
            const savedFixedCosts = localStorage.getItem('merokamataki_fixed_costs');
            if (savedFixedCosts) {
                monthlyFixedCostsEl.value = savedFixedCosts;
                monthlyFixedCostsEl.disabled = true;
                if (editFixedCostsBtn) {
                    editFixedCostsBtn.textContent = 'Επεξεργασία';
                    editFixedCostsBtn.className = 'bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
                }
            } else {
                monthlyFixedCostsEl.disabled = false;
                if (editFixedCostsBtn) {
                    editFixedCostsBtn.textContent = 'Αποθήκευση';
                    editFixedCostsBtn.className = 'bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap';
                }
            }

            fetchEmployees();
            renderCalendar();
            updateDashExpensesUI();
            updateCalculations();
            fetchDashboardData();
        }
    });

    ` + code.substring(authLogicEnd);
    }

    // 4. Swap fetches
    // apiFetchEmployees
    code = code.replace(/const response = await fetch\('\/api\/employees', \{\s*headers: \{ 'Authorization': `Bearer \$\{getToken\(\)\}` \}\s*\}\);/g, 'const response = await apiFetchEmployees();');

    // apiSaveEmployeesBulk
    code = code.replace(/await fetch\('\/api\/employees\/bulk', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json', 'Authorization': `Bearer \$\{getToken\(\)\}` \},\s*body: JSON.stringify\(\{ employees \}\)\s*\}\);/g, 'await apiSaveEmployeesBulk(employees);');

    // apiFetchDailyRecords dashboard
    code = code.replace(/const response = await fetch\(`\/api\/daily-records\/\$\{month\}\/\$\{year\}`\, \{\s*headers: \{ 'Authorization': `Bearer \$\{getToken\(\)\}` \}\s*\}\);/g, 'const response = await apiFetchDailyRecords(month, year);');
    // same for monthly report records
    code = code.replace(/const recordsResponse = await fetch\(`\/api\/daily-records\/\$\{month\}\/\$\{year\}`\, \{\s*headers: \{ 'Authorization': `Bearer \$\{getToken\(\)\}` \}\s*\}\);/g, 'const recordsResponse = await apiFetchDailyRecords(month, year);');

    // apiFetchMonthlyReport
    code = code.replace(/const response = await fetch\(`\/api\/monthly-report\/\$\{month\}\/\$\{year\}`\, \{\s*headers: \{ 'Authorization': `Bearer \$\{getToken\(\)\}` \}\s*\}\);/g, 'const response = await apiFetchMonthlyReport(month, year);');

    // apiSaveMonthlyReport
    code = code.replace(/const response = await fetch\('\/api\/monthly-report', \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'Authorization': `Bearer \$\{getToken\(\)\}`\s*\},\s*body: JSON.stringify\(payload\)\s*\}\);/g, 'const response = await apiSaveMonthlyReport(payload);');

    // apiUpdateDailyRecord (for edit)
    const editFetchStart = code.indexOf("const response = await fetch(`/api/daily-records/${currentEditRecordId}`");
    if (editFetchStart !== -1) {
        const editFetchEnd = code.indexOf("});", editFetchStart) + 3;
        const newEditFetch = `const response = await apiUpdateDailyRecord(currentEditRecordId, {
                    date: currentEditRecordDate,
                    daily_revenue: newRevenue,
                    cash_revenue: cashRev,
                    pos_revenue: posRev,
                    total_expenses: newTotalExpenses,
                    food_cost_percentage: newFoodCost,
                    worked_employees: workedEmployees
                });`;
        code = code.substring(0, editFetchStart) + newEditFetch + code.substring(editFetchEnd);
    }

    // apiDeleteDailyRecord
    code = code.replace(/const response = await fetch\(`\/api\/daily-records\/\$\{id\}`\, \{\s*method: 'DELETE',\s*headers: \{\s*'Authorization': `Bearer \$\{getToken\(\)\}`\s*\}\s*\}\);/g, 'const response = await apiDeleteDailyRecord(id);');

    // apiSaveDailyRecord (for modal save) and updates
    const modalFetchStart = code.indexOf("const response = await fetch(url");
    if (modalFetchStart !== -1) {
        const modalFetchEnd = code.indexOf("});", modalFetchStart) + 3;
        code = code.substring(0, modalFetchStart) + `const response = isEdit ? await apiUpdateDailyRecord(existingRecord.id, payload) : await apiSaveDailyRecord(payload);` + code.substring(modalFetchEnd);
    }

    // apiSaveDailyRecord (for daily save)
    code = code.replace(/const response = await fetch\('\/api\/daily-records', \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'Authorization': `Bearer \$\{getToken\(\)\}`\s*\},\s*body: JSON.stringify\(payload\)\s*\}\);/g, 'const response = await apiSaveDailyRecord(payload);');

    fs.writeFileSync('public/app.js', code);
    console.log('Script done. Replaced fetch calls and auth DOM logic.');
} catch (e) {
    console.error(e);
}
