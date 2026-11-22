import { apiFetchEmployees, apiSaveEmployeesBulk } from './api.js';
import { employeeListEl, addEmployeeBtn } from './dom.js';
import { formatCurrency, formatTimeSlots, showToast } from './utils.js';

let updateCallback = null;
let renderCallback = null;

const DAYS_META = [
    { id: 1, label: 'Δε', title: 'Δευτέρα' },
    { id: 2, label: 'Τρ', title: 'Τρίτη' },
    { id: 3, label: 'Τε', title: 'Τετάρτη' },
    { id: 4, label: 'Πε', title: 'Πέμπτη' },
    { id: 5, label: 'Πα', title: 'Παρασκευή' },
    { id: 6, label: 'Σα', title: 'Σάββατο' },
    { id: 0, label: 'Κυ', title: 'Κυριακή' }
];

const updateEmployeeViewSummary = (row) => {
    if (!row) return;
    const name = row.querySelector('.name-input')?.value.trim() || 'Άγνωστος';
    const rate = parseFloat(row.querySelector('.rate-input')?.value) || 0;
    const displayNameEl = row.querySelector('.display-name');
    if (displayNameEl) displayNameEl.textContent = name;

    const summaryStatsEl = row.querySelector('.emp-view-stats');
    const pillsContainerEl = row.querySelector('.emp-view-schedule-pills');
    if (!summaryStatsEl || !pillsContainerEl) return;

    let activeDays = 0;
    let totalHours = 0;
    const pillsHtml = [];

    DAYS_META.forEach(d => {
        const wrapper = row.querySelector(`.day-wrapper[data-day="${d.id}"]`);
        const isChecked = wrapper?.querySelector('.day-checkbox')?.checked;
        if (!isChecked) {
            pillsHtml.push(`
                <div class="px-2 py-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-[11px] flex items-center justify-between gap-1 opacity-60" title="${d.title}: Ρεπό">
                    <span class="font-semibold">${d.label}</span>
                    <span class="text-[10px]">Ρεπό</span>
                </div>
            `);
            return;
        }

        activeDays++;
        const shift = wrapper.querySelector('.shift-input-day')?.value || 'morning';
        const hours = parseFloat(wrapper.querySelector('.hours-input-day')?.value) || 0;
        totalHours += hours;

        const panel = row.querySelector(`.time-range-panel-day[data-day="${d.id}"]`);
        const tFrom = panel?.querySelector('.time-from-day')?.value || '';
        const tTo = panel?.querySelector('.time-to-day')?.value || '';
        const tFrom2 = panel?.querySelector('.time-from-day-2')?.value || '';
        const tTo2 = panel?.querySelector('.time-to-day-2')?.value || '';

        const ranges = [];
        if (tFrom && tTo) ranges.push(`${tFrom}-${tTo}`);
        if (tFrom2 && tTo2) ranges.push(`${tFrom2}-${tTo2}`);
        const timeStr = ranges.length > 0 ? ranges.join(', ') : `${hours}ω`;

        let shiftIcon = '☀️';
        let shiftLabel = 'Πρωί';
        let badgeStyle = 'bg-amber-50/90 text-amber-900 border-amber-200/90';
        if (shift === 'night') {
            shiftIcon = '🌙';
            shiftLabel = 'Βράδυ';
            badgeStyle = 'bg-indigo-50/90 text-indigo-900 border-indigo-200/90';
        } else if (shift === 'split') {
            shiftIcon = '⚡';
            shiftLabel = 'Σπαστό';
            badgeStyle = 'bg-purple-50/90 text-purple-900 border-purple-200/90';
        }

        pillsHtml.push(`
            <div class="px-2 py-1 rounded-lg border ${badgeStyle} text-[11px] flex flex-col justify-center leading-tight shadow-sm" title="${d.title}: ${shiftLabel} (${hours} ώρες${ranges.length ? ' • ' + ranges.join(', ') : ''})">
                <div class="flex items-center justify-between gap-1">
                    <span class="font-bold">${d.label}</span>
                    <span>${shiftIcon} <span class="font-semibold tabular-nums">${hours}ω</span></span>
                </div>
                ${ranges.length > 0 ? `<span class="text-[9px] opacity-80 truncate tabular-nums mt-0.5">${timeStr}</span>` : `<span class="text-[9px] opacity-75 mt-0.5">${shiftLabel}</span>`}
            </div>
        `);
    });

    const weeklyWage = totalHours * rate;
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    summaryStatsEl.innerHTML = `
        <span class="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 tabular-nums">${activeDays} ημ. • ${Math.round(totalHours * 10) / 10} ώρ./εβδ.</span>
        <span class="admin-only ${isAdmin ? '' : 'hidden'} text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 tabular-nums">${formatCurrency(rate)}/ώρα • ${formatCurrency(weeklyWage)}/εβδ.</span>
    `;
    pillsContainerEl.innerHTML = pillsHtml.join('');
};

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

                            const panel = row.querySelector(`.time-range-panel-day[data-day="${dayId}"]`);
                            if (panel) {
                                if (dayData.time_from) panel.querySelector('.time-from-day').value = dayData.time_from;
                                if (dayData.time_to) panel.querySelector('.time-to-day').value = dayData.time_to;
                                if (dayData.time_from_2) panel.querySelector('.time-from-day-2').value = dayData.time_from_2;
                                if (dayData.time_to_2) panel.querySelector('.time-to-day-2').value = dayData.time_to_2;
                            }
                        }
                    });

                    row.querySelector('.edit-mode').classList.add('hidden');
                    row.querySelector('.view-mode').classList.remove('hidden');
                    updateEmployeeViewSummary(row);
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
                    let time_from = '';
                    let time_to = '';
                    let time_from_2 = '';
                    let time_to_2 = '';
                    const panel = row.querySelector(`.time-range-panel-day[data-day="${dayId}"]`);
                    if (panel) {
                        time_from = panel.querySelector('.time-from-day').value;
                        time_to = panel.querySelector('.time-to-day').value;
                        time_from_2 = panel.querySelector('.time-from-day-2').value;
                        time_to_2 = panel.querySelector('.time-to-day-2').value;
                    }
                    schedule[dayId] = { shift, hours, time_from, time_to, time_from_2, time_to_2, time_slots: [] };
                }
            });
            employees.push({ name, hourly_rate, schedule });
        });
        try {
            const res = await apiSaveEmployeesBulk(employees);
            if (res && res.ok) {
                showToast('Το πρόγραμμα αποθηκεύτηκε!', 'success');
                return true;
            } else {
                showToast('Σφάλμα αποθήκευσης προσωπικού', 'error');
                return false;
            }
        } catch (error) {
            console.error('Failed to save employees:', error);
            showToast('Σφάλμα αποθήκευσης προσωπικού', 'error');
            return false;
        }
    };

