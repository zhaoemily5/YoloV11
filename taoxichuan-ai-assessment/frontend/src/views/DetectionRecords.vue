<template>
  <div class="detection-records-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>检测记录</span>
          <el-button type="primary" @click="$router.push('/detection')">
            <el-icon><Plus /></el-icon>
            新建检测
          </el-button>
        </div>
      </template>
      
      <el-table :data="records" style="width: 100%">
        <el-table-column prop="recordNo" label="记录编号" width="150" />
        <el-table-column prop="buildingName" label="建筑名称" />
        <el-table-column prop="username" label="检测人员" width="120" />
        <el-table-column prop="detectionDate" label="检测时间" width="180" />
        <el-table-column prop="imageCount" label="图片数量" width="100" />
        <el-table-column prop="totalDamageCount" label="损伤数量" width="100" />
        <el-table-column prop="detectionStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.detectionStatus)">
              {{ getStatusText(row.detectionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="handleView(row)">查看</el-button>
            <el-button type="text" @click="handleReport(row)">报告</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { DetectionRecord } from '@/types/detection'

const records = ref<DetectionRecord[]>([
  {
    id: 1,
    recordNo: 'DR20240226001',
    buildingId: 1,
    buildingName: '1号厂房 - 原制瓷车间',
    userId: 1,
    username: '张三',
    detectionDate: '2024-02-26 10:30:00',
    imageCount: 5,
    totalDamageCount: 23,
    detectionStatus: 'COMPLETED'
  },
  {
    id: 2,
    recordNo: 'DR20240226002',
    buildingId: 2,
    buildingName: '2号厂房 - 原烧制车间',
    userId: 1,
    username: '张三',
    detectionDate: '2024-02-26 09:15:00',
    imageCount: 3,
    totalDamageCount: 15,
    detectionStatus: 'COMPLETED'
  }
])

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

const handleView = (record: DetectionRecord) => {
  ElMessage.info(`查看记录: ${record.recordNo}`)
}

const handleReport = (record: DetectionRecord) => {
  ElMessage.info(`生成报告: ${record.recordNo}`)
}

const handleDelete = (record: DetectionRecord) => {
  ElMessage.info(`删除记录: ${record.recordNo}`)
}
</script>

<style lang="scss" scoped>
.detection-records-container {
  padding: 20px;
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
