/**
 * 墙面坐标系（实际尺寸，单位 cm）
 * - 原点：图片左下角 (0, 0)
 * - X 轴：向右为正
 * - Y 轴：向上为正
 *
 * 检测框 bbox 来自图像像素坐标（原点左上，y 向下），需经比例尺换算并翻转 y。
 */

export const WALL_COORD_SYSTEM_DESC =
  '墙面坐标系：原点在图片左下角 (0,0)，X 轴向右，Y 轴向上，单位 cm'

export const PIXEL_COORD_SYSTEM_DESC =
  '图像像素坐标：原点在图片左上角，仅作对照参考'

export interface WallPointCm {
  xCm: number
  yCm: number
}

export interface RealCoordCm {
  /** 病害框左下角（墙面坐标 X,Y） */
  bottomLeft: WallPointCm
  /** 病害框右上角（墙面坐标 X,Y） */
  topRight: WallPointCm
  center: WallPointCm
  widthCm: number
  heightCm: number
  /** 兼容旧字段 */
  x1Cm: number
  y1Cm: number
  x2Cm: number
  y2Cm: number
  centerXCm: number
  centerYCm: number
}

export interface CoordTransformContext {
  scalePxPerMm: number
  imageHeight: number
}

export function pxToCm(px: number, scalePxPerMm: number): number {
  if (!scalePxPerMm || scalePxPerMm <= 0 || !Number.isFinite(px)) return 0
  return px / scalePxPerMm / 10
}

/** 图像像素点 → 墙面坐标 (cm) */
export function pixelPointToWallCm(
  px: number,
  py: number,
  ctx: CoordTransformContext
): WallPointCm {
  return {
    xCm: pxToCm(px, ctx.scalePxPerMm),
    yCm: pxToCm(ctx.imageHeight - py, ctx.scalePxPerMm),
  }
}

/** 像素 bbox [x1,y1,x2,y2]（图像左上原点）→ 墙面 bbox（左下原点，cm） */
export function pixelBboxToRealCm(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ctx: CoordTransformContext
): RealCoordCm {
  const bottomLeft = pixelPointToWallCm(x1, y2, ctx)
  const topRight = pixelPointToWallCm(x2, y1, ctx)
  const center = pixelPointToWallCm((x1 + x2) / 2, (y1 + y2) / 2, ctx)
  return {
    bottomLeft,
    topRight,
    center,
    widthCm: Math.abs(topRight.xCm - bottomLeft.xCm),
    heightCm: Math.abs(topRight.yCm - bottomLeft.yCm),
    x1Cm: bottomLeft.xCm,
    y1Cm: bottomLeft.yCm,
    x2Cm: topRight.xCm,
    y2Cm: topRight.yCm,
    centerXCm: center.xCm,
    centerYCm: center.yCm,
  }
}

export function formatCm(n: number, digits = 1): string {
  return Number(n).toFixed(digits)
}

export function formatWallPoint(p: WallPointCm): string {
  return `X=${formatCm(p.xCm)}, Y=${formatCm(p.yCm)}`
}

export function formatRealBboxLine(real: RealCoordCm): string {
  return (
    `墙面坐标(cm): 左下角(${formatWallPoint(real.bottomLeft)}) ` +
    `右上角(${formatWallPoint(real.topRight)}) ` +
    `中心(${formatWallPoint(real.center)}) ` +
    `宽×高 ${formatCm(real.widthCm)}×${formatCm(real.heightCm)} cm`
  )
}

export function formatCoordSystemHeaderLines(): string[] {
  return [
    WALL_COORD_SYSTEM_DESC,
    '换算: X(cm)=像素x÷比例尺÷10；Y(cm)=(图像高度−像素y)÷比例尺÷10',
    PIXEL_COORD_SYSTEM_DESC,
  ]
}

export function hasValidCoordTransform(ctx?: Partial<CoordTransformContext> | null): boolean {
  return !!(ctx?.scalePxPerMm && ctx.scalePxPerMm > 0 && ctx.imageHeight && ctx.imageHeight > 0)
}
