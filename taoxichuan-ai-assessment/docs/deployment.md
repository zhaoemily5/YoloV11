# 部署文档

## 部署概述

本文档详细说明了陶溪川工业遗产AI智能损伤诊断评估系统的部署流程，包括开发环境、测试环境和生产环境的部署方案。

## 系统要求

### 硬件要求

#### 最小配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 100GB SSD
- **网络**: 100Mbps

#### 推荐配置
- **CPU**: 8核心
- **内存**: 16GB RAM
- **存储**: 500GB SSD
- **网络**: 1Gbps

#### 生产环境配置
- **CPU**: 16核心
- **内存**: 32GB RAM
- **存储**: 1TB SSD
- **网络**: 1Gbps
- **GPU**: NVIDIA RTX 3080或更高（用于AI模型推理）

### 软件要求

#### 基础环境
- **操作系统**: CentOS 7+/Ubuntu 18.04+/RHEL 7+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.0+

#### 开发环境额外要求
- **Java**: OpenJDK 17+
- **Node.js**: 18.0+
- **Maven**: 3.8+
- **MySQL**: 8.0+
- **Redis**: 6.0+

## 部署架构

### 容器化部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Frontend      │    │    Backend      │
│  (反向代理/SSL)  │────│   (Vue3 SPA)    │────│  (Spring Boot)  │
│     Port:80     │    │   Port:3000     │    │   Port:8080     │
│     Port:443    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │      Redis      │─────────────┤
                       │    (缓存/会话)   │             │
                       │   Port:6379     │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │      MySQL      │─────────────┘
                       │   (主数据库)     │
                       │   Port:3306     │
                       └─────────────────┘
                       
                       ┌─────────────────┐
                       │      MinIO      │
                       │   (文件存储)     │
                       │ Port:9000/9001  │
                       └─────────────────┘
```

## 部署步骤

### 1. 环境准备

#### 1.1 安装Docker和Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# CentOS/RHEL
sudo yum install -y docker docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到docker组
sudo usermod -aG docker $USER
```

#### 1.2 创建项目目录

```bash
# 创建项目根目录
sudo mkdir -p /opt/taoxichuan-ai-assessment
cd /opt/taoxichuan-ai-assessment

# 克隆项目代码
git clone <repository-url> .

# 设置目录权限
sudo chown -R $USER:$USER /opt/taoxichuan-ai-assessment
```

### 2. 配置环境变量

#### 2.1 创建环境变量文件

```bash
# 创建生产环境配置
cp docker/.env.example docker/.env.prod
```

#### 2.2 编辑环境变量

```bash
# docker/.env.prod
# 数据库配置
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_DATABASE=taoxichuan_ai
MYSQL_USER=taoxichuan
MYSQL_PASSWORD=your_db_password

# Redis配置
REDIS_PASSWORD=your_redis_password

# MinIO配置
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_minio_password

# 应用配置
SPRING_PROFILES_ACTIVE=prod
AI_API_KEY=your_ai_api_key

# SSL证书路径
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

### 3. 构建和部署

#### 3.1 构建后端应用

```bash
cd backend

# 使用Maven构建
mvn clean package -DskipTests

# 验证jar文件
ls -la target/taoxichuan-ai-assessment-1.0.0.jar
```

#### 3.2 构建前端应用

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 验证构建结果
ls -la dist/
```

#### 3.3 启动服务

```bash
cd docker

# 启动所有服务
docker-compose -f docker-compose.yml --env-file .env.prod up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 数据库初始化

#### 4.1 等待MySQL启动

```bash
# 检查MySQL状态
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

#### 4.2 执行初始化脚本

```bash
# 复制初始化脚本
cp docs/database.sql docker/init.sql

# 重启MySQL以执行初始化
docker-compose restart mysql

# 验证表结构
docker-compose exec mysql mysql -u taoxichuan -p taoxichuan_ai -e "SHOW TABLES;"
```

### 5. 验证部署

#### 5.1 健康检查

```bash
# 检查后端健康状态
curl http://localhost:8080/api/actuator/health

# 检查前端访问
curl http://localhost/

# 检查MinIO控制台
curl http://localhost:9001
```

#### 5.2 功能测试

1. **访问系统**: http://localhost
2. **API文档**: http://localhost:8080/api/doc.html
3. **MinIO控制台**: http://localhost:9001
4. **数据库连接**: 验证应用能正常连接数据库

### 6. SSL证书配置

#### 6.1 获取SSL证书

```bash
# 使用Let's Encrypt获取免费证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem
```

