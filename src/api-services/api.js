'use client'
import axios from 'axios'
import { TokenService } from '../custom-hooks/index'

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
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

  // Request interceptor
  instance.interceptors.request.use((config) => {
    const token = TokenService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (config.url !== '/auth/login') {
      // split URL (in case query params exist)
      const [path, query] = config.url.split('?')
      // Always append /admin to path
      // let newUrl = `${path}/admin`
      let newUrl = `${path}`

      // Re-attach query params if they exist
      if (query) {
        newUrl += `?${query}`
      }

      config.url = newUrl
    }

    return config
  })

  return instance
}

export default createAxiosInstance
