const storedVat = localStorage.getItem('vatRate');
const storedOverheads = localStorage.getItem('fixedOverheads');
const storedInsurance = localStorage.getItem('ownerInsurance');

const initVat = storedVat !== null ? parseFloat(storedVat) / 100 : 0.13;
const initOverheads = storedOverheads !== null ? parseFloat(storedOverheads) : 0;
const initInsurance = storedInsurance !== null ? parseFloat(storedInsurance) : 0;
const initFixedCosts = initOverheads + initInsurance;

export const appState = {
    currentReportData: null,
    currentMonthlyRecords: [],
    currentEditRecordId: null,
    currentEditRecordDate: null,
    foodCostChart: null,
    foodCostPercentage: 0,
    currentDate: new Date(),
    currentModalExpenses: [],
    currentDashboardExpenses: [],
    currentEditExpenses: [],
    actionModalTarget: null,
    currentDayModalMode: 'closure',
    currentEditRecordWorkedEmployees: [],
    AVERAGE_VAT_RATE: initVat,
    LABOR_BURDEN_RATE: 1.35,
    MONTHLY_FIXED_COSTS: initFixedCosts,
    monthlyChart: null
};
