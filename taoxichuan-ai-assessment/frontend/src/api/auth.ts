import request from '@/utils/request'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export interface AdminLoginRequest {
  username: string
  password: string
}

export const authApi = {
  // 单点登录
  ssoLogin: (data: LoginRequest): Promise<LoginResponse> => {
    return request.post<LoginResponse>('/auth/sso', data)
  },

  // 管理员登录
  adminLogin: (data: AdminLoginRequest): Promise<LoginResponse> => {
    return request.post<LoginResponse>('/auth/admin/login', data)
  },

  // 检查管理员登录状态
  getAdminLoginStatus: (): Promise<boolean> => {
    return request.get<boolean>('/auth/admin/status')
  },

  // 用户登出
  logout: (): Promise<void> => {
    return request.post<void>('/auth/logout')
  },

  // 刷新Token
  refreshToken: (refreshToken: string): Promise<LoginResponse> => {
    return request.post<LoginResponse>('/auth/refresh', { refreshToken })
  }
}
