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
    `墙面尺寸: ${report.wallWidthM} m × ${report.wallHeightM} m`,
    `墙面面积: ${report.wallAreaM2 ?? '—'} m²`,
    `网格尺寸: ${report.gridSizeM ?? 1} m`,
    `生成时间: ${report.generatedAt || new Date().toISOString()}`,
    '',
    '【总体评估】',
    `  病害种类: ${a.totalDiseaseTypes ?? 0} 种`,
    `  病害总数: ${a.totalDetections ?? 0} 处`,
    `  受损面积: ${a.totalDamageAreaM2 ?? 0} m²`,
    `  裂缝长度: ${a.crackLengthM ?? 0} m`,
    `  高风险网格: ${a.highRiskGridCount ?? 0}`,
    `  损伤占比: ${a.damageRatio ?? 0}%`,
    `  综合风险: ${a.overallRisk ?? '—'}`,
    `  预估造价: ¥${a.totalEstimatedCost ?? 0}`,
    `  建议: ${a.recommendation || '—'}`,
    '',
    '【病害详情与修缮方案】',
  ]
  ;(report.diseaseDetails || []).forEach((d: any, i: number) => {
    lines.push('')
    lines.push(`${i + 1}. ${d.name}${d.detected ? ` — ${d.count} 处` : ' — 未检出'}`)
    if (!d.detected) return
    if (d.description) lines.push(`   描述: ${d.description}`)
    if (d.repairMethod?.length) {
      lines.push('   修缮方法:')
      d.repairMethod.forEach((m: string, j: number) => lines.push(`     ${j + 1}. ${m}`))
    }
    if (d.materials) lines.push(`   材料: ${d.materials}`)
    if (d.estimatedCost) lines.push(`   费用估算: ¥${d.estimatedCost}`)
  })
  lines.push('', '【重点修缮网格】')
  ;(report.topGrids || []).forEach((g: any, i: number) => {
    lines.push(`  ${i + 1}. ${g.gridId} — 病害 ${g.totalCount} 处, 面积 ${g.totalAreaM2} m², 风险 ${Math.round((g.intensity || 0) * 100)}%`)
  })
  const rp = report.repairPlan || {}
  if (rp.urgentItems?.length || rp.importantItems?.length) {
    lines.push('', '【修缮优先级】')
    ;(rp.urgentItems || []).forEach((it: any) => lines.push(`  [紧急] ${it.name} ${it.count} 处`))
    ;(rp.importantItems || []).forEach((it: any) => lines.push(`  [重要] ${it.name} ${it.count} 处`))
    ;(rp.routineItems || []).forEach((it: any) => lines.push(`  [常规] ${it.name} ${it.count} 处`))
  }
  lines.push('', '══════════════════════════════════════')
  return lines.join('\n')
}

export function buildFacadeWallReportHtml(report: any): string {
  const a = report.overallAssessment || {}
  const diseaseBlocks = (report.diseaseDetails || []).map((d: any, i: number) => {
    if (!d.detected) {
      return `<p><b>${i + 1}. ${escHtml(d.name)}</b> — 未检出</p>`
    }
    const steps = (d.repairMethod || []).map((s: string, j: number) => `<li>${escHtml(s)}</li>`).join('')
    return `<div style="margin-bottom:14px;padding:12px;border:1px solid #e4e7ed;border-radius:8px;">
      <h3 style="margin:0 0 8px;color:${d.color || '#003a66'}">${i + 1}. ${escHtml(d.name)} — ${d.count} 处 · ${d.totalArea || 0} m²</h3>
      <p>${escHtml(d.description || '')}</p>
      ${steps ? `<ol>${steps}</ol>` : ''}
      <p><b>材料：</b>${escHtml(d.materials || '—')} · <b>费用：</b>¥${d.estimatedCost || 0}</p>
    </div>`
  }).join('')
  const gridRows = (report.topGrids || [])
    .map((g: any) => `<tr><td>${escHtml(g.gridId)}</td><td>${g.totalCount}</td><td>${g.totalAreaM2}</td><td>${g.crackLengthM}</td><td>${Math.round((g.intensity || 0) * 100)}%</td></tr>`)
    .join('')

  return `
    <p class="meta">项目：${escHtml(report.projectName)}　墙面：${escHtml(report.wallName)}　面积：${report.wallAreaM2} m²　网格：${report.gridSizeM} m</p>
    <h2>总体评估</h2>
    <table>
      <tr><th>病害种类</th><td>${a.totalDiseaseTypes ?? 0}</td><th>病害总数</th><td>${a.totalDetections}</td></tr>
      <tr><th>受损面积</th><td>${a.totalDamageAreaM2} m²</td><th>裂缝长度</th><td>${a.crackLengthM} m</td></tr>
      <tr><th>高风险网格</th><td>${a.highRiskGridCount}</td><th>损伤占比</th><td>${a.damageRatio}%</td></tr>
      <tr><th>综合风险</th><td>${escHtml(a.overallRisk)}</td><th>预估造价</th><td>¥${a.totalEstimatedCost}</td></tr>
    </table>
    <p><b>修缮建议：</b>${escHtml(a.recommendation)}</p>
    ${report.professionalNote ? `<p style="color:#0369a1;">ℹ️ ${escHtml(report.professionalNote)}</p>` : ''}
    <h2>病害详情与修缮方案</h2>
    ${diseaseBlocks}
    <h2>重点修缮网格</h2>
    <table><tr><th>网格</th><th>病害数</th><th>面积(m²)</th><th>裂缝(m)</th><th>风险</th></tr>${gridRows}</table>
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
