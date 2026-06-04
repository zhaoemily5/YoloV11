export interface TileMetrics {
  corePx: number
  corePxExact: number
  extractPx: number
  extractPxExact: number
  stepPxExact: number
}

/** 与后端 createAutoScaleTiles 保持一致：核心 C×scale，裁切 (C+2D)×scale，步长 C×scale */
export function computeTileMetrics(
  scalePxPerMm: number,
  zoneSizeMm: number,
  overlapMm: number
): TileMetrics {
  const C = zoneSizeMm || 0
  const D = overlapMm || 0
  if (!scalePxPerMm || scalePxPerMm <= 0 || !C) {
    return {
      corePx: 0,
      corePxExact: 0,
      extractPx: 0,
      extractPxExact: 0,
      stepPxExact: 0,
    }
  }

  const stepPxExact = C * scalePxPerMm
  const extractPxExact = (C + 2 * D) * scalePxPerMm
  const corePxExact = C * scalePxPerMm

  return {
    corePx: Math.round(corePxExact),
    corePxExact,
    extractPx: Math.round(extractPxExact),
    extractPxExact,
    stepPxExact,
  }
}

/** 统计 ROI 区域内切片数量（网格铺满至右/下边缘，与预览一致） */
export function countTilesInRegion(
  roiWidthPx: number,
  roiHeightPx: number,
  metrics: TileMetrics
): number {
  const { stepPxExact, extractPxExact } = metrics
  if (!stepPxExact || !extractPxExact || !roiWidthPx || !roiHeightPx) return 0

  let count = 0
  let y = 0
  while (y < roiHeightPx - 0.5) {
    let x = 0
    while (x < roiWidthPx - 0.5) {
      const cropW = Math.min(extractPxExact, roiWidthPx - x)
      const cropH = Math.min(extractPxExact, roiHeightPx - y)
      if (cropW >= 4 && cropH >= 4) count++
      const remainX = roiWidthPx - x
      x += remainX <= stepPxExact * 1.05 ? remainX : stepPxExact
    }
    const remainY = roiHeightPx - y
    y += remainY <= stepPxExact * 1.05 ? remainY : stepPxExact
  }
  return count
}
