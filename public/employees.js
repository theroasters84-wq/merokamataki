import { apiFetchEmployees, apiSaveEmployeesBulk } from './api.js';
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
            await apiSaveEmployeesBulk(employees);
        } catch (error) {
            console.error('Failed to save employees:', error);
        }
    };

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

        let daysHtml = '<div class="flex justify-start sm:justify-between items-end w-full text-xs font-medium text-gray-600 mt-2 px-1 overflow-x-auto pb-2 gap-4 sm:gap-1">';
        let allSlotsPanels = '';

        daysArr.forEach(d => {
            let sHtml = `
            <div class="time-range-panel-day hidden flex-col gap-2 mt-2 p-2 bg-white rounded border border-gray-200 w-full" data-day="${d.id}">
                <div class="flex items-center gap-2 w-full justify-center">
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-gray-500 font-bold mb-1">Από</label>
                        <input type="time" class="time-from-day p-1 border border-gray-300 rounded focus:ring-primary outline-none bg-white text-gray-700 w-[70px] text-center text-xs font-medium">
                    </div>
                    <span class="text-gray-400 font-bold mt-4">-</span>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-gray-500 font-bold mb-1">Έως</label>
                        <input type="time" class="time-to-day p-1 border border-gray-300 rounded focus:ring-primary outline-none bg-white text-gray-700 w-[70px] text-center text-xs font-medium">
                    </div>
                    <div class="w-px h-6 bg-gray-300 mx-1 mt-4"></div>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-gray-500 font-bold mb-1">Από (2)</label>
                        <input type="time" class="time-from-day-2 p-1 border border-gray-300 rounded focus:ring-primary outline-none bg-white text-gray-700 w-[70px] text-center text-xs font-medium">
                    </div>
                    <span class="text-gray-400 font-bold mt-4">-</span>
                    <div class="flex flex-col items-center">
                        <label class="text-[10px] text-gray-500 font-bold mb-1">Έως (2)</label>
                        <input type="time" class="time-to-day-2 p-1 border border-gray-300 rounded focus:ring-primary outline-none bg-white text-gray-700 w-[70px] text-center text-xs font-medium">
                    </div>
                </div>
            </div>`;
            allSlotsPanels += sHtml;

            daysHtml += `
                <div class="flex flex-col items-center gap-1 day-wrapper flex-shrink-0" data-day="${d.id}">
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

        // Διαγραφή εργαζόμενου
        div.querySelector('.delete-btn').addEventListener('click', () => {
            div.remove();
            updateCalculations();
            renderCalendar();
            saveEmployeesToServer(); // Διαγραφή από τη Βάση Δεδομένων!
        });

        return div;
    };

export { fetchEmployees, saveEmployeesToServer };
