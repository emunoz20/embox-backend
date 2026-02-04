function getMembershipStatus(dueDate) {
  // dueDate viene como YYYY-MM-DD
  const [year, month, day] = dueDate.split('-').map(Number)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Creamos la fecha como LOCAL (no UTC)
  const due = new Date(year, month - 1, day)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.floor(
    (due - today) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return "DUE_TODAY"
  if (diffDays === 1) return "DUE_TOMORROW"
  if (diffDays < 0) return "OVERDUE"

  return "ACTIVE"
}

module.exports = { getMembershipStatus }
