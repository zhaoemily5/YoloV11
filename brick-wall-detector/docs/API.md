# API 参考

基础 URL：`http://<host>:3080`（默认端口见 `.env` 中 `PORT`）。

除注明外，JSON 请求使用 `Content-Type: application/json`。需登录的接口在 Header 携带 `Authorization: Bearer <token>`。

---

## 通用

### GET /api/health

健康检查。

```json
{ "status": "ok", "timestamp": "2026-06-02T12:00:00.000Z" }
```

### GET /api/model-defaults

返回默认置信度、IoU、推理尺寸等。

### GET /api/models

列出可用本地/远程模型信息。

---

## 单图检测

### POST /api/detect

`multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | File | 是 | JPG/PNG，≤10MB |
| brickLengthMm | number | 否 | 参考砖长 mm，默认 240 |
| confidence | number | 否 | 置信度阈值 |
| iou | number | 否 | NMS IoU |
| imgsz | number | 否 | 推理边长 |

响应含 `detections[]`（`class`, `confidence`, `bbox` [x,y,w,h], `area`, `severity`）、`summary`、`modelInfo`。

### GET /api/detect/:jobId/status

异步检测任务状态（若启用）。

### POST /api/report/generate

请求体：`{ "detectionResult": { ... } }`  
返回结构化修缮报告 JSON。

### POST /api/quality-check

`multipart/form-data`，字段 `image`。返回亮度、模糊、分辨率等质量提示。

---

## 立面普查

### POST /api/facade/upload

`multipart/form-data`，字段 `panorama`。可选表单项：项目名称、墙面尺寸、网格模式等。

### POST /api/facade/analyze/:jobId

启动切片推理。可选 ROI：`cropX`, `cropY`, `cropWidth`, `cropHeight`。

### GET /api/facade/job/:jobId

轮询任务：`status`, `progress`, `detections`, `grids`, `stitchedImageUrl`, `sourceImageUrl`, `cropOffsetX/Y`, `stitchedWidth/Height` 等。

### POST /api/facade/cancel/:jobId

取消进行中的分析。

### POST /api/facade/calibrate-scale/:jobId

### POST /api/facade/manual-scale/:jobId

比例尺标定（像素 ↔ 米）。

### GET /api/facade/export-coords/:jobId

导出病害墙坐标（**米**，原点左下）。

### GET /api/facade/report/:jobId

整墙修缮报告 JSON。

---

## AI 服务（可选）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/analyze` | 检测结果智能分析 |
| POST | `/api/ai/chat` | 对话 |
| GET | `/api/ai/status` | 当前可用 AI 提供方 |

---

## 认证与管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册 |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/history` | 历史记录（分页） |
| GET | `/api/logs` | 系统日志 |
| GET/PUT | `/api/settings` | 系统设置（管理员） |

具体字段以 `backend/server.js` 与 `frontend/src/api/` 为准。

---

## 坐标约定

- **像素**：图像左上角为原点，用于 `bbox`、`globalBbox` [x, y, w, h]。
- **墙坐标**：原点左下，X 向右、Y 向上，单位 **米**（`facadeCoordTransform.ts`）。
- **立面热力图**：检测点先减去 `cropOffset`，再映射到分析区画布（见 [HEATMAP.md](HEATMAP.md)）。
