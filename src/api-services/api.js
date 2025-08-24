'use client'
import axios from 'axios'
import { TokenService } from '@/custom-hooks/index.js'

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
    params: {
      
    }
  })

  instance.defaults.headers.common['Content-Type'] = 'application/json'
  instance.defaults.headers.common['module-name'] = window && window.location.pathname

  const token = TokenService.getToken()
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  instance.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      if (error.response && error.response.status === 403) {
        TokenService.removeToken()
      }
      return Promise.reject(error)
    }
  )

  instance.interceptors.request.use(function (config) {
    if (
      config.url != '/auth/login' &&
      config.url != '/upload/image' &&
      config.url != '/auth/register' &&
      config.url != '/auth/change-password' &&
      config.url !== '/auth/email-verification-otp' &&
      config.url !== '/auth/verify-email-otp' &&
      config.url !== '/home/nationalities'
    ) {
      config.url =  config.url
    }
    return config
  })

  return instance
}

export default createAxiosInstance
