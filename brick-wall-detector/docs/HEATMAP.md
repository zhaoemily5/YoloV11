# 病害严重程度热力图

## 功能说明

在立面普查完成后，首页底部 **「病害严重程度热力图」** 模块可生成：

1. **纯热力图**：深色底 + heatmap.js 渐变色带  
2. **正射底图 + 热力层**：无检测框的 `sourceImageUrl` 裁切分析区后叠加半透明热力层  

## 点权重模式

| 模式 | 计算方式 |
|------|----------|
| 置信度 | 模型 confidence |
| 受损面积 | `areaM2 / max(areaM2)` |
| 严重程度 | 轻度~极严重 映射 0.35~1.0 |

权重线性归一化到 **1–100** 后传入 heatmap.js，便于区分高/低权重区域。

## 渲染参数

- **叠加强度**：热力层不透明度（约 20%–85%）
- **渲染半径**：**4 px ~ min(600, 短边×15%)**，步进 1 px  
  - 半径小：点状分布，三种权重差异明显  
  - 半径大：区域平滑，适合宏观汇总  

## 坐标对齐（v1.3.0+）

- 检测 `globalBbox` / `globalPolygon` 为 **全景像素坐标**
- 分析画布尺寸为 `stitchedWidth × stitchedHeight`（ROI 区域）
- 渲染前对坐标减去 `cropOffsetX/Y`
- 叠加底图从全景 `sourceImageUrl` 按相同偏移裁切，**不使用**带紫色框的 `stitchedImageUrl`

实现文件：

- `frontend/src/utils/severityHeatmapRenderer.ts`
- `frontend/src/components/FacadeSeverityHeatmapPanel.vue`
- `frontend/src/vendor/heatmap.js`（ESM + ImageData 兼容补丁）

## 导出

支持下载 PNG：纯热力图、叠加图。文件名带时间戳前缀（`reportFilename`）。
