<template>
  <div id="facade-repair-report" class="report-wrap">
    <div class="report-glass">
      <div class="rpt-top">
        <div class="rpt-top-left">
          <span class="rpt-icon"><el-icon :size="20"><Document /></el-icon></span>
          <div>
            <h2 class="rpt-title">{{ report.title }}</h2>
            <p class="rpt-time">
              {{ report.projectName }} · {{ report.wallName }} · {{ fmtDate(report.generatedAt) }}
            </p>
          </div>
        </div>
        <el-dropdown trigger="click" @command="handleExport">
          <el-button type="primary" :loading="exporting">
            <el-icon><Download /></el-icon>&ensp;一键导出报告
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="txt">导出 TXT</el-dropdown-item>
              <el-dropdown-item command="word">导出 Word (.doc)</el-dropdown-item>
              <el-dropdown-item command="pdf">导出 PDF</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-divider />

      <div class="meta-row">
        <el-tag>墙面 {{ report.wallWidthM }} × {{ report.wallHeightM }} m</el-tag>
        <el-tag type="info">面积 {{ report.wallAreaM2 }} m²</el-tag>
        <el-tag type="info">网格 {{ report.gridSizeM }} m</el-tag>
        <el-tag v-if="report.scalePxPerMm" type="success">比例尺 {{ report.scalePxPerMm.toFixed(4) }} px/mm</el-tag>
      </div>

      <!-- 01 总体评估 -->
      <div class="rpt-section">
        <div class="section-head">
          <span class="sec-num">01</span>
          <h3>总体评估</h3>
        </div>
        <div class="assessment-grid">
          <div class="assess-card ac-blue">
            <div class="ac-icon"><el-icon :size="22"><Grid /></el-icon></div>
            <div class="ac-body">
              <div class="ac-val">{{ a.totalDetections }}<small> 处</small></div>
              <div class="ac-lbl">病害总数</div>
            </div>
          </div>
          <div class="assess-card ac-teal">
            <div class="ac-icon"><el-icon :size="22"><Histogram /></el-icon></div>
            <div class="ac-body">
              <div class="ac-val">{{ a.totalDamageAreaM2 }}<small> m²</small></div>
              <div class="ac-lbl">受损面积</div>
            </div>
          </div>
          <div class="assess-card ac-red">
            <div class="ac-icon"><el-icon :size="22"><Warning /></el-icon></div>
            <div class="ac-body">
              <div class="ac-val">{{ a.crackLengthM }}<small> m</small></div>
              <div class="ac-lbl">裂缝长度</div>
            </div>
          </div>
          <div class="assess-card ac-purple">
            <div class="ac-icon"><el-icon :size="22"><Location /></el-icon></div>
            <div class="ac-body">
              <div class="ac-val">{{ a.highRiskGridCount }}<small> 格</small></div>
              <div class="ac-lbl">高风险网格</div>
            </div>
          </div>
        </div>

        <div class="assess-card ac-orange ratio-card">
          <div class="ac-icon"><el-icon :size="22"><PieChart /></el-icon></div>
          <div class="ac-body">
            <div class="ac-val">{{ a.damageRatio }}<small> %</small></div>
            <div class="ac-lbl">墙面损伤占比（实测统计）</div>
          </div>
        </div>

        <div class="risk-banner" :class="riskClass">
          <div class="risk-left">
            <span class="risk-label">综合风险等级</span>
            <span class="risk-val">{{ a.overallRisk }}</span>
          </div>
          <div class="risk-rec">{{ a.recommendation }}</div>
        </div>

        <div v-if="report.professionalNote" class="professional-note">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ report.professionalNote }}</span>
        </div>
      </div>

      <!-- 02 病害详情 -->
      <div class="rpt-section">
        <div class="section-head">
          <span class="sec-num">02</span>
          <h3>五类病害详情与修缮方案</h3>
        </div>
        <div
          v-for="(d, idx) in report.diseaseDetails"
          :key="d.name"
          class="dd-card"
          :class="{ detected: d.detected }"
        >
          <div class="dd-top" :style="{ borderLeftColor: d.color }">
            <span class="dd-idx" :style="{ background: d.color }">{{ idx + 1 }}</span>
            <span class="dd-name">{{ d.name }}</span>
            <el-tag v-if="!d.detected" type="info" size="small" effect="dark" round>未检出</el-tag>
            <span v-else class="dd-stat">
              {{ d.count }} 处
              <template v-if="d.totalArea"> · {{ d.totalArea }} m²</template>
              <template v-if="d.maxSeverity && d.maxSeverity !== '—'"> · 最高 {{ d.maxSeverity }}</template>
            </span>
          </div>
          <div v-if="d.detected" class="dd-body">
            <div class="dd-field">
              <span class="dd-fl">病害描述</span>
              <span class="dd-fv">{{ d.description }}</span>
            </div>
            <div class="dd-field">
              <span class="dd-fl">修缮方法</span>
              <div class="dd-fv">
                <div v-for="(s, i) in d.repairMethod || []" :key="i" class="repair-step">
                  <span class="rs-num">{{ i + 1 }}</span>
                  <span>{{ s }}</span>
                </div>
              </div>
            </div>
            <div class="dd-field">
              <span class="dd-fl">修缮材料</span>
              <span class="dd-fv">{{ d.materials }}</span>
            </div>
            <div class="dd-field">
              <span class="dd-fl">预防措施</span>
              <span class="dd-fv">{{ d.preventionMeasures }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 03 重点网格 -->
      <div v-if="report.topGrids?.length" class="rpt-section">
        <div class="section-head">
          <span class="sec-num">03</span>
          <h3>重点修缮网格</h3>
        </div>
        <el-table :data="report.topGrids" stripe size="small" border>
          <el-table-column prop="gridId" label="网格" width="100" />
          <el-table-column prop="totalCount" label="病害数" width="90" align="center" />
          <el-table-column prop="totalAreaM2" label="面积(m²)" width="110" align="right" />
          <el-table-column prop="crackLengthM" label="裂缝(m)" width="100" align="right" />
          <el-table-column label="风险强度" min-width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="Math.round((row.intensity || 0) * 100)"
                :stroke-width="10"
                :color="gridIntensityColor(row.intensity)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 04 修缮建议 -->
      <div class="rpt-section">
        <div class="section-head">
          <span class="sec-num">04</span>
          <h3>修缮优先级建议</h3>
        </div>
        <ul v-if="repairSuggestions.length" class="repair-list">
          <li v-for="it in repairSuggestions" :key="it.text">
            <el-tag :type="it.type" size="small" effect="dark">{{ it.level }}</el-tag>
            {{ it.text }}
          </li>
        </ul>
        <div v-else class="no-repair">暂无需要优先处理的修缮项</div>
      </div>

      <div class="rpt-bottom">
        <div class="rb-item"><span class="rb-label">检测模式</span><span>立面普查 · 整墙切片</span></div>
        <div class="rb-item"><span class="rb-label">检测模型</span><span>YOLOv11-BrickWall</span></div>
        <div class="rb-item"><span class="rb-label">报告时间</span><span>{{ fmtDate(report.generatedAt) }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document, Download, ArrowDown, Grid, Histogram, Warning, Location, PieChart, InfoFilled,
} from '@element-plus/icons-vue'
import { exportFacadeWallReport } from '../utils/facadeWallReportExport'

const props = defineProps<{ report: any }>()
const exporting = ref(false)

const a = computed(() => props.report.overallAssessment || {})

const riskClass = computed(() => {
  const r = a.value.overallRisk
  return r === '高风险' ? 'risk-high' : r === '中风险' ? 'risk-mid' : 'risk-low'
})

const repairSuggestions = computed(() => {
  const rp = props.report.repairPlan || {}
  const items: { level: string; type: 'danger' | 'warning' | 'success'; text: string }[] = []
  ;(rp.urgentItems || []).forEach((it: any) => {
    items.push({ level: '紧急', type: 'danger', text: `${it.name} — ${it.count} 处，建议立即修缮` })
  })
  ;(rp.importantItems || []).forEach((it: any) => {
    items.push({ level: '重要', type: 'warning', text: `${it.name} — ${it.count} 处，尽快安排修缮` })
  })
  ;(rp.routineItems || []).forEach((it: any) => {
    items.push({ level: '常规', type: 'success', text: `${it.name} — ${it.count} 处，纳入日常维护` })
  })
  ;(rp.priorityGrids || []).forEach((g: any) => {
    items.push({
      level: '网格',
      type: 'warning',
      text: `优先处理网格 ${g.gridId}（病害 ${g.totalCount} 处，风险 ${Math.round((g.intensity || 0) * 100)}%）`,
    })
  })
  return items
})

function fmtDate(iso: string) { return iso ? new Date(iso).toLocaleString('zh-CN') : '-' }
function gridIntensityColor(v: number) {
  if (v >= 0.8) return '#dc2626'
  if (v >= 0.6) return '#d97706'
  if (v >= 0.4) return '#eab308'
  return '#16a34a'
}

async function handleExport(cmd: string) {
  exporting.value = true
  try {
    await exportFacadeWallReport(props.report, cmd as 'txt' | 'word' | 'pdf')
    ElMessage.success(`报告已导出为 ${cmd.toUpperCase()}`)
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.report-wrap { margin: 24px 0; }
.report-glass {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(0,112,192,.1);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,112,192,.08);
  padding: 28px;
}
.rpt-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.rpt-top-left { display: flex; align-items: center; gap: 14px; }
.rpt-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0070C0, #0080CB); color: #fff;
}
.rpt-title { font-size: 20px; font-weight: 700; color: #003a66; margin: 0; }
.rpt-time { font-size: 12px; color: #8899aa; margin-top: 2px; }
.meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.rpt-section { margin-bottom: 28px; }
.section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.sec-num {
  font-size: 13px; font-weight: 700; color: #0070C0; background: #e6f2fb;
  padding: 4px 10px; border-radius: 6px;
}
.section-head h3 { font-size: 17px; color: #003a66; margin: 0; font-weight: 600; }
.assessment-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.assess-card {
  border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;
  color: #fff;
}
.ac-blue { background: linear-gradient(135deg, #005a99, #0080CB); }
.ac-teal { background: linear-gradient(135deg, #0d9488, #14b8a6); }
.ac-red { background: linear-gradient(135deg, #dc2626, #f87171); }
.ac-purple { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.ac-orange { background: linear-gradient(135deg, #ea580c, #fb923c); }
.ratio-card { margin-bottom: 16px; }
.ac-icon {
  width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ac-val { font-size: 22px; font-weight: 700; line-height: 1.2; }
.ac-val small { font-size: 12px; font-weight: 500; opacity: .85; }
.ac-lbl { font-size: 12px; opacity: .85; margin-top: 2px; }
.risk-banner {
  border-radius: 12px; padding: 16px 20px; display: flex; align-items: center;
  justify-content: space-between; gap: 20px; flex-wrap: wrap;
}
.risk-banner.risk-high { background: #fff5f5; border: 1px solid #fecaca; }
.risk-banner.risk-mid { background: #fffbeb; border: 1px solid #fde68a; }
.risk-banner.risk-low { background: #f0fdf4; border: 1px solid #bbf7d0; }
.risk-left { display: flex; align-items: center; gap: 12px; }
.risk-label { font-size: 13px; color: #888; }
.risk-val { font-size: 20px; font-weight: 700; }
.risk-high .risk-val { color: #dc2626; }
.risk-mid .risk-val { color: #d97706; }
.risk-low .risk-val { color: #16a34a; }
.risk-rec { font-size: 14px; color: #555; flex: 1; text-align: right; }
.professional-note {
  display: flex; align-items: center; gap: 8px; margin-top: 16px;
  padding: 12px 16px; background: #f0f9ff; border: 1px solid #bae6fd;
  border-radius: 8px; font-size: 13px; color: #0369a1;
}
.dd-card { border: 1px solid #d6ebf7; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
.dd-card.detected { border-color: #a8d0ec; }
.dd-top {
  display: flex; align-items: center; gap: 10px; padding: 14px 18px;
  background: linear-gradient(180deg, #f4faff, #eaf4fb); border-left: 4px solid #ccc; flex-wrap: wrap;
}
.dd-idx {
  width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 700;
}
.dd-name { font-size: 15px; font-weight: 700; color: #003a66; }
.dd-stat { font-size: 13px; color: #666; margin-left: auto; }
.dd-body { padding: 16px 18px; }
.dd-field { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; line-height: 1.7; }
.dd-fl { flex-shrink: 0; width: 72px; color: #8899aa; font-weight: 600; font-size: 12px; text-align: right; }
.dd-fv { color: #444; flex: 1; }
.repair-step { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
.rs-num {
  width: 20px; height: 20px; border-radius: 50%; background: #e6f2fb; color: #0070C0;
  font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.repair-list { padding-left: 0; list-style: none; margin: 0; }
.repair-list li { margin-bottom: 10px; font-size: 14px; color: #444; line-height: 1.7; display: flex; align-items: center; gap: 8px; }
.no-repair { color: #888; text-align: center; padding: 16px; }
.rpt-bottom {
  display: flex; justify-content: space-between; padding-top: 18px; margin-top: 8px;
  border-top: 1px solid #d6ebf7; flex-wrap: wrap; gap: 8px;
}
.rb-item { font-size: 13px; color: #8899aa; }
.rb-label { font-weight: 600; margin-right: 6px; }
.arrow-icon { margin-left: 4px; font-size: 12px; }
@media (max-width: 992px) {
  .assessment-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .report-glass { padding: 16px; }
  .assessment-grid { grid-template-columns: 1fr 1fr; }
  .risk-rec { text-align: left; }
}
</style>
