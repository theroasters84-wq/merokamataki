require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// Middleware ταυτοποίησης για προσθήκη υποστήριξης Multi-Tenancy
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Μη εξουσιοδοτημένη πρόσβαση. Απουσιάζει το token.' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Το token δεν είναι έγκυρο.' });
    req.user = user; 
    req.user.storeId = user.store_id || 1; // Εξασφάλιση του storeId μέσω middleware
    next();
  });
};

// --- Endpoints Ταυτοποίησης (Auth) ---

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, store_id } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε email και κωδικό.' });

    // Έλεγχος αν το email υπάρχει ήδη
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Το email χρησιμοποιείται ήδη.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Εύρεση του επόμενου διαθέσιμου store_id (μέγιστο υπάρχον + 1)
    const maxStoreQuery = await pool.query('SELECT MAX(store_id) FROM users');
    const maxStoreId = maxStoreQuery.rows[0].max || 0;
    const assignedStoreId = maxStoreId + 1;

    const query = `
      INSERT INTO users (email, password_hash, store_id)
      VALUES ($1, $2, $3) RETURNING id, email, store_id
    `;
    const result = await pool.query(query, [email, hashedPassword, assignedStoreId]);

    res.status(201).json({ message: 'Ο χρήστης δημιουργήθηκε επιτυχώς!', user: result.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την εγγραφή.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε email και κωδικό.' });

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Λάθος email ή κωδικός.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Λάθος email ή κωδικός.' });
    }

    const token = jwt.sign(
      { user_id: user.id, store_id: user.store_id || 1 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      store_id: user.store_id, 
      email: user.email,
      hasPin: (user.admin_pin !== null && user.admin_pin !== '')
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την σύνδεση.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Παρακαλώ εισάγετε το email σας.' });

    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Δεν βρέθηκε χρήστης με αυτό το email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Λήξη σε 1 ώρα
    const tokenExpiry = new Date(Date.now() + 3600000); 

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, tokenExpiry, email]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Προεπιλογή, μπορείς να το αλλάξεις αν χρησιμοποιείς άλλον πάροχο
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Δυναμική κατασκευή του URL με βάση το host
    const domain = req.headers.host || 'localhost:3000';
    const resetUrl = `http://${domain}/reset-password.html?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Επαναφορά Κωδικού Πρόσβασης - Μεροκαματάκι',
      text: `Έχετε ζητήσει επαναφορά του κωδικού σας.\n\nΠατήστε στον παρακάτω σύνδεσμο για να ορίσετε νέο κωδικό πρόσβασης:\n${resetUrl}\n\nΑν δεν το ζητήσατε εσείς, παρακαλώ αγνοήστε αυτό το email.`
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Το email επαναφοράς εστάλη επιτυχώς.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email. Ελέγξτε τις ρυθμίσεις του SMTP.' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    }

    const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()';
    const result = await pool.query(query, [token]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Το token είναι μη έγκυρο ή έχει λήξει.' });
    }

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Ο κωδικός σας ενημερώθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαναφορά κωδικού.' });
  }
});

// --- Endpoints PIN Ιδιοκτήτη ---

app.post('/api/pin/set', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.user_id;
    if (!pin) return res.status(400).json({ error: 'Παρακαλώ δώστε το νέο PIN.' });

    const hashedPin = await bcrypt.hash(pin, 10);
    await pool.query('UPDATE users SET admin_pin = $1 WHERE id = $2', [hashedPin, userId]);
    
    res.json({ message: 'Το PIN ορίστηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τον ορισμό του PIN.' });
  }
});

app.post('/api/pin/verify', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.user_id;
    if (!pin) return res.status(400).json({ error: 'Παρακαλώ δώστε το PIN.' });
    
    const result = await pool.query('SELECT admin_pin FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Χρήστης δεν βρέθηκε.' });
    
    const user = result.rows[0];
    if (!user.admin_pin) return res.status(400).json({ error: 'Δεν έχει οριστεί PIN. Παρακαλώ ορίστε νέο PIN.' });
    
    const isMatch = await bcrypt.compare(pin, user.admin_pin);
    res.json({ success: isMatch });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαλήθευση του PIN.' });
  }
});

app.post('/api/pin/forgot', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Χρήστης δεν βρέθηκε.' });
    
    const email = userResult.rows[0].email;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // Λήξη σε 1 ώρα

    await pool.query(
      'UPDATE users SET pin_reset_token = $1, pin_reset_token_expiry = $2 WHERE id = $3',
      [resetToken, tokenExpiry, userId]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const domain = req.headers.host || 'localhost:3000';
    const resetUrl = `http://${domain}/reset-pin.html?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Επαναφορά PIN Ιδιοκτήτη - Μεροκαματάκι',
      text: `Έχετε ζητήσει επαναφορά του PIN Ιδιοκτήτη.\n\nΠατήστε στον παρακάτω σύνδεσμο για να ορίσετε νέο PIN:\n${resetUrl}\n\nΑν δεν το ζητήσατε εσείς, παρακαλώ αγνοήστε αυτό το email.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Το email επαναφοράς PIN εστάλη επιτυχώς.' });
  } catch (error) {
    console.error('Forgot PIN error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email επαναφοράς PIN.' });
  }
});

app.post('/api/pin/reset', async (req, res) => {
  try {
    const { token, newPin } = req.body;
    if (!token || !newPin) return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    const query = 'SELECT * FROM users WHERE pin_reset_token = $1 AND pin_reset_token_expiry > NOW()';
    const result = await pool.query(query, [token]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Το token είναι μη έγκυρο ή έχει λήξει.' });
    const user = result.rows[0];
    const hashedPin = await bcrypt.hash(newPin, 10);
    await pool.query('UPDATE users SET admin_pin = $1, pin_reset_token = NULL, pin_reset_token_expiry = NULL WHERE id = $2', [hashedPin, user.id]);
    res.json({ message: 'Το PIN σας ενημερώθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Reset PIN error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαναφορά του PIN.' });
  }
});

// --- Τέλος Endpoints Ταυτοποίησης ---

app.post('/api/daily-records', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses } = req.body;
    
    const query = `
      INSERT INTO dashboard_daily_records (store_id, date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [store_id, date, daily_revenue, cash_revenue || 0, pos_revenue || 0, total_expenses, food_cost_percentage, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([])];
    
    await pool.query(query, values);
    
    res.status(201).json({ message: 'Η καταγραφή αποθηκεύτηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error saving daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία αποθήκευσης.' });
  }
});

