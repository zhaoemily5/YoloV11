# API接口文档

## 接口概述

本文档定义了陶溪川工业遗产AI智能损伤诊断评估系统的RESTful API接口规范。

### 基础信息

- **Base URL**: `http://localhost:8080/api`
- **API版本**: v1
- **认证方式**: JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-02-26T10:30:00Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "详细错误信息",
  "timestamp": "2024-02-26T10:30:00Z"
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 1. 认证管理

### 1.1 单点登录认证

**接口地址**: `POST /auth/sso`

**请求参数**:
```json
{
  "oaUserId": "OA-USER-123",
  "token": "sso-token-string",
  "timestamp": 1708926000
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "认证成功",
  "data": {
    "userId": 1,
    "username": "zhangsan",
    "realName": "张三",
    "department": "工程部",
    "role": "USER",
    "token": "jwt-token-string",
    "expiresIn": 3600
  }
}
```

### 1.2 用户登出

**接口地址**: `POST /auth/logout`

**请求头**: `Authorization: Bearer {token}`

**响应数据**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

### 1.3 刷新Token

**接口地址**: `POST /auth/refresh`

**请求头**: `Authorization: Bearer {token}`

**响应数据**:
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "new-jwt-token-string",
    "expiresIn": 3600
  }
}
```

## 2. 用户管理

### 2.1 获取用户信息

**接口地址**: `GET /users/profile`

**请求头**: `Authorization: Bearer {token}`

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "department": "工程部",
    "role": "USER",
    "lastLoginTime": "2024-02-26T10:00:00Z"
  }
}
```

### 2.2 获取用户列表

**接口地址**: `GET /users`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码 (默认: 1)
- `size`: 每页大小 (默认: 10)
- `department`: 部门筛选
- `role`: 角色筛选

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "username": "zhangsan",
        "realName": "张三",
        "department": "工程部",
        "role": "USER",
        "status": 1,
        "createdTime": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

## 3. 建筑管理

### 3.1 获取建筑列表

**接口地址**: `GET /buildings`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `buildingType`: 建筑类型筛选
- `status`: 状态筛选

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 6,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "buildingCode": "TXC-001",
        "buildingName": "1号厂房 - 原制瓷车间",
        "buildingType": "制瓷车间",
        "description": "陶溪川原制瓷车间",
        "buildYear": 1958,
        "area": 1200.50,
        "height": 15.2,
        "status": 1,
        "imagePaths": ["/images/building1_1.jpg", "/images/building1_2.jpg"]
      }
    ]
  }
}
```

### 3.2 获取建筑详情

**接口地址**: `GET /buildings/{id}`

**请求头**: `Authorization: Bearer {token}`

**路径参数**:
- `id`: 建筑ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "buildingCode": "TXC-001",
    "buildingName": "1号厂房 - 原制瓷车间",
    "buildingType": "制瓷车间",
    "description": "陶溪川原制瓷车间，主要用于陶瓷制作和加工",
    "address": "江西省景德镇市陶溪川文创街区",
    "buildYear": 1958,
    "area": 1200.50,
    "height": 15.2,
    "structureType": "砖混结构",
    "status": 1,
    "modelFilePath": "/models/building1.glb",
    "imagePaths": ["/images/building1_1.jpg", "/images/building1_2.jpg"],
    "createdTime": "2024-01-01T00:00:00Z",
    "updatedTime": "2024-02-26T10:00:00Z"
  }
}
```

### 3.3 创建建筑信息

**接口地址**: `POST /buildings`

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "buildingCode": "TXC-007",
  "buildingName": "7号厂房 - 新建车间",
  "buildingType": "制瓷车间",
  "description": "新建的制瓷车间",
  "address": "江西省景德镇市陶溪川文创街区",
  "buildYear": 2024,
  "area": 1500.00,
  "height": 18.0,
  "structureType": "钢结构"
}
```

**响应数据**:
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 7,
    "buildingCode": "TXC-007",
    "buildingName": "7号厂房 - 新建车间"
  }
}
```

