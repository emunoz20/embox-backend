require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cron = require('node-cron')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')
const { getMembershipStatus } = require('./dateStatus')
const isAdmin = require('./middlewares/isAdmin')

const app = express()

/* =========================
   MIDDLEWARE
========================= */
app.use(cors())
app.use(express.json())

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

/* =========================
   AUTH MIDDLEWARE
========================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.send('eMBox backend funcionando')
})

/* =========================
   AUTH ROUTES
========================= */

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { error } = await supabase.from('users').insert({
    username,
    password_hash: hashedPassword,
    role: 'admin'
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'User registered successfully' })
})

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token })
})

/* =========================
   CUSTOMERS
========================= */

// TEST ADMIN
app.get('/admin/test', authMiddleware, isAdmin, (req, res) => {
  res.json({ message: 'Acceso admin confirmado', user: req.user })
})

/* GET customers */
app.get('/customers', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const result = data.map(c => ({
    ...c,
    calculated_status: getMembershipStatus(c.due_date)
  }))

  res.json(result)
})

/* CREATE customer */
app.post('/customers', authMiddleware, isAdmin, async (req, res) => {
  const { full_name, phone, plan_name, inscription_date } = req.body || {}

  if (!full_name || !phone || !plan_name || !inscription_date) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const baseDate = new Date(inscription_date)
  baseDate.setDate(baseDate.getDate() + 30)
  const due_date = baseDate.toISOString().split('T')[0]

  const { error } = await supabase.from('customers').insert({
    full_name,
    phone,
    plan_name,
    inscription_date,
    due_date,
    status: 'active'
  })

  /* 🔥 MANEJO DE TELÉFONO DUPLICADO */
  if (error) {

    // Postgres UNIQUE constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Phone already exists'
      })
    }

    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ message: 'Customer creado correctamente' })
})

/* INACTIVATE customer */
app.put(
  '/customers/:id/inactivate',
  authMiddleware,
  isAdmin,
  async (req, res) => {

    const { id } = req.params

    const { error } = await supabase
      .from('customers')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Cliente marcado como inactivo' })
  }
)

/* UPDATE inscription_date (reactiva afiliado) */
app.put(
  '/customers/:id/inscription-date',
  authMiddleware,
  isAdmin,
  async (req, res) => {

    const { id } = req.params
    const { inscription_date } = req.body

    if (!inscription_date) {
      return res.status(400).json({ error: 'inscription_date is required' })
    }

    const baseDate = new Date(inscription_date)
    baseDate.setDate(baseDate.getDate() + 30)
    const due_date = baseDate.toISOString().split('T')[0]

    const { error } = await supabase
      .from('customers')
      .update({
        inscription_date,
        due_date,
        status: 'active'
      })
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Fecha actualizada y afiliado reactivado' })
  }
)

/* =========================
   CRON JOB
========================= */
cron.schedule('* * * * *', async () => {
  console.log('Ejecutando recordatorio automático')
})

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
