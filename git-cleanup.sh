#!/bin/bash

# 🧹 Git清理脚本
# 用于清理已提交的忽略文件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    log_error "当前目录不是Git仓库"
    exit 1
fi

log_info "开始清理已提交的忽略文件..."

# 清理编译产物
log_info "清理编译产物..."
git rm -r --cached backend/target/ 2>/dev/null || true
git rm -r --cached frontend/node_modules/ 2>/dev/null || true
git rm -r --cached frontend/dist/ 2>/dev/null || true
git rm -r --cached frontend/build/ 2>/dev/null || true
git rm -r --cached frontend/.nuxt/ 2>/dev/null || true
git rm -r --cached frontend/.output/ 2>/dev/null || true
git rm -r --cached frontend/.vite/ 2>/dev/null || true

# 清理日志文件
log_info "清理日志文件..."
git rm --cached *.log 2>/dev/null || true
git rm --cached backend/backend.log 2>/dev/null || true
git rm --cached frontend/frontend.log 2>/dev/null || true
git rm --cached frontend/cpolar.log 2>/dev/null || true
git rm -r --cached logs/ 2>/dev/null || true
git rm -r --cached backend/logs/ 2>/dev/null || true
git rm -r --cached frontend/logs/ 2>/dev/null || true

# 清理配置文件
log_info "清理配置文件..."
git rm --cached frontend/.env 2>/dev/null || true
git rm --cached frontend/.env.local 2>/dev/null || true
git rm --cached frontend/.env.development.local 2>/dev/null || true
git rm --cached frontend/.env.test.local 2>/dev/null || true
git rm --cached frontend/.env.production.local 2>/dev/null || true

# 清理自动生成文件
log_info "清理自动生成文件..."
git rm --cached frontend/auto-imports.d.ts 2>/dev/null || true
git rm --cached frontend/components.d.ts 2>/dev/null || true
git rm --cached frontend/.eslintrc-auto-import.json 2>/dev/null || true
git rm --cached frontend/*.tsbuildinfo 2>/dev/null || true

# 清理临时文件
log_info "清理临时文件..."
git rm --cached "index(*).html" 2>/dev/null || true
git rm --cached "通话录音.md" 2>/dev/null || true
git rm --cached "ToDoList.md" 2>/dev/null || true
git rm --cached test-*.html 2>/dev/null || true
git rm --cached demo-*.html 2>/dev/null || true

# 清理首页文件
log_info "清理首页文件..."
git rm --cached index.html 2>/dev/null || true
git rm --cached home.html 2>/dev/null || true
git rm --cached main.html 2>/dev/null || true
git rm --cached demo.html 2>/dev/null || true

# 清理脚本文件
log_info "清理脚本文件..."
git rm --cached deploy.sh 2>/dev/null || true
git rm --cached quick-start.sh 2>/dev/null || true
git rm --cached start.sh 2>/dev/null || true
git rm --cached stop.sh 2>/dev/null || true
git rm --cached restart.sh 2>/dev/null || true
git rm --cached build.sh 2>/dev/null || true
git rm --cached install.sh 2>/dev/null || true
git rm --cached setup.sh 2>/dev/null || true

# 清理第三方库
log_info "清理第三方库..."
git rm -r --cached third-party/ 2>/dev/null || true
git rm -r --cached vendor/ 2>/dev/null || true
git rm -r --cached lib/ 2>/dev/null || true
git rm -r --cached libs/ 2>/dev/null || true
git rm -r --cached external/ 2>/dev/null || true
git rm -r --cached deps/ 2>/dev/null || true
git rm -r --cached dependencies/ 2>/dev/null || true
git rm -r --cached downloads/ 2>/dev/null || true
git rm -r --cached packages/ 2>/dev/null || true

# 清理前端第三方库
log_info "清理前端第三方库..."
git rm -r --cached frontend/vendor/ 2>/dev/null || true
git rm -r --cached frontend/lib/ 2>/dev/null || true
git rm -r --cached frontend/libs/ 2>/dev/null || true
git rm -r --cached frontend/third-party/ 2>/dev/null || true

# 清理IDE文件
log_info "清理IDE文件..."
git rm -r --cached .idea/ 2>/dev/null || true
git rm -r --cached .vscode/ 2>/dev/null || true
git rm --cached *.iml 2>/dev/null || true
git rm --cached *.ipr 2>/dev/null || true
git rm --cached *.iws 2>/dev/null || true

# 清理操作系统文件
log_info "清理操作系统文件..."
git rm --cached .DS_Store 2>/dev/null || true
git rm --cached Thumbs.db 2>/dev/null || true
git rm --cached Desktop.ini 2>/dev/null || true

# 清理缓存文件
log_info "清理缓存文件..."
git rm -r --cached frontend/.cache/ 2>/dev/null || true
git rm -r --cached frontend/.temp/ 2>/dev/null || true
git rm --cached frontend/.eslintcache 2>/dev/null || true
git rm -r --cached frontend/.parcel-cache/ 2>/dev/null || true
git rm -r --cached .npm/ 2>/dev/null || true

# 清理上传文件
log_info "清理上传文件..."
git rm -r --cached uploads/ 2>/dev/null || true
git rm -r --cached upload/ 2>/dev/null || true
git rm -r --cached temp/ 2>/dev/null || true
git rm -r --cached static/upload/ 2>/dev/null || true

# 提交清理
log_info "提交清理..."
git add .gitignore
git commit -m "chore: 清理已提交的忽略文件，优化版本控制"

log_success "清理完成！"
log_info "仓库现在更加清洁，只包含必要的源代码文件。"

# 显示仓库状态
echo
log_info "当前仓库状态："
git status --short

# 显示仓库大小变化
echo
log_info "仓库统计信息："
echo "提交数量: $(git rev-list --count HEAD)"
echo "分支数量: $(git branch | wc -l)"
echo "远程仓库: $(git remote show)"

log_success "Git清理完成！"
