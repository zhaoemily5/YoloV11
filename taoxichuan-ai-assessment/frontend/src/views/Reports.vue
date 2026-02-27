<template>
  <div class="reports-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评估报告</span>
          <el-button type="primary" @click="handleGenerate">
            <el-icon><Document /></el-icon>
            生成报告
          </el-button>
        </div>
      </template>
      
      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="reportNo" label="报告编号" width="150" />
        <el-table-column prop="recordNo" label="检测记录" width="150" />
        <el-table-column prop="buildingName" label="建筑名称" />
        <el-table-column prop="reportTitle" label="报告标题" />
        <el-table-column prop="totalDamageCount" label="损伤数量" width="100" />
        <el-table-column prop="reportStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.reportStatus)">
              {{ getStatusText(row.reportStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="generatedTime" label="生成时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="handleView(row)">查看</el-button>
            <el-button type="text" @click="handleDownload(row)">下载</el-button>
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
import { Document } from '@element-plus/icons-vue'

const reports = ref([
  {
    id: 1,
    reportNo: 'RP20240226001',
    recordNo: 'DR20240226001',
    buildingName: '1号厂房 - 原制瓷车间',
    reportTitle: '1号厂房损伤评估报告',
    totalDamageCount: 23,
    reportStatus: 'COMPLETED',
    generatedTime: '2024-02-26 11:00:00'
  },
  {
    id: 2,
    reportNo: 'RP20240226002',
    recordNo: 'DR20240226002',
    buildingName: '2号厂房 - 原烧制车间',
    reportTitle: '2号厂房损伤评估报告',
    totalDamageCount: 15,
    reportStatus: 'COMPLETED',
    generatedTime: '2024-02-26 10:30:00'
  }
])

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'COMPLETED': 'success',
    'GENERATING': 'warning',
    'FAILED': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'COMPLETED': '已完成',
    'GENERATING': '生成中',
    'FAILED': '失败'
  }
  return textMap[status] || status
}

const handleGenerate = () => {
  ElMessage.info('生成报告功能开发中...')
}

const handleView = (report: any) => {
  ElMessage.info(`查看报告: ${report.reportNo}`)
}

const handleDownload = (report: any) => {
  ElMessage.info(`下载报告: ${report.reportNo}`)
}

const handleDelete = (report: any) => {
  ElMessage.info(`删除报告: ${report.reportNo}`)
}
</script>

<style lang="scss" scoped>
.reports-container {
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
