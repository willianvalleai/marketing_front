import axios, { AxiosError } from 'axios'
import type { ApiFail, ApiResponse } from '@/shared/types'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export function unwrap<T>(res: { data: ApiResponse<T> }): T {
  if (!res.data.success) throw new Error(res.data.error)
  return res.data.data
}

export function getErrorMessage(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof Error) return err.message
  const axiosErr = err as AxiosError<ApiFail>
  return axiosErr.response?.data?.error ?? fallback
}

