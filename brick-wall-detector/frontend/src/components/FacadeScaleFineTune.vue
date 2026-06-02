<template>
  <div class="fst-wrap">
    <div class="fst-head">
      <div class="fst-head-left">
        <span class="fst-title">比例尺视觉微调</span>
        <span class="fst-sub">弹窗已关闭 · 在主页拖动系数，右侧切片网格会实时变化</span>
      </div>
      <div class="fst-live-metrics">
        <span class="fst-metric">比例尺 <b>{{ adjustedScale.toFixed(4) }}</b> px/mm</span>
        <span class="fst-metric">C → <b>{{ mappedCorePx }}</b> px</span>
        <span class="fst-metric">约 <b>{{ liveTileCount }}</b> 块切片</span>
      </div>
    </div>

    <div class="fst-dual">
      <div class="fst-pane fst-pane-brick">
        <div class="fst-pane-label">
          <span class="dot brick"></span> 砖块对照
        </div>
        <div class="fst-scroll" ref="scrollRef">
          <div class="fst-stage" :style="stageStyle" @wheel.prevent="onWheel">
            <img ref="imgRef" :src="imageUrl" class="fst-img" draggable="false" @load="onLoad" />
            <svg
              v-if="imgLoaded && hasLine"
              class="fst-svg"
              :width="dispW"
              :height="dispH"
              :viewBox="`0 0 ${dispW} ${dispH}`"
            >
              <line
                :x1="lineStartDisp.x" :y1="lineStartDisp.y"
                :x2="lineEndDisp.x" :y2="lineEndDisp.y"
                stroke="#409eff" stroke-width="3" stroke-linecap="round"
              />
              <rect
                v-if="brickBox.w > 4"
                :x="brickBox.x" :y="brickBox.y"
                :width="brickBox.w" :height="brickBox.h"
                fill="rgba(103,194,58,0.18)"
                stroke="#67c23a"
                stroke-width="2"
                stroke-dasharray="6,4"
                rx="2"
                class="fst-brick-rect"
              />
              <circle :cx="lineStartDisp.x" :cy="lineStartDisp.y" r="5" fill="#409eff" stroke="#fff" stroke-width="1.5" />
              <circle :cx="lineEndDisp.x" :cy="lineEndDisp.y" r="5" fill="#409eff" stroke="#fff" stroke-width="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <div class="fst-pane fst-pane-slice">
        <div class="fst-pane-label">
          <span class="dot slice"></span> 切片划分预览（随微调实时更新）
        </div>
        <FacadeAutoPreview
          class="fst-slice-preview"
          :image-file="imageFile"
          :preview-image-url="previewImageUrl"
          :wall-width-m="wallWidthM"
          :wall-height-m="wallHeightM"
          :zone-size-mm="zoneSizeMm"
          :overlap-mm="overlapMm"
          :scale-px-per-mm="adjustedScale"
          :animate-tiles="true"
          @update:frame="(f) => emit('update:frame', f)"
          @update:image-size="(w, h) => emit('update:imageSize', w, h)"
          @update:tile-count="onTileCount"
        />
      </div>
    </div>

    <div class="fst-control">
      <div class="fst-stats">
        <div class="fst-stat"><span class="lbl">画线</span><b>{{ linePixelLength.toFixed(1) }} px</b></div>
        <div class="fst-stat"><span class="lbl">砖长 A</span><b>{{ brickLengthMm }} mm</b></div>
        <div class="fst-stat accent"><span class="lbl">1 块砖</span><b>{{ tunedBrickPx.toFixed(1) }} px</b></div>
        <div class="fst-stat accent"><span class="lbl">裁切边长</span><b>{{ mappedExtractPx }} px</b></div>
      </div>
      <div class="fst-slider-block">
        <div class="fst-slider-head">
          <span>微调系数</span>
          <span class="pct">{{ (scaleFactor * 100).toFixed(1) }}%</span>
        </div>
        <el-slider
          v-model="scaleFactor"
          :min="0.85"
          :max="1.15"
          :step="0.005"
          :format-tooltip="(v: number) => (v * 100).toFixed(1) + '%'"
          @input="emitScale"
        />
      </div>
      <el-button type="primary" size="large" class="fst-confirm-btn" :loading="confirming" @click="confirm">
        <el-icon><Check /></el-icon> 确认比例尺并完成标定
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Check } from '@element-plus/icons-vue'
import FacadeAutoPreview from './FacadeAutoPreview.vue'
import { countTilesInRegion, computeTileMetrics } from '../utils/facadeTileMetrics'

