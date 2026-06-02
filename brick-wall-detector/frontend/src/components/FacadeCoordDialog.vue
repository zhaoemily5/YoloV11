<template>
  <el-dialog
    :model-value="visible"
    title="立面普查 · 病害坐标"
    width="1020px"
    top="4vh"
    append-to-body
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div v-loading="loading" class="fcd-wrap">
      <div class="fcd-toolbar">
        <el-tag type="info">共 {{ detections.length }} 处病害</el-tag>
        <el-tag v-if="hasRealCoord" type="success">
          比例尺 {{ coordMeta.scalePxPerMm?.toFixed(4) }} px/mm · 实际坐标 cm
        </el-tag>
        <el-tag v-else type="warning">未标定比例尺，仅显示像素坐标</el-tag>
        <div style="flex:1" />
        <el-button type="primary" :disabled="!coordTxtContent" @click="$emit('export')">
          <el-icon><Download /></el-icon>&nbsp;导出 TXT
        </el-button>
      </div>

      <el-table
        v-if="tableRows.length"
        :data="tableRows"
        border
        stripe
        size="small"
        max-height="360"
        class="fcd-table"
      >
        <el-table-column prop="index" label="#" width="50" />
        <el-table-column prop="class" label="病害" width="90">
          <template #default="{ row }">
            <span class="fcd-dot" :style="{ background: DISEASE_COLORS[row.class] || '#999' }"></span>
            {{ row.class }}
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="80">
          <template #default="{ row }">{{ ((row.confidence || 0) * 100).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column prop="severity" label="程度" width="70" />
        <el-table-column v-if="hasRealCoord" label="实际坐标(cm)" min-width="200">
          <template #default="{ row }">
            中心({{ row.centerXCm }}, {{ row.centerYCm }})
          </template>
        </el-table-column>
        <el-table-column v-if="hasRealCoord" label="实际范围(cm)" min-width="220">
          <template #default="{ row }">
            左下({{ row.x1Cm }}, {{ row.y1Cm }}) → 右上({{ row.x2Cm }}, {{ row.y2Cm }})
          </template>
        </el-table-column>
        <el-table-column label="像素坐标" min-width="180">
          <template #default="{ row }">
            ({{ row.x1 }}, {{ row.y1 }}) → ({{ row.x2 }}, {{ row.y2 }})
          </template>
        </el-table-column>
        <el-table-column prop="gridId" label="网格" width="90" />
        <el-table-column prop="tileId" label="切片" width="110" show-overflow-tooltip />
      </el-table>
      <el-empty v-else description="暂无病害坐标数据" />

      <el-collapse v-if="coordTxtContent" class="fcd-collapse">
        <el-collapse-item title="完整坐标文件预览（TXT）" name="txt">
          <pre class="fcd-pre">{{ coordTxtContent }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { detectionTableRows, type FacadeCoordMeta } from '../utils/facadeCoordExport'
import { hasValidCoordTransform } from '../utils/facadeCoordTransform'

const props = defineProps<{
  visible: boolean
  loading?: boolean
  detections: any[]
  coordMeta?: FacadeCoordMeta
  coordTxtContent: string
}>()

defineEmits<{
  'update:visible': [value: boolean]
  export: []
}>()

const DISEASE_COLORS: Record<string, string> = {
  '风化': '#e74c3c',
  '泛碱': '#3498db',
  '裂缝': '#f39c12',
  '植物附着': '#9b59b6',
  '缺损': '#1abc9c',
}

const coordMeta = computed(() => props.coordMeta || {})
const hasRealCoord = computed(() => hasValidCoordTransform(coordMeta.value))
const tableRows = computed(() => detectionTableRows(props.detections || [], coordMeta.value))
</script>

<style scoped>
.fcd-wrap { min-height: 120px; }
.fcd-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.fcd-table { width: 100%; }
.fcd-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.fcd-collapse { margin-top: 12px; }
.fcd-pre {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
