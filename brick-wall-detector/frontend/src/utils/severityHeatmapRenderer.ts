export interface SeverityDetection {
  class?: string
  severity?: string
  confidence?: number
  globalBbox?: number[]
  bbox?: number[]
  globalPolygon?: Array<{ x: number; y: number }>
}

export interface SeverityGrid {
  gridId?: string
  xM: number
  yM: number
  widthM: number
  heightM: number
  intensity: number
  totalCount?: number
}

export interface SeverityHeatmapOptions {
  maxSide?: number
  overlayOpacity?: number
  pureBackground?: string
}

export interface SeverityHeatmapOutput {
  pure: HTMLCanvasElement
  overlay: HTMLCanvasElement
  width: number
  height: number
  confMin: number
  confMax: number
}

interface ConfPoint {
  x: number
  y: number
  confidence: number
}

const HEAT_DOWNSAMPLE = 6

/** 温度分布色标：低置信度(蓝) → 高置信度(红)，线性插值 */
export function heatColormap(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t))
  if (v < 0.25) {
    const u = v / 0.25
    return [Math.round(60 + u * 40), Math.round(40 + u * 100), Math.round(180 + u * 75)]
  }
  if (v < 0.5) {
    const u = (v - 0.25) / 0.25
    return [Math.round(100 - u * 80), Math.round(140 + u * 115), Math.round(255 * (1 - u))]
  }
  if (v < 0.75) {
    const u = (v - 0.5) / 0.25
    return [Math.round(20 + u * 235), Math.round(255 * (1 - u * 0.2)), 0]
  }
  const u = (v - 0.75) / 0.25
  return [255, Math.round(204 * (1 - u)), 0]
}

function getBbox(det: SeverityDetection): [number, number, number, number] | null {
  const b = det.globalBbox || det.bbox
  if (!b || b.length < 4) return null
  return [b[0], b[1], b[2], b[3]]
}

function detectionCenter(det: SeverityDetection, scale: number): { x: number; y: number } | null {
  const poly = det.globalPolygon
  if (poly && poly.length >= 3) {
    let sx = 0
    let sy = 0
    poly.forEach(p => {
      sx += p.x
      sy += p.y
    })
    return { x: (sx / poly.length) * scale, y: (sy / poly.length) * scale }
  }
  const bbox = getBbox(det)
  if (!bbox) return null
  const [bx, by, bw, bh] = bbox
  return { x: (bx + bw / 2) * scale, y: (by + bh / 2) * scale }
}

function collectConfidencePoints(
  detections: SeverityDetection[],
  scale: number,
  w: number,
  h: number
): { points: ConfPoint[]; confMin: number; confMax: number } {
  const points: ConfPoint[] = []
  let confMin = Infinity
  let confMax = -Infinity

  detections.forEach(det => {
    const conf = Math.max(0, Math.min(1, det.confidence ?? 0))
    const center = detectionCenter(det, scale)
    if (!center || conf <= 0) return
    if (center.x < 0 || center.y < 0 || center.x > w || center.y > h) return
    points.push({ x: center.x, y: center.y, confidence: conf })
    if (conf < confMin) confMin = conf
    if (conf > confMax) confMax = conf
  })

  if (!points.length) return { points: [], confMin: 0, confMax: 1 }
  if (confMin === confMax) confMin = Math.max(0, confMax - 0.01)
  return { points, confMin, confMax }
}

/** 线性平滑权重核：(1 - d/r)² */
function buildLinearSmoothKernel(radius: number) {
  const r = Math.ceil(radius)
  const kernel: { dx: number; dy: number; w: number }[] = []
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > radius) continue
      const w = (1 - d / radius) ** 2
      if (w > 0.001) kernel.push({ dx, dy, w })
    }
  }
  return kernel
}

/**
 * 以各检测框中心为采样点，线性平滑权重做 IDW 插值
 */
function buildInterpolatedField(
  points: ConfPoint[],
  fw: number,
  fh: number,
  downsample: number,
  influenceRadius: number
): { values: Float32Array; weights: Float32Array } {
  const valueField = new Float32Array(fw * fh)
  const weightField = new Float32Array(fw * fh)
  if (!points.length) return { values: valueField, weights: weightField }

  const radius = influenceRadius / downsample
  const kernel = buildLinearSmoothKernel(radius)

  points.forEach(pt => {
    const ix = Math.round(pt.x / downsample)
    const iy = Math.round(pt.y / downsample)
    kernel.forEach(({ dx, dy, w }) => {
      const nx = ix + dx
      const ny = iy + dy
      if (nx < 0 || ny < 0 || nx >= fw || ny >= fh) return
      const idx = ny * fw + nx
      weightField[idx] += w
      valueField[idx] += w * pt.confidence
    })
  })

  const values = new Float32Array(fw * fh)
  for (let i = 0; i < values.length; i++) {
    values[i] = weightField[i] > 1e-5 ? valueField[i] / weightField[i] : 0
  }
  return { values, weights: weightField }
}

function blurScalarField(values: Float32Array, fw: number, fh: number, blurPx: number): Float32Array {
  const src = document.createElement('canvas')
  src.width = fw
  src.height = fh
  const sctx = src.getContext('2d')!
  const img = sctx.createImageData(fw, fh)
  let maxV = 0
  for (let i = 0; i < values.length; i++) {
    const v = Math.round(values[i] * 255)
    if (v > maxV) maxV = v
    const idx = i * 4
    img.data[idx] = v
    img.data[idx + 1] = v
    img.data[idx + 2] = v
    img.data[idx + 3] = v > 0 ? 255 : 0
  }
  sctx.putImageData(img, 0, 0)

  const dst = document.createElement('canvas')
  dst.width = fw
  dst.height = fh
  const dctx = dst.getContext('2d')!
  dctx.filter = `blur(${blurPx}px)`
  dctx.drawImage(src, 0, 0)
  dctx.filter = 'none'

  const blurred = dctx.getImageData(0, 0, fw, fh)
  const out = new Float32Array(fw * fh)
  for (let i = 0; i < out.length; i++) {
    out[i] = blurred.data[i * 4] / 255
  }
  return out
}