interface Point { x: number; y: number }

const props = defineProps<{
  imageFile?: File | null
  previewImageUrl?: string
  brickLengthMm: number
  linePixelLength: number
  lineStartNative: Point
  lineEndNative: Point
  baseScalePxPerMm: number
  zoneSizeMm?: number
  overlapMm?: number
  wallWidthM?: number
  wallHeightM?: number
  confirming?: boolean
}>()

const emit = defineEmits<{
  'update:scale': [scale: number]
  'update:frame': [f: { left: number; top: number; right: number; bottom: number }]
  'update:imageSize': [w: number, h: number]
  'update:tileCount': [count: number]
  confirm: [scale: number, scaleFactor: number]
}>()

const scrollRef = ref<HTMLDivElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const imageUrl = ref('')
const selfUrl = ref('')
const imgNW = ref(0)
const imgNH = ref(0)
const baseW = ref(0)
const baseH = ref(0)
const imgLoaded = ref(false)
const zoom = ref(1)
const scaleFactor = ref(1)
const liveTileCount = ref(0)

watch(() => [props.imageFile, props.previewImageUrl], ([f, url]) => {
  if (selfUrl.value) { URL.revokeObjectURL(selfUrl.value); selfUrl.value = '' }
  let target = ''
  if (f instanceof File) {
    target = URL.createObjectURL(f)
    selfUrl.value = target
  } else if (typeof url === 'string' && url) target = url
  imageUrl.value = target
  imgLoaded.value = false
}, { immediate: true })

onBeforeUnmount(() => {
  if (selfUrl.value) URL.revokeObjectURL(selfUrl.value)
})

function onLoad() {
  const img = imgRef.value!
  imgNW.value = img.naturalWidth
  imgNH.value = img.naturalHeight
  const ratio = Math.min(1, 520 / imgNW.value, 380 / imgNH.value)
  baseW.value = imgNW.value * ratio
  baseH.value = imgNH.value * ratio
  imgLoaded.value = true
  emitScale()
  updateTileCount()
}

const dispW = computed(() => baseW.value * zoom.value)
const dispH = computed(() => baseH.value * zoom.value)
const scaleX = computed(() => dispW.value / imgNW.value || 1)
const scaleY = computed(() => dispH.value / imgNH.value || 1)

const hasLine = computed(() =>
  props.linePixelLength > 0 &&
  (props.lineStartNative.x !== props.lineEndNative.x || props.lineStartNative.y !== props.lineEndNative.y)
)

const lineStartDisp = computed(() => ({
  x: props.lineStartNative.x * scaleX.value,
  y: props.lineStartNative.y * scaleY.value,
}))
const lineEndDisp = computed(() => ({
  x: props.lineEndNative.x * scaleX.value,
  y: props.lineEndNative.y * scaleY.value,
}))

const adjustedScale = computed(() => props.baseScalePxPerMm * scaleFactor.value)
const tunedBrickPx = computed(() => props.brickLengthMm * adjustedScale.value)

const mappedCorePx = computed(() =>
  props.zoneSizeMm && adjustedScale.value ? Math.round(props.zoneSizeMm * adjustedScale.value) : 0
)
const mappedExtractPx = computed(() => {
  const d = props.overlapMm || 0
  return props.zoneSizeMm && adjustedScale.value
    ? Math.round((props.zoneSizeMm + 2 * d) * adjustedScale.value)
    : 0
})

