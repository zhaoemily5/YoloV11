<template>
  <div class="fms-wrap">
    <div class="fms-header">
      <span class="fms-title">砖块画线标定</span>
      <span class="fms-param">标准砖长 A = <b>{{ brickLengthMm }}</b> mm</span>
      <div style="flex:1" />
      <el-button-group size="small">
        <el-button @click="zoomOut" :icon="ZoomOut" plain :disabled="zoom <= 0.5">缩小</el-button>
        <el-button plain disabled>{{ Math.round(zoom * 100) }}%</el-button>
        <el-button @click="zoomIn" :icon="ZoomIn" plain :disabled="zoom >= 3">放大</el-button>
        <el-button @click="resetZoom" :icon="RefreshRight" plain>适应</el-button>
      </el-button-group>
      <el-button size="small" @click="resetAll" :icon="RefreshRight" plain style="margin-left:8px">重画</el-button>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="fms-tip"
      :title="lineConfirmed
        ? `画线长度 ${linePixelLengthNative.toFixed(1)} px，对应 ${brickLengthMm} mm。确认后返回主页进行视觉微调。`
        : '在图片上点击两个点，沿一块完整红砖的长边画一条直线。'"
    />

    <div class="fms-scroll-container" ref="scrollContainerRef">
      <div
        class="fms-container"
        ref="containerRef"
        :style="containerStyle"
        @wheel.prevent="onWheel"
        @mousedown="handleCanvasClick"
        @mousemove="onMouseMove"
      >
        <img ref="imgRef" :src="imageUrl" class="fms-img" draggable="false" @load="onLoad" />

        <svg
          v-if="imgLoaded"
          class="fms-svg-overlay"
          :width="dispW"
          :height="dispH"
          :viewBox="`0 0 ${dispW} ${dispH}`"
        >
          <g v-if="lineConfirmed">
            <line
              :x1="lineStart.x" :y1="lineStart.y"
              :x2="lineEnd.x" :y2="lineEnd.y"
              stroke="#409eff" stroke-width="3"
              stroke-linecap="round"
            />
            <circle :cx="lineStart.x" :cy="lineStart.y" r="5" fill="#409eff" stroke="#fff" stroke-width="1.5" />
            <circle :cx="lineEnd.x" :cy="lineEnd.y" r="5" fill="#409eff" stroke="#fff" stroke-width="1.5" />
            <text
              :x="(lineStart.x + lineEnd.x) / 2"
              :y="(lineStart.y + lineEnd.y) / 2 - 10"
              text-anchor="middle"
              fill="#409eff"
              font-size="12"
              font-weight="600"
              stroke="#fff"
              stroke-width="2"
              paint-order="stroke"
            >{{ Math.round(linePixelLengthNative) }} px</text>
          </g>

          <line
            v-if="isDrawing && !lineConfirmed"
            :x1="drawStart.x" :y1="drawStart.y"
            :x2="drawCurrent.x" :y2="drawCurrent.y"
            stroke="#ffd04b" stroke-width="2.5"
            stroke-dasharray="8,4"
            stroke-linecap="round"
          />
          <circle v-if="isDrawing && !lineConfirmed" :cx="drawStart.x" :cy="drawStart.y" r="4" fill="#ffd04b" />
        </svg>

        <div v-if="!lineConfirmed && !isDrawing && imgLoaded" class="fms-hint-overlay">
          <el-icon :size="20" color="#fff"><InfoFilled /></el-icon>
          <span>点击起点 → 点击终点，沿砖块长边画线</span>
        </div>
      </div>
    </div>

    <div v-if="lineConfirmed && baseScale > 0" class="fms-results">
      <div class="fms-compare-grid">
        <div class="fms-compare-card">
          <span class="fms-compare-label">画线测量</span>
          <span class="fms-compare-value">{{ linePixelLengthNative.toFixed(1) }} px</span>
        </div>
        <div class="fms-compare-card">
          <span class="fms-compare-label">标准砖长</span>
          <span class="fms-compare-value">{{ brickLengthMm }} mm</span>
        </div>
        <div class="fms-compare-card highlight">
          <span class="fms-compare-label">初步比例尺</span>
          <span class="fms-compare-value">{{ baseScale.toFixed(4) }} px/mm</span>
        </div>
      </div>
      <div class="fms-actions">
        <el-button type="primary" :loading="applying" @click="confirmLine">
          <el-icon><Check /></el-icon> 确定比例尺
        </el-button>
        <el-button @click="recalibrate">重新画线</el-button>
      </div>
    </div>

    <div v-else-if="isDrawing" class="fms-drawing-hint">已选起点，请点击终点完成画线</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { InfoFilled, Check, RefreshRight, ZoomIn, ZoomOut } from '@element-plus/icons-vue'

