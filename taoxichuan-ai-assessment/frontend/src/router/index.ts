import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '控制台',
          icon: 'House'
        }
      },
      {
        path: '/buildings',
        name: 'Buildings',
        component: () => import('@/views/Buildings.vue'),
        meta: {
          title: '建筑管理',
          icon: 'Building'
        }
      },
      {
        path: '/detection',
        name: 'Detection',
        component: () => import('@/views/Detection.vue'),
        meta: {
          title: '损伤检测',
          icon: 'Camera'
        }
      },
      {
        path: '/detection/records',
        name: 'DetectionRecords',
        component: () => import('@/views/DetectionRecords.vue'),
        meta: {
          title: '检测记录',
          icon: 'Document'
        }
      },
      {
        path: '/reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: {
          title: '评估报告',
          icon: 'Files'
        }
      },
      {
        path: '/statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: {
          title: '统计分析',
          icon: 'DataAnalysis'
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人中心',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 陶溪川工业遗产AI智能损伤诊断评估系统`
  }
  
  // 检查是否需要认证
  if (to.meta?.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      // 尝试从token恢复登录状态
      await authStore.checkAuth()
      if (!authStore.isAuthenticated) {
        next('/login')
        return
      }
    }
  }
  
  // 如果已登录且访问登录页，重定向到首页
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
