export interface Building {
  id: number
  buildingCode: string
  buildingName: string
  buildingType: string
  description?: string
  address?: string
  buildYear?: number
  area?: number
  height?: number
  structureType?: string
  status: number
  modelFilePath?: string
  imagePaths?: string
  imagePathList?: string[]
  createdTime: string
  updatedTime: string
}

export interface DetectionForm {
  buildingId?: number
  weatherCondition?: string
  temperature?: number
  humidity?: number
}

export interface DamageInfo {
  id: string
  damageType: string
  severityLevel: string
  urgencyLevel: string
  confidenceScore: number
  description: string
  bboxX: number
  bboxY: number
  bboxWidth: number
  bboxHeight: number
  bboxArray?: number[]
}

export interface DetectionResult {
  recordId: string
  buildingId: number
  analysisTime: string
  totalDamages: number
  damages: DamageInfo[]
  imagePaths: string[]
}

export interface DetectionRecord {
  id: number
  recordNo: string
  buildingId: number
  buildingName: string
  userId: number
  username: string
  detectionDate: string
  weatherCondition?: string
  temperature?: number
  humidity?: number
  imageCount: number
  totalDamageCount: number
  detectionStatus: string
  aiModelVersion?: string
  detectionDuration?: number
  building?: Building
  user?: any
}

export interface ReportGenerateRequest {
  recordId: number
  reportType: string
  reportTitle: string
}
