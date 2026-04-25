export const getToken = () => localStorage.getItem('token');

export const getHeaders = (includeAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return headers;
};

export const apiLogin = async (email, password) => {
    return await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
};

export const apiRegister = async (email, password, store_name) => {
    return await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, store_name })
    });
};

export const apiSetPin = async (pin) => {
    return await fetch('/api/pin/set', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
    });
};

export const apiVerifyPin = async (pin) => {
    return await fetch('/api/pin/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pin })
    });
};

export const apiForgotPin = async () => {
    return await fetch('/api/pin/forgot', {
        method: 'POST',
        headers: getHeaders()
    });
};

export const apiFetchEmployees = async () => {
    return await fetch('/api/employees', {
        headers: getHeaders()
    });
};

export const apiSaveEmployeesBulk = async (employees) => {
    return await fetch('/api/employees/bulk', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employees })
    });
};

export const apiFetchDailyRecords = async (month, year) => {
    return await fetch(`/api/daily-records/${month}/${year}`, {
        headers: getHeaders()
    });
};

export const apiFetchMonthlyReport = async (month, year) => {
    return await fetch(`/api/monthly-report/${month}/${year}`, {
        headers: getHeaders()
    });
};
export const apiSaveMonthlyReport = async (payload) => {
    return await fetch('/api/monthly-report', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiSaveDailyRecord = async (payload) => {
    return await fetch('/api/daily-records', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiUpdateDailyRecord = async (id, payload) => {
    return await fetch(`/api/daily-records/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
};

export const apiDeleteDailyRecord = async (id) => {
    return await fetch(`/api/daily-records/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};