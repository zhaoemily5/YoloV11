<template>
  <div class="statistics-container">
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card title="统计分析">
          <template #header>
            <div class="card-header">
              <span>数据统计</span>
              <el-button type="primary" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="chart-container">
                <h3>检测趋势</h3>
                <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
                  图表组件待实现
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <h3>损伤分布</h3>
                <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
                  图表组件待实现
                </div>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="24" style="margin-top: 24px;">
            <el-col :span="24">
              <div class="chart-container">
                <h3>建筑健康评分</h3>
                <div style="height: 400px; display: flex; align-items: center; justify-content: center; color: #999;">
                  图表组件待实现
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const handleExport = () => {
  ElMessage.info('数据导出功能开发中...')
}
</script>

<style lang="scss" scoped>
.statistics-container {
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

.chart-container {
  h3 {
    margin-bottom: 16px;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
