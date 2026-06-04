declare module '../vendor/heatmap.js' {
  export interface HeatmapDataPoint {
    x: number
    y: number
    value: number
  }

  export interface HeatmapData {
    max: number
    min?: number
    data: HeatmapDataPoint[]
  }

  export interface HeatmapConfiguration {
    container: HTMLElement
    width?: number
    height?: number
    radius?: number
    maxOpacity?: number
    minOpacity?: number
    blur?: number
    gradient?: Record<string, string>
  }

  export interface HeatmapInstance {
    setData(data: HeatmapData): void
    repaint(): void
    getDataURL(): string
  }

  const h337: {
    create(config: HeatmapConfiguration): HeatmapInstance
  }

  export default h337
}
