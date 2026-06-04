# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-02

### Added
- 病害严重程度热力图（heatmap.js）：纯热力图 + 无标注正射叠加图；三种点权重；可调渲染半径（4–600 px 量级）
- 墙坐标体系统一为 **米**（m），原点左下、X 右 Y 上
- 立面坐标导出、比例尺微调与 ROI 裁切支持（`cropOffsetX/Y`）
- 文档体系：`docs/`（API、部署、热力图、课题专章）；仓库根 `README.md`
- 前端 `vendor/heatmap.js` ESM 补丁（ImageData / h337 兼容）

### Changed
- 报告与导出移除费用估算、造价等不确定内容，仅保留可核实检测与统计项
- 立面热力图底图改用 `sourceImageUrl`，修复 ROI 坐标偏移与 bbox 格式误判
- 项目 README 全面重写，对齐当前目录结构（`frontend/` + `backend/`）

### Fixed
- heatmap.js 在 Vite 下 `Cannot assign to read only property 'data'` / `h337` 未定义
- 病害详细列表重复标题与空白占位
- Vite 开发服务器 SPA 回退导致页面无法加载

## [2.0.0] - 2026-05-21

### Added
- 本地 YOLOv11 模型推理支持（ONNX Runtime）
- 强制模型调用模式：模型失败直接返回错误，不回退演示数据
- 角色权限控制：管理员/普通用户区分
- 侧边栏折叠/展开 UI，支持移动端
- 历史记录、系统日志、系统设置功能
- 用户注册功能（新用户默认 role=user）
- 导出 ONNX 模型脚本（export_onnx.py）

### Changed
- 推理引擎：优先使用 ONNX Runtime（内存 < 2GB 时自动切换），避免 ultralytics OOM
- 移除 PAI API 回退和演示数据回退
- 移除 ONNX-Node.js 原生推理（使用 Python 子进程更稳定）
- 病害类别更新："脱落" → "植物附着"
- 版本升级：v1.0.0 → v2.0.0

### Fixed
- OOM 问题：大图推理时 Python 子进程被系统杀死（exit 137）
- 模型未调用问题：run_inference.py 的 main() 现在强制调用 infer_onnxruntime
- 错误日志截断问题：完整输出 Python 子进程 stderr/stdout/exit code
- NMS 参数名不匹配：iou_threshold → iou_thr

### Security
- 注册接口限制：禁止注册 admin 用户名
- 认证中间件：Bearer Token 验证，过期自动失效

## [1.0.0] - 2026-05-06

### Added
- Initial release
- Vue 3 + Express.js 架构
- 阿里云 PAI-EAS YOLOv11 集成
- 病害检测、修缮报告、AI 分析功能