## 4. 损伤检测

### 4.1 图片上传与分析

**接口地址**: `POST /detection/analyze`

**请求头**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**请求参数**:
- `buildingId`: 建筑ID
- `image`: 图片文件 (支持jpg, jpeg, png)
- `weatherCondition`: 天气条件 (可选)
- `temperature`: 温度 (可选)
- `humidity`: 湿度 (可选)

**响应数据**:
```json
{
  "code": 200,
  "message": "分析完成",
  "data": {
    "recordId": 123,
    "recordNo": "DR20240226001",
    "imageId": 456,
    "imageUrl": "/uploads/images/processed_456.jpg",
    "totalDamages": 3,
    "analysisDuration": 2.5,
    "damages": [
      {
        "id": 1,
        "damageType": "裂缝扩展",
        "severityLevel": "中度",
        "confidenceScore": 0.92,
        "bbox": [150, 200, 300, 400],
        "positionDescription": "东墙面第3排第8块砖",
        "damageArea": 25.5,
        "treatmentAdvice": "建议进行表面填缝修复",
        "urgencyLevel": "中"
      },
      {
        "id": 2,
        "damageType": "泛碱现象",
        "severityLevel": "轻度",
        "confidenceScore": 0.85,
        "bbox": [500, 100, 600, 250],
        "positionDescription": "南墙面第2排第6块砖",
        "damageArea": 15.2,
        "treatmentAdvice": "建议使用弱酸性清洗剂清理",
        "urgencyLevel": "低"
      }
    ]
  }
}
```

### 4.2 获取检测记录列表

**接口地址**: `GET /detection/records`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `buildingId`: 建筑ID筛选
- `userId`: 检测用户ID筛选
- `startDate`: 开始日期
- `endDate`: 结束日期
- `status`: 检测状态筛选

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 123,
        "recordNo": "DR20240226001",
        "buildingId": 1,
        "buildingName": "1号厂房 - 原制瓷车间",
        "userId": 1,
        "username": "张三",
        "detectionDate": "2024-02-26T10:30:00Z",
        "imageCount": 5,
        "totalDamageCount": 23,
        "detectionStatus": "COMPLETED",
        "aiModelVersion": "GLM-4.7",
        "detectionDuration": 120
      }
    ]
  }
}
```

### 4.3 获取检测记录详情

**接口地址**: `GET /detection/records/{id}`

**请求头**: `Authorization: Bearer {token}`

**路径参数**:
- `id`: 检测记录ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 123,
    "recordNo": "DR20240226001",
    "building": {
      "id": 1,
      "buildingCode": "TXC-001",
      "buildingName": "1号厂房 - 原制瓷车间"
    },
    "user": {
      "id": 1,
      "username": "张三",
      "realName": "张三"
    },
    "detectionDate": "2024-02-26T10:30:00Z",
    "weatherCondition": "晴天",
    "temperature": 25.5,
    "humidity": 60.0,
    "imageCount": 5,
    "totalDamageCount": 23,
    "detectionStatus": "COMPLETED",
    "aiModelVersion": "GLM-4.7",
    "detectionDuration": 120,
    "images": [
      {
        "id": 456,
        "imageName": "image_001.jpg",
        "filePath": "/uploads/images/image_001.jpg",
        "fileSize": 2048576,
        "imageWidth": 1920,
        "imageHeight": 1080,
        "analysisStatus": "COMPLETED",
        "damageCount": 3
      }
    ],
    "damages": [
      {
        "id": 1,
        "damageType": "裂缝扩展",
        "severityLevel": "中度",
        "confidenceScore": 0.92,
        "bbox": [150, 200, 300, 400],
        "positionDescription": "东墙面第3排第8块砖",
        "treatmentAdvice": "建议进行表面填缝修复",
        "urgencyLevel": "中",
        "verified": false
      }
    ]
  }
}
```

