<template>
  <el-card class="fsh-panel" shadow="never">
    <template #header>
      <div class="fsh-header">
        <div class="fsh-header-left">
          <el-icon class="fsh-icon"><Picture /></el-icon>
          <div>
            <span class="fsh-title">病害严重程度热力图</span>
            <span class="fsh-sub">以检测框中心置信度插值，按 min/max 标定色标，输出纯热力图与叠加图</span>
          </div>
        </div>
        <el-button
          type="primary"
          :loading="generating"
          :disabled="!canGenerate"
          @click="generateHeatmap"
        >
          <el-icon><MagicStick /></el-icon>
          生成热力图
        </el-button>
      </div>
    </template>

    <el-alert
      v-if="!canGenerate"
      type="info"
      :closable="false"
      show-icon
      title="请先完成 AI 诊断并确保有原图与病害数据，再生成热力图。"
    />

    <div v-if="hasResult" class="fsh-result">
      <div class="fsh-result-toolbar">
        <el-tag type="success" effect="dark">已生成 2 张热力图</el-tag>
        <span class="fsh-meta">{{ resultMeta }}</span>
        <div class="fsh-actions">
          <el-button type="primary" plain size="small" @click="downloadPure">
            <el-icon><Download /></el-icon> 下载纯热力图
          </el-button>
          <el-button type="warning" plain size="small" @click="downloadOverlay">
            <el-icon><Download /></el-icon> 下载叠加图
          </el-button>
          <el-button size="small" @click="generateHeatmap">
            <el-icon><Refresh /></el-icon> 重新生成
          </el-button>
        </div>
      </div>

      <div class="fsh-dual-preview">
        <div class="fsh-preview-block">
          <div class="fsh-preview-label">纯热力图（温度分布）</div>
          <div class="fsh-preview-wrap fsh-preview-wrap--dark">
            <img :src="pureHeatmapUrl" alt="纯热力图" class="fsh-preview-img" />
          </div>
        </div>
        <div class="fsh-preview-block">
          <div class="fsh-preview-label">原图 + 热力图叠加</div>
          <div class="fsh-preview-wrap">
            <img :src="overlayHeatmapUrl" alt="叠加热力图" class="fsh-preview-img" />
          </div>
        </div>
      </div>

      <p class="fsh-legend-hint">
        各病害区域中心为置信度采样点，线性平滑权重插值连接；色标按本次检测置信度最小值与最大值标定（蓝→绿→黄→红）。
      </p>
    </div>

    <el-empty v-else-if="!generating" description="点击「生成热力图」输出纯热力图与原图叠加图各一张" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, MagicStick, Download, Refresh } from '@element-plus/icons-vue'
import {
  renderSeverityHeatmaps,
  canvasToBlob,
  type SeverityDetection,
} from '../utils/severityHeatmapRenderer'
import { downloadBlob, reportFilename } from '../utils/reportExport'

const props = defineProps<{
  imageUrl: string
  imageWidth: number
  imageHeight: number
  detections: SeverityDetection[]
}>()

const generating = ref(false)
const pureHeatmapUrl = ref('')
const overlayHeatmapUrl = ref('')
const pureBlob = ref<Blob | null>(null)
const overlayBlob = ref<Blob | null>(null)
const resultMeta = ref('')

const canGenerate = computed(() =>
  !!props.imageUrl &&
  props.imageWidth > 0 &&
  props.imageHeight > 0 &&
  (props.detections?.length > 0)
)

const hasResult = computed(() => !!pureHeatmapUrl.value && !!overlayHeatmapUrl.value)

function revokeUrls() {
  if (pureHeatmapUrl.value) {
    URL.revokeObjectURL(pureHeatmapUrl.value)
    pureHeatmapUrl.value = ''
  }
  if (overlayHeatmapUrl.value) {
    URL.revokeObjectURL(overlayHeatmapUrl.value)
    overlayHeatmapUrl.value = ''
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('原图加载失败'))
    img.src = url
  })
}

async function generateHeatmap() {
  if (!canGenerate.value) {
    ElMessage.warning('缺少原图或病害数据')
    return
  }
  generating.value = true
  revokeUrls()
  pureBlob.value = null
  overlayBlob.value = null
  try {
    const img = await loadImage(props.imageUrl)
    const result = renderSeverityHeatmaps(img, props.detections || [], {})
    const { pure, overlay, width, height } = result
    const [pureB, overlayB] = await Promise.all([canvasToBlob(pure), canvasToBlob(overlay)])
    pureBlob.value = pureB
    overlayBlob.value = overlayB
    pureHeatmapUrl.value = URL.createObjectURL(pureB)
    overlayHeatmapUrl.value = URL.createObjectURL(overlayB)
    resultMeta.value = `${width} × ${height} px · ${props.detections.length} 处 · 置信度 ${(result.confMin * 100).toFixed(1)}% ~ ${(result.confMax * 100).toFixed(1)}%`
    ElMessage.success('纯热力图与叠加图已生成')
  } catch (e: any) {
    ElMessage.error(e.message || '热力图生成失败')
  } finally {
    generating.value = false
  }
}

function downloadPure() {
  if (!pureBlob.value) {
    ElMessage.warning('请先生成热力图')
    return
  }
  downloadBlob(pureBlob.value, reportFilename('病害严重程度_纯热力图', 'png'), 'image/png')
  ElMessage.success('纯热力图 PNG 已下载')
}

function downloadOverlay() {
  if (!overlayBlob.value) {
    ElMessage.warning('请先生成热力图')
    return
  }
  downloadBlob(overlayBlob.value, reportFilename('病害严重程度_叠加图', 'png'), 'image/png')
  ElMessage.success('叠加图 PNG 已下载')
}

onBeforeUnmount(() => revokeUrls())
</script>

<style scoped>
.fsh-panel {
  border: 1px solid #f5dab1;
  border-radius: 12px;
  background: linear-gradient(180deg, #fffbf5 0%, #fff 40%);
}
.fsh-panel :deep(.el-card__header) {
  background: linear-gradient(90deg, #fdf6ec, #fff);
  border-bottom: 1px solid #faecd8;
  padding: 14px 18px;
}
.fsh-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.fsh-header-left { display: flex; align-items: flex-start; gap: 12px; }
.fsh-icon { font-size: 28px; color: #e6a23c; margin-top: 2px; }
.fsh-title { display: block; font-size: 16px; font-weight: 700; color: #303133; }
.fsh-sub { display: block; font-size: 12px; color: #909399; margin-top: 4px; }
.fsh-result { margin-top: 4px; }
.fsh-result-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.fsh-meta { font-size: 12px; color: #606266; }
.fsh-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.fsh-dual-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 960px) {
  .fsh-dual-preview { grid-template-columns: 1fr; }
}
.fsh-preview-block { min-width: 0; }
.fsh-preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.fsh-preview-wrap {
  border-radius: 10px;
  overflow: auto;
  max-height: min(60vh, 560px);
  background: #2c2c2c;
  border: 1px solid #dcdfe6;
  text-align: center;
}
.fsh-preview-wrap--dark { background: #0d1117; }
.fsh-preview-img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.fsh-legend-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
