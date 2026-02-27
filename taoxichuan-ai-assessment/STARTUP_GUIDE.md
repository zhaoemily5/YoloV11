# 陶溪川工业遗产AI智能损伤诊断评估系统 - 启动指南

## 📋 项目概述

**系统名称**：陶溪川工业遗产AI智能损伤诊断评估系统  
**技术栈**：
- 前端：Vue 3 + TypeScript + Element Plus + Pinia + Vite
- 后端：Spring Boot 3 + Java 17 + MySQL + Redis
- AI模型：YOLOv11（图像识别）+ GLM-4.7（智能评估）

---

## 🚀 快速启动（推荐）

### 方式一：Docker Compose一键启动

```bash
# 1. 进入项目根目录
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment

# 2. 启动所有服务（前端、后端、数据库、Redis）
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 访问系统
# 前端：http://localhost:3000
# 后端API：http://localhost:8081/api
# API文档：http://localhost:8081/api/doc.html
```

**停止服务**：
```bash
docker-compose down
```

---

## 🔧 手动启动（开发调试）

### 一、后端服务启动

#### 1. 环境要求
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+

#### 2. 数据库准备
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE taoxichuan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 使用提供的SQL文件初始化（如有）
mysql -u root -p taoxichuan < /path/to/init.sql
```

#### 3. 修改配置文件
编辑 `backend/src/main/resources/application-dev.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/taoxichuan?useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
  
  redis:
    host: localhost
    port: 6379
    password:  # 如有密码请填写
```

#### 4. 启动后端服务
```bash
# 进入后端目录
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/backend

# 编译项目
mvn clean compile -DskipTests

# 启动服务（开发模式）
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 或在WSL中使用不同端口
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--server.port=8081"
```

**验证启动成功**：
```bash
curl http://localhost:8081/api/health
# 应返回：{"code":200,"message":"系统运行正常"...}
```

---

### 二、前端服务启动

#### 1. 环境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+

#### 2. 安装依赖
```bash
# 进入前端目录
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/frontend

# 安装依赖
npm install

# 如果使用yarn
yarn install
```

#### 3. 配置环境变量（如需修改后端地址）
编辑 `.env` 文件：
```
# 开发环境 - 使用Vite代理
VITE_API_BASE_URL=/api

# 生产环境 - 直接指定后端地址
# VITE_API_BASE_URL=http://192.168.165.208:8081/api
```

#### 4. 启动前端服务
```bash
# 开发模式
npm run dev

# 或指定端口
npm run dev -- --port 3000
```

**默认访问地址**：
- 本地：http://localhost:3000
- 网络：http://10.255.255.254:3000
- WSL：http://192.168.165.208:3000

---

## 🔑 登录信息

### 管理员账号
- **用户名**：`admin`
- **密码**：`123`
- **权限**：系统管理员，可访问所有功能

### OA登录（预留接口）
- 需要集成SSO单点登录系统
- 暂可通过管理员账号测试

---

## 📁 项目结构

```
taoxichuan-ai-assessment/
├── backend/                    # Spring Boot后端
│   ├── src/main/java/
│   │   └── com/taoxichuan/
│   │       ├── controller/     # REST API控制器
│   │       ├── service/        # 业务逻辑层
│   │       ├── dto/            # 数据传输对象
│   │       └── config/         # 配置类
│   └── src/main/resources/
│       └── application-dev.yml # 开发环境配置
│
├── frontend/                   # Vue前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 通用组件
│   │   ├── api/                # API接口封装
│   │   ├── store/              # Pinia状态管理
│   │   └── utils/              # 工具函数
│   ├── package.json
│   └── vite.config.ts          # Vite配置
│
├── docker/                     # Docker配置
│   ├── docker-compose.yml
│   └── Dockerfile.backend
│
├── docs/                       # 项目文档
│   ├── api.md                  # API接口文档
│   ├── deployment.md           # 部署文档
│   └── user-manual.md          # 用户手册
│
└── README.md                   # 项目说明
```

---

## 🐛 常见问题排查

### 问题1：前端无法连接后端（WSL环境）

**现象**：页面显示"网络连接失败"或"加载建筑列表失败"

**解决方案**：
1. 检查后端是否启动
   ```bash
   curl http://localhost:8081/api/health
   ```

2. 修改Vite代理配置（`vite.config.ts`）：
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'http://192.168.165.208:8081',  // WSL IP地址
         changeOrigin: true,
         secure: false
       }
     }
   }
   ```

