export const getToken = () => localStorage.getItem('token');

export const getHeaders = (includeAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return headers;
};

// Ασφαλής ανάγνωση JSON απαντήσεων ώστε να μην προκαλείται SyntaxError αν ο server/proxy επιστρέψει HTML (π.χ. 413, 502, 504)
export const safeJson = async (response, fallback = null) => {
    if (!response) return fallback || { error: 'Κενή απάντηση από τον διακομιστή.' };
    try {
        if (typeof response._rawText === 'function') {
            const text = await response._rawText();
            if (!text || !text.trim()) {
                return fallback || (response.ok ? {} : { error: `Σφάλμα διακομιστή (${response.status}).` });
            }
            return JSON.parse(text);
        }
        const text = await response.text();
        if (!text || !text.trim()) {
            return fallback || (response.ok ? {} : { error: `Σφάλμα διακομιστή (${response.status}).` });
        }
        return JSON.parse(text);
    } catch (err) {
        return fallback || {
            error: response.status === 413
                ? 'Το μέγεθος των δεδομένων υπερβαίνει το επιτρεπτό όριο.'
                : response.status === 429
                ? 'Πάρα πολλά αιτήματα. Παρακαλώ περιμένετε λίγο και δοκιμάστε ξανά.'
                : `Μη έγκυρη απάντηση από τον διακομιστή (${response.status || 'Σφάλμα δικτύου'}).`
        };
    }
};

const safeFetch = async (url, options) => {
    const response = await fetch(url, options);
    response._rawText = response.text.bind(response);
    response.json = () => safeJson(response);
    return response;
};

export const apiLogin = async (email, password) => {
    return await safeFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
};

export const apiRegister = async (email, password, store_name, termsAccepted = true) => {
    return await safeFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, store_name, termsAccepted })
    });
};

export const apiForgotPassword = async (email) => {
    return await safeFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
};

export const apiResetPassword = async (token, newPassword) => {
    return await safeFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
};

export const apiSetPin = async (pin) => {
    return await safeFetch('/api/pin/set', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
    });
};

export const apiVerifyPin = async (pin) => {
    return await safeFetch('/api/pin/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
    });
};

export const apiForgotPin = async () => {
    return await safeFetch('/api/pin/forgot', {
        method: 'POST',
        headers: getHeaders()
    });
};

export const apiResetPinWithPassword = async (password, newPin) => {
    return await safeFetch('/api/pin/reset-with-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password, newPin })
    });
};

export const apiFetchEmployees = async () => {
    return await safeFetch('/api/employees', {
        headers: getHeaders()
    });
};

export const apiSaveEmployeesBulk = async (employees) => {
    return await safeFetch('/api/employees/bulk', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employees })
    });
};

export const apiFetchDailyRecords = async (month, year) => {
    return await safeFetch(`/api/daily-records/${month}/${year}`, {
        headers: getHeaders()
    });
};

export const apiFetchMonthlyReport = async (month, year) => {
    return await safeFetch(`/api/monthly-report/${month}/${year}`, {
        headers: getHeaders()
    });
};

export const apiDeleteMonthlyReport = async (month, year) => {
    return await safeFetch(`/api/monthly-report/${month}/${year}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const apiSaveMonthlyReport = async (payload) => {
    return await safeFetch('/api/monthly-report', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiSaveDailyRecord = async (payload) => {
    return await safeFetch('/api/daily-records', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiUpdateDailyRecord = async (id, payload) => {
    return await safeFetch(`/api/daily-records/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiDeleteDailyRecord = async (id) => {
    return await safeFetch(`/api/daily-records/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const apiGetSettings = async () => {
    return await safeFetch('/api/settings', {
        headers: getHeaders()
    });
};

export const apiSetSettings = async (settings) => {
    return await safeFetch('/api/settings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settings)
    });
};

export const apiCheckToken = async () => {
    try {
        const response = await fetch('/api/check-token', {
            headers: getHeaders()
        });
        return response.ok;
    } catch (error) {
        // Network error, etc.
        console.error('Token check failed:', error);
        return false;
    }
};