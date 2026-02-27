# 陶溪川AI系统 - Cpolar内网穿透发布指南

## 📋 目录
1. [Cpolar简介](#cpolar简介)
2. [安装Cpolar](#安装cpolar)
3. [配置Cpolar](#配置cpolar)
4. [发布前端服务](#发布前端服务)
5. [发布后端服务](#发布后端服务)
6. [配置HTTPS](#配置https)
7. [域名绑定](#域名绑定)
8. [安全配置](#安全配置)
9. [常见问题](#常见问题)

## 🌐 Cpolar简介

Cpolar是一款强大的内网穿透工具，可以将本地服务映射到公网，无需公网IP即可实现外网访问。

### 主要优势
- ✅ 无需公网IP
- ✅ 无需路由器配置
- ✅ 支持HTTP/HTTPS
- ✅ 自定义域名
- ✅ 数据加密传输
- ✅ 跨平台支持

## 🛠️ 安装Cpolar

### Windows安装
```bash
# 下载Cpolar客户端
# 访问: https://www.cpolar.com/download

# 下载Windows版本并安装
# 或使用命令行一键安装
powershell -Command "iwr -useb https://static.cpolar.com/static/install.sh | bash"
```

### Linux安装
```bash
# Ubuntu/Debian
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# CentOS/RHEL
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# 验证安装
cpolar version
```

### macOS安装
```bash
# 使用Homebrew
brew tap cpolar/homebrew-tap
brew install cpolar

# 或手动下载DMG文件安装
```

## ⚙️ 配置Cpolar

### 1. 注册账号
1. 访问 [Cpolar官网](https://www.cpolar.com)
2. 注册免费账号
3. 获取认证token

### 2. 登录认证
```bash
# 登录Cpolar
cpolar authtoken <your-auth-token>

# 验证登录状态
cpolar status
```

### 3. 配置文件位置
```bash
# Windows: C:\Users\<用户名>\.cpolar\cpolar.yml
# Linux/macOS: ~/.cpolar/cpolar.yml
```

## 🚀 发布前端服务

### 方案1: HTTP隧道（推荐用于测试）

#### 1.1 启动前端服务
```bash
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/frontend
npm run dev
# 确保前端运行在 http://localhost:3000
```

#### 1.2 创建HTTP隧道
```bash
# 创建前端隧道
cpolar http 3000

# 输出示例:
Forwarding   http://xxxxxxxx.cpolar.io -> http://localhost:3000
Forwarding   https://xxxxxxxx.cpolar.io -> http://localhost:3000
```

#### 1.3 自定义子域名（付费功能）
```bash
# 创建固定子域名隧道
cpolar http 3000 --subdomain=taoxichuan-frontend
```

### 方案2: 使用配置文件

#### 2.1 编辑配置文件
```yaml
# ~/.cpolar/cpolar.yml
authtoken: <your-auth-token>

tunnels:
  frontend:
    proto: http
    addr: 3000
    subdomain: taoxichuan-frontend  # 需要付费套餐
    region: cn                    # 选择服务器区域
    
  backend:
    proto: http
    addr: 8082
    subdomain: taoxichuan-backend
    region: cn
```

#### 2.2 启动隧道
```bash
# 启动所有隧道
cpolar start-all

# 启动特定隧道
cpolar start frontend
cpolar start backend
```

## 🔧 发布后端服务

### 1. 启动后端服务
```bash
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--server.port=8082"
```

### 2. 创建后端隧道
```bash
# 创建后端API隧道
cpolar http 8082 --subdomain=taoxichuan-api

# 输出示例:
Forwarding   http://taoxichuan-api.cpolar.io -> http://localhost:8082
Forwarding   https://taoxichuan-api.cpolar.io -> http://localhost:8082
```

### 3. 更新前端配置

#### 3.1 修改前端API地址
编辑 `frontend/.env`:
```env
VITE_API_BASE_URL=https://taoxichuan-api.cpolar.io/api
VITE_APP_TITLE=陶溪川工业遗产AI智能损伤诊断评估系统
```

#### 3.2 修改Vite代理配置
编辑 `frontend/vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://taoxichuan-api.cpolar.io',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

#### 3.3 重启前端服务
```bash
# 停止前端服务 (Ctrl+C)
# 重新启动
npm run dev
```

## 🔒 配置HTTPS

### 1. Cpolar自动HTTPS
Cpolar自动为所有隧道提供HTTPS访问，无需额外配置。

### 2. 前端HTTPS配置
编辑 `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: false,  // Cpolar会提供HTTPS
    cors: true,
    proxy: {
      '/api': {
        target: 'https://taoxichuan-api.cpolar.io',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

## 🌐 域名绑定（付费功能）

### 1. 自定义域名配置
```bash
# 绑定自定义域名
cpolar http 3000 --hostname your-domain.com

# 或在配置文件中设置
tunnels:
  frontend:
    proto: http
    addr: 3000
    hostname: your-domain.com
```

### 2. DNS配置
1. 登录域名服务商
2. 添加CNAME记录:
   ```
   主机记录: www
   记录类型: CNAME
   记录值: your-tunnel.cpolar.io
   ```

### 3. SSL证书
Cpolar自动提供SSL证书，无需手动配置。

## 🛡️ 安全配置

### 1. 访问控制
```yaml
# cpolar.yml配置
tunnels:
  frontend:
    proto: http
    addr: 3000
    subdomain: taoxichuan
    region: cn
    # 访问控制
    auth: "username:password"  # HTTP基础认证
    # IP白名单
    ip_whitelist: 
      - "192.168.1.0/24"
      - "10.0.0.0/8"
```

### 2. 后端安全配置
编辑 `backend/src/main/resources/application.yml`:
```yaml
spring:
  security:
    # 允许Cpolar域名
    cors:
      allowed-origins: 
        - "https://taoxichuan.cpolar.io"
        - "https://taoxichuan-frontend.cpolar.io"
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
```

### 3. 前端安全配置
```typescript
// frontend/src/utils/request.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,  // 跨域携带cookie
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## 📊 监控和管理

### 1. Web管理界面
访问 [Cpolar Web UI](https://dashboard.cpolar.com)

### 2. 查看隧道状态
```bash
# 查看所有隧道状态
cpolar status

# 查看在线隧道
cpolar list

# 查看隧道日志
cpolar logs frontend
```

### 3. 重启隧道
```bash
# 重启所有隧道
cpolar restart-all

# 重启特定隧道
cpolar restart frontend
```

## 🚀 完整部署流程

### 步骤1: 准备环境
```bash
# 1. 确保本地服务正常运行
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--server.port=8082"

# 2. 新终端启动前端
cd /home/zzn16/YoloV11/taoxichuan-ai-assessment/frontend
npm run dev
```

### 步骤2: 配置Cpolar
```bash
# 1. 登录Cpolar
cpolar authtoken <your-auth-token>

# 2. 创建配置文件
cat > ~/.cpolar/cpolar.yml << EOF
authtoken: <your-auth-token>

tunnels:
  frontend:
    proto: http
    addr: 3000
    subdomain: taoxichuan-frontend
    region: cn
    
  backend:
    proto: http
    addr: 8082
    subdomain: taoxichuan-api
    region: cn
EOF
```

### 步骤3: 启动隧道
```bash
# 启动所有隧道
cpolar start-all

# 查看状态
cpolar status
```

### 步骤4: 验证访问
```bash
# 前端访问地址
https://taoxichuan-frontend.cpolar.io

# 后端API访问地址
https://taoxichuan-api.cpolar.io/api/health
```

### 步骤5: 测试功能
1. 访问前端地址
2. 登录系统 (admin/123)
3. 测试AI检测功能
4. 验证图片上传和分析

## 🔧 常见问题

### 1. 隧道启动失败
```bash
# 检查端口是否被占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :8082

# 检查Cpolar日志
cpolar logs

# 重启Cpolar服务
sudo systemctl restart cpolar
```

### 2. 连接超时
```bash
# 检查网络连接
ping taoxichuan-frontend.cpolar.io

# 检查本地服务状态
curl http://localhost:3000
curl http://localhost:8082/api/health
```

### 3. 跨域问题
```bash
# 检查CORS配置
curl -H "Origin: https://taoxichuan-frontend.cpolar.io" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://taoxichuan-api.cpolar.io/api/health
```

### 4. 认证失败
```bash
# 重新登录
cpolar authtoken <your-new-token>

# 检查配置文件
cat ~/.cpolar/cpolar.yml
```

### 5. 带宽限制
- 免费套餐有带宽限制
- 建议升级到付费套餐获得更好性能
- 可配置缓存减少API调用

## 📈 性能优化

### 1. 前端优化
```bash
# 启用Gzip压缩
npm install --save-dev vite-plugin-compression

# 配置vite.config.ts
import { defineConfig } from 'vite'
import { viteCompression } from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression()
  ]
})
```

### 2. 后端优化
```yaml
# application.yml
server:
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
  tomcat:
    max-threads: 200
    min-spare-threads: 10
```

### 3. Cpolar优化
```yaml
# cpolar.yml
tunnels:
  frontend:
    proto: http
    addr: 3000
    subdomain: taoxichuan
    region: cn                    # 选择就近区域
    connection_pool_size: 10      # 连接池大小
    idle_timeout: 60             # 空闲超时
```

## 🎯 最佳实践

### 1. 环境分离
- 开发环境: 使用随机域名
- 测试环境: 使用固定子域名
- 生产环境: 使用自定义域名

### 2. 监控告警
```bash
# 设置健康检查脚本
#!/bin/bash
# health-check.sh

FRONTEND_URL="https://taoxichuan-frontend.cpolar.io"
BACKEND_URL="https://taoxichuan-api.cpolar.io/api/health"

# 检查前端
if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "Frontend is healthy"
else
    echo "Frontend is down, restarting..."
    cpolar restart frontend
fi

# 检查后端
if curl -f -s $BACKEND_URL > /dev/null; then
    echo "Backend is healthy"
else
    echo "Backend is down, restarting..."
    cpolar restart backend
fi
```

### 3. 备份配置
```bash
# 备份Cpolar配置
cp ~/.cpolar/cpolar.yml ~/.cpolar/cpolar.yml.backup

# 备份应用配置
cp -r /home/zzn16/YoloV11/taoxichuan-ai-assessment ~/backup/
```

---

## 📞 技术支持

如遇到Cpolar相关问题：

1. **Cpolar官方文档**: https://www.cpolar.com/docs
2. **Cpolar客服**: support@cpolar.com
3. **项目技术支持**: support@taoxichuan.com

**注意**: Cpolar免费版有流量和连接数限制，建议生产环境使用付费版本获得更稳定的服务。
