import axios from 'axios'
import { getToken } from './auth'

const API_URL = 'http://localhost:3000'

export async function getCustomers() {
  const token = getToken()

  if (!token) {
    throw new Error('No token found')
  }

  const response = await axios.get(`${API_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

