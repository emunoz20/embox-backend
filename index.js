require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

const app = express()

app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

/* ================= AUTH ================= */

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

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch)
    return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token })
})

/* ================= HELPERS ================= */

function calculateDueDate(planName, inscriptionDate, manualDueDate) {
  if (manualDueDate) return manualDueDate
  const baseDate = new Date(inscriptionDate)

  switch (planName) {
    case 'Mensual':
      baseDate.setMonth(baseDate.getMonth() + 1)
      break
    case 'Bimestral':
      baseDate.setMonth(baseDate.getMonth() + 2)
      break
    case 'Trimestral':
      baseDate.setMonth(baseDate.getMonth() + 3)
      break
    default:
      baseDate.setMonth(baseDate.getMonth() + 1)
  }

  return baseDate.toISOString().split('T')[0]
}

/* ================= CUSTOMERS ================= */

app.get('/customers', authMiddleware, async (req, res) => {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .order('due_date', { ascending: true })

  res.json(data)
})

app.post('/customers', authMiddleware, async (req, res) => {
  const {
    full_name,
    phone,
    plan_name,
    inscription_date,
    manual_due_date,
    monthly_fee
  } = req.body

  const due_date = calculateDueDate(
    plan_name,
    inscription_date,
    manual_due_date
  )

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      full_name,
      phone,
      plan_name,
      inscription_date,
      due_date,
      monthly_fee,
      status: 'active'
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('transactions').insert({
    type: 'income',
    amount: monthly_fee,
    concept: 'Inscripción',
    date: inscription_date,
    customer_id: customer.id
  })

  res.json({ message: 'Customer creado con ingreso' })
})

app.put('/customers/:id/inactivate', authMiddleware, async (req, res) => {
  const { id } = req.params

  await supabase
    .from('customers')
    .update({ status: 'inactive' })
    .eq('id', id)

  res.json({ message: 'Cliente inactivado' })
})

app.put('/customers/:id/inscription-date', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { inscription_date, plan_name, manual_due_date } = req.body

  if (!inscription_date || !plan_name) {
    return res.status(400).json({
      error: 'inscription_date and plan_name are required'
    })
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' })
  }

  const due_date = calculateDueDate(
    plan_name,
    inscription_date,
    manual_due_date
  )

  await supabase
    .from('customers')
    .update({
      inscription_date,
      plan_name,
      due_date,
      status: 'active'
    })
    .eq('id', id)

  await supabase.from('transactions').insert({
    type: 'income',
    amount: customer.monthly_fee,
    concept: 'Pago de mensualidad',
    date: inscription_date,
    customer_id: id
  })

  res.json({ message: 'Pago registrado y afiliado reactivado' })
})

/* ================= FINANCE ================= */

app.post('/transactions/expense', authMiddleware, async (req, res) => {
  const { concept, amount, date } = req.body

  await supabase.from('transactions').insert({
    type: 'expense',
    amount,
    concept,
    date
  })

  res.json({ message: 'Egreso registrado' })
})

app.get('/finance/summary', authMiddleware, async (req, res) => {
  let { start, end } = req.query

  if (!start || !end) {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    start = firstDay.toISOString().split('T')[0]
    end = lastDay.toISOString().split('T')[0]
  }

  const { data } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', start)
    .lte('date', end)

  let income = 0
  let expense = 0

  data.forEach(t => {
    if (t.type === 'income') income += Number(t.amount)
    if (t.type === 'expense') expense += Number(t.amount)
  })

  res.json({
    total_income: income,
    total_expense: expense,
    balance: income - expense
  })
})

/* ================= REPORT EXCEL ================= */

app.get('/reports/finance/excel', authMiddleware, async (req, res) => {
  let { start, end } = req.query

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })

  let income = 0
  let expense = 0

  data.forEach(t => {
    if (t.type === 'income') income += Number(t.amount)
    if (t.type === 'expense') expense += Number(t.amount)
  })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Reporte financiero')

  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Tipo', key: 'type', width: 15 },
    { header: 'Concepto', key: 'concept', width: 30 },
    { header: 'Valor (COP)', key: 'amount', width: 20 }
  ]

  data.forEach(t => {
    sheet.addRow({
      date: t.date,
      type: t.type,
      concept: t.concept,
      amount: t.amount
    })
  })

  sheet.addRow([])
  sheet.addRow(['', '', 'TOTAL INGRESOS', income])
  sheet.addRow(['', '', 'TOTAL EGRESOS', expense])
  sheet.addRow(['', '', 'BALANCE', income - expense])

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reporte_financiero.xlsx'
  )

  await workbook.xlsx.write(res)
  res.end()
})

