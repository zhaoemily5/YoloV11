/**
 * 墙面坐标系（实际尺寸，单位 m）
 * - 原点：图片左下角 (0, 0)
 * - X 轴：向右为正
 * - Y 轴：向上为正
 *
 * 检测框 bbox 来自图像像素坐标（原点左上，y 向下），需经比例尺换算并翻转 y。
 */

export const WALL_COORD_SYSTEM_DESC =
  '墙面坐标系：原点在图片左下角 (0,0)，X 轴向右，Y 轴向上，单位 m'

export const PIXEL_COORD_SYSTEM_DESC =
  '图像像素坐标：原点在图片左上角，仅作对照参考'

export interface WallPointM {
  xM: number
  yM: number
}

export interface RealCoordM {
  /** 病害框左下角（墙面坐标 X,Y） */
  bottomLeft: WallPointM
  /** 病害框右上角（墙面坐标 X,Y） */
  topRight: WallPointM
  center: WallPointM
  widthM: number
  heightM: number
  /** 兼容字段 */
  x1M: number
  y1M: number
  x2M: number
  y2M: number
  centerXM: number
  centerYM: number
}

export interface CoordTransformContext {
  scalePxPerMm: number
  imageHeight: number
}

export function pxToM(px: number, scalePxPerMm: number): number {
  if (!scalePxPerMm || scalePxPerMm <= 0 || !Number.isFinite(px)) return 0
  return px / scalePxPerMm / 1000
}

/** 图像像素点 → 墙面坐标 (m) */
export function pixelPointToWallM(
  px: number,
  py: number,
  ctx: CoordTransformContext
): WallPointM {
  return {
    xM: pxToM(px, ctx.scalePxPerMm),
    yM: pxToM(ctx.imageHeight - py, ctx.scalePxPerMm),
  }
}

/** 像素 bbox [x1,y1,x2,y2]（图像左上原点）→ 墙面 bbox（左下原点，m） */
export function pixelBboxToRealM(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ctx: CoordTransformContext
): RealCoordM {
  const bottomLeft = pixelPointToWallM(x1, y2, ctx)
  const topRight = pixelPointToWallM(x2, y1, ctx)
  const center = pixelPointToWallM((x1 + x2) / 2, (y1 + y2) / 2, ctx)
  return {
    bottomLeft,
    topRight,
    center,
    widthM: Math.abs(topRight.xM - bottomLeft.xM),
    heightM: Math.abs(topRight.yM - bottomLeft.yM),
    x1M: bottomLeft.xM,
    y1M: bottomLeft.yM,
    x2M: topRight.xM,
    y2M: topRight.yM,
    centerXM: center.xM,
    centerYM: center.yM,
  }
}

export function formatM(n: number, digits = 3): string {
  return Number(n).toFixed(digits)
}

export function formatWallPoint(p: WallPointM): string {
  return `X=${formatM(p.xM)}, Y=${formatM(p.yM)}`
}

export function formatRealBboxLine(real: RealCoordM): string {
  return (
    `墙面坐标(m): 左下角(${formatWallPoint(real.bottomLeft)}) ` +
    `右上角(${formatWallPoint(real.topRight)}) ` +
    `中心(${formatWallPoint(real.center)}) ` +
    `宽×高 ${formatM(real.widthM)}×${formatM(real.heightM)} m`
  )
}

export function formatCoordSystemHeaderLines(): string[] {
  return [
    WALL_COORD_SYSTEM_DESC,
    '换算: X(m)=像素x÷比例尺÷1000；Y(m)=(图像高度−像素y)÷比例尺÷1000',
    PIXEL_COORD_SYSTEM_DESC,
  ]
}

export function hasValidCoordTransform(ctx?: Partial<CoordTransformContext> | null): boolean {
  return !!(ctx?.scalePxPerMm && ctx.scalePxPerMm > 0 && ctx.imageHeight && ctx.imageHeight > 0)
}