## 5. 评估报告

### 5.1 生成评估报告

**接口地址**: `POST /reports/generate`

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "recordId": 123,
  "reportType": "STANDARD",
  "reportTitle": "1号厂房损伤评估报告"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "报告生成中",
  "data": {
    "reportId": 789,
    "reportNo": "RP20240226001",
    "status": "GENERATING"
  }
}
```

### 5.2 获取报告列表

**接口地址**: `GET /reports`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `buildingId`: 建筑ID筛选
- `reportType`: 报告类型筛选
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 30,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 789,
        "reportNo": "RP20240226001",
        "recordId": 123,
        "recordNo": "DR20240226001",
        "buildingId": 1,
        "buildingName": "1号厂房 - 原制瓷车间",
        "reportTitle": "1号厂房损伤评估报告",
        "reportType": "STANDARD",
        "totalDamageCount": 23,
        "reportStatus": "COMPLETED",
        "generatedTime": "2024-02-26T11:00:00Z",
        "downloadCount": 5
      }
    ]
  }
}
```

### 5.3 下载报告文件

**接口地址**: `GET /reports/{id}/download`

**请求头**: `Authorization: Bearer {token}`

**路径参数**:
- `id`: 报告ID

**响应**: PDF文件流

### 5.4 获取报告详情

**接口地址**: `GET /reports/{id}`

**请求头**: `Authorization: Bearer {token}`

**路径参数**:
- `id`: 报告ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 789,
    "reportNo": "RP20240226001",
    "record": {
      "id": 123,
      "recordNo": "DR20240226001",
      "detectionDate": "2024-02-26T10:30:00Z"
    },
    "building": {
      "id": 1,
      "buildingName": "1号厂房 - 原制瓷车间"
    },
    "reportTitle": "1号厂房损伤评估报告",
    "reportType": "STANDARD",
    "totalDamageCount": 23,
    "severityDistribution": {
      "轻度": 15,
      "中度": 6,
      "重度": 2,
      "严重": 0
    },
    "damageTypeDistribution": {
      "风化严重": 8,
      "裂缝扩展": 7,
      "泛碱现象": 5,
      "砖块脱落": 2,
      "表面污染": 1
    },
    "overallAssessment": "建筑整体状况良好，存在少量轻度损伤...",
    "repairRecommendations": "建议对中度损伤进行及时修复...",
    "estimatedCost": 15000.00,
    "reportStatus": "COMPLETED",
    "generatedBy": 1,
    "generatedTime": "2024-02-26T11:00:00Z",
    "downloadCount": 5
  }
}
```

## 6. 统计分析

### 6.1 获取检测统计

**接口地址**: `GET /statistics/detection`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `buildingId`: 建筑ID (可选)
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalDetections": 150,
    "totalDamages": 1250,
    "buildingsDetected": 6,
    "avgDamagePerDetection": 8.33,
    "severityDistribution": {
      "轻度": 750,
      "中度": 400,
      "重度": 90,
      "严重": 10
    },
    "typeDistribution": {
      "风化严重": 400,
      "裂缝扩展": 350,
      "泛碱现象": 300,
      "砖块脱落": 150,
      "表面污染": 50
    },
    "monthlyTrend": [
      {
        "month": "2024-01",
        "detectionCount": 45,
        "damageCount": 380
      },
      {
        "month": "2024-02",
        "detectionCount": 55,
        "damageCount": 470
      }
    ]
  }
}
```

### 6.2 获取建筑统计

**接口地址**: `GET /statistics/building`

