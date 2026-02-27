import request from '@/utils/request'
import type { DetectionRecord, DetectionResult, ReportGenerateRequest } from '@/types/detection'

export const detectionApi = {
  // 图片分析
  analyzeImage: (formData: FormData) => {
    return request.post<DetectionResult>('/detection/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      } as any
    })
  },

  // 获取检测记录列表
  getDetectionRecords: (params?: any) => {
    return request.get<{
      total: number
      page: number
      size: number
      records: DetectionRecord[]
    }>('/detection/records', { params } as any)
  },

  // 获取检测记录详情
  getDetectionRecordDetail: (id: number) => {
    return request.get<DetectionRecord>(`/detection/records/${id}`)
  },

  // 生成报告
  generateReport: (data: ReportGenerateRequest) => {
    return request.post<any>('/reports/generate', data)
  },

  // 核实损伤
  verifyDamage: (damageId: string) => {
    return request.post<void>(`/damages/${damageId}/verify`)
  }
}
