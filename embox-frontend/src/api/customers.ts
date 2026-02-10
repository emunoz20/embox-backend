import axios from "axios"
import { getToken } from "../services/auth"

const API_URL = "http://localhost:3000"

/* ========================
   GET CUSTOMERS
======================== */
export const fetchCustomers = async () => {
  const token = getToken()

  const response = await axios.get(`${API_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

/* ========================
   CREATE CUSTOMER
======================== */
export const createCustomer = async (data: {
  full_name: string
  phone: string
  plan_name: string
  inscription_date: string
  manual_due_date?: string
  monthly_fee: number
}) => {
  const token = getToken()

  const response = await axios.post(
    `${API_URL}/customers`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}

/* ========================
   UPDATE PAYMENT DATE
======================== */
export const updateInscriptionDate = async (
  id: string,
  inscriptionDate: string,
  planName: string,
  manualDueDate?: string | null
) => {

  const token = getToken()

  const response = await axios.put(
    `${API_URL}/customers/${id}/inscription-date`,
    {
      inscription_date: inscriptionDate,
      plan_name: planName,
      manual_due_date: manualDueDate
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}

/* ========================
   INACTIVATE CUSTOMER
======================== */
export const inactivateCustomer = async (id: string) => {

  const token = getToken()

  const response = await axios.put(
    `${API_URL}/customers/${id}/inactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}

/* ========================
   FINANCE SUMMARY (WITH RANGE)
======================== */
export const getFinanceSummary = async (
  start?: string,
  end?: string
) => {
  const token = getToken()

  let url = `${API_URL}/finance/summary`

  if (start && end) {
    url += `?start=${start}&end=${end}`
  }

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

/* ========================
   CREATE EXPENSE
======================== */
export const createExpense = async (data: {
  concept: string
  amount: number
  date: string
}) => {
  const token = getToken()

  const response = await axios.post(
    `${API_URL}/transactions/expense`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}
