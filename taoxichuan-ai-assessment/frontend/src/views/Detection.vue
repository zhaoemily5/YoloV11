<template>
  <div class="detection-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h3>建筑损伤智能检测</h3>
          <p>基于AI视觉技术的建筑外立面砖块损伤自动识别与评估</p>
        </div>
      </template>

      <!-- 建筑选择 -->
      <div class="building-selector">
        <el-form :model="detectionForm" label-width="120px">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="选择建筑">
                <el-select 
                  v-model="detectionForm.buildingId" 
                  placeholder="请选择要检测的建筑"
                  style="width: 100%"
                  @change="handleBuildingChange"
                >
                  <el-option
                    v-for="building in buildingList"
                    :key="building.id"
                    :label="building.buildingName"
                    :value="building.id"
                  />
                </el-select>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="loadBuildings"
                  style="margin-top: 5px"
                >
                  刷新建筑列表
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="天气条件">
                <el-select v-model="detectionForm.weatherCondition" placeholder="请选择天气条件">
                  <el-option label="晴天" value="晴天" />
                  <el-option label="多云" value="多云" />
                  <el-option label="阴天" value="阴天" />
                  <el-option label="雨天" value="雨天" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="温度(°C)">
                <el-input-number 
                  v-model="detectionForm.temperature" 
                  :min="-20" 
                  :max="50" 
                  :precision="1"
                  placeholder="温度"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 图片上传区域 -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :file-list="fileList"
          :auto-upload="false"
          accept="image/jpeg,image/jpg,image/png"
          multiple
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">
              <p>将图片拖拽到此处，或<em>点击上传</em></p>
              <p class="upload-tip">支持 JPG、PNG 格式，单个文件不超过 10MB</p>
            </div>
          </div>
        </el-upload>

        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <el-progress :percentage="uploadProgress" :status="uploadStatus" />
          <p>正在上传并分析图片，请稍候...</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large" 
          :loading="analyzing"
          :disabled="!canStartDetection"
          @click="startDetection"
        >
          <el-icon><Camera /></el-icon>
          启动AI分析
        </el-button>
        <el-button size="large" @click="resetForm">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button 
          type="info" 
          size="small" 
          @click="debugStatus"
        >
          调试状态
        </el-button>
      </div>

      <!-- 检测结果 -->
      <div v-if="detectionResult" class="detection-result">
        <el-divider content-position="left">
          <h4>检测结果</h4>
        </el-divider>
        
        <el-row :gutter="24">
          <!-- 图片展示 -->
          <el-col :span="16">
            <div class="image-analysis">
              <h5>图片分析结果</h5>
              <div class="image-container">
                <img 
                  :src="getImageUrl(detectionResult.imagePaths?.[0])" 
                  alt="检测图片"
                  class="detection-image"
                  @error="handleImageError"
                  @load="handleImageLoad"
                  v-show="!imageError"
                />
                
                <!-- 图片加载状态 -->
                <div v-if="imageError" class="image-error-state">
                  <el-empty description="图片加载失败" />
                  <p class="error-hint">检测图片无法正常显示，标注已隐藏</p>
                </div>
                
                <!-- 损伤标记层 - 只有图片加载成功时才显示 -->
                <div v-if="imageLoaded && !imageError" class="damage-overlay">
                  <div
                    v-for="damage in validDamages"
                    :key="damage.id"
                    class="damage-marker"
                    :style="getDamageMarkerStyle(damage)"
                    :title="damage.damageType"
                    @click="showDamageDetail(damage)"
                  >
                    <span class="damage-label">{{ damage.damageType }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 损伤信息面板 -->
          <el-col :span="8">
            <div class="damage-panel">
              <h5>损伤信息统计</h5>
              
              <!-- 统计卡片 -->
              <div class="stats-cards">
                <div class="stat-card">
                  <div class="stat-number">{{ detectionResult.totalDamages || 0 }}</div>
                  <div class="stat-label">发现损伤点</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ detectionResult.damages?.length || 0 }}</div>
                  <div class="stat-label">分析完成</div>
                </div>
              </div>

              <!-- 损伤列表 -->
              <div class="damage-list">
                <h6>损伤详情</h6>
                <el-scrollbar height="300px">
                  <div
                    v-for="damage in validDamages"
                    :key="damage.id"
                    class="damage-item"
                    @click="showDamageDetail(damage)"
                  >
                    <div class="damage-header">
                      <span class="damage-type">{{ damage.damageType || '未知损伤' }}</span>
                      <span class="damage-severity" :class="(damage.severityLevel || '轻度').toLowerCase()">
                        {{ damage.severityLevel || '轻度' }}
                      </span>
                    </div>
                    <div class="damage-info">
                      <p>置信度: {{ damage.confidenceScore ? (damage.confidenceScore * 100).toFixed(1) : '0.0' }}%</p>
                      <p>紧急程度: {{ damage.urgencyLevel || '低' }}</p>
                      <p>描述: {{ damage.description || '暂无描述' }}</p>
                    </div>
                  </div>
                  
                  <!-- 空状态 -->
                  <div v-if="validDamages.length === 0" class="empty-state">
                    <el-empty description="未检测到明显损伤或数据不完整" />
                  </div>
                </el-scrollbar>
              </div>

              <!-- 操作按钮 -->
              <div class="result-actions">
                <el-button type="success" @click="generateReport" :disabled="!detectionResult.damages || detectionResult.damages.length === 0">
                  <el-icon><Document /></el-icon>
                  生成报告
                </el-button>
                <el-button @click="exportResults">
                  <el-icon><Download /></el-icon>
                  导出结果
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 损伤详情对话框 -->
    <el-dialog
      v-model="damageDialogVisible"
      title="损伤详细信息"
      width="600px"
    >
      <div v-if="selectedDamage" class="damage-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="损伤类型">
            {{ selectedDamage.damageType }}
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityTagType(selectedDamage.severityLevel)">
              {{ selectedDamage.severityLevel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            {{ (selectedDamage.confidenceScore * 100).toFixed(1) }}%
          </el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            <el-tag :type="getUrgencyTagType(selectedDamage?.urgencyLevel || '')">
              {{ selectedDamage.urgencyLevel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置描述" :span="2">
            坐标: ({{ selectedDamage.bboxX }}, {{ selectedDamage.bboxY }})
          </el-descriptions-item>
          <el-descriptions-item label="边界框尺寸">
            {{ selectedDamage.bboxWidth }} × {{ selectedDamage.bboxHeight }} px
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            {{ (selectedDamage.confidenceScore * 100).toFixed(1) }}%
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedDamage.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="damageDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="verifyDamage">
          核实损伤
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Camera, Refresh, Document, Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { buildingApi } from '@/api/building'
import { detectionApi } from '@/api/detection'
import type { Building, DetectionForm, DetectionResult, DamageInfo } from '@/types/detection'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const buildingList = ref<Building[]>([])
const fileList = ref<any[]>([])
const uploading = ref(false)
const analyzing = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const detectionResult = ref<DetectionResult | null>(null)
const selectedDamage = ref<DamageInfo | null>(null)
const damageDialogVisible = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)
const uploadRef = ref()

// 表单数据
const detectionForm = ref<DetectionForm>({
  buildingId: undefined,
  weatherCondition: '',
  temperature: undefined,
  humidity: undefined
})

// 计算属性
const canStartDetection = computed(() => {
  const buildingSelected = !!detectionForm.value.buildingId
  const hasFiles = fileList.value.length > 0
  const notAnalyzing = !analyzing.value
  
  console.log('【调试】按钮启用条件检查:')
  console.log('  - 建筑已选择:', buildingSelected, 'buildingId:', detectionForm.value.buildingId)
  console.log('  - 有文件上传:', hasFiles, '文件数量:', fileList.value.length)
  console.log('  - 未在分析中:', notAnalyzing, 'analyzing:', analyzing.value)
  console.log('  - 最终结果:', buildingSelected && hasFiles && notAnalyzing)
  
  return buildingSelected && hasFiles && notAnalyzing
})

// 过滤有效的损伤数据
const validDamages = computed(() => {
  if (!detectionResult.value?.damages) return []
  
  return detectionResult.value.damages.filter(damage => {
    return damage && 
           damage.id && 
           damage.damageType && 
           damage.severityLevel && 
           damage.confidenceScore !== undefined &&
           damage.urgencyLevel &&
           damage.description
  })
})

// 生命周期
onMounted(async () => {
  await loadBuildings()
})

// 方法
const loadBuildings = async () => {
  try {
    console.log('【调试】开始加载建筑列表...')
    const buildings = await buildingApi.getBuildingList()
    console.log('【调试】建筑列表API返回:', buildings)
    console.log('【调试】返回数据类型:', typeof buildings)
    console.log('【调试】是否为数组:', Array.isArray(buildings))
    
    // 响应拦截器已经返回了data字段，所以buildings就是建筑数组
    buildingList.value = buildings || []
    console.log('【调试】建筑列表已加载:', buildingList.value.length, '条')
    console.log('【调试】建筑列表内容:', buildingList.value)
  } catch (error) {
    console.error('【调试】加载建筑列表失败:', error)
    ElMessage.error('加载建筑列表失败')
  }
}

const handleBuildingChange = (buildingId: number) => {
  const building = buildingList.value.find(b => b.id === buildingId)
  if (building) {
    // 可以根据建筑类型设置默认的天气条件等
    console.log('选择建筑:', building.buildingName)
  }
}

const beforeUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const startDetection = async () => {
  if (!detectionForm.value.buildingId) {
    ElMessage.warning('请选择要检测的建筑')
    return
  }

  if (fileList.value.length === 0) {
    ElMessage.warning('请上传要检测的图片')
    return
  }

  analyzing.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''

  try {
    // 创建FormData手动提交
    const formData = new FormData()
    
    // 添加文件
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i]
      console.log(`【调试】处理文件${i}:`, file.name, 'raw存在:', !!file.raw)
      
      // 获取原始文件对象
      if (file.raw) {
        formData.append('files', file.raw)
        console.log(`【调试】添加文件到FormData:`, file.raw.name, file.raw.size)
      } else if (file.uid && file.name) {
        // 如果没有raw，尝试从uploadRef获取
        const uploadFiles = uploadRef.value?.uploadFiles || []
        const originalFile = uploadFiles.find((f: any) => f.uid === file.uid)
        if (originalFile && originalFile.raw) {
          formData.append('files', originalFile.raw)
          console.log(`【调试】从uploadRef添加文件:`, originalFile.raw.name)
        } else {
          console.error(`【调试】无法找到文件原始数据:`, file.name)
        }
      }
    }
    
    // 添加其他参数
    formData.append('buildingId', detectionForm.value.buildingId.toString())
    if (detectionForm.value.weatherCondition) {
      formData.append('weatherCondition', detectionForm.value.weatherCondition)
    }
    if (detectionForm.value.temperature) {
      formData.append('temperature', detectionForm.value.temperature.toString())
    }
    if (detectionForm.value.humidity) {
      formData.append('humidity', detectionForm.value.humidity.toString())
    }

    const filesCount = formData.getAll('files').length
    console.log('【调试】FormData准备完成，文件数量:', filesCount)
    
    if (filesCount === 0) {
      throw new Error('没有有效的文件数据')
    }

    // 模拟进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10
      }
    }, 500)
    
    // 使用fetch发送请求
    const response = await fetch('/api/detection/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    })
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('【调试】服务器响应错误:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('【调试】AI分析响应:', result)
    
    handleUploadSuccess(result)
    
  } catch (error: any) {
    console.error('【调试】AI分析失败:', error)
    analyzing.value = false
    uploadStatus.value = 'exception'
    ElMessage.error('检测失败：' + (error.message || '请重试'))
  }
}

