const fs = require('fs');

let appJs = fs.readFileSync('public/app.js', 'utf8');

// The block to extract starts with:
//     // --- Διαχείριση Ανάκτησης & Αποθήκευσης Προσωπικού (Μόνιμη Βάση) ---
// And ends right before:
//     // --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος ---
const block1Start = appJs.indexOf('    // --- Διαχείριση Ανάκτησης & Αποθήκευσης Προσωπικού (Μόνιμη Βάση) ---');
const block1End = appJs.indexOf('    // --- Κεντρικές Συναρτήσεις Δεδομένων & Γραφήματος ---');
const block1 = appJs.substring(block1Start, block1End);

// The second block starts with:
//     // --- Διαχείριση Προσωπικού (Δυναμική Λίστα) ---
// And ends right before:
//     // --- Αποθήκευση στον Server (POST request) ---
const block2Start = appJs.indexOf('    // --- Διαχείριση Προσωπικού (Δυναμική Λίστα) ---');
const block2End = appJs.indexOf('    // --- Αποθήκευση στον Server (POST request) ---');
const block2 = appJs.substring(block2Start, block2End);

// Remove the blocks from app.js
let newAppJs = appJs.substring(0, block1Start) + appJs.substring(block1End, block2Start) + appJs.substring(block2End);

// Create the new employees.js content
const employeesJsContent = `import { apiFetchEmployees, apiSaveEmployeesBulk } from './api.js';
import { employeeListEl, addEmployeeBtn } from './dom.js';
import { formatTimeSlots } from './utils.js';

let updateCallback = null;
let renderCallback = null;

export const initEmployees = (onUpdate, onRender) => {
    updateCallback = onUpdate;
    renderCallback = onRender;
    
    // Καθαρίζουμε το HTML (κρυμμένο by default - εμφανίζεται μόνο με προσθήκη)
    employeeListEl.innerHTML = '';

    addEmployeeBtn.addEventListener('click', () => {
        employeeListEl.prepend(createEmployeeRow());
    });
};

const updateCalculations = () => {
    if (updateCallback) updateCallback();
};

const renderCalendar = () => {
    if (renderCallback) renderCallback();
};

${block1.trim()}

${block2.trim()}

export { fetchEmployees, saveEmployeesToServer };
`;

// Insert the initialization into app.js and import
newAppJs = newAppJs.replace(
    "import { appState } from './state.js';",
    "import { appState } from './state.js';\nimport { initEmployees, fetchEmployees } from './employees.js';"
);

// We also need to add the initialization call inside DOMContentLoaded
// Find where we updateCalculations
newAppJs = newAppJs.replace(
    "            fetchEmployees();\n            renderCalendar();\n            updateDashExpensesUI();\n            updateCalculations();",
    "            initEmployees(updateCalculations, renderCalendar);\n            fetchEmployees();\n            renderCalendar();\n            updateDashExpensesUI();\n            updateCalculations();"
);

fs.writeFileSync('public/employees.js', employeesJsContent, 'utf8');
fs.writeFileSync('public/app.js', newAppJs, 'utf8');
