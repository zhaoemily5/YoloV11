# 陶溪川工业遗产AI智能损伤诊断评估系统 - 启用指南

## 📋 目录
1. [系统概述](#系统概述)
2. [环境要求](#环境要求)
3. [本地开发环境搭建](#本地开发环境搭建)
4. [系统启动流程](#系统启动流程)
5. [功能使用指南](#功能使用指南)
6. [常见问题排查](#常见问题排查)
7. [生产环境部署](#生产环境部署)

## 🏗️ 系统概述

陶溪川工业遗产AI智能损伤诊断评估系统是一个基于Vue 3 + Spring Boot的现代化Web应用，专门用于工业遗产建筑的损伤检测和评估。

### 技术栈
- **前端**: Vue 3, TypeScript, Vite, Element Plus, Pinia
- **后端**: Spring Boot 3.2, Java 17, Maven, H2数据库
- **AI模型**: GLM-4.7 (云端API) / YOLOv11 (本地模型)
- **部署**: Docker Compose, Nginx

### 核心功能
- 🏢 建筑信息管理
- 📷 AI损伤检测分析
- 📊 检测结果可视化
- 📋 评估报告生成
- 🔍 损伤详情查看

## 🛠️ 环境要求

### 开发环境
```bash
# 必需软件版本
Node.js >= 18.0.0
Java >= 17
Maven >= 3.8.0
Git >= 2.30.0

# 推荐开发工具
VS Code / WebStorm
IntelliJ IDEA
```

### 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **内存**: 最少8GB，推荐16GB
- **存储**: 至少10GB可用空间
- **网络**: 稳定的互联网连接（AI模型API调用）

## 🚀 本地开发环境搭建

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/taoxichuan-ai-assessment.git
cd taoxichuan-ai-assessment
```

### 2. 后端环境配置

#### 2.1 Java环境检查
```bash
# 检查Java版本
java -version
# 应显示: openjdk version "17.x.x"

# 检查Maven版本
mvn -version
# 应显示: Apache Maven 3.8.x
```

#### 2.2 数据库配置
项目默认使用H2内存数据库，无需额外安装。

#### 2.3 后端依赖安装
```bash
cd backend
mvn clean install -DskipTests
```

#### 2.4 后端配置文件
检查 `backend/src/main/resources/application.yml`:
```yaml
spring:
  profiles:
    active: dev
  
  # 开发环境使用H2内存数据库
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:taoxichuan_dev;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    username: sa
    password: 
  
  # H2控制台配置
  h2:
    console:
      enabled: true
      path: /h2-console

# AI模型配置
ai:
  model:
    api-url: https://api.siliconflow.cn/v1/chat/completions
    api-key: sk-ifhnzwaudztwgrmojfgflhgxnzejhxxoxsqncqwsewxhsmkr
    model-name: Pro/zai-org/GLM-4.7

server:
  port: 8082
```

### 3. 前端环境配置

#### 3.1 Node.js环境检查
```bash
# 检查Node.js版本
node -v
# 应显示: v18.x.x 或更高版本

# 检查npm版本
npm -v
# 应显示: 8.x.x 或更高版本
```

#### 3.2 前端依赖安装
```bash
cd frontend
npm install
```

#### 3.3 前端环境配置
检查 `frontend/.env`:
```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=陶溪川工业遗产AI智能损伤诊断评估系统
```

检查 `frontend/vite.config.ts`代理配置:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8082',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🎯 系统启动流程

### 启动顺序
1. 启动后端服务
2. 启动前端服务
3. 验证系统功能

### 详细启动步骤

#### 步骤1: 启动后端服务
```bash
# 在项目根目录
cd backend

# 启动开发环境
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--server.port=8082"

# 或者在IDE中直接运行主类: TaoxichuanAiAssessmentApplication.java
```

**成功标志**:
```
=================================
陶溪川工业遗产AI智能损伤诊断评估系统启动成功!
API文档地址: http://localhost:8082/api/doc.html
=================================
```

#### 步骤2: 启动前端服务
```bash
# 新开终端窗口
cd frontend

# 启动开发服务器
npm run dev

# 或者使用yarn
yarn dev
```

**成功标志**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h to show help
```

#### 步骤3: 验证系统功能

##### 3.1 访问系统
打开浏览器访问: http://localhost:3000

##### 3.2 登录系统
- 用户名: `admin`
- 密码: `123`

##### 3.3 验证核心功能
1. **建筑管理**: 检查建筑列表是否正常显示
2. **AI检测**: 上传图片进行损伤检测
3. **结果查看**: 验证检测结果展示
4. **报告生成**: 测试评估报告功能

##### 3.4 API接口测试
```bash
# 健康检查
curl http://localhost:8082/api/health

# 建筑列表
curl http://localhost:8082/api/buildings

# 前端代理测试
curl http://localhost:3000/api/health
```

## 📖 功能使用指南

### 1. 管理员登录
1. 访问登录页面
2. 选择"管理员登录"
3. 输入用户名: `admin`
4. 输入密码: `123`
5. 点击"登录"

### 2. AI损伤检测流程

#### 2.1 新建检测
1. 点击"损伤检测" → "新建检测"
2. 选择要检测的建筑（从下拉框选择）
3. 设置环境条件：
   - 天气条件：晴天/多云/阴天/雨天
   - 温度（摄氏度）
   - 湿度（百分比）
4. 上传建筑照片：
   - 支持JPG、PNG格式
   - 单个文件不超过10MB
   - 可同时上传多张照片
5. 点击"启动AI分析"

#### 2.2 查看检测结果
1. **图片分析结果**: 显示上传的图片和AI标记的损伤位置
2. **统计信息**: 显示总损伤数量和分析完成状态
3. **损伤列表**: 详细列出每个损伤的信息
   - 损伤类型（裂缝、风化、泛碱等）
   - 严重程度（轻度、中度、重度）
   - 置信度百分比
   - 紧急程度

#### 2.3 损伤详情查看
1. 点击损伤列表中的任意项目
2. 查看详细信息：
   - 损伤类型和严重程度
   - 置信度和紧急程度
   - 位置坐标和边界框尺寸
   - 损伤描述

#### 2.4 生成评估报告
1. 点击"生成报告"按钮
2. 确认报告生成
3. 系统自动生成PDF评估报告
4. 可下载或查看报告

### 3. 建筑信息管理
1. 查看建筑列表
2. 查看建筑详情
3. 添加新建筑（管理员功能）
4. 编辑建筑信息
5. 删除建筑记录

## 🔧 常见问题排查

### 1. 后端启动失败

#### 问题: 端口被占用
```bash
# 查看端口占用
lsof -i :8082
# 或
netstat -tulpn | grep 8082

# 解决方案1: 杀死占用进程
kill -9 <PID>

# 解决方案2: 更换端口
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8083"
```

#### 问题: Java版本不兼容
```bash
# 检查Java版本
java -version

# 如果版本低于17，需要升级Java
# Ubuntu/Debian:
sudo apt update
sudo apt install openjdk-17-jdk

# macOS (使用Homebrew):
brew install openjdk@17

# Windows: 下载并安装Oracle JDK 17
```

#### 问题: Maven依赖下载失败
```bash
# 清理Maven缓存
mvn clean

# 强制更新依赖
mvn install -U

# 检查Maven配置
mvn help:effective-settings
```

### 2. 前端启动失败

#### 问题: Node.js版本过低
```bash
# 使用nvm管理Node.js版本
nvm install 18
nvm use 18
nvm alias default 18
```

#### 问题: 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 问题: 端口冲突
```bash
# 查看端口占用
lsof -i :3000

# 杀死进程或更换端口
npm run dev -- --port 3001
```

### 3. API连接问题

#### 问题: 前端无法连接后端
1. 检查后端是否正常启动
2. 检查代理配置是否正确
3. 检查防火墙设置
4. 查看浏览器控制台错误信息

#### 问题: 跨域错误
```typescript
// 检查vite.config.ts代理配置
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8082', // 确保端口正确
      changeOrigin: true,
      secure: false
    }
  }
}
```

### 4. AI分析问题

#### 问题: 图片上传失败
1. 检查图片格式（仅支持JPG、PNG）
2. 检查图片大小（不超过10MB）
3. 查看浏览器控制台错误信息
4. 检查网络连接

#### 问题: AI分析无结果
1. 检查AI API密钥是否正确
2. 检查网络连接
3. 查看后端日志
4. 确认图片质量良好

### 5. 数据库问题

#### 问题: H2数据库连接失败
1. 检查application.yml配置
2. 确认没有其他H2实例冲突
3. 重启后端服务

#### 问题: 数据丢失
- H2内存数据库重启后数据会丢失
- 如需持久化数据，可配置H2文件数据库

## 🌐 生产环境部署

### Docker部署（推荐）

#### 1. 构建Docker镜像
```bash
# 构建后端镜像
cd backend
docker build -t taoxichuan-backend .

# 构建前端镜像
cd ../frontend
docker build -t taoxichuan-frontend .
```

#### 2. 使用Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 传统部署

#### 1. 后端部署
```bash
# 打包应用
mvn clean package -DskipTests

# 运行JAR文件
java -jar target/taoxichuan-ai-assessment-1.0.0.jar --spring.profiles.active=prod
```

#### 2. 前端部署
```bash
# 构建生产版本
npm run build

# 使用Nginx托管
cp -r dist/* /var/www/html/
```

### 环境变量配置
```bash
# 生产环境配置
export SPRING_PROFILES_ACTIVE=prod
export SERVER_PORT=8080
export AI_MODEL_API_KEY=your-production-api-key
```

## 📞 技术支持

如遇到技术问题，请按以下步骤排查：

1. **查看日志**: 检查前后端日志文件
2. **网络诊断**: 使用浏览器开发者工具
3. **配置检查**: 验证所有配置文件
4. **环境验证**: 确认运行环境符合要求

### 联系方式
- 技术支持邮箱: support@taoxichuan.com
- 项目地址: https://github.com/your-repo/taoxichuan-ai-assessment
- 问题反馈: https://github.com/your-repo/taoxichuan-ai-assessment/issues

---

**注意**: 本系统仍在持续开发中，部分功能可能存在优化空间。欢迎提出宝贵意见和建议！
