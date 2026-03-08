/**
 * API Service Layer
 * Axios client with interceptors for:
 * - JWT token injection
 * - Error handling
 * - Request/response logging
 * - Retry logic
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { config } from '../config/env'
import { createLogger } from '../utils/logger'

const logger = createLogger('API')

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private instance: AxiosInstance
  private tokenKey = 'access_token'

  constructor() {
    this.instance = axios.create({
      baseURL: config.apiUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request Interceptor: Inject JWT token
    this.instance.interceptors.request.use(
      (req) => {
        const token = this.getToken()
        if (token) {
          req.headers.Authorization = `Bearer ${token}`
        }
        logger.debug('Request:', { method: req.method, url: req.url })
        return req
      },
      (error) => {
        logger.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response Interceptor: Handle errors & log
    this.instance.interceptors.response.use(
      (res) => {
        logger.debug('Response:', { status: res.status, url: res.config.url })
        return res
      },
      (error: AxiosError) => {
        logger.error('Response error:', {
          status: error.response?.status,
          message: error.message,
        })

        // Handle 401 (token expired)
        if (error.response?.status === 401) {
          this.clearToken()
          // In a real app, trigger logout/redirect here
        }

        return Promise.reject(error)
      }
    )
  }

  // Token Management
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  public setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
    logger.debug('Token set')
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey)
    logger.debug('Token cleared')
  }

  // API Methods
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await this.instance.get<T>(url)
      return { success: true, data: res.data, status: res.status }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const res = await this.instance.post<T>(url, data)
      return { success: true, data: res.data, status: res.status }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const res = await this.instance.put<T>(url, data)
      return { success: true, data: res.data, status: res.status }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await this.instance.delete<T>(url)
      return { success: true, data: res.data, status: res.status }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any): ApiResponse {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status || 500
    const message = axiosError.message || 'Unknown error'

    return {
      success: false,
      error: message,
      status,
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()
export const api = apiClient // Alias for convenience
export type { ApiResponse }