const debugStatus = () => {
  console.log('【调试】当前状态:')
  console.log('  - buildingList长度:', buildingList.value.length)
  console.log('  - detectionForm:', detectionForm.value)
  console.log('  - fileList长度:', fileList.value.length)
  console.log('  - analyzing:', analyzing.value)
  console.log('  - canStartDetection:', canStartDetection.value)
  console.log('  - authStore.token:', !!authStore.token)
  
  ElMessage.info(`调试信息已输出到控制台`)
}

const handleFileChange = (file: any, newFileList: any[]) => {
  console.log('【调试】文件变化:', file.name, '总文件数:', newFileList.length)
  console.log('【调试】文件对象:', file)
  console.log('【调试】file.raw存在:', !!file.raw)
  
  // 更新文件列表
  fileList.value = newFileList
  console.log('【调试】fileList.value更新后:', fileList.value.length)
  
  // 检查每个文件的raw属性
  fileList.value.forEach((f: any, index: number) => {
    console.log(`【调试】文件${index}:`, f.name, 'raw存在:', !!f.raw, 'size:', f.size)
  })
}

const handleUploadSuccess = (response: any) => {
  analyzing.value = false
  uploadProgress.value = 100
  uploadStatus.value = 'success'
  
  console.log('【调试】AI分析响应完整数据:', response)
  
  if (response.code === 200) {
    detectionResult.value = response.data
    console.log('【调试】设置检测结果:', detectionResult.value)
    console.log('【调试】原始损伤数量:', detectionResult.value?.damages?.length)
    console.log('【调试】有效损伤数量:', validDamages.value?.length)
    console.log('【调试】图片路径:', detectionResult.value?.imagePaths)
    
    // 验证数据完整性
    if (!detectionResult.value?.damages || detectionResult.value.damages.length === 0) {
      ElMessage.warning('AI分析完成，但未检测到明显损伤')
    } else {
      const validCount = validDamages.value?.length || 0
      const totalCount = detectionResult.value.damages.length
      if (validCount < totalCount) {
        ElMessage.warning(`AI分析完成！发现${totalCount}处损伤，其中${validCount}处数据完整`)
      } else {
        ElMessage.success(`AI分析完成！发现${validCount}处损伤`)
      }
    }
  } else {
    ElMessage.error(response.message || '分析失败')
  }
}