3. 获取WSL IP地址：
   ```bash
   hostname -I | awk '{print $1}'
   ```

### 问题2：建筑列表无数据

**现象**：下拉框显示"无数据"

**排查步骤**：
1. 检查后端建筑API是否正常：
   ```bash
   curl http://localhost:3000/api/buildings
   # 或
   curl http://localhost:8081/api/buildings
   ```

2. 检查SecurityConfig是否放行建筑API：
   ```java
   .requestMatchers("/health/**", "/actuator/**", "/auth/admin/**", "/buildings/**").permitAll()
   ```

3. 强制刷新浏览器缓存：Ctrl + F5

### 问题3：TypeScript类型错误

**现象**：IDE显示类型不匹配错误

**解决方案**：
1. 在报错位置添加类型断言 `as any`
2. 或者重新安装依赖：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 问题4：端口被占用

**现象**：启动时提示"Port 3000/8081 is already in use"

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000  # 前端端口
lsof -i :8081  # 后端端口

# 终止进程
kill -9 <PID>

# 或使用不同端口启动
npm run dev -- --port 3001
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8082"
```

---

## 🎯 核心功能使用流程

### 建筑损伤检测流程

1. **登录系统**
   - 访问 http://localhost:3000
   - 选择"管理员登录"
   - 输入 admin / 123

2. **进入检测页面**
   - 点击左侧菜单：损伤检测 → 新建检测

3. **配置检测参数**
   - 选择建筑（如"东门窑房"）
   - 设置天气条件（晴天/多云/阴天/雨天）
   - 输入环境温度

4. **上传图片**
   - 支持拖拽或点击上传
   - 格式：JPG、PNG
   - 大小：单个文件不超过10MB
   - 可上传多张图片

5. **启动AI分析**
   - 点击"启动AI分析"按钮
   - 等待分析完成（显示进度条）

6. **查看结果**
   - 查看损伤标记（不同类型的颜色框）
   - 点击标记查看详细损伤信息
   - 生成评估报告（PDF格式）

### 建筑管理

1. 查看建筑列表
2. 添加/编辑建筑信息
3. 查看建筑检测历史

### 检测记录

1. 查看所有检测记录
2. 筛选/搜索特定记录
3. 导出检测数据

---

## 🔒 安全注意事项

1. **生产环境部署前**：
   - 修改管理员默认密码
   - 配置HTTPS
   - 关闭Swagger/OpenAPI文档访问
   - 配置JWT密钥

2. **数据库安全**：
   - 使用强密码
   - 限制数据库访问IP
   - 定期备份数据

3. **API安全**：
   - 启用Spring Security认证
   - 配置CORS跨域策略
   - 添加API限流

---

## 📞 技术支持

**项目文档**：
- API文档：http://localhost:8081/api/doc.html (后端启动后)
- 项目结构：`/docs/`

**开发者**：赵正楠  
**版本**：v1.0.0  
**更新日期**：2024-02-26

---

## 📝 更新日志

### v1.0.0 (2024-02-26)
- ✅ 基础框架搭建完成
- ✅ 管理员登录功能实现
- ✅ 建筑列表展示
- ✅ 损伤检测页面UI完成
- ✅ AI分析流程框架
- ✅ 后端API接口（建筑、检测、报告）
- ✅ WSL网络配置支持

### 待完成功能
- [ ] AI模型集成（YOLOv11）
- [ ] OA SSO登录集成
- [ ] 3D建筑模型展示
- [ ] 实时损伤监测
- [ ] 智能报告生成
