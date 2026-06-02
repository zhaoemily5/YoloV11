<template>
  <div class="fpr-wrap" :class="{ 'fpr-fill': fill }">
    <el-collapse v-model="expanded" class="fpr-collapse">
      <el-collapse-item name="report">
        <template #title>
          <div class="fpr-title">
            <el-icon class="fpr-icon"><Document /></el-icon>
            <span class="fpr-title-text">{{ title }}</span>
            <el-tag type="danger" effect="dark" round size="small">{{ detections.length }} 处</el-tag>
            <span v-if="filterDisease || filterGrid" class="fpr-filter-hint">
              筛选显示 {{ filteredDetections.length }} 处
            </span>
          </div>
        </template>

        <div class="fpr-toolbar">
          <el-select v-model="filterDisease" placeholder="病害类型" size="small" clearable class="fpr-select">
            <el-option label="全部类型" :value="null" />
            <el-option v-for="(color, name) in DISEASE_COLORS" :key="name" :label="name" :value="name">
              <span class="fpr-opt-dot" :style="{ background: color }"></span>{{ name }}
            </el-option>
          </el-select>
          <el-select v-model="filterGrid" placeholder="网格" size="small" clearable class="fpr-select fpr-select-sm">
            <el-option label="全部网格" :value="null" />
            <el-option v-for="g in grids" :key="g.gridId" :label="g.gridId" :value="g.gridId" />
          </el-select>
          <div class="fpr-export">
            <el-button size="small" type="primary" plain :loading="exporting" @click.stop="exportAs('txt')">TXT</el-button>
            <el-button size="small" type="success" plain :loading="exporting" @click.stop="exportAs('word')">Word</el-button>
            <el-button size="small" type="warning" plain :loading="exporting" @click.stop="exportAs('pdf')">PDF</el-button>
          </div>
        </div>

        <div v-if="filteredDetections.length" class="fpr-blocks">
          <pre
            v-for="(block, idx) in textBlocks"
            :key="block.id"
            class="fpr-block"
          ><span class="fpr-block-index">{{ idx + 1 }}</span>{{ block.text }}</pre>
        </div>
        <el-empty v-else description="暂无匹配的病害" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import type { ProblemReportMeta, ProblemReportInput } from '../utils/facadeProblemReportExport'
import { exportProblemReportFormats } from '../utils/facadeWallReportExport'
import { formatCm, hasValidCoordTransform, pixelBboxToRealCm } from '../utils/facadeCoordTransform'

const DISEASE_COLORS: Record<string, string> = {
  '风化': '#e74c3c',
  '泛碱': '#3498db',
  '裂缝': '#f39c12',
  '植物附着': '#9b59b6',
  '缺损': '#1abc9c',
}

const props = withDefaults(defineProps<{
  detections: any[]
  grids?: any[]
  summary?: any
  meta?: ProblemReportMeta
  title?: string
  fill?: boolean
}>(), {
  title: '病害详细列表',
  fill: false,
})

const expanded = ref<string[]>([])
const filterDisease = ref<string | null>(null)
const filterGrid = ref<string | null>(null)
const exporting = ref(false)

const filteredDetections = computed(() => {
  let list = props.detections || []
  if (filterDisease.value) list = list.filter(d => d.class === filterDisease.value)
  if (filterGrid.value) list = list.filter(d => d.gridId === filterGrid.value)
  return list
})

function formatBlock(det: any, index: number): string {
  const bbox = det.globalBbox || det.bbox || []
  const x1 = bbox[0] || 0
  const y1 = bbox[1] || 0
  const x2 = (bbox[0] || 0) + (bbox[2] || 0)
  const y2 = (bbox[1] || 0) + (bbox[3] || 0)
  const lines = [
    `${det.class} · ${det.severity || '—'} · 置信度 ${((det.confidence || 0) * 100).toFixed(1)}%`,
  ]
  const meta = props.meta
  if (hasValidCoordTransform(meta)) {
    const real = pixelBboxToRealCm(x1, y1, x2, y2, {
      scalePxPerMm: meta!.scalePxPerMm!,
      imageHeight: meta!.imageHeight!,
    })
    lines.push(
      `实际坐标(cm): 中心(${formatCm(real.centerXCm)}, ${formatCm(real.centerYCm)}) ` +
        `左下(${formatCm(real.x1Cm)}, ${formatCm(real.y1Cm)}) 右上(${formatCm(real.x2Cm)}, ${formatCm(real.y2Cm)})`
    )
  }
  lines.push(`像素坐标: (${Math.round(x1)}, ${Math.round(y1)}) → (${Math.round(x2)}, ${Math.round(y2)})`)
  if (det.areaM2 > 0) lines.push(`受损面积: ${det.areaM2.toFixed(3)} m²`)
  if (det.lengthM > 0) lines.push(`裂缝长度: ${det.lengthM.toFixed(3)} m`)
  if (det.gridId) lines.push(`所属网格: ${det.gridId}`)
  if (det.tileId) lines.push(`所在切片: ${det.tileId}`)
  return lines.join('\n')
}

const textBlocks = computed(() =>
  filteredDetections.value.map((det, i) => ({
    id: det.id || `${det.tileId}-${i}`,
    text: formatBlock(det, i + 1),
  }))
)

function reportInput(): ProblemReportInput {
  return {
    detections: filteredDetections.value,
    summary: props.summary,
    grids: props.grids,
    meta: props.meta,
  }
}

async function exportAs(fmt: 'txt' | 'word' | 'pdf') {
  if (!filteredDetections.value.length) {
    ElMessage.warning('暂无病害可导出')
    return
  }
  exporting.value = true
  try {
    await exportProblemReportFormats(reportInput(), fmt)
    ElMessage.success(`已导出 ${fmt.toUpperCase()} 问题汇报`)
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.fpr-wrap { width: 100%; }
.fpr-wrap.fpr-fill { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.fpr-collapse { border: none; background: transparent; }
.fpr-collapse :deep(.el-collapse-item__header) {
  height: 52px;
  padding: 0 16px;
  background: linear-gradient(90deg, #f0f7ff, #fff);
  border-radius: 10px 10px 0 0;
  border: 1px solid #d9ecff;
  border-bottom: none;
  font-weight: 600;
}
.fpr-collapse :deep(.el-collapse-item__wrap) {
  border: 1px solid #e4e7ed;
  border-radius: 0 0 10px 10px;
  background: #fff;
}
.fpr-collapse :deep(.el-collapse-item__content) {
  padding: 16px 18px 18px;
}
.fpr-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; width: 100%; }
.fpr-icon { color: #0070c0; font-size: 18px; }
.fpr-title-text { font-size: 15px; font-weight: 700; color: #003a66; }
.fpr-filter-hint { font-size: 12px; color: #909399; font-weight: normal; margin-left: auto; }
.fpr-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.fpr-select { width: 130px; }
.fpr-select-sm { width: 110px; }
.fpr-opt-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.fpr-export { margin-left: auto; display: flex; flex-wrap: wrap; gap: 8px; }
.fpr-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  max-height: min(56vh, 640px);
  overflow-y: auto;
  padding: 4px 2px;
}
.fpr-fill .fpr-blocks { max-height: min(62vh, 720px); }
.fpr-block {
  margin: 0;
  padding: 14px 14px 14px 42px;
  position: relative;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}
.fpr-block:hover {
  border-color: #b3d8ff;
  box-shadow: 0 4px 12px rgba(0, 112, 192, 0.1);
}
.fpr-block-index {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #0070c0;
  border-radius: 6px;
}
</style>
