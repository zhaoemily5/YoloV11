import { formatRealBboxLine, hasValidCoordTransform, pixelBboxToRealCm } from './facadeCoordTransform'

export interface ProblemReportMeta {
  projectName?: string
  wallName?: string
  jobId?: string
  finishedAt?: string
  scalePxPerMm?: number
  imageWidth?: number
  imageHeight?: number
}

export interface ProblemReportInput {
  detections: any[]
  summary?: any
  grids?: any[]
  meta?: ProblemReportMeta
}

function formatDetectionBlock(det: any, index: number, meta?: ProblemReportMeta): string {
  const bbox = det.globalBbox || det.bbox || []
  const x1 = bbox[0] || 0
  const y1 = bbox[1] || 0
  const x2 = (bbox[0] || 0) + (bbox[2] || 0)
  const y2 = (bbox[1] || 0) + (bbox[3] || 0)
  const lines = [
    `[${index}] ${det.class || '未知'} · ${det.severity || '—'} · 置信度 ${((det.confidence || 0) * 100).toFixed(1)}%`,
  ]
  if (hasValidCoordTransform(meta)) {
    const real = pixelBboxToRealCm(x1, y1, x2, y2, {
      scalePxPerMm: meta!.scalePxPerMm!,
      imageHeight: meta!.imageHeight!,
    })
    lines.push(`  ${formatRealBboxLine(real)}`)
  }
  lines.push(`  像素坐标: (${Math.round(x1)}, ${Math.round(y1)}) → (${Math.round(x2)}, ${Math.round(y2)})`)
  if (det.areaM2 > 0) lines.push(`  受损面积: ${det.areaM2.toFixed(3)} m²`)
  if (det.lengthM > 0) lines.push(`  裂缝长度: ${det.lengthM.toFixed(3)} m`)
  if (det.gridId) lines.push(`  所属网格: ${det.gridId}`)
  if (det.tileId) lines.push(`  所在切片: ${det.tileId}`)
  return lines.join('\n')
}

export function buildProblemReportText(input: ProblemReportInput): string {
  const { detections, summary, meta } = input
  const lines: string[] = [
    '══════════════════════════════════════',
    '  立面普查 · 问题汇报',
    '══════════════════════════════════════',
    '',
    `项目: ${meta?.projectName || '—'}`,
    `墙面: ${meta?.wallName || '—'}`,
    `任务ID: ${meta?.jobId || '—'}`,
    `生成时间: ${meta?.finishedAt || new Date().toISOString()}`,
    '',
    `病害总数: ${detections.length} 处`,
  ]
  if (summary) {
    lines.push(`受损面积: ${summary.totalAreaM2 ?? 0} m²`)
    lines.push(`裂缝长度: ${summary.crackLengthM ?? 0} m`)
  }
  lines.push('', '──────────────────────────────────────', '  病害明细', '──────────────────────────────────────', '')
  detections.forEach((d, i) => {
    lines.push(formatDetectionBlock(d, i + 1, meta))
    lines.push('')
  })
  lines.push('══════════════════════════════════════')
  return lines.join('\n')
}

export function buildProblemReportMarkdown(input: ProblemReportInput): string {
  const { detections, summary, meta } = input
  const lines: string[] = [
    '# 立面普查 · 问题汇报',
    '',
    '| 字段 | 值 |',
    '|------|-----|',
    `| 项目 | ${meta?.projectName || '—'} |`,
    `| 墙面 | ${meta?.wallName || '—'} |`,
    `| 任务ID | ${meta?.jobId || '—'} |`,
    `| 生成时间 | ${meta?.finishedAt || new Date().toISOString()} |`,
    `| 病害总数 | ${detections.length} 处 |`,
  ]
  if (summary) {
    lines.push(`| 受损面积 | ${summary.totalAreaM2 ?? 0} m² |`)
    lines.push(`| 裂缝长度 | ${summary.crackLengthM ?? 0} m |`)
  }
  lines.push('', '## 病害明细', '')
  detections.forEach((d, i) => {
    lines.push(`### ${i + 1}. ${d.class || '未知'}（${d.severity || '—'}）`, '')
    lines.push('```text')
    lines.push(formatDetectionBlock(d, i + 1))
    lines.push('```', '')
  })
  return lines.join('\n')
}

export function buildProblemReportJson(input: ProblemReportInput): string {
  const { detections, summary, grids, meta } = input
  return JSON.stringify(
    {
      type: 'facade-problem-report',
      generatedAt: meta?.finishedAt || new Date().toISOString(),
      meta: meta || {},
      summary: summary || null,
      gridCount: grids?.length ?? 0,
      totalDetections: detections.length,
      detections: detections.map((d, index) => ({
        index: index + 1,
        class: d.class,
        severity: d.severity,
        confidence: d.confidence,
        globalBbox: d.globalBbox || d.bbox,
        areaM2: d.areaM2,
        lengthM: d.lengthM,
        gridId: d.gridId,
        tileId: d.tileId,
        id: d.id,
      })),
    },
    null,
    2
  )
}

export { downloadBlob } from './reportExport'

export function buildProblemReportHtml(input: ProblemReportInput): string {
  const { detections, summary, meta } = input
  const blocks = detections.map((d, i) => {
    const bbox = d.globalBbox || d.bbox || []
    const x1 = bbox[0] || 0
    const y1 = bbox[1] || 0
    const x2 = x1 + (bbox[2] || 0)
    const y2 = y1 + (bbox[3] || 0)
    let coordHtml = `像素: (${Math.round(x1)}, ${Math.round(y1)}) → (${Math.round(x2)}, ${Math.round(y2)})`
    if (hasValidCoordTransform(meta)) {
      const real = pixelBboxToRealCm(x1, y1, x2, y2, {
        scalePxPerMm: meta!.scalePxPerMm!,
        imageHeight: meta!.imageHeight!,
      })
      coordHtml = `实际(cm): 中心(${real.centerXCm.toFixed(1)}, ${real.centerYCm.toFixed(1)}) · ${coordHtml}`
    }
    return `<div style="margin-bottom:10px;padding:10px;border:1px solid #e4e7ed;border-radius:6px;">
      <b>${i + 1}. ${d.class || '未知'}</b> — ${d.severity || '—'} — 置信度 ${((d.confidence || 0) * 100).toFixed(1)}%<br/>
      ${coordHtml} · 面积 ${d.areaM2?.toFixed(3) || '—'} m²
      ${d.gridId ? `<br/>网格: ${d.gridId}` : ''}
    </div>`
  }).join('')
  return `
    <p class="meta">项目：${meta?.projectName || '—'}　墙面：${meta?.wallName || '—'}　病害 ${detections.length} 处</p>
    <table>
      <tr><th>受损面积</th><td>${summary?.totalAreaM2 ?? 0} m²</td>
          <th>裂缝长度</th><td>${summary?.crackLengthM ?? 0} m</td></tr>
    </table>
    <h2>病害明细</h2>
    ${blocks}
  `
}