interface Point { x: number; y: number }

const props = defineProps<{
  imageFile?: File | null
  previewImageUrl?: string
  brickLengthMm: number
  applying?: boolean
}>()

const emit = defineEmits<{
  'update:scale': [scale: number]
  apply: [scale: number, linePixelLength: number, lineStartNative: Point, lineEndNative: Point]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const scrollContainerRef = ref<HTMLDivElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const imageUrl = ref('')
const imgNW = ref(0)
const imgNH = ref(0)
const baseW = ref(0)
const baseH = ref(0)
const imgLoaded = ref(false)
const selfCreatedUrl = ref('')
const zoom = ref(1)
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

function zoomIn() { if (zoom.value < MAX_ZOOM) zoom.value = Math.min(MAX_ZOOM, zoom.value + 0.25) }
function zoomOut() { if (zoom.value > MIN_ZOOM) zoom.value = Math.max(MIN_ZOOM, zoom.value - 0.25) }
function resetZoom() { zoom.value = 1 }

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }
}

const prevImageUrl = ref('')
watch(() => [props.imageFile, props.previewImageUrl], ([f, url]) => {
  if (selfCreatedUrl.value) {
    URL.revokeObjectURL(selfCreatedUrl.value)
    selfCreatedUrl.value = ''
  }
  let targetUrl = ''
  if (f instanceof File) {
    targetUrl = URL.createObjectURL(f)
    selfCreatedUrl.value = targetUrl
  } else if (typeof url === 'string' && url) targetUrl = url
  if (targetUrl !== prevImageUrl.value) {
    prevImageUrl.value = targetUrl
    imageUrl.value = ''
    imgNW.value = 0
    imgNH.value = 0
    baseW.value = 0
    baseH.value = 0
    imgLoaded.value = false
    zoom.value = 1
    imageUrl.value = targetUrl
    recalibrate()
  }
}, { immediate: true })

function onLoad() {
  const img = imgRef.value!
  imgNW.value = img.naturalWidth
  imgNH.value = img.naturalHeight
  const ratio = Math.min(860 / imgNW.value, 520 / imgNH.value, 1)
  baseW.value = imgNW.value * ratio
  baseH.value = imgNH.value * ratio
  imgLoaded.value = true
}

