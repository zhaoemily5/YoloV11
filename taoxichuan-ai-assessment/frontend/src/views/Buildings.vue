<template>
  <div class="buildings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>建筑管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增建筑
          </el-button>
        </div>
      </template>
      
      <el-table :data="buildingList" style="width: 100%">
        <el-table-column prop="buildingCode" label="建筑编码" width="120" />
        <el-table-column prop="buildingName" label="建筑名称" />
        <el-table-column prop="buildingType" label="建筑类型" width="120" />
        <el-table-column prop="buildYear" label="建造年份" width="100" />
        <el-table-column prop="area" label="建筑面积" width="120">
          <template #default="{ row }">
            {{ row.area }} m²
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="handleView(row)">查看</el-button>
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Building } from '@/types/detection'

const buildingList = ref<Building[]>([
  {
    id: 1,
    buildingCode: 'TXC-001',
    buildingName: '1号厂房 - 原制瓷车间',
    buildingType: '制瓷车间',
    buildYear: 1958,
    area: 1200.50,
    status: 1,
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    buildingCode: 'TXC-002',
    buildingName: '2号厂房 - 原烧制车间',
    buildingType: '烧制车间',
    buildYear: 1960,
    area: 800.30,
    status: 1,
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z'
  }
])

const handleAdd = () => {
  ElMessage.info('新增建筑功能开发中...')
}

const handleView = (building: Building) => {
  ElMessage.info(`查看建筑: ${building.buildingName}`)
}

const handleEdit = (building: Building) => {
  ElMessage.info(`编辑建筑: ${building.buildingName}`)
}

const handleDelete = (building: Building) => {
  ElMessage.info(`删除建筑: ${building.buildingName}`)
}

onMounted(() => {
  console.log('Buildings mounted')
})
</script>

<style lang="scss" scoped>
.buildings-container {
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
