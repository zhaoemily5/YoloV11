# 陶溪川工业遗产AI智能损伤诊断评估系统

## 项目概述

本项目为中建八局装饰公司开发的工业遗产建筑外立面砖块损伤智能评估诊断系统，基于机器视觉技术实现建筑损伤的自动化检测和评估。

## 技术架构

### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **3D展示**: Three.js
- **构建工具**: Vite

### 后端技术栈
- **框架**: Spring Boot 3.x
- **数据库**: MySQL 8.0
- **ORM**: MyBatis Plus
- **认证**: Spring Security + JWT
- **API文档**: SpringDoc OpenAPI 3
- **文件存储**: 本地存储 + MinIO
- **AI模型服务**: GLM-4.7 API (临时) / YOLOv11 (正式)

### 部署架构
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **应用服务器**: Tomcat (内嵌)

## 项目结构

```
taoxichuan-ai-assessment/
├── backend/                 # Java后端服务
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taoxichuan/
│   │   │   │   ├── controller/      # 控制器层
│   │   │   │   ├── service/         # 业务逻辑层
│   │   │   │   ├── mapper/          # 数据访问层
│   │   │   │   ├── entity/          # 实体类
│   │   │   │   ├── dto/             # 数据传输对象
│   │   │   │   ├── config/          # 配置类
│   │   │   │   ├── util/            # 工具类
│   │   │   │   └── TAOXICHUANApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── mapper/          # MyBatis映射文件
│   │   └── test/
│   └── pom.xml
├── frontend/               # Vue前端应用
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── api/             # API接口
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript类型定义
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/                   # 项目文档
│   ├── api.md              # API接口文档
│   ├── database.md         # 数据库设计文档
│   └── deployment.md       # 部署文档
├── docker/                 # Docker配置文件
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
└── README.md
```

## 核心功能模块

### 1. 建筑管理模块
- 建筑基础信息管理
- 建筑三维模型展示
- 建筑图片管理

### 2. AI损伤检测模块
- 图片上传和预处理
- AI模型调用 (GLM-4.7/YOLOv11)
- 损伤识别和定位
- 检测结果可视化

### 3. 评估报告模块
- 损伤评估报告生成
- PDF报告导出
- 历史报告查看

### 4. 用户认证模块
- OA单点认证集成
- 用户权限管理
- 会话管理

### 5. 系统管理模块
- 系统配置管理
- 日志管理
- 数据备份

## 数据库设计

### 核心数据表

1. **建筑信息表 (t_building)**
   - 建筑基础信息
   - 地理位置
   - 建造年代

2. **检测记录表 (t_detection_record)**
   - 检测时间
   - 操作用户
   - 检测状态

3. **损伤信息表 (t_damage_info)**
   - 损伤类型
   - 损伤位置
   - 严重程度
   - 处理建议

4. **用户信息表 (t_user)**
   - 用户基础信息
   - 权限角色
   - OA集成信息

## API接口设计

### 认证相关
- `POST /api/auth/sso` - 单点认证
- `POST /api/auth/logout` - 用户登出

### 建筑管理
- `GET /api/buildings` - 获取建筑列表
- `GET /api/buildings/{id}` - 获取建筑详情
- `POST /api/buildings` - 创建建筑信息

### 损伤检测
- `POST /api/detection/analyze` - 图片损伤分析
- `GET /api/detection/records` - 获取检测记录
- `GET /api/detection/records/{id}` - 获取检测详情

### 报告管理
- `GET /api/reports/generate/{recordId}` - 生成评估报告
- `GET /api/reports/download/{reportId}` - 下载报告文件

## 开发环境搭建

### 后端环境
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 前端环境
```bash
cd frontend
npm install
npm run dev
```

### Docker部署
```bash
docker-compose up -d
```

## 配置说明

### 后端配置 (application.yml)
```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/taoxichuan_ai
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
ai:
  model:
    provider: glm47  # glm47 或 yolo11
    api-key: ${GLM_API_KEY:your-api-key}
    api-url: https://api.siliconflow.cn/v1/chat/completions
```

### 前端配置 (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_UPLOAD_MAX_SIZE=10MB
VITE_ALLOWED_IMAGE_TYPES=jpg,jpeg,png
```

## 部署说明

1. **环境准备**
   - Java 17+
   - Node.js 18+
   - MySQL 8.0+
   - Redis 6.0+

2. **数据库初始化**
   ```sql
   -- 执行 docs/database.md 中的SQL脚本
   ```

3. **应用部署**
   ```bash
   # 构建前端
   cd frontend && npm run build
   
   # 构建后端
   cd backend && mvn clean package
   
   # Docker部署
   docker-compose up -d
   ```

## 开发规范

### 代码规范
- Java: 遵循阿里巴巴Java开发手册
- TypeScript: 使用ESLint + Prettier
- Git提交: 使用Conventional Commits规范

### API设计规范
- RESTful API设计
- 统一响应格式
- 完善的错误处理
- 详细的API文档

### 数据库规范
- 表名使用小写下划线
- 字段名使用小写下划线
- 必须包含主键id和创建时间、更新时间

## 联系方式

- **项目负责人**: 赵正楠
- **技术支持**: 开发团队
- **业务咨询**: 中建八局装饰公司

## 版本历史

- **v1.0.0** - 初始版本发布
  - 基础功能实现
  - GLM-4.7模型集成
  - 前后端分离架构