onBeforeUnmount(() => {
  if (selfCreatedUrl.value) URL.revokeObjectURL(selfCreatedUrl.value)
  window.removeEventListener('mousemove', onGlobalMove)
  window.removeEventListener('mouseup', onGlobalUp)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

onMounted(() => {
  window.addEventListener('mousemove', onGlobalMove)
  window.addEventListener('mouseup', onGlobalUp)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

const dispW = computed(() => baseW.value * zoom.value)
const dispH = computed(() => baseH.value * zoom.value)
const scaleX = computed(() => dispW.value / imgNW.value || 1)
const scaleY = computed(() => dispH.value / imgNH.value || 1)

const lineStart = ref<Point>({ x: 0, y: 0 })
const lineEnd = ref<Point>({ x: 0, y: 0 })
const lineConfirmed = ref(false)
const isDrawing = ref(false)
const drawStart = ref<Point>({ x: 0, y: 0 })
const drawCurrent = ref<Point>({ x: 0, y: 0 })

const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const scrollStart = ref({ x: 0, y: 0 })
const isSpacePressed = ref(false)

function recalibrate() {
  lineConfirmed.value = false
  lineStart.value = { x: 0, y: 0 }
  lineEnd.value = { x: 0, y: 0 }
  isDrawing.value = false
}

function resetAll() {
  recalibrate()
  resetZoom()
}

const lineStartNative = computed<Point>(() => ({
  x: lineStart.value.x / scaleX.value,
  y: lineStart.value.y / scaleY.value,
}))
const lineEndNative = computed<Point>(() => ({
  x: lineEnd.value.x / scaleX.value,
  y: lineEnd.value.y / scaleY.value,
}))

const linePixelLengthNative = computed(() => {
  if (!lineConfirmed.value) return 0
  const dx = lineEndNative.value.x - lineStartNative.value.x
  const dy = lineEndNative.value.y - lineStartNative.value.y
  return Math.sqrt(dx * dx + dy * dy)
})

const baseScale = computed(() => {
  if (!linePixelLengthNative.value || !props.brickLengthMm) return 0
  return linePixelLengthNative.value / props.brickLengthMm
})

watch(baseScale, (s) => {
  if (lineConfirmed.value && s > 0) emit('update:scale', s)
})

function getRelPos(e: MouseEvent) {
  const container = containerRef.value
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(dispW.value, e.clientX - rect.left)),
    y: Math.max(0, Math.min(dispH.value, e.clientY - rect.top)),
  }
}

function handleCanvasClick(e: MouseEvent) {
  if (e.button === 1 || (isSpacePressed.value && e.button === 0)) {
    e.preventDefault()
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    const sc = scrollContainerRef.value
    if (sc) scrollStart.value = { x: sc.scrollLeft, y: sc.scrollTop }
    return
  }
  if (e.button !== 0 || lineConfirmed.value) return
  const pos = getRelPos(e)
  if (!isDrawing.value) {
    isDrawing.value = true
    drawStart.value = pos
    drawCurrent.value = pos
  } else {
    drawCurrent.value = pos
    lineStart.value = { ...drawStart.value }
    lineEnd.value = pos
    lineConfirmed.value = true
    isDrawing.value = false
    if (baseScale.value > 0) emit('update:scale', baseScale.value)
  }
}

function onMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    const sc = scrollContainerRef.value
    if (sc) {
      sc.scrollLeft = scrollStart.value.x - (e.clientX - panStart.value.x)
      sc.scrollTop = scrollStart.value.y - (e.clientY - panStart.value.y)
    }
    return
  }
  if (isDrawing.value && !lineConfirmed.value) drawCurrent.value = getRelPos(e)
}

function onGlobalMove(e: MouseEvent) {
  if (isPanning.value || isDrawing.value) onMouseMove(e)
}
function onGlobalUp() { isPanning.value = false }
function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !isSpacePressed.value) { e.preventDefault(); isSpacePressed.value = true }
}
function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') { e.preventDefault(); isSpacePressed.value = false; isPanning.value = false }
}

function confirmLine() {
  if (baseScale.value > 0 && linePixelLengthNative.value > 0) {
    emit('apply', baseScale.value, linePixelLengthNative.value, { ...lineStartNative.value }, { ...lineEndNative.value })
  }
}

const containerStyle = computed(() => {
  const base: Record<string, string> = {}
  if (baseW.value && baseH.value) {
    base.width = `${dispW.value}px`
    base.height = `${dispH.value}px`
  }
  base.cursor = isPanning.value ? 'grabbing' : isSpacePressed.value ? 'grab' : 'crosshair'
  return base
})
</script>

<style scoped>
.fms-wrap { display: flex; flex-direction: column; gap: 12px; user-select: none; }
.fms-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fms-title { font-size: 14px; font-weight: 600; color: #303133; }
.fms-param { font-size: 13px; color: #606266; }
.fms-param b { color: #409eff; }
.fms-tip { margin-bottom: 0; }
.fms-scroll-container { width: 100%; max-height: 520px; overflow: auto; background: #1a1a1a; border-radius: 8px; border: 1px solid #dcdfe6; }
.fms-container { position: relative; display: inline-block; background: #111; }
.fms-img { display: block; width: 100%; height: 100%; }
.fms-svg-overlay { position: absolute; top: 0; left: 0; pointer-events: none; z-index: 15; }
.fms-hint-overlay { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.75); color: #fff; padding: 6px 12px; border-radius: 16px; font-size: 12px; z-index: 20; pointer-events: none; white-space: nowrap; }
.fms-drawing-hint { text-align: center; font-size: 13px; color: #e6a23c; padding: 8px; background: #fdf6ec; border-radius: 6px; }
.fms-results { background: #f0f9ff; border: 1px solid #b3d8ff; border-radius: 8px; padding: 14px 16px; }
.fms-compare-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.fms-compare-card { background: #fff; border: 1px solid #e4e7ed; border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; }
.fms-compare-card.highlight { border-color: #409eff; background: #ecf5ff; }
.fms-compare-label { font-size: 11px; color: #909399; }
.fms-compare-value { font-size: 15px; font-weight: 600; color: #303133; }
.fms-actions { display: flex; gap: 8px; }
</style>
