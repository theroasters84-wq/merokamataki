const { Client } = require('pg');

// Συνδεόμαστε στην προεπιλεγμένη βάση "postgres" για να δημιουργήσουμε τη δική μας
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
});

async function setup() {
  try {
    await client.connect();
    await client.query('CREATE DATABASE finance_manager;');
    console.log('✅ Η βάση δεδομένων "finance_manager" δημιουργήθηκε επιτυχώς!');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('✅ Η βάση δεδομένων "finance_manager" υπάρχει ήδη. Προχωράμε!');
    } else {
      console.error('❌ Σφάλμα σύνδεσης. Η PostgreSQL δεν τρέχει ή ο κωδικός δεν είναι "postgres":', err.message);
    }
  } finally {
    await client.end();
  }
}

setup();