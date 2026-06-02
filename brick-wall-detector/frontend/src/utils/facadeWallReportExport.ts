import { escHtml, exportPdfFromHtml, exportTextFile, exportWordFromHtml, reportFilename } from './reportExport'
import type { ProblemReportInput } from './facadeProblemReportExport'
import { buildProblemReportText, buildProblemReportHtml } from './facadeProblemReportExport'

export function buildFacadeWallReportText(report: any): string {
  if (!report) return ''
  const a = report.overallAssessment || {}
  const lines: string[] = [
    '══════════════════════════════════════',
    `  ${report.title || '整墙修缮报告'}`,
    '══════════════════════════════════════',
    '',
    `项目: ${report.projectName || '—'}`,
    `墙面: ${report.wallName || '—'}`,
    `墙面面积: ${report.wallAreaM2 ?? '—'} m²`,
    `生成时间: ${report.generatedAt || new Date().toISOString()}`,
    '',
    '【总体评估】',
    `  病害总数: ${a.totalDetections ?? 0} 处`,
    `  受损面积: ${a.totalDamageAreaM2 ?? 0} m²`,
    `  裂缝长度: ${a.crackLengthM ?? 0} m`,
    `  高风险网格: ${a.highRiskGridCount ?? 0}`,
    `  损伤占比: ${a.damageRatio ?? 0}%`,
    `  综合风险: ${a.overallRisk ?? '—'}`,
    `  预估造价: ¥${a.totalEstimatedCost ?? 0}`,
    `  建议: ${a.recommendation || '—'}`,
    '',
    '【病害分布】',
  ]
  ;(report.diseaseDetails || []).filter((d: any) => d.detected).forEach((d: any) => {
    lines.push(`  · ${d.name}: ${d.count} 处, ${d.totalArea ?? 0} m², 造价 ¥${d.estimatedCost ?? 0}`)
  })
  lines.push('', '【重点修缮网格】')
  ;(report.topGrids || []).forEach((g: any, i: number) => {
    lines.push(`  ${i + 1}. ${g.gridId} — 病害 ${g.totalCount} 处, 面积 ${g.totalAreaM2} m²`)
  })
  lines.push('', '══════════════════════════════════════')
  return lines.join('\n')
}

export function buildFacadeWallReportHtml(report: any): string {
  const a = report.overallAssessment || {}
  const diseaseRows = (report.diseaseDetails || [])
    .filter((d: any) => d.detected)
    .map((d: any) => `<tr><td>${escHtml(d.name)}</td><td>${d.count}</td><td>${d.totalArea}</td><td>¥${d.estimatedCost}</td></tr>`)
    .join('')
  const gridRows = (report.topGrids || [])
    .map((g: any) => `<tr><td>${escHtml(g.gridId)}</td><td>${g.totalCount}</td><td>${g.totalAreaM2}</td><td>${g.crackLengthM}</td></tr>`)
    .join('')

  return `
    <p class="meta">项目：${escHtml(report.projectName)}　墙面：${escHtml(report.wallName)}　面积：${report.wallAreaM2} m²</p>
    <h2>总体评估</h2>
    <table>
      <tr><th>病害总数</th><td>${a.totalDetections}</td><th>受损面积</th><td>${a.totalDamageAreaM2} m²</td></tr>
      <tr><th>裂缝长度</th><td>${a.crackLengthM} m</td><th>高风险网格</th><td>${a.highRiskGridCount}</td></tr>
      <tr><th>损伤占比</th><td>${a.damageRatio}%</td><th>综合风险</th><td>${escHtml(a.overallRisk)}</td></tr>
      <tr><th>预估造价</th><td colspan="3">¥${a.totalEstimatedCost}</td></tr>
    </table>
    <p><b>修缮建议：</b>${escHtml(a.recommendation)}</p>
    <h2>病害分布明细</h2>
    <table><tr><th>病害</th><th>数量</th><th>面积(m²)</th><th>造价</th></tr>${diseaseRows}</table>
    <h2>重点修缮网格</h2>
    <table><tr><th>网格</th><th>病害数</th><th>面积</th><th>裂缝(m)</th></tr>${gridRows}</table>
  `
}

export async function exportFacadeWallReport(report: any, format: 'txt' | 'word' | 'pdf') {
  const base = reportFilename('整墙修缮报告', format === 'word' ? 'doc' : format)
  if (format === 'txt') {
    exportTextFile(buildFacadeWallReportText(report), base.replace(/\.\w+$/, '.txt'))
    return
  }
  const html = buildFacadeWallReportHtml(report)
  if (format === 'word') {
    exportWordFromHtml(html, base.endsWith('.doc') ? base : base + '.doc')
    return
  }
  await exportPdfFromHtml(html, base.replace(/\.\w+$/, '.pdf'), report.title)
}

export async function exportProblemReportFormats(
  input: ProblemReportInput,
  format: 'txt' | 'word' | 'pdf'
) {
  const jobPart = input.meta?.jobId?.slice(0, 8) || 'local'
  const stamp = new Date().toISOString().slice(0, 10)
  const base = `问题汇报_${jobPart}_${stamp}`

  const text = buildProblemReportText(input)
  if (format === 'txt') {
    exportTextFile(text, `${base}.txt`)
    return
  }

  const html = buildProblemReportHtml(input)
  if (format === 'word') {
    exportWordFromHtml(html, `${base}.doc`)
    return
  }
  await exportPdfFromHtml(html, `${base}.pdf`, '立面普查 · 问题汇报')
}
