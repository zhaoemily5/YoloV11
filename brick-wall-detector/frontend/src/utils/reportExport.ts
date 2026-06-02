import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function escHtml(s: unknown): string {
  return String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
}

export function downloadBlob(content: string | Blob, filename: string, mime?: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 800)
}

export function exportTextFile(text: string, filename: string) {
  downloadBlob(text, filename, 'text/plain;charset=utf-8')
}

export function exportWordFromHtml(html: string, filename: string) {
  const doc = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"></head>
<body>${html}</body>
</html>`
  downloadBlob('\ufeff' + doc, filename, 'application/msword')
}

export async function exportPdfFromHtml(html: string, filename: string, title?: string) {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;left:-99999px;top:0;width:794px;padding:24px;background:#fff;font-family:"Microsoft YaHei",SimSun,sans-serif;font-size:13px;line-height:1.65;color:#333;'
  wrap.innerHTML = `
    <style>
      h1 { color:#003a66; font-size:20px; margin:0 0 8px; }
      h2 { color:#0070c0; font-size:16px; border-bottom:2px solid #0070c0; padding-bottom:4px; margin:18px 0 10px; }
      table { border-collapse:collapse; width:100%; margin:8px 0; }
      td, th { border:1px solid #bbb; padding:6px 10px; font-size:12px; }
      th { background:#e6f2fb; }
      .meta { color:#666; font-size:12px; margin-bottom:12px; }
      pre { white-space:pre-wrap; font-family:Consolas,monospace; font-size:11px; background:#f5f7fa; padding:10px; border:1px solid #e4e7ed; }
    </style>
    ${title ? `<h1>${escHtml(title)}</h1>` : ''}
    ${html}
  `
  document.body.appendChild(wrap)
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, logging: false })
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 10
    const imgW = pageW - margin * 2
    const imgH = (canvas.height * imgW) / canvas.width
    let heightLeft = imgH
    let position = margin
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', margin, position, imgW, imgH)
    heightLeft -= pageH - margin * 2
    while (heightLeft > 0) {
      position = heightLeft - imgH + margin
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position, imgW, imgH)
      heightLeft -= pageH - margin * 2
    }
    pdf.save(filename)
  } finally {
    document.body.removeChild(wrap)
  }
}

export function reportFilename(prefix: string, ext: string) {
  const stamp = new Date().toISOString().slice(0, 10)
  return `${prefix}_${stamp}.${ext}`
}