// --- Διαχείριση Προσωπικού (Δυναμική Λίστα) ---
    const createEmployeeRow = () => {
        const div = document.createElement('div');
        div.className = 'flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all employee-row';
        
        const daysArr = [
            { id: 1, label: 'Δε', title: 'Δευτέρα' },
            { id: 2, label: 'Τρ', title: 'Τρίτη' },
            { id: 3, label: 'Τε', title: 'Τετάρτη' },
            { id: 4, label: 'Πε', title: 'Πέμπτη' },
            { id: 5, label: 'Πα', title: 'Παρασκευή' },
            { id: 6, label: 'Σα', title: 'Σάββατο' },
            { id: 0, label: 'Κυ', title: 'Κυριακή' }
        ];

        let daysHtml = '<div class="grid grid-cols-2 sm:grid-cols-7 gap-2 w-full text-xs font-medium text-slate-700 mt-1">';
        let allSlotsPanels = '';

        daysArr.forEach(d => {
            let sHtml = `
            <div class="time-range-panel-day hidden flex-col gap-2.5 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 w-full" data-day="${d.id}">
                <div class="text-xs font-bold text-slate-700 border-b border-slate-200/80 pb-1.5 flex items-center justify-between">
                    <span>⏱️ Ακριβές Ωράριο — ${d.title}</span>
                </div>
                <div class="flex items-center gap-2 w-full justify-center flex-wrap">
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-slate-500 font-bold mb-1">Από</label>
                        <input type="time" class="time-from-day px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-slate-700 w-[112px] text-center text-base sm:text-sm font-medium tabular-nums">
                    </div>
                    <span class="text-slate-400 font-bold mt-4">-</span>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-slate-500 font-bold mb-1">Έως</label>
                        <input type="time" class="time-to-day px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-slate-700 w-[112px] text-center text-base sm:text-sm font-medium tabular-nums">
                    </div>
                    <div class="w-px h-6 bg-slate-300 mx-1 mt-4 hidden sm:block"></div>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-slate-500 font-bold mb-1">Από (2)</label>
                        <input type="time" class="time-from-day-2 px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-slate-700 w-[112px] text-center text-base sm:text-sm font-medium tabular-nums">
                    </div>
                    <span class="text-slate-400 font-bold mt-4">-</span>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-slate-500 font-bold mb-1">Έως (2)</label>
                        <input type="time" class="time-to-day-2 px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-slate-700 w-[112px] text-center text-base sm:text-sm font-medium tabular-nums">
                    </div>
                </div>
            </div>`;
            allSlotsPanels += sHtml;

            daysHtml += `
                <div class="flex flex-col justify-between gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 day-wrapper" data-day="${d.id}">
                    <label class="flex items-center justify-between gap-1.5 cursor-pointer hover:text-primary min-h-[28px]">
                        <span class="font-bold text-slate-800 text-xs sm:text-xs" title="${d.title}">${d.label} <span class="sm:hidden font-normal text-slate-500">(${d.title})</span></span>
                        <input type="checkbox" class="day-checkbox w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" data-day="${d.id}">
                    </label>
                    <div class="flex items-center gap-1.5 w-full">
                        <select class="shift-input-day flex-1 min-h-[36px] text-base sm:text-sm px-1.5 py-1 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center cursor-pointer" title="Βάρδια">
                            <option value="morning">☀️</option>
                            <option value="night">🌙</option>
                            <option value="split">⚡</option>
                        </select>
                        <button type="button" class="toggle-slots-btn-day min-w-[36px] min-h-[36px] flex items-center justify-center text-xs text-slate-600 hover:text-primary bg-white hover:bg-blue-50 border border-slate-300 rounded-lg px-2 py-1 transition-colors" title="24ωρο Ωράριο">🕒</button>
                    </div>
                    <div class="flex items-center gap-1 w-full">
                        <input type="number" inputmode="decimal" class="hours-input-day w-full min-h-[36px] text-base sm:text-sm px-2 py-1 border border-slate-300 rounded-lg bg-white text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums" min="0" step="0.5" value="8" title="Ώρες εργασίας ημέρας">
                        <span class="text-[11px] text-slate-400 font-medium">ώρ.</span>
                    </div>
                </div>
            `;
        });
        daysHtml += '</div>';

        div.innerHTML = `
            <!-- ΠΡΟΒΟΛΗ (Όταν αποθηκευτεί) -->
            <div class="view-mode hidden flex flex-col gap-2.5 w-full cursor-pointer hover:bg-slate-50/80 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                <div class="flex flex-wrap justify-between items-center gap-2 w-full">
                    <div class="flex items-center gap-2.5 flex-wrap">
                        <span class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base flex-shrink-0">👤</span>
                        <span class="font-bold text-slate-800 display-name text-base sm:text-lg"></span>
                        <div class="emp-view-stats flex items-center gap-1.5 flex-wrap"></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors ml-auto">✏️ Επεξεργασία</span>
                </div>
                <div class="emp-view-schedule-pills grid grid-cols-2 sm:grid-cols-7 gap-1.5 w-full"></div>
            </div>
            <!-- ΕΠΕΞΕΡΓΑΣΙΑ -->
            <div class="edit-mode flex flex-col gap-2.5 w-full">
                <div class="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
                    <input type="text" placeholder="Όνομα εργαζόμενου" class="flex-grow px-3 py-2 text-base sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none name-input">
                    <input type="number" inputmode="decimal" placeholder="Ωρομίσθιο (€)" class="w-32 sm:w-28 px-3 py-2 text-base sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none tabular-nums rate-input" min="0" step="0.01">
                    <button type="button" class="save-emp-btn min-h-[38px] text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors ml-auto shadow-sm">Αποθήκευση</button>
                    <button type="button" class="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 p-1.5 delete-btn font-bold text-xl leading-none transition-colors" title="Διαγραφή Εργαζόμενου">&times;</button>
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
        saveEmpBtn.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            if (!name) {
                showToast('Παρακαλώ εισάγετε όνομα εργαζόμενου.', 'warning');
                return;
            }
            displayName.textContent = name;
            saveEmpBtn.disabled = true;
            const prevText = saveEmpBtn.textContent;
            saveEmpBtn.textContent = 'Αποθήκευση...';

            try {
                updateCalculations();
                renderCalendar();
                const ok = await saveEmployeesToServer();
                if (ok) {
                    updateEmployeeViewSummary(div);
                    editMode.classList.add('hidden');
                    viewMode.classList.remove('hidden');
                }
            } finally {
                saveEmpBtn.disabled = false;
                saveEmpBtn.textContent = prevText;
            }
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
                const panel = div.querySelector(`.time-range-panel-day[data-day="${day}"]`);
                if (panel) {
                    panel.classList.toggle('hidden');
                    div.querySelectorAll('.time-range-panel-day').forEach(p => {
                        if (p !== panel) p.classList.add('hidden');
                    });
                }
            });
        });
        
        div.querySelectorAll('.time-from-day, .time-to-day, .time-from-day-2, .time-to-day-2').forEach(input => {
            input.addEventListener('input', (e) => {
                const day = e.currentTarget.closest('.time-range-panel-day').dataset.day;
                const panel = div.querySelector(`.time-range-panel-day[data-day="${day}"]`);
                const dayWrapper = div.querySelector(`.day-wrapper[data-day="${day}"]`);
                const shiftSelect = dayWrapper.querySelector('.shift-input-day');

                const from = panel.querySelector('.time-from-day').value;
                const to = panel.querySelector('.time-to-day').value;
                const from2 = panel.querySelector('.time-from-day-2').value;
                const to2 = panel.querySelector('.time-to-day-2').value;
                
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

                let diff = diff1 + diff2;
                if (diff > 0 && dayWrapper) {
                    const hoursInputDay = dayWrapper.querySelector('.hours-input-day');
                    if (hoursInputDay) hoursInputDay.value = (Math.round(diff * 100) / 100).toString();
                }
                updateCalculations();
                renderCalendar();
            });
        });

        // Διαγραφή εργαζόμενου με υποχρεωτική επιβεβαίωση
        div.querySelector('.delete-btn').addEventListener('click', () => {
            const name = nameInput.value.trim() || 'Νέος Εργαζόμενος';
            if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε τον εργαζόμενο "' + name + '";')) {
                return;
            }
            div.remove();
            updateCalculations();
            renderCalendar();
            saveEmployeesToServer(); // Διαγραφή από τη Βάση Δεδομένων!
        });

        return div;
    };

export { fetchEmployees, saveEmployeesToServer };
