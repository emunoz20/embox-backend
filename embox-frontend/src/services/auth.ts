console.log("🔥 AUTH SERVICE CARGADO 🔥")

import axios from 'axios'

const API_URL = 'http://localhost:3000'

// LOGIN
console.log("🔥 LOGIN FUNCTION EJECUTADA 🔥")

export async function login(username: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username,
    password
  })

  if (!response.data || !response.data.token) {
  throw new Error('No token received from backend')
}

return response.data.token

}

// TOKEN STORAGE
export function saveToken(token: string) {
  localStorage.setItem('embox_token', token)
}

export function getToken(): string | null {
  return localStorage.getItem('embox_token')
}

export function logout() {
  localStorage.removeItem('embox_token')
}
