<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>
      
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="profile-avatar">
            <el-avatar :size="120" :src="userInfo.avatar">
              {{ userInfo.realName?.charAt(0) }}
            </el-avatar>
            <h3>{{ userInfo.realName }}</h3>
            <p>{{ userInfo.department }}</p>
          </div>
        </el-col>
        
        <el-col :span="16">
          <el-form :model="userInfo" label-width="120px">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="userInfo.realName" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="userInfo.department" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const userInfo = ref({
  username: authStore.userName,
  realName: authStore.userName,
  email: '',
  phone: '',
  department: '工程部',
  avatar: ''
})

const handleSave = () => {
  ElMessage.success('保存成功')
}

const handleCancel = () => {
  ElMessage.info('取消编辑')
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
}

.profile-avatar {
  text-align: center;
  
  h3 {
    margin: 16px 0 8px 0;
    color: #303133;
  }
  
  p {
    color: #909399;
    margin: 0;
  }
}
</style>
