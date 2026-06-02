/** 墙面实际坐标（cm），原点在图像左下角，x 向右、y 向上 */

export interface RealCoordCm {
  /** 左下角 (cm) */
  x1Cm: number
  y1Cm: number
  /** 右上角 (cm) */
  x2Cm: number
  y2Cm: number
  centerXCm: number
  centerYCm: number
  widthCm: number
  heightCm: number
}

export interface CoordTransformContext {
  scalePxPerMm: number
  imageHeight: number
}

export function pxToCm(px: number, scalePxPerMm: number): number {
  if (!scalePxPerMm || scalePxPerMm <= 0 || !Number.isFinite(px)) return 0
  return px / scalePxPerMm / 10
}

/** 像素 bbox（图像坐标系，原点左上）→ 墙面实际坐标 cm（原点左下） */
export function pixelBboxToRealCm(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ctx: CoordTransformContext
): RealCoordCm {
  const { scalePxPerMm, imageHeight } = ctx
  const x1Cm = pxToCm(x1, scalePxPerMm)
  const x2Cm = pxToCm(x2, scalePxPerMm)
  const y1Cm = pxToCm(imageHeight - y2, scalePxPerMm)
  const y2Cm = pxToCm(imageHeight - y1, scalePxPerMm)
  const centerXCm = pxToCm((x1 + x2) / 2, scalePxPerMm)
  const centerYCm = pxToCm(imageHeight - (y1 + y2) / 2, scalePxPerMm)
  return {
    x1Cm,
    y1Cm,
    x2Cm,
    y2Cm,
    centerXCm,
    centerYCm,
    widthCm: Math.abs(x2Cm - x1Cm),
    heightCm: Math.abs(y2Cm - y1Cm),
  }
}

export function formatCm(n: number, digits = 1): string {
  return Number(n).toFixed(digits)
}

export function formatRealBboxLine(real: RealCoordCm): string {
  return (
    `实际坐标(cm): 左下(${formatCm(real.x1Cm)}, ${formatCm(real.y1Cm)}) ` +
    `右上(${formatCm(real.x2Cm)}, ${formatCm(real.y2Cm)}) ` +
    `中心(${formatCm(real.centerXCm)}, ${formatCm(real.centerYCm)}) ` +
    `尺寸 ${formatCm(real.widthCm)}×${formatCm(real.heightCm)} cm`
  )
}

export function hasValidCoordTransform(ctx?: Partial<CoordTransformContext> | null): boolean {
  return !!(ctx?.scalePxPerMm && ctx.scalePxPerMm > 0 && ctx.imageHeight && ctx.imageHeight > 0)
}
