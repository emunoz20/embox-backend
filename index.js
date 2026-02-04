require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { getMembershipStatus } = require('./dateStatus');
const isAdmin = require('./middlewares/isAdmin');


const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json()); // obligatorio para leer req.body

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // ⚠️ debe ser SERVICE ROLE KEY
);

/* =========================
   AUTH MIDDLEWARE
========================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.send('eMBox backend funcionando');
});

/* =========================
   AUTH ROUTES
========================= */

// REGISTER (modo prueba)
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password required'
    });
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) {
    return res.status(409).json({
      error: 'Username already exists'
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('users').insert({
    username,
    password_hash: hashedPassword,
    role: 'admin'
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: 'User registered successfully'
  });
});

// LOGIN
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

/* =========================
   RESET PASSWORD (DEFINITIVO)
========================= */

// Solicitar reset
app.post('/auth/request-reset', async (req, res) => {
  const { username } = req.body || {};

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  const { data, error } = await supabase
    .from('users')
    .update({
      reset_token: token,
      reset_token_expires: expires
    })
    .eq('username', username)
    .select('id');

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    message: 'Reset token generated',
    reset_token: token
  });
});

// Confirmar reset
app.post('/auth/confirm-reset', async (req, res) => {
  const { token, newPassword } = req.body || {};

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Token and newPassword required'
    });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_token', token)
    .gte('reset_token_expires', new Date().toISOString())
    .single();

  if (error || !user) {
    return res.status(400).json({
      error: 'Invalid or expired token'
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await supabase
    .from('users')
    .update({
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    })
    .eq('id', user.id);

  res.json({ message: 'Password updated successfully' });
});

/* =========================
   CUSTOMERS (PROTECTED)
========================= */

app.get(
  '/admin/test',
  authMiddleware,
  isAdmin,
  (req, res) => {
    res.json({
      message: 'Acceso admin confirmado',
      user: req.user
    });
  }
);

app.get('/customers', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const result = data.map(c => {
    const calculatedStatus = getMembershipStatus(c.due_date);

    return {
      ...c,
      calculated_status: calculatedStatus
    };
  });

  res.json(result);
});

/* =========================
   CRON JOB
========================= */
cron.schedule('* * * * *', async () => {
  console.log('Ejecutando recordatorio automático');
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
