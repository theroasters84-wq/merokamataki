// Helper για μορφοποίηση νομίσματος
export const formatCurrency = (amount) => {
    return amount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
};

// Helper για μορφοποίηση των time slots (π.χ. [10,11,18,19] -> "10:00-12:00, 18:00-20:00")
export const formatTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return '';
    let ranges = [];
    let sorted = [...slots].sort((a,b)=>a-b);
    let start = sorted[0];
    let prev = start;
    const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) {
            prev = sorted[i];
        } else {
            ranges.push(`${formatHour(start)}-${formatHour(prev + 1)}`);
            start = sorted[i];
            prev = start;
        }
    }
    ranges.push(`${formatHour(start)}-${formatHour(prev + 1)}`);
    return ranges.join(', ');
};

// Σύστημα Μοντέρνων SaaS Toast Notifications
export const showToast = (message, type = 'success') => {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const styles = {
        success: {
            classes: 'bg-emerald-50/95 border-emerald-200 text-emerald-900',
            iconBg: 'bg-emerald-500 text-white',
            icon: '✓'
        },
        error: {
            classes: 'bg-rose-50/95 border-rose-200 text-rose-900',
            iconBg: 'bg-rose-500 text-white',
            icon: '⚠️'
        },
        warning: {
            classes: 'bg-amber-50/95 border-amber-200 text-amber-900',
            iconBg: 'bg-amber-500 text-white',
            icon: '⚠️'
        },
        info: {
            classes: 'bg-blue-50/95 border-blue-200 text-blue-900',
            iconBg: 'bg-blue-600 text-white',
            icon: 'ℹ️'
        }
    };

    const currentStyle = styles[type] || styles.info;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md text-sm font-medium transition-all duration-300 opacity-0 -translate-y-2 cursor-pointer ${currentStyle.classes}`;

    const iconSpan = document.createElement('span');
    iconSpan.className = `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${currentStyle.iconBg}`;
    iconSpan.textContent = currentStyle.icon;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'flex-1 leading-snug';
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', '-translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
    });

    const removeToast = () => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    };

    const timer = setTimeout(removeToast, 3500);
    toast.addEventListener('click', () => {
        clearTimeout(timer);
        removeToast();
    });
};

// Ασφαλές SaaS Info Modal / Bottom Sheet (αντικαθιστά τα inline onclick="alert(...)")
export const showDetailsModal = (title, contentText) => {
    let modal = document.getElementById('detailsInfoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detailsInfoModal';
        modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity hidden flex items-end sm:items-center justify-center p-0 sm:p-4 z-[95]';
        modal.innerHTML = `
            <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/80">
                <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0"></div>
                <div class="flex justify-between items-center px-5 pt-3 pb-3 border-b border-slate-100 flex-shrink-0">
                    <h3 id="detailsInfoModalTitle" class="text-base sm:text-lg font-bold text-slate-900"></h3>
                    <button type="button" id="closeDetailsInfoModalIcon" class="text-slate-400 hover:text-rose-500 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-2xl leading-none transition-colors">&times;</button>
                </div>
                <div id="detailsInfoModalBody" class="px-5 py-4 overflow-y-auto text-sm text-slate-700 space-y-1.5 whitespace-pre-line leading-relaxed tabular-nums"></div>
                <div class="px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-slate-50/70 flex justify-end flex-shrink-0">
                    <button type="button" id="closeDetailsInfoModalBtn" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm">Κλείσιμο</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeFn = () => modal.classList.add('hidden');
        modal.querySelector('#closeDetailsInfoModalIcon').addEventListener('click', closeFn);
        modal.querySelector('#closeDetailsInfoModalBtn').addEventListener('click', closeFn);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFn();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeFn();
            }
        });
    }

    modal.querySelector('#detailsInfoModalTitle').textContent = title;
    modal.querySelector('#detailsInfoModalBody').textContent = contentText;
    modal.classList.remove('hidden');
};
