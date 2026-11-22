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
app.use(express.json({ limit: '100kb' }));

// JSON Error Handler για malformed JSON payloads & 413 Payload Too Large (επιστροφή καθαρού JSON αντί για HTML stack trace)
app.use((err, req, res, next) => {
  if (err) {
    if (err.type === 'entity.too.large' || err.status === 413) {
      return res.status(413).json({ error: 'Το μέγεθος του αιτήματος υπερβαίνει το επιτρεπτό όριο.' });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Μη έγκυρη μορφή δεδομένων JSON.' });
    }
    if (err.status && err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ error: 'Μη έγκυρο αίτημα.' });
    }
  }
  next(err);
});

// Εξασφάλιση ότι το req.body είναι πάντα έγκυρο αντικείμενο (προστασία όταν λείπει το Content-Type header)
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    req.body = {};
  }
  next();
});

// --- Ελαφρύς In-Memory Rate Limiter για προστασία ευαίσθητων Auth / PIN endpoints ---
const rateLimitStore = new Map();
const createRateLimiter = ({ windowMs = 60 * 1000, max = 80, keyPrefix = 'global' } = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') || req.ip || 'unknown';
    const key = `${keyPrefix}:${clientIp}`;

    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Πάρα πολλά αιτήματα σε σύντομο χρονικό διάστημα. Παρακαλώ περιμένετε λίγο και δοκιμάστε ξανά.'
      });
    }

    next();
  };
};

// Περιοδικός καθαρισμός ληγμένων εγγραφών rate limiter (χωρίς να κρατάει ανοιχτό το event loop)
const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
if (typeof rateLimitCleanupTimer.unref === 'function') {
  rateLimitCleanupTimer.unref();
}

const registerRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 80, keyPrefix: 'register' });
const loginRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 80, keyPrefix: 'login' });
const forgotPasswordRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60, keyPrefix: 'forgot_pw' });
const pinVerifyRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 40, keyPrefix: 'pin_verify' });

// Εξυπηρέτηση στατικών αρχείων από τον φάκελο public
app.use(express.static(path.join(__dirname, 'public')));

// Αν ο χρήστης επισκεφθεί το /, σερβίρουμε το index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- WAKE UP ENDPOINT ΓΙΑ ΔΩΡΕΑΝ SERVERS ---
// Endpoint για να κρατάμε τον server ξύπνιο μέσω εξωτερικών pings (π.χ. cron-job.org)
app.get('/api/keep_alive', (req, res) => {
    res.status(200).json({ 
        status: 'alive', 
        app: 'merokamataki',
        time: new Date().toISOString() 
    });
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

// Endpoint για τον περιοδικό έλεγχο του token από το frontend
app.get('/api/check-token', authenticateToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Token is valid.' });
});

// --- Endpoints Ταυτοποίησης (Auth) ---

app.post('/api/register', registerRateLimiter, async (req, res) => {
  try {
    const { email, password, store_id, termsAccepted } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε email και κωδικό.' });

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος δεδομένων για email ή κωδικό.' });
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || cleanEmail.length > 254) {
      return res.status(400).json({ error: 'Το email δεν είναι έγκυρο ή υπερβαίνει το μέγιστο επιτρεπτό μήκος (254 χαρακτήρες).' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Ο κωδικός πρόσβασης υπερβαίνει το μέγιστο επιτρεπτό μήκος.' });
    }

    // Έλεγχος αποδοχής Όρων Χρήσης & Πολιτικής Απορρήτου (με διατήρηση backward compatibility αν το πεδίο δεν σταλεί από παλαιότερο client)
    if (termsAccepted !== undefined && termsAccepted !== true && termsAccepted !== 'true') {
      return res.status(400).json({ error: 'Απαιτείται η αποδοχή των Όρων Χρήσης και της Πολιτικής Απορρήτου για την εγγραφή.' });
    }

    // Έλεγχος αν το email υπάρχει ήδη
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Το email χρησιμοποιείται ήδη.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ατομική απόδοση μοναδικού store_id μέσω PostgreSQL sequence (εξάλειψη race condition του SELECT MAX(store_id))
    const maxStoreQuery = await pool.query("SELECT nextval('users_store_id_seq') AS next_store_id");
    const assignedStoreId = parseInt(maxStoreQuery.rows[0].next_store_id, 10);

    const termsAcceptedAt = (termsAccepted === true || termsAccepted === 'true') ? new Date() : null;

    const query = `
      INSERT INTO users (email, password_hash, store_id, terms_accepted_at)
      VALUES ($1, $2, $3, $4) RETURNING id, email, store_id
    `;
    const result = await pool.query(query, [cleanEmail, hashedPassword, assignedStoreId, termsAcceptedAt]);

    res.status(201).json({ message: 'Ο χρήστης δημιουργήθηκε επιτυχώς!', user: result.rows[0] });
  } catch (error) {
    if (error && error.code === '23505') {
      return res.status(400).json({ error: 'Το email χρησιμοποιείται ήδη.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την εγγραφή.' });
  }
});

app.post('/api/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε email και κωδικό.' });

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος δεδομένων για email ή κωδικό.' });
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || cleanEmail.length > 254 || password.length > 128) {
      return res.status(400).json({ error: 'Το email ή ο κωδικός υπερβαίνει το μέγιστο επιτρεπτό μήκος.' });
    }

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [cleanEmail]);

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

