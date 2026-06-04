# 部署指南

## 1. 服务器准备

- 操作系统：Linux（推荐 Ubuntu 20.04+）或 macOS
- Node.js 18+、`npm`
- Python 3.8+（本地推理）
- 可选：Nginx 反向代理、HTTPS 证书

## 2. 部署步骤

```bash
git clone git@github.com:Dr-Zhao1980/YoloV11.git
cd YoloV11/brick-wall-detector

cp .env.example .env
# 编辑 PORT、API 密钥等

# 模型文件（不入库时需手动上传）
mkdir -p backend/models
# 复制 best.onnx 或 best.pt 至 backend/models/

npm ci
npm run build
npm start
```

验证：`curl http://localhost:3080/api/health`

## 3. 后台运行

```bash
nohup npm start > logs/server.log 2>&1 &
echo $! > logs/brick-wall-detector.pid
```

停止：

```bash
kill $(cat logs/brick-wall-detector.pid)
```

## 4. 反向代理（Nginx 示例）

```nginx
server {
    listen 80;
    server_name your.domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
    }
}
```

立面分析可能耗时较长，请适当增大 `proxy_read_timeout`。

## 5. 数据备份

| 路径 | 内容 |
|------|------|
| `backend/data/users.json` | 账号（若存在） |
| `backend/data/history.json` | 检测历史 |
| `backend/data/logs.json` | 系统日志 |
| `backend/data/facade-jobs/` | 立面任务 |
| `backend/uploads/` | 上传与切片图片 |

`.env` 含密钥，**勿提交 Git**。

## 6. 安全建议

- 修改默认管理员密码
- 生产环境限制 `/api/auth/register` 或仅内网开放
- 使用 HTTPS 与防火墙限制管理端口
- 定期清理 `backend/uploads/` 与过期 `facade-jobs`

## 7. 阿里云 ECS

安全组入方向放行 TCP `3080`（或 Nginx 的 80/443）。

## 8. 更新发布

```bash
git pull
npm ci
npm run build
# 重启 Node 进程
```
