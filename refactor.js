const fs = require('fs');
let content = fs.readFileSync('public/app.js', 'utf8');

const vars = [
    'currentReportData',
    'currentMonthlyRecords',
    'currentEditRecordId',
    'currentEditRecordDate',
    'foodCostChart',
    'foodCostPercentage',
    'currentDate',
    'currentModalExpenses',
    'currentDashboardExpenses'
];

vars.forEach(v => {
    const regex = new RegExp(`(?<!\\.)\\b${v}\\b`, 'g');
    content = content.replace(regex, `appState.${v}`);
});

// Remove the variable declarations (let appState.xxx = ...;)
const declRegex = /\s*let\s+appState\.(currentReportData|currentMonthlyRecords|currentEditRecordId|currentEditRecordDate|foodCostChart|foodCostPercentage|currentDate|currentModalExpenses|currentDashboardExpenses)\s*=\s*.*?;/g;
content = content.replace(declRegex, '');

// Add the import statement
content = content.replace(
    "import { initAuth } from './auth.js';",
    "import { initAuth } from './auth.js';\nimport { appState } from './state.js';"
);

// We should also remove the inline comments that described these state variables
content = content.replace(/\s*\/\/\s*---\s*Κατάσταση\s*---[\s\S]*?\/\/\s*---\s*Λογική\s*Ημερολογίου\s*---/g, '\n    // --- Λογική Ημερολογίου ---');

fs.writeFileSync('public/app.js', content, 'utf8');
