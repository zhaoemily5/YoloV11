<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">陶</div>
          <div class="logo-text">陶溪川工业遗产AI智能损伤诊断评估系统</div>
        </div>
      </div>
      
      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'sso' }"
          @click="loginType = 'sso'"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span>OA登录</span>
        </div>
        <div 
          v-if="adminLoginEnabled"
          class="tab-item" 
          :class="{ active: loginType === 'admin' }"
          @click="loginType = 'admin'"
        >
          <el-icon><UserFilled /></el-icon>
          <span>管理员登录</span>
        </div>
      </div>
      
      <div class="login-form">
        <!-- OA SSO登录表单 -->
        <el-form 
          v-if="loginType === 'sso'"
          ref="ssoFormRef" 
          :model="ssoForm" 
          :rules="ssoRules" 
          @submit.prevent="handleSsoLogin"
        >
          <el-form-item prop="oaUserId">
            <el-input
              v-model="ssoForm.oaUserId"
              placeholder="请输入OA用户ID"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="token">
            <el-input
              v-model="ssoForm.token"
              type="password"
              placeholder="请输入SSO令牌"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleSsoLogin"
              style="width: 100%"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 管理员登录表单 -->
        <el-form 
          v-if="loginType === 'admin'"
          ref="adminFormRef" 
          :model="adminForm" 
          :rules="adminRules" 
          @submit.prevent="handleAdminLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="adminForm.username"
              placeholder="请输入管理员用户名"
              size="large"
              :prefix-icon="UserFilled"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="adminForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleAdminLogin"
              style="width: 100%"
            >
              管理员登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="login-footer">
        <el-tag v-if="!adminLoginEnabled" type="info" size="small" effect="plain">
          管理员登录已禁用
        </el-tag>
        <el-tag v-else type="success" size="small" effect="plain">
          管理员登录已启用
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, OfficeBuilding } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/auth'
import { authApi, type AdminLoginRequest } from '@/api/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const { token, refreshToken, user } = storeToRefs(authStore)

// 登录类型
const loginType = ref<'sso' | 'admin'>('sso')
const adminLoginEnabled = ref(true)

// 响应式数据
const loading = ref(false)
const ssoFormRef = ref<FormInstance>()
const adminFormRef = ref<FormInstance>()

// SSO登录表单
const ssoForm = reactive({
  oaUserId: '',
  token: ''
})

// 管理员登录表单
const adminForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const ssoRules: FormRules = {
  oaUserId: [
    { required: true, message: '请输入OA用户ID', trigger: 'blur' }
  ],
  token: [
    { required: true, message: '请输入SSO令牌', trigger: 'blur' }
  ]
}

const adminRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 检查管理员登录状态
onMounted(async () => {
  console.log('【调试】Login页面挂载，检查管理员登录状态')
  try {
    const enabled = await authApi.getAdminLoginStatus()
    console.log('【调试】管理员登录状态:', enabled)
    adminLoginEnabled.value = enabled
  } catch (error) {
    console.error('【调试】获取管理员登录状态失败:', error)
    adminLoginEnabled.value = true
  }
})

// SSO登录方法
const handleSsoLogin = async () => {
  if (!ssoFormRef.value) return
  
  try {
    const valid = await ssoFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    await authStore.login({
      oaUserId: ssoForm.oaUserId,
      token: ssoForm.token,
      timestamp: Date.now()
    })
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 管理员登录方法
const handleAdminLogin = async () => {
  console.log('【调试】点击管理员登录按钮')
  if (!adminFormRef.value) {
    console.error('【调试】表单引用为空')
    return
  }
  
  try {
    console.log('【调试】开始表单验证')
    const valid = await adminFormRef.value.validate()
    console.log('【调试】表单验证结果:', valid)
    if (!valid) return
    
    loading.value = true
    console.log('【调试】准备登录数据:', { username: adminForm.username })
    
    const loginData: AdminLoginRequest = {
      username: adminForm.username,
      password: adminForm.password
    }
    
    console.log('【调试】调用adminLogin API')
    const response = await authApi.adminLogin(loginData)
    console.log('【调试】登录响应:', response)
    
    // 直接设置ref值
    console.log('【调试】设置token:', response.token)
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
      oaUserId: '0',
      lastLoginTime: new Date().toISOString(),
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    }
    console.log('【调试】存储登录状态完成')
    
    ElMessage.success('管理员登录成功')
    router.push('/')
  } catch (error: any) {
    console.error('【调试】登录失败:', error)
    ElMessage.error(error.message || '用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  padding: 30px 20px;
  text-align: center;
  
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    
    .logo-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #ff6b6b, #ee5a24);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 24px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
    }
  }
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    color: #606266;
    
    &:hover {
      background: #e4e7ed;
    }
    
    &.active {
      background: white;
      color: #409eff;
      border-bottom: 2px solid #409eff;
      margin-bottom: -1px;
    }
    
    .el-icon {
      font-size: 16px;
    }
    
    span {
      font-size: 14px;
    }
  }
}

.login-form {
  padding: 40px 30px 20px;
  
  .el-form-item {
    margin-bottom: 25px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.login-footer {
  padding: 0 30px 30px;
  text-align: center;
  
  .el-tag {
    font-size: 12px;
  }
}
</style>
