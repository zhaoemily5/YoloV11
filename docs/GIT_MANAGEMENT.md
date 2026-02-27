# Git管理详细指南

## 📋 目录
1. [Git配置](#git配置)
2. [分支管理策略](#分支管理策略)
3. [提交规范](#提交规范)
4. [工作流程](#工作流程)
5. [一键部署](#一键部署)
6. [常见问题](#常见问题)

## 🔧 Git配置

### 1. 全局配置
```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main

# 设置编辑器
git config --global core.editor "code --wait"

# 设置推送策略
git config --global push.default simple

# 设置合并策略
git config --global pull.rebase false
```

### 2. 项目配置
```bash
# 在项目根目录执行
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/YoloV11.git

# 设置分支跟踪
git branch -M main
git push -u origin main
```

## 🌿 分支管理策略

### 分支类型
- **main**: 主分支，用于生产环境
- **develop**: 开发分支，用于集成测试
- **feature/***: 功能分支，用于新功能开发
- **hotfix/***: 热修复分支，用于紧急修复
- **release/***: 发布分支，用于版本发布

### 分支命名规范
```bash
# 功能分支
feature/ai-detection
feature/user-auth
feature/image-upload

# 热修复分支
hotfix/fix-image-loading
hotfix/fix-ui-bug

# 发布分支
release/v1.0.0
release/v1.1.0
```

## 📝 提交规范

### 提交消息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型
- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

### 提交示例
```bash
# 新功能
git commit -m "feat(detection): 添加AI损伤检测功能"

# 修复bug
git commit -m "fix(ui): 修复图片加载失败问题"

# 文档更新
git commit -m "docs(readme): 更新安装和使用说明"

# 代码重构
git commit -m "refactor(api): 重构检测接口结构"
```

## 🔄 工作流程

### 1. 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/ai-detection

# 2. 开发并提交
git add .
git commit -m "feat(detection): 添加AI损伤检测功能"

# 3. 推送到远程
git push origin feature/ai-detection

# 4. 创建Pull Request
# 在GitHub/GitLab上创建PR

# 5. 合并到develop
git checkout develop
git pull origin develop
git merge feature/ai-detection

# 6. 删除功能分支
git branch -d feature/ai-detection
git push origin --delete feature/ai-detection
```

### 2. 热修复流程
```bash
# 1. 从main创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/fix-image-loading

# 2. 修复并提交
git add .
git commit -m "fix(ui): 修复图片加载失败问题"

# 3. 推送并创建PR
git push origin hotfix/fix-image-loading

# 4. 合并到main和develop
git checkout main
git merge hotfix/fix-image-loading
git push origin main

git checkout develop
git merge hotfix/fix-image-loading
git push origin develop

# 5. 删除热修复分支
git branch -d hotfix/fix-image-loading
git push origin --delete hotfix/fix-image-loading
```

## 🚀 一键部署

### 1. 部署脚本
创建 `deploy.sh`:
```bash
#!/bin/bash

# 部署脚本
echo "🚀 开始部署..."

# 拉取最新代码
git pull origin main

# 构建后端
echo "📦 构建后端..."
cd backend
./mvnw clean package -DskipTests
cd ..

# 构建前端
echo "📦 构建前端..."
cd frontend
npm run build
cd ..

# 停止旧服务
echo "🛑 停止旧服务..."
pkill -f "java.*taoxichuan" || true

# 启动新服务
echo "🔄 启动新服务..."
nohup java -jar backend/target/taoxichuan-ai-assessment-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

echo "✅ 部署完成！"
echo "📊 查看日志: tail -f app.log"
```

### 2. 使用方法
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 3. Docker部署
创建 `Dockerfile`:
```dockerfile
# 多阶段构建
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.8-openjdk-11 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:resolve
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

创建 `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped
```

### 4. Docker部署命令
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🛠️ 常用Git命令

### 1. 基础操作
```bash
# 查看状态
git status

# 查看提交历史
git log --oneline --graph

# 查看分支
git branch -a

# 切换分支
git checkout develop

# 创建并切换分支
git checkout -b feature/new-feature
```

### 2. 撤销操作
```bash
# 撤销工作区修改
git checkout -- file.txt

# 撤销暂存区修改
git reset HEAD file.txt

# 撤销最后一次提交
git reset --soft HEAD~1

# 撤销最后一次提交（包括工作区）
git reset --hard HEAD~1
```

### 3. 合并和变基
```bash
# 合并分支
git merge feature/new-feature

# 变基分支
git rebase develop

# 解决冲突后继续
git add .
git rebase --continue
```

## ❓ 常见问题

### 1. 提交了不该提交的文件
```bash
# 删除文件并提交
git rm --cached file.txt
git commit -m "chore: 删除误提交的文件"

# 更新.gitignore
echo "file.txt" >> .gitignore
git add .gitignore
git commit -m "chore: 更新gitignore"
```

### 2. 推送被拒绝
```bash
# 拉取最新代码
git pull origin main

# 如果有冲突，解决后
git add .
git commit -m "fix: 解决合并冲突"
git push origin main
```

### 3. 查看文件修改历史
```bash
# 查看文件修改历史
git log -p file.txt

# 查看谁修改了某行
git blame file.txt
```

## 📊 Git Hooks

### 1. 提交前检查
创建 `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# 代码格式检查
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ 代码格式检查失败，请修复后提交"
    exit 1
fi

# 运行测试
npm test
if [ $? -ne 0 ]; then
    echo "❌ 测试失败，请修复后提交"
    exit 1
fi

echo "✅ 检查通过"
```

### 2. 安装Hooks
```bash
chmod +x .git/hooks/pre-commit
```

---

**📝 注意事项**:
1. 定期备份重要代码
2. 使用有意义的提交消息
3. 及时合并和清理分支
4. 保持.gitignore文件更新
5. 使用分支保护规则保护主分支

**🔗 相关文档**:
- [Git官方文档](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow)
