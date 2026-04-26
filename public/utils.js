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
