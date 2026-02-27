# Git快速启动指南

## 🚀 快速开始

### 1. 初始化Git仓库
```bash
# 在项目根目录执行
git init
git add .
git commit -m "feat: 初始化YoloV11 AI评估系统"
```

### 2. 连接远程仓库
```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/YoloV11.git

# 推送到远程
git branch -M main
git push -u origin main
```

## 📋 一键部署

### 完整部署
```bash
# 执行完整部署流程
./deploy.sh
```

### 其他部署选项
```bash
# 仅构建，不启动服务
./deploy.sh build-only

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看服务状态
./deploy.sh status

# 查看实时日志
./deploy.sh logs

# 显示帮助
./deploy.sh help
```

## 🌿 日常开发流程

### 1. 创建功能分支
```bash
git checkout -b feature/new-feature
```

### 2. 开发和提交
```bash
# 添加文件
git add .

# 提交（遵循提交规范）
git commit -m "feat(detection): 添加新的检测功能"

# 推送到远程
git push origin feature/new-feature
```

### 3. 合并到主分支
```bash
# 切换到主分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并功能分支
git merge feature/new-feature

# 推送
git push origin main

# 删除功能分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

## 📝 提交规范

### 格式
```
<type>(<scope>): <subject>
```

### 类型说明
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建工具

### 示例
```bash
git commit -m "feat(ai): 添加AI损伤检测功能"
git commit -m "fix(ui): 修复图片加载失败问题"
git commit -m "docs(readme): 更新安装说明"
```

## 🛠️ 常用命令

### 查看状态
```bash
git status                    # 查看工作区状态
git log --oneline --graph     # 查看提交历史
git branch -a                 # 查看所有分支
```

### 撤销操作
```bash
git checkout -- file.txt     # 撤销文件修改
git reset HEAD file.txt      # 撤销暂存
git reset --soft HEAD~1       # 撤销最后一次提交
```

### 分支操作
```bash
git branch new-branch        # 创建分支
git checkout new-branch      # 切换分支
git merge feature-branch     # 合并分支
```

## 📊 项目结构

```
YoloV11/
├── .gitignore              # Git忽略文件
├── deploy.sh               # 一键部署脚本
├── docs/                   # 文档目录
│   ├── GIT_MANAGEMENT.md   # Git管理详细指南
│   └── ...
├── backend/                # 后端代码
├── frontend/               # 前端代码
└── README.md              # 项目说明
```

## ❓ 常见问题

### Q: 如何处理合并冲突？
```bash
# 解决冲突后
git add .
git commit -m "fix: 解决合并冲突"
```

### Q: 如何撤销提交？
```bash
# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1
```

### Q: 如何查看文件修改历史？
```bash
git log -p file.txt
git blame file.txt
```

## 🔗 相关文档

- [Git管理详细指南](docs/GIT_MANAGEMENT.md)
- [项目README](README.md)
- [API文档](docs/api.md)

---

**💡 提示**: 首次使用前请确保已安装Git、Java、Node.js等必要工具。