const brickBox = computed(() => {
  if (!hasLine.value || tunedBrickPx.value <= 0) return { x: 0, y: 0, w: 0, h: 0 }
  const cx = (lineStartDisp.value.x + lineEndDisp.value.x) / 2
  const cy = (lineStartDisp.value.y + lineEndDisp.value.y) / 2
  const displayLen = tunedBrickPx.value * scaleX.value
  const displayH = Math.max(10, displayLen * 0.45)
  return { x: cx - displayLen / 2, y: cy - displayH / 2, w: displayLen, h: displayH }
})

const stageStyle = computed(() => ({
  width: dispW.value ? `${dispW.value}px` : undefined,
  height: dispH.value ? `${dispH.value}px` : undefined,
}))

function onTileCount(n: number) {
  liveTileCount.value = n
  emit('update:tileCount', n)
}

function updateTileCount() {
  const s = adjustedScale.value
  const C = props.zoneSizeMm || 0
  const D = props.overlapMm || 0
  if (!s || !C || !imgNW.value || !imgNH.value) {
    liveTileCount.value = 0
    return
  }
  const m = computeTileMetrics(s, C, D)
  liveTileCount.value = countTilesInRegion(imgNW.value, imgNH.value, m)
}

function onWheel(e: WheelEvent) {
  if (e.deltaY < 0) zoom.value = Math.min(3, zoom.value + 0.15)
  else zoom.value = Math.max(0.5, zoom.value - 0.15)
}

function emitScale() {
  if (adjustedScale.value > 0) emit('update:scale', adjustedScale.value)
}

function confirm() {
  if (adjustedScale.value > 0) emit('confirm', adjustedScale.value, scaleFactor.value)
}

watch(() => props.baseScalePxPerMm, () => {
  scaleFactor.value = 1
  emitScale()
  updateTileCount()
})

watch(adjustedScale, () => {
  emitScale()
  updateTileCount()
})
</script>

<style scoped>
.fst-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  background: linear-gradient(165deg, #f8fbff 0%, #eef5fc 100%);
  border: 1px solid #c5ddf5;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 112, 192, 0.08);
}
.fst-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.fst-title { font-size: 16px; font-weight: 700; color: #003a66; display: block; }
.fst-sub { font-size: 12px; color: #909399; margin-top: 4px; display: block; }
.fst-live-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.fst-metric {
  font-size: 12px;
  color: #606266;
  background: #fff;
  border: 1px solid #d9ecff;
  padding: 6px 12px;
  border-radius: 20px;
}
.fst-metric b { color: #0070c0; font-weight: 700; }
.fst-dual {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.1fr);
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 900px) {
  .fst-dual { grid-template-columns: 1fr; }
}
.fst-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  padding: 12px;
  min-height: 320px;
}
.fst-pane-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}
.fst-pane-label .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.fst-pane-label .dot.brick { background: #67c23a; }
.fst-pane-label .dot.slice { background: #409eff; }
.fst-scroll {
  flex: 1;
  min-height: 280px;
  overflow: auto;
  background: #111;
  border-radius: 8px;
}
.fst-stage { position: relative; display: inline-block; margin: auto; }
.fst-img { display: block; width: 100%; height: 100%; }
.fst-svg { position: absolute; top: 0; left: 0; pointer-events: none; }
.fst-brick-rect { transition: x 0.12s ease, y 0.12s ease, width 0.12s ease, height 0.12s ease; }
.fst-slice-preview { flex: 1; min-height: 0; }
.fst-slice-preview :deep(.fap-container) { min-height: 280px; }
.fst-control {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fst-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 768px) {
  .fst-stats { grid-template-columns: repeat(2, 1fr); }
}
.fst-stat {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
}
.fst-stat.accent { background: #ecf5ff; border-color: #b3d8ff; }
.fst-stat .lbl { display: block; font-size: 11px; color: #909399; margin-bottom: 4px; }
.fst-stat b { font-size: 15px; color: #303133; }
.fst-slider-block { padding: 0 4px; }
.fst-slider-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.fst-slider-head .pct { color: #409eff; font-size: 15px; }
.fst-confirm-btn { width: 100%; font-weight: 600; letter-spacing: 0.5px; }
</style>
