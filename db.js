const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') 
    ? false 
    : { rejectUnauthorized: false } // Τοπικά κλειστό, στο Render (ή άλλους server) ανοιχτό
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        store_id INTEGER DEFAULT 1,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dashboard_daily_records (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        daily_revenue DECIMAL(10, 2) NOT NULL,
        total_expenses DECIMAL(10, 2) NOT NULL,
        food_cost_percentage DECIMAL(5, 2) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dashboard_expenses (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dashboard_employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        daily_wage DECIMAL(10, 2) NOT NULL,
        days_per_week INTEGER NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS monthly_summaries (
        id SERIAL PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        total_revenue DECIMAL(10, 2) NOT NULL,
        total_expenses DECIMAL(10, 2) NOT NULL,
        fixed_costs DECIMAL(10, 2) DEFAULT 0,
        net_profit DECIMAL(10, 2) NOT NULL,
        UNIQUE (month, year)
      );
    `);

    // Ασφαλής προσθήκη της νέας στήλης σε περίπτωση που ο πίνακας υπήρχε ήδη από πριν
    await pool.query(`ALTER TABLE monthly_summaries ADD COLUMN IF NOT EXISTS fixed_costs DECIMAL(10, 2) DEFAULT 0;`);
    
    await pool.query(`ALTER TABLE dashboard_daily_records ADD COLUMN IF NOT EXISTS worked_employees JSONB DEFAULT '[]'::jsonb;`);
    await pool.query(`ALTER TABLE dashboard_daily_records ADD COLUMN IF NOT EXISTS detailed_expenses JSONB DEFAULT '[]'::jsonb;`);
    await pool.query(`ALTER TABLE dashboard_daily_records ADD COLUMN IF NOT EXISTS cash_revenue DECIMAL(10, 2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE dashboard_daily_records ADD COLUMN IF NOT EXISTS pos_revenue DECIMAL(10, 2) DEFAULT 0;`);

    // Multi-tenancy: Προσθήκη store_id στους πίνακες
    await pool.query(`ALTER TABLE dashboard_daily_records ADD COLUMN IF NOT EXISTS store_id INTEGER DEFAULT 1;`);
    await pool.query(`ALTER TABLE dashboard_expenses ADD COLUMN IF NOT EXISTS store_id INTEGER DEFAULT 1;`);
    await pool.query(`ALTER TABLE dashboard_employees ADD COLUMN IF NOT EXISTS store_id INTEGER DEFAULT 1;`);
    await pool.query(`ALTER TABLE monthly_summaries ADD COLUMN IF NOT EXISTS store_id INTEGER DEFAULT 1;`);

    // Πρόβλεψη σε περίπτωση που χρησιμοποιείται ή υπάρχει παλιός πίνακας με το όνομα dashboard_staff
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dashboard_staff') THEN
          ALTER TABLE dashboard_staff ADD COLUMN IF NOT EXISTS store_id INTEGER DEFAULT 1;
        END IF;
      END $$;
    `);

    await pool.query(`ALTER TABLE monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_month_year_key;`);
    await pool.query(`ALTER TABLE monthly_summaries DROP CONSTRAINT IF EXISTS monthly_summaries_store_month_year_key;`);
    await pool.query(`ALTER TABLE monthly_summaries ADD CONSTRAINT monthly_summaries_store_month_year_key UNIQUE (store_id, month, year);`);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB,
};
