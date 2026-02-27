export interface User {
  id: number
  username: string
  realName: string
  email?: string
  phone?: string
  department?: string
  role: string
  oaUserId?: string
  lastLoginTime?: string
  createdTime: string
  updatedTime: string
}

export interface LoginRequest {
  oaUserId: string
  token: string
  timestamp: number
}

export interface LoginResponse {
  userId: number
  username: string
  realName: string
  email?: string
  phone?: string
  department?: string
  role: string
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}