function parseBgColor(bg: string): [number, number, number] {
  if (bg.startsWith('#') && bg.length >= 7) {
    return [
      parseInt(bg.slice(1, 3), 16),
      parseInt(bg.slice(3, 5), 16),
      parseInt(bg.slice(5, 7), 16),
    ]
  }
  return [13, 17, 23]
}

function fieldToColorCanvas(
  values: Float32Array,
  weights: Float32Array,
  fw: number,
  fh: number,
  confMin: number,
  confMax: number,
  background: string | null
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = fw
  canvas.height = fh
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(fw, fh)
  const range = Math.max(confMax - confMin, 1e-6)

  for (let i = 0; i < values.length; i++) {
    const idx = i * 4
    if (weights[i] < 0.015) {
      if (background) {
        const [r, g, b] = parseBgColor(background)
        img.data[idx] = r
        img.data[idx + 1] = g
        img.data[idx + 2] = b
        img.data[idx + 3] = 255
      } else {
        img.data[idx + 3] = 0
      }
      continue
    }
    const t = Math.max(0, Math.min(1, (values[i] - confMin) / range))
    const [r, g, b] = heatColormap(t)
    const alpha = Math.round(40 + t * 200)
    img.data[idx] = r
    img.data[idx + 1] = g
    img.data[idx + 2] = b
    img.data[idx + 3] = alpha
  }

  ctx.putImageData(img, 0, 0)
  return canvas
}

function upscaleCanvas(small: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, w, h)
  return out
}

function drawColorLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  barW: number,
  barH: number,
  confMin: number,
  confMax: number
) {
  const grad = ctx.createLinearGradient(x, y, x + barW, y)
  ;[0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const [r, g, b] = heatColormap(t)
    grad.addColorStop(t, `rgb(${r},${g},${b})`)
  })
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.fillRect(x - 8, y - 28, barW + 16, barH + 44)
  ctx.fillStyle = '#303133'
  ctx.font = 'bold 12px "Microsoft YaHei", sans-serif'
  ctx.fillText('置信度热力（线性插值）', x, y - 10)
  ctx.fillStyle = grad
  ctx.fillRect(x, y, barW, barH)
  ctx.strokeStyle = '#909399'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, barW, barH)
  ctx.fillStyle = '#606266'
  ctx.font = '10px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${(confMin * 100).toFixed(1)}%`, x, y + barH + 14)
  ctx.textAlign = 'right'
  ctx.fillText(`${(confMax * 100).toFixed(1)}%`, x + barW, y + barH + 14)
  ctx.textAlign = 'left'
}

function attachLegend(canvas: HTMLCanvasElement, confMin: number, confMax: number): HTMLCanvasElement {
  const w = canvas.width
  const h = canvas.height
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!
  ctx.drawImage(canvas, 0, 0)
  drawColorLegend(ctx, 14, h - 52, Math.min(260, w * 0.34), 12, confMin, confMax)
  return out
}

function composeOverlay(
  image: HTMLImageElement,
  heatCanvas: HTMLCanvasElement,
  w: number,
  h: number,
  opacity: number
): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!
  ctx.drawImage(image, 0, 0, w, h)
  ctx.globalAlpha = opacity
  ctx.drawImage(heatCanvas, 0, 0)
  ctx.globalAlpha = 1
  return out
}

/**
 * 生成纯热力图 + 原图叠加图
 * 以各检测区域中心为置信度采样点，线性平滑 IDW 插值，色标按置信度 min/max 标定
 */
export function renderSeverityHeatmaps(
  image: HTMLImageElement,
  detections: SeverityDetection[],
  options: SeverityHeatmapOptions = {}
): SeverityHeatmapOutput {
  const maxSide = options.maxSide ?? 8192
  let w = image.naturalWidth || image.width
  let h = image.naturalHeight || image.height
  let scale = 1
  if (Math.max(w, h) > maxSide) {
    scale = maxSide / Math.max(w, h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }

  const pureBg = options.pureBackground ?? '#0d1117'
  const overlayOpacity = options.overlayOpacity ?? 0.68
  const ds = HEAT_DOWNSAMPLE
  const fw = Math.ceil(w / ds)
  const fh = Math.ceil(h / ds)
  const minSide = Math.min(w, h)
  const influenceRadius = Math.max(40, Math.min(320, minSide * 0.09))
  const blurPx = Math.max(3, Math.min(14, minSide / ds / 80))

  const { points, confMin, confMax } = collectConfidencePoints(detections, scale, w, h)
  const { values, weights } = buildInterpolatedField(points, fw, fh, ds, influenceRadius)
  const smoothed = blurScalarField(values, fw, fh, blurPx)
  const smoothedWeights = blurScalarField(weights, fw, fh, blurPx)

  const smallPure = fieldToColorCanvas(smoothed, smoothedWeights, fw, fh, confMin, confMax, pureBg)
  const smallHeat = fieldToColorCanvas(smoothed, smoothedWeights, fw, fh, confMin, confMax, null)

  const pure = attachLegend(upscaleCanvas(smallPure, w, h), confMin, confMax)
  const heatLayer = upscaleCanvas(smallHeat, w, h)
  const overlay = attachLegend(composeOverlay(image, heatLayer, w, h, overlayOpacity), confMin, confMax)

  return { pure, overlay, width: w, height: h, confMin, confMax }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('导出图片失败'))), type, quality)
  })
}
