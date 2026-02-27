<template>
  <div class="dashboard-container">
    <el-row :gutter="24">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px;">
      <!-- 检测趋势图表 -->
      <el-col :span="12">
        <el-card title="检测趋势">
          <template #header>
            <div class="card-header">
              <span>检测趋势</span>
              <el-button type="text">查看详情</el-button>
            </div>
          </template>
          <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
            图表组件待实现
          </div>
        </el-card>
      </el-col>

      <!-- 损伤分布图表 -->
      <el-col :span="12">
        <el-card title="损伤分布">
          <template #header>
            <div class="card-header">
              <span>损伤分布</span>
              <el-button type="text">查看详情</el-button>
            </div>
          </template>
          <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
            图表组件待实现
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px;">
      <!-- 最近检测记录 -->
      <el-col :span="24">
        <el-card title="最近检测记录">
          <template #header>
            <div class="card-header">
              <span>最近检测记录</span>
              <el-button type="primary" @click="$router.push('/detection/records')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="recordNo" label="记录编号" width="150" />
            <el-table-column prop="buildingName" label="建筑名称" />
            <el-table-column prop="detectionDate" label="检测时间" width="180" />
            <el-table-column prop="totalDamageCount" label="损伤数量" width="120" />
            <el-table-column prop="detectionStatus" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.detectionStatus)">
                  {{ getStatusText(row.detectionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="text" @click="viewRecord(row.id)">查看</el-button>
                <el-button type="text" @click="generateReport(row.id)">报告</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  OfficeBuilding, 
  Camera, 
  Files, 
  DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const stats = ref([
  {
    title: '建筑总数',
    value: 6,
    icon: OfficeBuilding,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '检测次数',
    value: 156,
    icon: Camera,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '发现损伤',
    value: 892,
    icon: DataAnalysis,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '生成报告',
    value: 45,
    icon: Files,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

const recentRecords = ref([
  {
    id: 1,
    recordNo: 'DR20240226001',
    buildingName: '1号厂房 - 原制瓷车间',
    detectionDate: '2024-02-26 10:30:00',
    totalDamageCount: 23,
    detectionStatus: 'COMPLETED'
  },
  {
    id: 2,
    recordNo: 'DR20240226002',
    buildingName: '2号厂房 - 原烧制车间',
    detectionDate: '2024-02-26 09:15:00',
    totalDamageCount: 15,
    detectionStatus: 'COMPLETED'
  },
  {
    id: 3,
    recordNo: 'DR20240225003',
    buildingName: '3号厂房 - 原包装车间',
    detectionDate: '2024-02-25 16:45:00',
    totalDamageCount: 8,
    detectionStatus: 'PROCESSING'
  }
])

// 方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'COMPLETED': 'success',
    'PROCESSING': 'warning',
    'FAILED': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'COMPLETED': '已完成',
    'PROCESSING': '处理中',
    'FAILED': '失败'
  }
  return textMap[status] || status
}

const viewRecord = (id: number) => {
  router.push(`/detection/records/${id}`)
}

const generateReport = (_id: number) => {
  ElMessage.info('报告生成功能开发中...')
}

// 生命周期
onMounted(() => {
  console.log('Dashboard mounted')
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .stat-info {
      flex: 1;
      
      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat-title {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-weight: 600;
    color: #303133;
  }
}
</style>
