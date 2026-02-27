import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 调试模式开关
const DEBUG = true

// 创建自定义request类型
interface CustomRequest {
  get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T>
  request<T = any>(config: InternalAxiosRequestConfig): Promise<T>
}

// 打印环境变量
if (DEBUG) {
  console.log('【调试】VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
}

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

if (DEBUG) {
  console.log('【调试】axios baseURL:', axiosInstance.defaults.baseURL)
}

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (DEBUG) {
      console.log('【调试】请求发送:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers
      })
    }
    
    // 添加认证token
    const token = localStorage.getItem('taoxichuan_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('【调试】请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEBUG) {
      console.log('【调试】响应成功:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }
    
    const { code, message, data } = response.data
    
    // 请求成功
    if (code === 200 || code === 201) {
      return data
    }
    
    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  async (error) => {
    if (DEBUG) {
      console.error('【调试】响应错误:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      })
    }
    
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('taoxichuan_token')
          localStorage.removeItem('taoxichuan_user')
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
          
        case 403:
          ElMessage.error('没有权限访问')
          break
          
        case 404:
          ElMessage.error('请求的资源不存在')
          break
          
        case 500:
          ElMessage.error('服务器内部错误')
          break
          
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      // 网络错误
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else if (error.code === 'ERR_NETWORK') {
        ElMessage.error('网络连接失败，请检查后端服务是否启动')
      } else {
        ElMessage.error('网络连接失败: ' + error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

// 创建自定义request
const request: CustomRequest = {
  get: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    if (DEBUG) console.log('【调试】GET请求:', url)
    return axiosInstance.get(url, config)
  },
  
  post: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
    if (DEBUG) console.log('【调试】POST请求:', url, '数据:', data)
    return axiosInstance.post(url, data, config)
  },
  
  put: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
    if (DEBUG) console.log('【调试】PUT请求:', url)
    return axiosInstance.put(url, data, config)
  },
  
  delete: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    if (DEBUG) console.log('【调试】DELETE请求:', url)
    return axiosInstance.delete(url, config)
  },
  
  request: <T = any>(config: InternalAxiosRequestConfig): Promise<T> => {
    if (DEBUG) console.log('【调试】自定义请求:', config.url)
    return axiosInstance.request(config)
  }
}

export default request