**请求头**: `Authorization: Bearer {token}`

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalBuildings": 6,
    "buildingsByType": {
      "制瓷车间": 2,
      "烧制车间": 1,
      "包装车间": 1,
      "仓储车间": 1,
      "动力车间": 1,
      "办公楼": 1
    },
    "buildingStatistics": [
      {
        "buildingId": 1,
        "buildingName": "1号厂房 - 原制瓷车间",
        "totalDetections": 25,
        "totalDamages": 200,
        "lastDetectionDate": "2024-02-26T10:30:00Z",
        "healthScore": 85.5
      }
    ]
  }
}
```

## 7. 系统管理

### 7.1 获取系统配置

**接口地址**: `GET /system/config`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `configKey`: 配置键 (可选，单个配置查询)

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "configKey": "ai.model.provider",
      "configValue": "glm47",
      "configDesc": "AI模型提供商",
      "configType": "STRING"
    }
  ]
}
```

### 7.2 更新系统配置

**接口地址**: `PUT /system/config`

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "configKey": "ai.model.confidence.threshold",
  "configValue": "0.75",
  "configDesc": "AI识别置信度阈值"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 7.3 获取操作日志

**接口地址**: `GET /system/logs`

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `userId`: 用户ID筛选
- `operationType`: 操作类型筛选
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 1000,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "userId": 1,
        "username": "张三",
        "operationType": "DETECTION_ANALYZE",
        "operationDesc": "执行损伤检测分析",
        "requestUrl": "/api/detection/analyze",
        "ipAddress": "192.168.1.100",
        "executionTime": 2500,
        "operationStatus": "SUCCESS",
        "createdTime": "2024-02-26T10:30:00Z"
      }
    ]
  }
}
```

## 8. 文件管理

### 8.1 文件上传

**接口地址**: `POST /files/upload`

**请求头**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**请求参数**:
- `file`: 文件
- `fileType`: 文件类型 (IMAGE, MODEL, DOCUMENT)

**响应数据**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "fileId": 123,
    "fileName": "image_001.jpg",
    "filePath": "/uploads/2024/02/26/image_001.jpg",
    "fileSize": 2048576,
    "fileUrl": "http://localhost:8080/api/files/123/download"
  }
}
```

### 8.2 文件下载

**接口地址**: `GET /files/{id}/download`

**请求头**: `Authorization: Bearer {token}`

**路径参数**:
- `id`: 文件ID

**响应**: 文件流

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户名或密码错误 |
| 1002 | Token已过期 |
| 1003 | Token无效 |
| 1004 | 权限不足 |
| 2001 | 建筑信息不存在 |
| 2002 | 建筑编码已存在 |
| 3001 | 检测记录不存在 |
| 3002 | 图片格式不支持 |
| 3003 | 图片大小超限 |
| 3004 | AI分析失败 |
| 4001 | 报告不存在 |
| 4002 | 报告生成失败 |
| 5001 | 文件不存在 |
| 5002 | 文件上传失败 |
| 9001 | 系统内部错误 |
| 9002 | 数据库连接失败 |

## 接口调用示例

### JavaScript/Axios示例

```javascript
// 设置基础配置
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 图片上传和分析
const analyzeImage = async (buildingId, imageFile) => {
  const formData = new FormData();
  formData.append('buildingId', buildingId);
  formData.append('image', imageFile);
  formData.append('weatherCondition', '晴天');
  
  try {
    const response = await api.post('/detection/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('图片分析失败:', error.response.data);
    throw error;
  }
};
```

### Java/Spring Boot示例

```java
// RestTemplate调用示例
@Service
public class AIService {
    
    @Value("${ai.model.api.url}")
    private String apiUrl;
    
    @Value("${ai.model.api.key}")
    private String apiKey;
    
    public AIAnalysisResult analyzeImage(MultipartFile image) {
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("Authorization", "Bearer " + apiKey);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", image.getResource());
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<AIAnalysisResult> response = restTemplate.postForEntity(
                apiUrl, requestEntity, AIAnalysisResult.class);
            return response.getBody();
        } catch (Exception e) {
            throw new AIAnalysisException("AI分析失败", e);
        }
    }
}
```