app.get('/api/daily-records/:month/:year', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { month, year } = req.params;
    
    const query = `
      SELECT id, date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses
      FROM dashboard_daily_records
      WHERE store_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
      ORDER BY date ASC
    `;
    const result = await pool.query(query, [store_id, month, year]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly records:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ανάκτησης.' });
  }
});

app.put('/api/daily-records/:id', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { id } = req.params;
    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses } = req.body;
    
    const query = `
      UPDATE dashboard_daily_records
      SET date = $2, daily_revenue = $3, cash_revenue = $4, pos_revenue = $5, total_expenses = $6, food_cost_percentage = $7, worked_employees = $8, detailed_expenses = $9
      WHERE id = $1 AND store_id = $10
    `;
    const values = [id, date, daily_revenue, cash_revenue || 0, pos_revenue || 0, total_expenses, food_cost_percentage, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([]), store_id];
    
    await pool.query(query, values);
    
    res.json({ message: 'Η καταγραφή ενημερώθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error updating daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ενημέρωσης.' });
  }
});

app.delete('/api/daily-records/:id', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { id } = req.params;
    const query = 'DELETE FROM dashboard_daily_records WHERE id = $1 AND store_id = $2';
    await pool.query(query, [id, store_id]);
    
    res.json({ message: 'Η καταγραφή διαγράφηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error deleting daily record:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία διαγραφής.' });
  }
});

app.get('/api/monthly-report/:month/:year', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { month, year } = req.params;
    
    // Έλεγχος αν υπάρχει ήδη "κλεισμένος" μήνας
    const summaryQuery = `
      SELECT total_revenue, total_expenses, fixed_costs, net_profit 
      FROM monthly_summaries 
      WHERE store_id = $1 AND month = $2 AND year = $3
    `;
    const summaryResult = await pool.query(summaryQuery, [store_id, month, year]);
    
    if (summaryResult.rows.length > 0) {
      return res.json(summaryResult.rows[0]);
    }

    // Διαφορετικά, υπολογισμός από τις ημερήσιες εγγραφές
    const dailyQuery = `
      SELECT 
        COALESCE(SUM(daily_revenue), 0) as total_revenue,
        COALESCE(SUM(total_expenses), 0) as total_expenses
      FROM dashboard_daily_records
      WHERE store_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
    `;
    const dailyResult = await pool.query(dailyQuery, [store_id, month, year]);
    
    const total_revenue = parseFloat(dailyResult.rows[0].total_revenue);
    const total_expenses = parseFloat(dailyResult.rows[0].total_expenses);
    const net_profit = total_revenue - total_expenses;

    res.json({ total_revenue, total_expenses, net_profit });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία ανάκτησης μηνιαίας αναφοράς.' });
  }
});

app.post('/api/monthly-report', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { month, year, total_revenue, total_expenses, fixed_costs, net_profit, clearData } = req.body;
    
    const query = `
      INSERT INTO monthly_summaries (store_id, month, year, total_revenue, total_expenses, fixed_costs, net_profit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (store_id, month, year) DO UPDATE 
      SET total_revenue = EXCLUDED.total_revenue,
          total_expenses = EXCLUDED.total_expenses,
          fixed_costs = EXCLUDED.fixed_costs,
          net_profit = EXCLUDED.net_profit
    `;
    await pool.query(query, [store_id, month, year, total_revenue, total_expenses, fixed_costs, net_profit]);
    
    if (clearData) {
      const deleteQuery = `
        DELETE FROM dashboard_daily_records
        WHERE store_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
      `;
      await pool.query(deleteQuery, [store_id, month, year]);
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