const resetForm = () => {
  detectionForm.value = {
    buildingId: undefined,
    weatherCondition: '',
    temperature: undefined,
    humidity: undefined
  }
  fileList.value = []
  detectionResult.value = null
  selectedDamage.value = null
  uploadProgress.value = 0
  uploadStatus.value = ''
}

const getDamageMarkerStyle = (damage: DamageInfo) => {
  const bbox = damage.bboxArray || [damage.bboxX || 0, damage.bboxY || 0, damage.bboxWidth || 0, damage.bboxHeight || 0]
  return {
    left: `${bbox[0]}px`,
    top: `${bbox[1]}px`,
    width: `${bbox[2]}px`,
    height: `${bbox[3]}px`,
    borderColor: getDamageColor(damage.damageType || '')
  }
}

const getDamageColor = (damageType: string) => {
  const colorMap: Record<string, string> = {
    '风化严重': '#ff6b6b',
    '裂缝扩展': '#4ecdc4',
    '泛碱现象': '#45b7d1',
    '砖块脱落': '#f7b731',
    '表面污染': '#5f27cd',
    '结构变形': '#ee5a24'
  }
  return colorMap[damageType] || '#ff6b6b'
}

const showDamageDetail = (damage: DamageInfo) => {
  selectedDamage.value = damage
  damageDialogVisible.value = true
}

