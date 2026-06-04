/** 图像有效内容区（相对原图 0–1），用于排除全景图黑边/留白 */
export interface ContentBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface DetectContentBoundsOptions {
  maxSample?: number
  lumaThreshold?: number
  padRatio?: number
}

/**
 * 扫描非近黑像素，得到有效内容外接矩形（归一化坐标）
 */
export async function detectImageContentBounds(
  img: HTMLImageElement,
  options: DetectContentBoundsOptions = {}
): Promise<ContentBounds> {
  const maxSample = options.maxSample ?? 960
  const lumaThreshold = options.lumaThreshold ?? 28
  const padRatio = options.padRatio ?? 0.01

  const nw = img.naturalWidth
  const nh = img.naturalHeight
  if (!nw || !nh) {
    return { left: 0, top: 0, right: 1, bottom: 1 }
  }

  const scale = Math.min(1, maxSample / Math.max(nw, nh))
  const w = Math.max(1, Math.round(nw * scale))
  const h = Math.max(1, Math.round(nh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return { left: 0, top: 0, right: 1, bottom: 1 }
  }

  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let found = false

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      if (luma > lumaThreshold) {
        found = true
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (!found) {
    return { left: 0, top: 0, right: 1, bottom: 1 }
  }

  const padX = Math.max(2, Math.round(w * padRatio))
  const padY = Math.max(2, Math.round(h * padRatio))
  minX = Math.max(0, minX - padX)
  minY = Math.max(0, minY - padY)
  maxX = Math.min(w - 1, maxX + padX)
  maxY = Math.min(h - 1, maxY + padY)

  const cw = maxX - minX + 1
  const ch = maxY - minY + 1
  if (cw < w * 0.04 || ch < h * 0.04) {
    return { left: 0, top: 0, right: 1, bottom: 1 }
  }

  return {
    left: minX / w,
    top: minY / h,
    right: (maxX + 1) / w,
    bottom: (maxY + 1) / h,
  }
}
