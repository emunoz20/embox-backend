const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken
}
