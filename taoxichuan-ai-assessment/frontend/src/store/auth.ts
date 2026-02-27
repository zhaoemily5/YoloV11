import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { authApi } from '@/api/auth'
import type { User, LoginRequest, LoginResponse } from '@/types/auth'

const TOKEN_KEY = 'taoxichuan_token'
const REFRESH_TOKEN_KEY = 'taoxichuan_refresh_token'
const USER_KEY = 'taoxichuan_user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>(Cookies.get(TOKEN_KEY) || '')
  const refreshToken = ref<string>(Cookies.get(REFRESH_TOKEN_KEY) || '')
  const user = ref<User | null>(null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => user.value?.realName || user.value?.username || '')
  
  // 登录
  const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authApi.ssoLogin(loginData)
      
      // 保存token和用户信息
      token.value = response.token
      refreshToken.value = response.refreshToken || ''
      user.value = {
        id: response.userId,
        username: response.username,
        realName: response.realName,
        email: response.email || '',
        phone: response.phone || '',
        department: response.department || '',
        role: response.role,
        oaUserId: loginData.oaUserId,
        lastLoginTime: new Date().toISOString(),
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString()
      }
      
      // 保存到cookie
      Cookies.set(TOKEN_KEY, token.value, { expires: 1 })
      if (refreshToken.value) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken.value, { expires: 7 })
      }
      
      // 保存用户信息到localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      
      return response
    } catch (error) {
      logout()
      throw error
    }
  }
  
  // 登出
  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地状态
      token.value = ''
      refreshToken.value = ''
      user.value = null
      
      // 清除cookie
      Cookies.remove(TOKEN_KEY)
      Cookies.remove(REFRESH_TOKEN_KEY)
      
      // 清除localStorage
      localStorage.removeItem(USER_KEY)
    }
  }
  
  // 刷新token
  const refreshAccessToken = async (): Promise<string> => {
    if (!refreshToken.value) {
      throw new Error('没有刷新令牌')
    }
    
    try {
      const response = await authApi.refreshToken(refreshToken.value)
      
      token.value = response.token
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }
      
      // 更新cookie
      Cookies.set(TOKEN_KEY, token.value, { expires: 1 })
      if (response.refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, response.refreshToken, { expires: 7 })
      }
      
      return token.value
    } catch (error) {
      logout()
      throw error
    }
  }
  
  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    // 如果有token但没有用户信息，尝试从localStorage恢复
    if (token.value && !user.value) {
      try {
        const savedUser = localStorage.getItem(USER_KEY)
        if (savedUser) {
          user.value = JSON.parse(savedUser)
        }
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        logout()
        return false
      }
    }
    
    return isAuthenticated.value
  }
  
  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated.value) {
      return false
    }
    
    const role = userRole.value
    switch (permission) {
      case 'admin':
        return role === 'ADMIN'
      case 'user':
        return ['ADMIN', 'USER'].includes(role)
      case 'viewer':
        return ['ADMIN', 'USER', 'VIEWER'].includes(role)
      default:
        return false
    }
  }
  
  return {
    // 状态
    token,
    refreshToken,
    user,
    
    // 计算属性
    isAuthenticated,
    userRole,
    userName,
    
    // 方法
    login,
    logout,
    refreshAccessToken,
    checkAuth,
    hasPermission
  }
})
