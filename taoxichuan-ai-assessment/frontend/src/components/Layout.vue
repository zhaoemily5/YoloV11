<template>
  <div class="layout-container">
    <!-- 头部导航 -->
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">陶</div>
          <div class="logo-text">陶溪川工业遗产AI智能损伤诊断评估系统</div>
        </div>
        
        <div class="header-actions">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32">{{ userName.charAt(0) }}</el-avatar>
              <span class="username">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="layout-main">
      <!-- 侧边栏 -->
      <el-aside class="layout-aside" :width="isCollapse ? '64px' : '240px'">
        <div class="aside-header">
          <el-button 
            :icon="isCollapse ? Expand : Fold" 
            @click="toggleCollapse"
            text
            size="small"
          />
        </div>
        
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          router
          class="layout-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>
          
          <el-menu-item index="/buildings">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>建筑管理</template>
          </el-menu-item>
          
          <el-sub-menu index="detection">
            <template #title>
              <el-icon><Camera /></el-icon>
              <span>损伤检测</span>
            </template>
            <el-menu-item index="/detection">新建检测</el-menu-item>
            <el-menu-item index="/detection/records">检测记录</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/reports">
            <el-icon><Files /></el-icon>
            <template #title>评估报告</template>
          </el-menu-item>
          
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>统计分析</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  House, 
  OfficeBuilding, 
  Camera, 
  Files, 
  DataAnalysis, 
  User, 
  Setting, 
  SwitchButton,
  ArrowDown,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isCollapse = ref(false)

// 计算属性
const userName = computed(() => authStore.userName)

// 方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          type: 'warning'
        })
        await authStore.logout()
        router.push('/login')
        ElMessage.success('退出登录成功')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('退出登录失败')
        }
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: white;
  border-bottom: 1px solid $border-color-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, $primary-color, $primary-color-light);
      color: white;
      border-radius: $border-radius-base;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: $text-color-primary;
    }
  }
  
  .header-actions {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: $border-radius-base;
      transition: $transition-base;
      
      &:hover {
        background: $background-color-light;
      }
      
      .username {
        font-size: 14px;
        color: $text-color-primary;
      }
    }
  }
}

.layout-main {
  flex: 1;
  height: calc(100vh - 60px);
}

.layout-aside {
  background: white;
  border-right: 1px solid $border-color-light;
  transition: width 0.3s ease;
  
  .aside-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid $border-color-light;
  }
  
  .layout-menu {
    border: none;
    height: calc(100% - 60px);
    
    .el-menu-item {
      height: 48px;
      line-height: 48px;
      
      &.is-active {
        background: rgba($primary-color, 0.1);
        color: $primary-color;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: $primary-color;
        }
      }
    }
    
    .el-sub-menu {
      .el-sub-menu__title {
        height: 48px;
        line-height: 48px;
      }
    }
  }
}

.layout-content {
  background: $background-color-base;
  padding: 0;
  
  .content-wrapper {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .layout-header {
    .header-content {
      padding: 0 15px;
    }
    
    .logo {
      .logo-text {
        display: none;
      }
    }
  }
  
  .layout-aside {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    z-index: $z-index-popper;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .layout-content {
    .content-wrapper {
      padding: 15px;
    }
  }
}
</style>
