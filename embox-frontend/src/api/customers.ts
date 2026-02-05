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
  inscriptionDate: string
) => {

  const token = getToken()

  const response = await axios.put(
    `${API_URL}/customers/${id}/inscription-date`,
    { inscription_date: inscriptionDate },
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
