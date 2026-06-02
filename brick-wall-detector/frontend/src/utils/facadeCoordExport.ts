import {
  type CoordTransformContext,
  formatRealBboxLine,
  hasValidCoordTransform,
  pixelBboxToRealCm,
} from './facadeCoordTransform'

export interface FacadeCoordMeta {
  projectName?: string
  wallName?: string
  wallWidthM?: number
  wallHeightM?: number
  gridSizeM?: number
  jobId?: string
  finishedAt?: string
  scalePxPerMm?: number
  imageWidth?: number
  imageHeight?: number
}

function bboxCorners(bbox: number[] | undefined) {
  if (!bbox || bbox.length < 4) return { x1: 0, y1: 0, x2: 0, y2: 0 }
  const x1 = bbox[0] || 0
  const y1 = bbox[1] || 0
  const w = bbox[2] || 0
  const h = bbox[3] || 0
  return { x1, y1, x2: x1 + w, y2: y1 + h }
}

function coordTransformFromMeta(meta: FacadeCoordMeta): CoordTransformContext | null {
  if (!hasValidCoordTransform(meta)) return null
  return {
    scalePxPerMm: meta.scalePxPerMm!,
    imageHeight: meta.imageHeight!,
  }
}

/** 客户端生成坐标 TXT（与后端 export-coords 格式基本一致） */
export function buildFacadeCoordText(
  detections: any[],
  grids: any[] = [],
  summary: Record<string, any> = {},
  meta: FacadeCoordMeta = {}
): string {
  const diseaseNames = ['风化', '泛碱', '裂缝', '植物附着', '缺损']
  const transform = coordTransformFromMeta(meta)
  const lines: string[] = [
    '========================================',
    '  红砖墙病害检测坐标文件 - 立面普查模式',
    '========================================',
    '',
    `项目名称: ${meta.projectName || '立面普查'}`,
    `墙面名称: ${meta.wallName || '矮墙立面'}`,
    `墙面尺寸: ${meta.wallWidthM || 0} m × ${meta.wallHeightM || 0} m`,
    `网格尺寸: ${meta.gridSizeM || 1} m`,
    `检测时间: ${meta.finishedAt || new Date().toISOString()}`,
    `病害总数: ${detections.length} 处`,
  ]

  if (transform) {
    lines.push(
      `比例尺: ${meta.scalePxPerMm!.toFixed(4)} px/mm`,
      `图像尺寸: ${meta.imageWidth} × ${meta.imageHeight} px`,
      '坐标说明: 实际坐标单位为 cm；墙面坐标系原点在图像左下角，x 向右、y 向上',
      '换算公式: 实际(cm) = 像素 / 比例尺(px/mm) / 10'
    )
  } else {
    lines.push('比例尺: 未标定（仅输出像素坐标，无法换算实际坐标）')
  }

  lines.push(
    '',
    '----------------------------------------',
    '  一、全局病害坐标',
    '----------------------------------------'
  )

  const byClass: Record<string, any[]> = {}
  diseaseNames.forEach(n => { byClass[n] = [] })
  detections.forEach(d => {
    if (byClass[d.class]) byClass[d.class].push(d)
  })

  let globalId = 1
  diseaseNames.forEach(disease => {
    const items = byClass[disease] || []
    if (!items.length) return
    lines.push('')
    lines.push(`【${disease}】共 ${items.length} 处`)
    items.forEach(det => {
      const { x1, y1, x2, y2 } = bboxCorners(det.globalBbox || det.bbox)
      let coordPart = ` | 像素: 左上(${Math.round(x1)}, ${Math.round(y1)}) 右下(${Math.round(x2)}, ${Math.round(y2)})`
      if (transform) {
        const real = pixelBboxToRealCm(x1, y1, x2, y2, transform)
        coordPart = ` | ${formatRealBboxLine(real)} | 像素: 左上(${Math.round(x1)}, ${Math.round(y1)}) 右下(${Math.round(x2)}, ${Math.round(y2)})`
      }
      lines.push(
        `  ${String(globalId).padStart(3, '0')} | ${disease} | 置信度: ${((det.confidence || 0) * 100).toFixed(1)}% | 严重程度: ${det.severity || '轻度'}` +
        coordPart +
        ` | 网格: ${det.gridId || det.tileId || 'N/A'}`
      )
      globalId++
    })
  })

  if (grids.length) {
    lines.push('')
    lines.push('----------------------------------------')
    lines.push('  二、网格病害统计')
    lines.push('----------------------------------------')
    lines.push('')
    lines.push('  网格ID  |  行  |  列  |  病害数  |  面积(m²)  |  裂缝(m)  |  风险强度')
    lines.push('  ' + '-'.repeat(70))
    grids.forEach(grid => {
      const intensity = grid.intensity || 0
      let riskLevel = '低'
      if (intensity >= 0.8) riskLevel = '极高'
      else if (intensity >= 0.6) riskLevel = '高'
      else if (intensity >= 0.4) riskLevel = '中'
      else if (intensity >= 0.2) riskLevel = '较低'
      lines.push(
        `  ${String(grid.gridId || '').padEnd(8)} | ${String((grid.row ?? 0) + 1).padStart(2)} | ${String((grid.col ?? 0) + 1).padStart(2)} | ${String(grid.totalCount || 0).padStart(4)} | ${String((grid.totalAreaM2 || 0).toFixed(3)).padStart(8)} | ${String((grid.crackLengthM || 0).toFixed(3)).padStart(7)} | ${riskLevel}(${(intensity * 100).toFixed(0)}%)`
      )
    })
  }

  lines.push('')
  lines.push('----------------------------------------')
  lines.push('  三、病害分类汇总')
  lines.push('----------------------------------------')
  diseaseNames.forEach(disease => {
    const stat = summary[disease] || summary.diseaseStats?.[disease]
    const count = typeof stat === 'number' ? stat : stat?.count
    if (!count) return
    const totalArea = typeof stat === 'object' ? stat.totalArea : 0
    const maxSev = typeof stat === 'object' ? stat.maxSeverity : '轻度'
    lines.push(`  【${disease}】: ${count} 处${totalArea > 0 ? `, 面积 ${Number(totalArea).toFixed(3)} m²` : ''}, 最高严重程度: ${maxSev || '轻度'}`)
  })

  lines.push('')
  lines.push('========================================')
  lines.push(`  文件生成时间: ${new Date().toLocaleString('zh-CN')}`)
  lines.push('  红砖墙病害智能检测系统 - 立面普查模式')
  lines.push('========================================')
  return lines.join('\n')
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function detectionTableRows(detections: any[], meta: FacadeCoordMeta = {}) {
  const transform = coordTransformFromMeta(meta)
  return detections.map((det, index) => {
    const { x1, y1, x2, y2 } = bboxCorners(det.globalBbox || det.bbox)
    const row: Record<string, unknown> = {
      index: index + 1,
      id: det.id || `${det.tileId || 'det'}-${index + 1}`,
      class: det.class,
      confidence: det.confidence,
      severity: det.severity || '轻度',
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
      gridId: det.gridId || '—',
      tileId: det.tileId || '—',
      areaM2: det.areaM2,
      hasRealCoord: !!transform,
    }
    if (transform) {
      const real = pixelBboxToRealCm(x1, y1, x2, y2, transform)
      row.centerXCm = Number(real.centerXCm.toFixed(1))
      row.centerYCm = Number(real.centerYCm.toFixed(1))
      row.x1Cm = Number(real.x1Cm.toFixed(1))
      row.y1Cm = Number(real.y1Cm.toFixed(1))
      row.x2Cm = Number(real.x2Cm.toFixed(1))
      row.y2Cm = Number(real.y2Cm.toFixed(1))
    }
    return row
  })
}