#### 6.2 配置Nginx SSL

```bash
# 更新nginx配置
vim docker/nginx-ssl.conf

# 重启Nginx
docker-compose restart nginx
```

## 监控和维护

### 1. 日志管理

#### 1.1 查看应用日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# 实时跟踪日志
docker-compose logs -f --tail=100 backend
```

#### 1.2 日志轮转配置

```bash
# 配置日志轮转
sudo vim /etc/logrotate.d/taoxichuan-ai-assessment

/opt/taoxichuan-ai-assessment/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend
    endscript
}
```

### 2. 数据备份

#### 2.1 数据库备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/taoxichuan"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD taoxichuan_ai > $BACKUP_DIR/db_backup_$DATE.sql

# 备份文件数据
docker run --rm -v taoxichuan-ai-assessment_uploads_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_backup_$DATE.tar.gz -C /data .

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# 设置定时任务
crontab -e
# 添加：0 2 * * * /opt/taoxichuan-ai-assessment/backup.sh
```

#### 2.2 恢复数据

```bash
# 恢复数据库
docker-compose exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD taoxichuan_ai < db_backup_20240226_020000.sql

# 恢复文件数据
docker run --rm -v taoxichuan-ai-assessment_uploads_data:/data -v /opt/backups/taoxichuan:/backup alpine tar xzf /backup/uploads_backup_20240226_020000.tar.gz -C /data
```

### 3. 性能监控

#### 3.1 系统监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看CPU负载
top
```

#### 3.2 应用监控

```bash
# 查看JVM状态
docker-compose exec backend curl http://localhost:8080/api/actuator/metrics

# 查看数据库状态
docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# 查看Redis状态
docker-compose exec redis redis-cli info
```

### 4. 更新部署

#### 4.1 滚动更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 滚动更新后端服务
docker-compose up -d --no-deps backend

# 验证更新
curl http://localhost:8080/api/actuator/health
```

#### 4.2 回滚操作

```bash
# 查看镜像历史
docker images | grep taoxichuan

# 回滚到上一个版本
docker-compose up -d --no-deps backend:previous_tag

# 或者使用git回滚
git checkout previous_commit
docker-compose build
docker-compose up -d
```

## 故障排除

### 1. 常见问题

#### 1.1 容器启动失败

```bash
# 查看容器状态
docker-compose ps

# 查看详细错误信息
docker-compose logs <service_name>

# 检查配置文件
docker-compose config
```

#### 1.2 数据库连接失败

```bash
# 检查MySQL服务状态
docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# 检查网络连接
docker-compose exec backend ping mysql

# 检查环境变量
docker-compose exec backend env | grep DB
```

#### 1.3 文件上传失败

```bash
# 检查MinIO服务状态
curl http://localhost:9000/minio/health/live

# 检查存储空间
df -h

# 检查权限
docker-compose exec backend ls -la /app/uploads
```

### 2. 性能优化

#### 2.1 数据库优化

```sql
-- 优化MySQL配置
SET GLOBAL innodb_buffer_pool_size = 2147483648;  -- 2GB
SET GLOBAL innodb_log_file_size = 268435456;      -- 256MB
SET GLOBAL max_connections = 200;

-- 创建索引
CREATE INDEX idx_detection_building_user ON t_detection_record(building_id, user_id, detection_date);
CREATE INDEX idx_damage_record_type ON t_damage_info(record_id, damage_type);
```

#### 2.2 应用优化

```bash
# 调整JVM参数
export JAVA_OPTS="-Xms1g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 调整连接池大小
# 在application.yml中配置
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=10
```

## 安全配置

### 1. 网络安全

#### 1.1 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 1.2 SSL/TLS配置

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}
```

### 2. 应用安全

#### 2.1 密码策略

```bash
# 生成强密码
openssl rand -base64 32

# 定期更换密码
# 每90天更换一次数据库密码
# 每60天更换一次应用密钥
```

#### 2.2 访问控制

```yaml
# application.yml
spring:
  security:
    user:
      name: admin
      password: ${ADMIN_PASSWORD}
      roles: ADMIN
```

## 联系支持

如果在部署过程中遇到问题，请联系：

- **技术支持**: tech-support@taoxichuan.com
- **运维团队**: ops@taoxichuan.com
- **项目经理**: pm@taoxichuan.com

### 支持时间
- **工作日**: 9:00-18:00
- **紧急支持**: 7x24小时

### 支持内容
- 部署指导
- 故障排除
- 性能优化
- 安全加固
- 版本升级