// --- Βοηθητική Συνάρτηση Δημιουργίας SMTP Transporter (Gmail / Custom SMTP) ---
const createMailTransporter = () => {
  const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  // Αφαίρεση τυχόν κενών από το 16-ψήφιο Gmail App Password
  const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  const timeoutConfig = {
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  };

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure,
    requireTLS: !isSecure,
    family: 4, // Αυστηρή χρήση IPv4 για αποφυγή IPv6 ENETUNREACH σε cloud περιβάλλοντα (π.χ. Render)
    auth: { user: smtpUser, pass: smtpPass },
    ...timeoutConfig
  });
};

const handleForgotPassword = async (req, res) => {
  try {
    const body = req.body || {};
    if (body.email === undefined || body.email === null || body.email === '') {
      return res.status(400).json({ error: 'Παρακαλώ εισάγετε το email σας.' });
    }
    if (typeof body.email !== 'string') {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος δεδομένων για το email.' });
    }
    const rawEmail = body.email.trim().toLowerCase();
    if (!rawEmail || rawEmail.length > 254) {
      return res.status(400).json({ error: 'Παρακαλώ εισάγετε ένα έγκυρο email.' });
    }

    const neutralSuccessMessage = 'Εάν το email είναι καταχωρημένο στο σύστημα, σας έχουμε αποστείλει σύνδεσμο επαναφοράς κωδικού.';

    const userQuery = 'SELECT id, email FROM users WHERE LOWER(TRIM(email)) = $1';
    const userResult = await pool.query(userQuery, [rawEmail]);

    // Επιστρέφουμε πάντα ουδέτερο μήνυμα επιτυχίας ώστε να μην αποκαλύπτεται αν υπάρχει το email στη βάση
    if (userResult.rows.length === 0) {
      return res.json({ message: neutralSuccessMessage });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Λήξη σε 30 λεπτά
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    // Ακύρωση προηγούμενων αχρησιμοποίητων tokens του ίδιου χρήστη & αποθήκευση μόνο του SHA-256 hash
    await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
      [user.id]
    );
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, tokenExpiry]
    );

    // Διατήρηση συμβατότητας (αποθηκεύουμε επίσης το hash στη στήλη reset_token του users)
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [tokenHash, tokenExpiry, user.id]
    );

    const configuredAppUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
    const forwardedProto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'http';
    const domain = req.headers.host || `localhost:${port}`;
    const baseUrl = configuredAppUrl || `${protocol}://${domain}`;
    const resetUrl = `${baseUrl}/?resetToken=${resetToken}`;

    const emailSubject = 'Επαναφορά Κωδικού Πρόσβασης - Μεροκαματάκι';
    const emailText = `Έχετε ζητήσει επαναφορά του κωδικού σας στο Μεροκαματάκι.\n\nΠατήστε στον παρακάτω σύνδεσμο για να ορίσετε νέο κωδικό πρόσβασης (ισχύει για 30 λεπτά):\n${resetUrl}\n\nΑν δεν το ζητήσατε εσείς, παρακαλώ αγνοήστε αυτό το email.`;
    const emailHtml = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
          <h2 style="margin-top: 0; color: #0f172a;">💼 Μεροκαματάκι — Ανάκτηση Κωδικού</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Λάβαμε αίτημα επαναφοράς του κωδικού πρόσβασης για τον λογαριασμό σας.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px;">Ορισμός Νέου Κωδικού</a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #64748b;">Ο σύνδεσμος είναι αυστηρά προσωπικός και <b>λήγει σε 30 λεπτά</b>. Αν το κουμπί δεν ανοίγει, αντιγράψτε τον παρακάτω σύνδεσμο στον browser σας:</p>
          <p style="font-size: 12px; word-break: break-all; color: #3b82f6;">${resetUrl}</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Αν δεν ζητήσατε εσείς επαναφορά κωδικού, μπορείτε να αγνοήσετε με ασφάλεια αυτό το μήνυμα.</p>
        </div>
      `;

    const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const senderEmail = (process.env.EMAIL_USER || process.env.MAIL_FROM || process.env.SMTP_USER || '').trim();

    // 1. Προτεραιότητα Α: Αποστολή μέσω Brevo HTTPS API (Port 443 - παρακάμπτει μπλοκάρισμα SMTP θυρών)
    if (brevoApiKey) {
      if (!senderEmail) {
        console.error('[Email Config Error] BREVO_API_KEY is set, but EMAIL_USER (or MAIL_FROM) is missing.');
        return res.status(500).json({ error: 'Λείπει η διεύθυνση αποστολέα (EMAIL_USER / MAIL_FROM) στις ρυθμίσεις.' });
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: { name: 'Μεροκαματάκι', email: senderEmail },
          to: [{ email: String(user.email).trim() }],
          subject: emailSubject,
          htmlContent: emailHtml,
          textContent: emailText
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response body');
        console.error('[Brevo API Error]', response.status, errorText);
        return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email μέσω υπηρεσίας API.' });
      }

      return res.json({ message: neutralSuccessMessage });
    }

    // 2. Προτεραιότητα Β: Αποστολή μέσω Resend HTTPS API (Port 443 - παρακάμπτει μπλοκάρισμα SMTP θυρών)
    if (resendApiKey) {
      const resendFrom = senderEmail ? `Μεροκαματάκι <${senderEmail}>` : 'Μεροκαματάκι <onboarding@resend.dev>';

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [user.email],
          subject: emailSubject,
          html: emailHtml,
          text: emailText
        })
      });

      if (!resendResponse.ok) {
        const errBody = await resendResponse.text().catch(() => 'Unable to read response body');
        console.error('[Resend API Error] Αποτυχία αποστολής email μέσω Resend HTTPS API:', {
          status: resendResponse.status,
          statusText: resendResponse.statusText,
          details: errBody
        });
        return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email μέσω υπηρεσίας API.' });
      }

      return res.json({ message: neutralSuccessMessage });
    }

    // 3. Fallback: Αποστολή μέσω SMTP (Nodemailer με IPv4 & STARTTLS port 587)
    const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');
    if (!smtpUser || !smtpPass) {
      const missingVars = [];
      if (!smtpUser) missingVars.push('EMAIL_USER (ή SMTP_USER)');
      if (!smtpPass) missingVars.push('EMAIL_PASS (ή SMTP_PASS)');
      console.error(
        `[SMTP Config Error] Forgot password failed: Λείπουν οι μεταβλητές περιβάλλοντος: ${missingVars.join(', ')} (ή BREVO_API_KEY / RESEND_API_KEY). Ελέγξτε το αρχείο .env ή τα Environment Variables του server.`
      );
      return res.status(500).json({ error: 'Ο διακομιστής email (SMTP) δεν έχει ρυθμιστεί ακόμα.' });
    }

    const transporter = createMailTransporter();

    // Προκαταρκτικός έλεγχος σύνδεσης/αυθεντικοποίησης SMTP με ασφαλές timeout & χωρίς διαρροή μυστικών
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => {
            const timeoutErr = new Error('SMTP verify timed out after 10000ms');
            timeoutErr.code = 'ETIMEDOUT';
            timeoutErr.command = 'VERIFY';
            reject(timeoutErr);
          }, 10000)
        )
      ]);
    } catch (verifyErr) {
      console.error('[SMTP Verify Error] Αποτυχία επαλήθευσης σύνδεσης SMTP πριν την αποστολή:', {
        code: verifyErr.code || 'UNKNOWN_CODE',
        responseCode: verifyErr.responseCode || null,
        command: verifyErr.command || 'VERIFY',
        message: verifyErr.message || 'Unknown verify error'
      });
      return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email. Ελέγξτε τις ρυθμίσεις του SMTP.' });
    }

    const mailOptions = {
      from: `"Μεροκαματάκι" <${smtpUser}>`,
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: neutralSuccessMessage });
  } catch (error) {
    console.error('[Forgot Password Error] Αποτυχία στη διαδικασία ανάκτησης κωδικού:', {
      code: error.code || 'UNKNOWN_CODE',
      responseCode: error.responseCode || null,
      command: error.command || null,
      message: error.message || 'Unknown error'
    });
    res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email. Ελέγξτε τις ρυθμίσεις του SMTP.' });
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    }

    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος δεδομένων.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Ο νέος κωδικός πρέπει να αποτελείται από τουλάχιστον 6 χαρακτήρες.' });
    }

    if (newPassword.length > 128 || token.length > 512) {
      return res.status(400).json({ error: 'Τα στοιχεία υπερβαίνουν το μέγιστο επιτρεπτό μήκος.' });
    }

    const cleanToken = token.trim();
    if (!cleanToken) {
      return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    }
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    // 1. Έλεγχος στον πίνακα password_reset_tokens με βάση το SHA-256 hash
    const tokenRecordResult = await pool.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [tokenHash]
    );

    let targetUserId = null;
    let tokenRecordId = null;

    if (tokenRecordResult.rows.length > 0) {
      targetUserId = tokenRecordResult.rows[0].user_id;
      tokenRecordId = tokenRecordResult.rows[0].id;
    } else {
      // 2. Fallback έλεγχος στον πίνακα users (για συμβατότητα)
      const legacyResult = await pool.query(
        'SELECT id FROM users WHERE (reset_token = $1 OR reset_token = $2) AND reset_token_expiry > NOW()',
        [tokenHash, cleanToken]
      );
      if (legacyResult.rows.length > 0) {
        targetUserId = legacyResult.rows[0].id;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Ο σύνδεσμος επαναφοράς είναι μη έγκυρος, έχει ήδη χρησιμοποιηθεί ή έχει λήξει.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, targetUserId]
    );

    if (tokenRecordId) {
      await pool.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [targetUserId]
      );
    }

    res.json({ message: 'Ο κωδικός σας ενημερώθηκε επιτυχώς! Μπορείτε πλέον να συνδεθείτε.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαναφορά κωδικού.' });
  }
};

app.post('/api/auth/forgot-password', forgotPasswordRateLimiter, handleForgotPassword);
app.post('/api/forgot-password', forgotPasswordRateLimiter, handleForgotPassword);

app.post('/api/auth/reset-password', handleResetPassword);
app.post('/api/reset-password', handleResetPassword);

// --- Endpoints PIN Ιδιοκτήτη ---

app.post('/api/pin/set', authenticateToken, async (req, res) => {
  try {
    const { pin } = req.body || {};
    const userId = req.user.user_id;
    if (!pin) return res.status(400).json({ error: 'Παρακαλώ δώστε το νέο PIN.' });
    if (typeof pin !== 'string' || pin.length > 64) {
      return res.status(400).json({ error: 'Μη έγκυρη μορφή ή μήκος PIN.' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await pool.query('UPDATE users SET admin_pin = $1 WHERE id = $2', [hashedPin, userId]);
    
    res.json({ message: 'Το PIN ορίστηκε επιτυχώς!' });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τον ορισμό του PIN.' });
  }
});

app.post('/api/pin/verify', authenticateToken, pinVerifyRateLimiter, async (req, res) => {
  try {
    const { pin } = req.body || {};
    const userId = req.user.user_id;
    if (!pin) return res.status(400).json({ error: 'Παρακαλώ δώστε το PIN.' });
    if (typeof pin !== 'string' || pin.length > 64) {
      return res.status(400).json({ error: 'Μη έγκυρη μορφή ή μήκος PIN.' });
    }
    
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

app.post('/api/pin/forgot', authenticateToken, forgotPasswordRateLimiter, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Χρήστης δεν βρέθηκε.' });
    
    const email = String(userResult.rows[0].email || '').trim();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // Λήξη σε 1 ώρα

    // Αποθήκευση SHA-256 hash στη βάση (με υποστήριξη backward compatibility στο /api/pin/reset)
    await pool.query(
      'UPDATE users SET pin_reset_token = $1, pin_reset_token_expiry = $2 WHERE id = $3',
      [tokenHash, tokenExpiry, userId]
    );

    const configuredAppUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
    const forwardedProto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'http';
    const domain = req.headers.host || `localhost:${port}`;
    const baseUrl = configuredAppUrl || `${protocol}://${domain}`;
    const resetUrl = `${baseUrl}/reset-pin.html?token=${resetToken}`;

    const emailSubject = 'Επαναφορά PIN Ιδιοκτήτη - Μεροκαματάκι';
    const emailText = `Έχετε ζητήσει επαναφορά του PIN Ιδιοκτήτη.\n\nΠατήστε στον παρακάτω σύνδεσμο για να ορίσετε νέο PIN (ισχύει για 1 ώρα):\n${resetUrl}\n\nΑν δεν το ζητήσατε εσείς, παρακαλώ αγνοήστε αυτό το email.`;
    const emailHtml = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <h2 style="margin-top: 0; color: #0f172a;">🔑 Μεροκαματάκι — Επαναφορά PIN Ιδιοκτήτη</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Λάβαμε αίτημα επαναφοράς του PIN Ιδιοκτήτη για το κατάστημά σας.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px;">Ορισμός Νέου PIN</a>
        </div>
        <p style="font-size: 12px; line-height: 1.5; color: #64748b;">Ο σύνδεσμος είναι αυστηρά προσωπικός και <b>λήγει σε 1 ώρα</b>. Αν το κουμπί δεν ανοίγει, αντιγράψτε τον παρακάτω σύνδεσμο στον browser σας:</p>
        <p style="font-size: 12px; word-break: break-all; color: #3b82f6;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Αν δεν ζητήσατε εσείς επαναφορά PIN, μπορείτε να αγνοήσετε με ασφάλεια αυτό το μήνυμα.</p>
      </div>
    `;

    const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const senderEmail = (process.env.EMAIL_USER || process.env.MAIL_FROM || process.env.SMTP_USER || '').trim();

    // 1. Προτεραιότητα Α: Αποστολή μέσω Brevo HTTPS API (Port 443)
    if (brevoApiKey) {
      if (!senderEmail) {
        console.error('[Email Config Error] BREVO_API_KEY is set, but EMAIL_USER (or MAIL_FROM) is missing.');
        return res.status(500).json({ error: 'Λείπει η διεύθυνση αποστολέα (EMAIL_USER / MAIL_FROM) στις ρυθμίσεις.' });
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: { name: 'Μεροκαματάκι', email: senderEmail },
          to: [{ email }],
          subject: emailSubject,
          htmlContent: emailHtml,
          textContent: emailText
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response body');
        console.error('[Brevo API Error - PIN Forgot]', response.status, errorText);
        return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email μέσω υπηρεσίας API.' });
      }

      return res.json({ message: 'Το email επαναφοράς PIN εστάλη επιτυχώς.' });
    }

    // 2. Προτεραιότητα Β: Αποστολή μέσω Resend HTTPS API (Port 443)
    if (resendApiKey) {
      const resendFrom = senderEmail ? `Μεροκαματάκι <${senderEmail}>` : 'Μεροκαματάκι <onboarding@resend.dev>';

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [email],
          subject: emailSubject,
          html: emailHtml,
          text: emailText
        })
      });

      if (!resendResponse.ok) {
        const errBody = await resendResponse.text().catch(() => 'Unable to read response body');
        console.error('[Resend API Error - PIN Forgot] Αποτυχία αποστολής email μέσω Resend HTTPS API:', {
          status: resendResponse.status,
          statusText: resendResponse.statusText,
          details: errBody
        });
        return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email μέσω υπηρεσίας API.' });
      }

      return res.json({ message: 'Το email επαναφοράς PIN εστάλη επιτυχώς.' });
    }

    // 3. Fallback: Αποστολή μέσω SMTP (Nodemailer με IPv4 & STARTTLS port 587)
    const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');
    if (!smtpUser || !smtpPass) {
      console.error('[SMTP Config Error - PIN Forgot] Λείπουν οι ρυθμίσεις email (BREVO_API_KEY / RESEND_API_KEY / EMAIL_USER / EMAIL_PASS).');
      return res.status(500).json({ error: 'Ο διακομιστής email δεν έχει ρυθμιστεί. Χρησιμοποιήστε την επαναφορά με τον Κωδικό Λογαριασμού.' });
    }

    const transporter = createMailTransporter();

    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => {
            const timeoutErr = new Error('SMTP verify timed out after 10000ms');
            timeoutErr.code = 'ETIMEDOUT';
            timeoutErr.command = 'VERIFY';
            reject(timeoutErr);
          }, 10000)
        )
      ]);
    } catch (verifyErr) {
      console.error('[SMTP Verify Error - PIN Forgot] Αποτυχία επαλήθευσης σύνδεσης SMTP:', {
        code: verifyErr.code || 'UNKNOWN_CODE',
        responseCode: verifyErr.responseCode || null,
        command: verifyErr.command || 'VERIFY',
        message: verifyErr.message || 'Unknown verify error'
      });
      return res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email. Μπορείτε να επαναφέρετε το PIN άμεσα με τον Κωδικό Λογαριασμού.' });
    }

    const mailOptions = {
      from: `"Μεροκαματάκι" <${smtpUser}>`,
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Το email επαναφοράς PIN εστάλη επιτυχώς.' });
  } catch (error) {
    console.error('[Forgot PIN Error]', {
      code: error.code || 'UNKNOWN_CODE',
      message: error.message || 'Unknown error'
    });
    res.status(500).json({ error: 'Σφάλμα κατά την αποστολή email επαναφοράς PIN.' });
  }
});

app.post('/api/pin/reset-with-password', authenticateToken, pinVerifyRateLimiter, async (req, res) => {
  try {
    const { password, newPin } = req.body || {};
    const userId = req.user.user_id;
    const storeId = req.user.storeId;

    if (!password || !newPin) {
      return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε τον κωδικό λογαριασμού και το νέο PIN.' });
    }
    if (typeof password !== 'string' || typeof newPin !== 'string') {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος δεδομένων.' });
    }
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length > 64 || password.length > 128) {
      return res.status(400).json({ error: 'Μη έγκυρη μορφή ή μήκος στοιχείων.' });
    }

    const userResult = await pool.query(
      'SELECT id, store_id, password_hash FROM users WHERE id = $1 AND COALESCE(store_id, 1) = $2',
      [userId, storeId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Λάθος κωδικός πρόσβασης λογαριασμού.' });
    }

    const hashedPin = await bcrypt.hash(cleanPin, 10);
    await pool.query(
      'UPDATE users SET admin_pin = $1, pin_reset_token = NULL, pin_reset_token_expiry = NULL WHERE id = $2 AND COALESCE(store_id, 1) = $3',
      [hashedPin, userId, storeId]
    );

    res.json({ success: true, message: 'Το νέο PIN Ιδιοκτήτη αποθηκεύτηκε επιτυχώς!' });
  } catch (error) {
    console.error('Reset PIN with password error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαναφορά του PIN.' });
  }
});

app.post('/api/pin/reset', async (req, res) => {
  try {
    const { token, newPin } = req.body || {};
    if (!token || !newPin) return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    if (typeof token !== 'string' || typeof newPin !== 'string' || newPin.length > 64 || token.length > 512) {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος ή μήκος στοιχείων.' });
    }
    const cleanToken = token.trim();
    const cleanPin = newPin.trim();
    if (!cleanToken || !cleanPin) {
      return res.status(400).json({ error: 'Λείπουν απαραίτητα στοιχεία.' });
    }
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    const query = 'SELECT * FROM users WHERE (pin_reset_token = $1 OR pin_reset_token = $2) AND pin_reset_token_expiry > NOW()';
    const result = await pool.query(query, [tokenHash, cleanToken]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Το token είναι μη έγκυρο ή έχει λήξει.' });
    const user = result.rows[0];
    const hashedPin = await bcrypt.hash(cleanPin, 10);
    await pool.query('UPDATE users SET admin_pin = $1, pin_reset_token = NULL, pin_reset_token_expiry = NULL WHERE id = $2', [hashedPin, user.id]);
    res.json({ message: 'Το PIN σας ενημερώθηκε επιτυχώς!' });
  } catch (error) {
    console.error('Reset PIN error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την επαναφορά του PIN.' });
  }
});

// --- Τέλος Endpoints Ταυτοποίησης ---

// --- Endpoints Ρυθμίσεων Καταστήματος ---
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT fixed_overheads, owner_insurance, vat_rate FROM users WHERE id = $1', [req.user.user_id]);
    if (result.rows.length > 0) {
      res.json({
        fixed_overheads: result.rows[0].fixed_overheads || 0,
        owner_insurance: result.rows[0].owner_insurance || 0,
        vat_rate: result.rows[0].vat_rate || 13
      });
    } else {
      res.json({ fixed_overheads: 0, owner_insurance: 0, vat_rate: 13 });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { fixed_overheads, owner_insurance, vat_rate } = req.body || {};
    const parsedOverheads = fixed_overheads !== undefined && fixed_overheads !== null && fixed_overheads !== '' ? Number(fixed_overheads) : 0;
    const parsedInsurance = owner_insurance !== undefined && owner_insurance !== null && owner_insurance !== '' ? Number(owner_insurance) : 0;
    const parsedVat = vat_rate !== undefined && vat_rate !== null && vat_rate !== '' ? Number(vat_rate) : 13;

    if (!Number.isFinite(parsedOverheads) || !Number.isFinite(parsedInsurance) || !Number.isFinite(parsedVat)) {
      return res.status(400).json({ error: 'Μη έγκυρες αριθμητικές τιμές στις ρυθμίσεις.' });
    }

    await pool.query('UPDATE users SET fixed_overheads = $1, owner_insurance = $2, vat_rate = $3 WHERE store_id = $4', [parsedOverheads, parsedInsurance, parsedVat, req.user.storeId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting settings:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Endpoints Προσωπικού ---
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_employees WHERE store_id = $1 ORDER BY id ASC', [req.user.storeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/employees/bulk', authenticateToken, async (req, res) => {
  const { employees } = req.body || {};
  if (!Array.isArray(employees)) {
    return res.status(400).json({ error: 'Μη έγκυρα δεδομένα προσωπικού (απαιτείται πίνακας employees).' });
  }

  for (const emp of employees) {
    if (!emp || typeof emp !== 'object' || typeof emp.name !== 'string' || !emp.name.trim() || emp.name.length > 255) {
      return res.status(400).json({ error: 'Μη έγκυρο όνομα υπαλλήλου.' });
    }
    const rate = Number(emp.hourly_rate ?? 0);
    if (!Number.isFinite(rate) || rate < 0) {
      return res.status(400).json({ error: 'Μη έγκυρο ωρομίσθιο υπαλλήλου.' });
    }
  }

  const client = await pool.getClient();
  try {
    await client.query('BEGIN');
    // Καθαρίζουμε τους παλιούς για το κατάστημα και βάζουμε τους νέους με τη μία (Συγχρονισμός)
    await client.query('DELETE FROM dashboard_employees WHERE store_id = $1', [req.user.storeId]);
    
    if (employees && employees.length > 0) {
      for (const emp of employees) {
        await client.query(
          `INSERT INTO dashboard_employees (store_id, name, hourly_rate, schedule, daily_wage, days_per_week)
           VALUES ($1, $2, $3, $4, 0, 0)`,
          [req.user.storeId, emp.name.trim(), Number(emp.hourly_rate ?? 0), JSON.stringify(emp.schedule || {})]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving employees:', error);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
});

app.post('/api/daily-records', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses, cashier_name } = req.body || {};

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(date.trim()) || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Μη έγκυρη ημερομηνία καταγραφής.' });
    }

    const parsedDailyRev = Number(daily_revenue);
    const parsedCashRev = cash_revenue !== undefined && cash_revenue !== null && cash_revenue !== '' ? Number(cash_revenue) : 0;
    const parsedPosRev = pos_revenue !== undefined && pos_revenue !== null && pos_revenue !== '' ? Number(pos_revenue) : 0;
    const parsedTotalExp = Number(total_expenses);
    const parsedFoodCost = Number(food_cost_percentage);

    if (
      daily_revenue === undefined || daily_revenue === null || daily_revenue === '' || !Number.isFinite(parsedDailyRev) ||
      total_expenses === undefined || total_expenses === null || total_expenses === '' || !Number.isFinite(parsedTotalExp) ||
      food_cost_percentage === undefined || food_cost_percentage === null || food_cost_percentage === '' || !Number.isFinite(parsedFoodCost) ||
      !Number.isFinite(parsedCashRev) || !Number.isFinite(parsedPosRev)
    ) {
      return res.status(400).json({ error: 'Μη έγκυρες αριθμητικές τιμές στην ημερήσια καταγραφή.' });
    }

    const safeCashierName = cashier_name && typeof cashier_name === 'string' ? cashier_name.trim().slice(0, 255) : null;
    
    const query = `
      INSERT INTO dashboard_daily_records (store_id, date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses, cashier_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [store_id, date.trim(), parsedDailyRev, parsedCashRev, parsedPosRev, parsedTotalExp, parsedFoodCost, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([]), safeCashierName];
    
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
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
      return res.status(400).json({ error: 'Μη έγκυρος μήνας ή έτος.' });
    }
    
    const query = `
      SELECT id, date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses, cashier_name
      FROM dashboard_daily_records
      WHERE store_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
      ORDER BY date ASC
    `;
    const result = await pool.query(query, [store_id, parsedMonth, parsedYear]);
    
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
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'Μη έγκυρο αναγνωριστικό εγγραφής.' });
    }

    const { date, daily_revenue, cash_revenue, pos_revenue, total_expenses, food_cost_percentage, worked_employees, detailed_expenses, cashier_name } = req.body || {};

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(date.trim()) || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Μη έγκυρη ημερομηνία καταγραφής.' });
    }

    const parsedDailyRev = Number(daily_revenue);
    const parsedCashRev = cash_revenue !== undefined && cash_revenue !== null && cash_revenue !== '' ? Number(cash_revenue) : 0;
    const parsedPosRev = pos_revenue !== undefined && pos_revenue !== null && pos_revenue !== '' ? Number(pos_revenue) : 0;
    const parsedTotalExp = Number(total_expenses);
    const parsedFoodCost = Number(food_cost_percentage);

    if (
      daily_revenue === undefined || daily_revenue === null || daily_revenue === '' || !Number.isFinite(parsedDailyRev) ||
      total_expenses === undefined || total_expenses === null || total_expenses === '' || !Number.isFinite(parsedTotalExp) ||
      food_cost_percentage === undefined || food_cost_percentage === null || food_cost_percentage === '' || !Number.isFinite(parsedFoodCost) ||
      !Number.isFinite(parsedCashRev) || !Number.isFinite(parsedPosRev)
    ) {
      return res.status(400).json({ error: 'Μη έγκυρες αριθμητικές τιμές στην ημερήσια καταγραφή.' });
    }

    const safeCashierName = cashier_name && typeof cashier_name === 'string' ? cashier_name.trim().slice(0, 255) : null;
    
    const query = `
      UPDATE dashboard_daily_records
      SET date = $2, daily_revenue = $3, cash_revenue = $4, pos_revenue = $5, total_expenses = $6, food_cost_percentage = $7, worked_employees = $8, detailed_expenses = $9, cashier_name = $11
      WHERE id = $1 AND store_id = $10
    `;
    const values = [parsedId, date.trim(), parsedDailyRev, parsedCashRev, parsedPosRev, parsedTotalExp, parsedFoodCost, worked_employees ? JSON.stringify(worked_employees) : JSON.stringify([]), detailed_expenses ? JSON.stringify(detailed_expenses) : JSON.stringify([]), store_id, safeCashierName];
    
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
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'Μη έγκυρο αναγνωριστικό εγγραφής.' });
    }

    const query = 'DELETE FROM dashboard_daily_records WHERE id = $1 AND store_id = $2';
    await pool.query(query, [parsedId, store_id]);
    
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
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
      return res.status(400).json({ error: 'Μη έγκυρος μήνας ή έτος.' });
    }
    
    // Έλεγχος αν υπάρχει ήδη "κλεισμένος" μήνας
    const summaryQuery = `
      SELECT total_revenue, total_expenses, fixed_costs, net_profit 
      FROM monthly_summaries 
      WHERE store_id = $1 AND month = $2 AND year = $3
    `;
    const summaryResult = await pool.query(summaryQuery, [store_id, parsedMonth, parsedYear]);
    
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
    const dailyResult = await pool.query(dailyQuery, [store_id, parsedMonth, parsedYear]);
    
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
    const { month, year, total_revenue, total_expenses, fixed_costs, net_profit, clearData } = req.body || {};

    const parsedMonth = Number(month);
    const parsedYear = Number(year);
    const parsedRev = Number(total_revenue);
    const parsedExp = Number(total_expenses);
    const parsedFixed = fixed_costs !== undefined && fixed_costs !== null && fixed_costs !== '' ? Number(fixed_costs) : 0;
    const parsedProfit = Number(net_profit);

    if (
      !Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 ||
      !Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100 ||
      total_revenue === undefined || total_revenue === null || !Number.isFinite(parsedRev) ||
      total_expenses === undefined || total_expenses === null || !Number.isFinite(parsedExp) ||
      net_profit === undefined || net_profit === null || !Number.isFinite(parsedProfit) ||
      !Number.isFinite(parsedFixed)
    ) {
      return res.status(400).json({ error: 'Μη έγκυρα στοιχεία μηνιαίας αναφοράς.' });
    }
    
    const query = `
      INSERT INTO monthly_summaries (store_id, month, year, total_revenue, total_expenses, fixed_costs, net_profit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (store_id, month, year) DO UPDATE 
      SET total_revenue = EXCLUDED.total_revenue,
          total_expenses = EXCLUDED.total_expenses,
          fixed_costs = EXCLUDED.fixed_costs,
          net_profit = EXCLUDED.net_profit
    `;
    await pool.query(query, [store_id, parsedMonth, parsedYear, parsedRev, parsedExp, parsedFixed, parsedProfit]);
    
    if (clearData) {
      const deleteQuery = `
        DELETE FROM dashboard_daily_records
        WHERE store_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
      `;
      await pool.query(deleteQuery, [store_id, parsedMonth, parsedYear]);
    }
    
    res.status(201).json({ message: 'Ο μήνας έκλεισε επιτυχώς!' });
  } catch (error) {
    console.error('Error saving monthly summary:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία αποθήκευσης συνόψεων.' });
  }
});

app.delete('/api/monthly-report/:month/:year', authenticateToken, async (req, res) => {
  try {
    const store_id = req.user.storeId;
    const { month, year } = req.params;
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
      return res.status(400).json({ error: 'Μη έγκυρος μήνας ή έτος.' });
    }
    
    const query = `
      DELETE FROM monthly_summaries
      WHERE store_id = $1 AND month = $2 AND year = $3
    `;
    await pool.query(query, [store_id, parsedMonth, parsedYear]);
    
    res.json({ message: 'Η σύνοψη διαγράφηκε (Ο μήνας άνοιξε ξανά)!' });
  } catch (error) {
    console.error('Error deleting monthly summary:', error);
    res.status(500).json({ error: 'Server Error. Αδυναμία διαγραφής συνόψεων.' });
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