/* ================= REPORT PDF ================= */

app.get('/reports/finance/pdf', authMiddleware, async (req, res) => {
  let { start, end } = req.query

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })

  let income = 0
  let expense = 0

  data.forEach(t => {
    if (t.type === 'income') income += Number(t.amount)
    if (t.type === 'expense') expense += Number(t.amount)
  })

  const doc = new PDFDocument({ margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reporte_financiero.pdf'
  )

  doc.pipe(res)

  const logoPath = path.join(__dirname, 'logoqj.jpg')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 20, { width: 80 })
  }

  doc.moveDown(3)
  doc.fontSize(12)
  doc.text('Reporte financiero', { align: 'center' })
  doc.moveDown()

  const startX = 40
  let y = doc.y
  const colWidths = [100, 100, 240, 100]
  const headers = ['Fecha', 'Tipo', 'Concepto', 'Valor']

  let x = startX
  doc.fontSize(8)
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], 16).stroke()
    doc.text(h, x + 4, y + 3, { width: colWidths[i] - 8 })
    x += colWidths[i]
  })

  y += 18

  data.forEach(t => {
    if (y > 720) {
      doc.addPage()
      y = 50
    }

    const row = [
      t.date,
      t.type.toUpperCase(),
      t.concept,
      `$${Number(t.amount).toLocaleString('es-CO')}`
    ]

    let x = startX
    row.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], 16).stroke()
      doc.text(cell, x + 4, y + 3, {
        width: colWidths[i] - 8
      })
      x += colWidths[i]
    })

    y += 18
  })

  y += 40
  doc.y = y

  doc.moveDown()
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text(`Total ingresos: $${income.toLocaleString('es-CO')}`)
  doc.moveDown(0.5)
  doc.text(`Total egresos: $${expense.toLocaleString('es-CO')}`)
  doc.moveDown(0.5)
  doc.text(`Balance: $${(income - expense).toLocaleString('es-CO')}`)

  doc.end()
})

/* ================= CUSTOMER REPORT PDF ================= */

app.get('/reports/customers/pdf', authMiddleware, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const pending = data.filter(c => c.status === 'active' && c.due_date <= today)
  const active = data.filter(c => c.status === 'active' && c.due_date > today)
  const inactive = data.filter(c => c.status === 'inactive')

  const doc = new PDFDocument({ margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reporte_afiliados.pdf'
  )

  doc.pipe(res)

  const logoPath = path.join(__dirname, 'logoqj.jpg')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 20, { width: 80 })
  }

  doc.moveDown(3)
  doc.fontSize(12)
  doc.text('Reporte de Afiliados', { align: 'center' })
  doc.moveDown()

  const startX = 40
  const colWidths = [200, 150, 120]
  const headers = ['Nombre', 'Teléfono', 'Vencimiento']

  const drawSection = (title, customers) => {
    doc.moveDown()
    doc.fontSize(10).font('Helvetica-Bold').text(title)
    doc.moveDown(0.5)

    let y = doc.y
    let x = startX

    doc.fontSize(8)
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], 16).stroke()
      doc.text(h, x + 4, y + 3, { width: colWidths[i] - 8 })
      x += colWidths[i]
    })

    y += 18

    customers.forEach(c => {
      if (y > 720) {
        doc.addPage()
        y = 50
      }

      let x = startX
      const row = [c.full_name, c.phone, c.due_date]

      row.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], 16).stroke()
        doc.text(cell, x + 4, y + 3, {
          width: colWidths[i] - 8
        })
        x += colWidths[i]
      })

      y += 18
    })
  }

  drawSection('PENDIENTES', pending)
  drawSection('ACTIVOS', active)
  drawSection('INACTIVOS', inactive)

  doc.end()
})

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