const getSeverityTagType = (severity: string) => {
  const typeMap: Record<string, string> = {
    '轻度': 'success',
    '中度': 'warning',
    '重度': 'danger',
    '严重': 'danger'
  }
  return typeMap[severity] || 'info'
}

const getUrgencyTagType = (urgency: string) => {
  const typeMap: Record<string, string> = {
    '低': 'info',
    '中': 'warning',
    '高': 'danger',
    '紧急': 'danger'
  }
  return typeMap[urgency] || 'info'
}

const generateReport = async () => {
  if (!detectionResult.value) return

  try {
    await ElMessageBox.confirm('确定要生成评估报告吗？', '确认', {
      type: 'warning'
    })

    await detectionApi.generateReport({
      recordId: parseInt(detectionResult.value.recordId),
      reportType: 'STANDARD',
      reportTitle: `${selectedBuilding}损伤评估报告`
    })

    ElMessage.success('报告生成成功!')
    router.push('/reports')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('报告生成失败')
    }
  }
}

const exportResults = () => {
  if (!detectionResult.value) return

  // 导出检测数据为JSON文件
  const dataStr = JSON.stringify(detectionResult.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `detection_result_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const verifyDamage = async () => {
  if (!selectedDamage.value) return

  try {
    await detectionApi.verifyDamage(selectedDamage.value.id)
    ElMessage.success('损伤核实成功!')
    damageDialogVisible.value = false
  } catch (error) {
    ElMessage.error('损伤核实失败')
  }
}

const selectedBuilding = computed(() => {
  const building = buildingList.value.find(b => b.id === detectionForm.value.buildingId)
  return building ? building.buildingName : ''
})

// 图片处理方法
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) {
    return '/placeholder.svg'
  }
  
  // 如果是完整URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // 如果是相对路径，构建完整URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendUrl = baseUrl.startsWith('http') ? baseUrl : `http://localhost:8080${baseUrl}`
  return `${backendUrl}${imagePath}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('【调试】图片加载失败:', img.src)
  imageError.value = true
  imageLoaded.value = false
  // 设置默认图片
  img.src = '/placeholder.svg'
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('【调试】图片加载成功:', img.src)
  imageLoaded.value = true
  imageError.value = false
}
</script>

<style lang="scss" scoped>
.detection-container {
  padding: 20px;
}

.page-card {
  .card-header {
    h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 20px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #7f8c8d;
      font-size: 14px;
    }
  }
}

.building-selector {
  margin-bottom: 30px;
}

.upload-section {
  margin-bottom: 30px;
  
  .upload-dragger {
    width: 100%;
    
    .upload-content {
      text-align: center;
      padding: 40px 0;
      
      .upload-icon {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }
      
      .upload-text {
        p {
          margin: 8px 0;
          
          em {
            color: #409eff;
            font-style: normal;
          }
        }
        
        .upload-tip {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
  
  .upload-progress {
    margin-top: 20px;
    text-align: center;
    
    p {
      margin-top: 10px;
      color: #666;
    }
  }
}

.action-buttons {
  text-align: center;
  margin-bottom: 30px;
  
  .el-button {
    margin: 0 10px;
  }
}

.detection-result {
  .image-analysis {
    h5 {
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .image-container {
      position: relative;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: visible; // 改为visible，避免标签被截断
      min-height: 400px;
      background: #f5f5f5;
      
      .detection-image {
        width: 100%;
        height: auto;
        display: block;
        max-height: 500px;
        object-fit: contain;
      }
      
      .image-error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        background: #fafafa;
        
        .error-hint {
          margin-top: 10px;
          color: #666;
          font-size: 14px;
        }
      }
      
      .damage-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        
        .damage-marker {
          position: absolute;
          border: 2px solid;
          border-radius: 4px;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          }
          
          .damage-label {
            position: absolute;
            top: -30px; // 增加距离，避免被截断
            left: 50%;
            transform: translateX(-50%); // 居中显示
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px; // 增加padding
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10; // 确保在最上层
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }
  
  .damage-panel {
    h5 {
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .stats-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
      
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
    
    .damage-list {
      .empty-state {
        padding: 20px;
        text-align: center;
      }
      
      .damage-item {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .damage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .damage-type {
            font-weight: bold;
            color: #2c3e50;
          }
          
          .damage-severity {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            
            &.轻度 {
              background: #e8f5e8;
              color: #4caf50;
            }
            
            &.中度 {
              background: #fff3cd;
              color: #ff9800;
            }
            
            &.重度 {
              background: #ffebee;
              color: #f44336;
            }
          }
        }
        
        .damage-info {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
          
          p {
            margin: 2px 0;
          }
        }
      }
    }
    
    .result-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      
      .el-button {
        flex: 1;
      }
    }
  }
}

.damage-detail {
  .el-descriptions {
    margin-bottom: 20px;
  }
}
</style>
