require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Εξυπηρέτηση στατικών αρχείων από τον φάκελο public
app.use(express.static(path.join(__dirname, 'public')));

// Αν ο χρήστης επισκεφθεί το /, σερβίρουμε το index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Εκκίνηση server και αρχικοποίηση Βάσης Δεδομένων
const pool = require('./db');

app.post('/api/daily-records', async (req, res) => {
  try {
    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses } = req.body;
    
    const query = `
      INSERT INTO dashboard_daily_records (date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [date, daily_revenue, cash_revenue || 0, pos_revenue || 0, total_expenses, food_cost_percentage, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([])];
    
    await pool.query(query, values);
    
    res.status(201).json({ message: 'Η καταγραφή αποθηκεύτηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error saving daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία αποθήκευσης.' });
  }
});

app.get('/api/daily-records/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const query = `
      SELECT id, date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses
      FROM dashboard_daily_records
      WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2
      ORDER BY date ASC
    `;
    const result = await pool.query(query, [month, year]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly records:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ανάκτησης.' });
  }
});

app.put('/api/daily-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses } = req.body;
    
    const query = `
      UPDATE dashboard_daily_records
      SET date = $1, daily_revenue = $2, cash_revenue = $3, pos_revenue = $4, total_expenses = $5, food_cost_percentage = $6, worked_employees = $7, detailed_expenses = $8
      WHERE id = $9
    `;
    const values = [date, daily_revenue, cash_revenue || 0, pos_revenue || 0, total_expenses, food_cost_percentage, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([]), id];
    
    await pool.query(query, values);
    
    res.json({ message: 'Η καταγραφή ενημερώθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error updating daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ενημέρωσης.' });
  }
});

app.delete('/api/daily-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM dashboard_daily_records WHERE id = $1';
    await pool.query(query, [id]);
    
    res.json({ message: 'Η καταγραφή διαγράφηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error deleting daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία διαγραφής.' });
  }
});

app.get('/api/monthly-report/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    
    // Έλεγχος αν υπάρχει ήδη "κλεισμένος" μήνας
    const summaryQuery = `
      SELECT total_revenue, total_expenses, fixed_costs, net_profit 
      FROM monthly_summaries 
      WHERE month = $1 AND year = $2
    `;
    const summaryResult = await pool.query(summaryQuery, [month, year]);
    
    if (summaryResult.rows.length > 0) {
      return res.json(summaryResult.rows[0]);
    }

    // Διαφορετικά, υπολογισμός από τις ημερήσιες εγγραφές
    const dailyQuery = `
      SELECT 
        COALESCE(SUM(daily_revenue), 0) as total_revenue,
        COALESCE(SUM(total_expenses), 0) as total_expenses
      FROM dashboard_daily_records
      WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2
    `;
    const dailyResult = await pool.query(dailyQuery, [month, year]);
    
    const total_revenue = parseFloat(dailyResult.rows[0].total_revenue);
    const total_expenses = parseFloat(dailyResult.rows[0].total_expenses);
    const net_profit = total_revenue - total_expenses;

    res.json({ total_revenue, total_expenses, net_profit });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ανάκτησης μηνιαίας αναφοράς.' });
  }
});

app.post('/api/monthly-report', async (req, res) => {
  try {
    const { month, year, total_revenue, total_expenses, fixed_costs, net_profit, clearData } = req.body;
    
    const query = `
      INSERT INTO monthly_summaries (month, year, total_revenue, total_expenses, fixed_costs, net_profit)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (month, year) DO UPDATE 
      SET total_revenue = EXCLUDED.total_revenue,
          total_expenses = EXCLUDED.total_expenses,
          fixed_costs = EXCLUDED.fixed_costs,
          net_profit = EXCLUDED.net_profit
    `;
    await pool.query(query, [month, year, total_revenue, total_expenses, fixed_costs, net_profit]);
    
    if (clearData) {
      const deleteQuery = `
        DELETE FROM dashboard_daily_records
        WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2
      `;
      await pool.query(deleteQuery, [month, year]);
    }
    
    res.status(201).json({ message: 'Ο μήνας έκλεισε επιτυχώς!' });
  } catch (error) {
    console.error('Error saving monthly summary:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία αποθήκευσης συνόψεων.' });
  }
});

const startServer = async () => {
  try {
    // Αρχικοποίηση πινάκων της βάσης
    await initDB();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
