#!/usr/bin/env bash
# ============================================================
#  Brick Wall Detector — 交互式服务控制面板
#  使用方式: ./service.sh
# ============================================================

# ---------- Config ----------
APP_NAME="brick-wall-detector"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENTRY="server.js"
PORT="${PORT:-3080}"

RUN_DIR="$APP_DIR/.runtime"
PID_FILE="$RUN_DIR/$APP_NAME.pid"
LOG_FILE="$RUN_DIR/$APP_NAME.log"

mkdir -p "$RUN_DIR"

# ---------- Colors ----------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ---------- Helpers ----------
get_pid() {
  [ -f "$PID_FILE" ] && cat "$PID_FILE" 2>/dev/null || true
}

is_running() {
  local pid
  pid=$(get_pid)
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

port_pid() {
  lsof -t -i:"$PORT" 2>/dev/null | head -1 || true
}

pause() {
  echo ""
  read -n 1 -s -r -p "按任意键返回主菜单..."
  echo ""
}

# ---------- Commands ----------
cmd_start() {
  if is_running; then
    warn "$APP_NAME 已经在运行中了，不需要重复启动哦。"
    return 0
  fi

  local existing
  existing=$(port_pid)
  if [ -n "$existing" ]; then
    warn "启动失败！因为端口 $PORT 已经被其他程序（编号 $existing）占用了。"
    warn "建议先在菜单里使用【2】停止服务，然后再试一次。"
    return 1
  fi

  if [ ! -d "$APP_DIR/dist" ]; then
    info "没有找到打包好的网页文件 (dist)，正在自动帮你构建..."
    cmd_build
  fi

  info "正在启动服务 (端口 $PORT)..."
  cd "$APP_DIR" || return 1
  
  nohup setsid env NODE_ENV=production PORT="$PORT" node "$ENTRY" \
    >> "$LOG_FILE" 2>&1 < /dev/null &
  local pid=$!
  echo "$pid" > "$PID_FILE"

  # 等待健康检查
  local i=0
  while [ $i -lt 15 ]; do
    sleep 0.5
    if curl -sf "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
      ok "太棒了，服务启动成功！"
      return 0
    fi
    i=$((i + 1))
  done

  err "启动似乎有点慢或者失败了，请在主菜单使用【5】查看日志排查问题。"
  return 1
}

cmd_stop() {
  local pid
  pid=$(get_pid)

  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
    warn "服务本来就没有在运行哦。"
    # fallback: 清理可能的占端口进程
    local rogue
    rogue=$(port_pid)
    if [ -n "$rogue" ]; then
      warn "不过发现端口 $PORT 依然被占用，正在强行清理..."
      kill "$rogue" 2>/dev/null || true
      sleep 1
      kill -9 "$rogue" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
    return 0
  fi

  info "正在关闭服务..."
  kill "$pid" 2>/dev/null || true

  # 等待退出
  local i=0
  while [ $i -lt 10 ] && kill -0 "$pid" 2>/dev/null; do
    sleep 0.3
    i=$((i + 1))
  done

  if kill -0 "$pid" 2>/dev/null; then
    warn "程序好像卡住了，正在强制结束..."
    kill -9 "$pid" 2>/dev/null || true
  fi

  rm -f "$PID_FILE"
  ok "服务已经彻底关闭了。"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  echo -e "\n${CYAN}====== 当前系统状态 ======${NC}"
  if is_running; then
    local pid
    pid=$(get_pid)
    
    # 提取通俗易懂的系统指标 (忽略报错)
    local stats=$(ps -p "$pid" -o %cpu=,%mem=,etime= 2>/dev/null)
    local cpu=$(echo "$stats" | awk '{print $1}')
    local mem=$(echo "$stats" | awk '{print $2}')
    local uptime=$(echo "$stats" | awk '{print $3}')
    
    [ -z "$cpu" ] && cpu="0.0"
    [ -z "$mem" ] && mem="0.0"
    [ -z "$uptime" ] && uptime="刚刚启动"

    echo -e "🟢 ${GREEN}运行状态${NC} : 正在运行中，一切正常！"
    echo -e "🌐 ${GREEN}访问网址${NC} : http://localhost:$PORT  (可以直接复制到浏览器打开)"
    echo -e "⏱️  ${YELLOW}已经运行${NC} : $uptime (格式: 小时:分钟:秒)"
    echo -e "💻 ${YELLOW}电脑负担${NC} : 消耗了 $cpu% 的 CPU，以及 $mem% 的内存"
    echo -e "📁 ${BLUE}运行记录${NC} : 保存在 $LOG_FILE (如果出错了可以看这里)"
    echo -e "⚙️  ${BLUE}后台编号${NC} : $pid"
  else
    echo -e "🔴 ${RED}运行状态${NC} : 服务目前是 ${YELLOW}关闭${NC} 状态。"
    
    local rogue
    rogue=$(port_pid)
    if [ -n "$rogue" ]; then
      echo -e "⚠️  ${RED}异常警告${NC} : 虽然你的服务没开，但是你要用的端口 ($PORT) 被其他不知名程序占用了！"
      echo -e "   👉 解决办法: 请先尝试在主菜单输入【2】来强制清理端口。"
    else
      echo -e "💡 ${GREEN}温馨提示${NC} : 你可以在菜单里输入【1】来启动它。"
    fi
  fi
  echo -e "${CYAN}==========================${NC}"
}

cmd_logs() {
  if [ ! -f "$LOG_FILE" ]; then
    warn "还没有产生任何日志文件哦。"
    return 1
  fi
  info "正在实时滚动显示日志..."
  info "【按 Ctrl+C 随时可以退出日志，返回主菜单】"
  echo "------------------------------------------------"
  # 查看日志时捕获 Ctrl+C，避免退出整个脚本
  trap 'echo -e "\n${YELLOW}>> 已退出日志查看${NC}"' SIGINT
  tail -n 100 -f "$LOG_FILE"
  # 恢复默认的 Ctrl+C 行为
  trap - SIGINT
}

cmd_build() {
  info "正在重新打包网页前端代码 (vite build)..."
  cd "$APP_DIR" || return 1
  npx vite build
  ok "打包完成！可以重新启动服务了。"
}

# ---------- Interactive Menu ----------
show_menu() {
  clear
  echo -e "${CYAN}============================================================${NC}"
  echo -e "${GREEN}             Brick Wall Detector — 服务控制面板             ${NC}"
  echo -e "${CYAN}============================================================${NC}"
  echo -e "  ${YELLOW}1.${NC} 🚀 启动服务  (Start)"
  echo -e "  ${YELLOW}2.${NC} ⏹️  停止服务  (Stop)"
  echo -e "  ${YELLOW}3.${NC} 🔄 重启服务  (Restart)"
  echo -e "  ${YELLOW}4.${NC} 📊 查看状态  (Status)"
  echo -e "  ${YELLOW}5.${NC} 📝 查看日志  (Logs)"
  echo -e "  ${YELLOW}6.${NC} 🛠️  重新构建  (Build Frontend)"
  echo -e "  ${YELLOW}0.${NC} 🚪 退出面板  (Exit)"
  echo -e "${CYAN}============================================================${NC}"
}

# 捕获 Ctrl+C 防止直接退出，提示用户使用 0 退出
trap 'echo -e "\n${YELLOW}提示: 请按 0 正规退出面板哦~${NC}"; sleep 1' SIGINT

while true; do
  show_menu
  read -r -p "👉 请输入你要执行的数字 [0-6]: " choice
  echo ""
  
  case "$choice" in
    1) cmd_start ; pause ;;
    2) cmd_stop ; pause ;;
    3) cmd_restart ; pause ;;
    4) cmd_status ; pause ;;
    5) cmd_logs ; pause ;;
    6) cmd_build ; pause ;;
    0) 
      info "拜拜！已退出控制面板。"
      trap - SIGINT # 恢复默认信号
      exit 0 
      ;;
    *) 
      err "哎呀，输错了！请输入 0 到 6 之间的数字。"
      sleep 1
      ;;
  esac
done