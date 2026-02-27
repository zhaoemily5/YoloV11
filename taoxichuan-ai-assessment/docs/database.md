# 数据库设计文档

## 数据库概述

本项目使用MySQL 8.0作为主数据库，采用InnoDB存储引擎，支持事务处理和外键约束。

## 数据库表设计

### 1. 用户信息表 (t_user)

用户基础信息和权限管理。

```sql
CREATE TABLE `t_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `real_name` varchar(100) NOT NULL COMMENT '真实姓名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `oa_user_id` varchar(50) DEFAULT NULL COMMENT 'OA系统用户ID',
  `department` varchar(100) DEFAULT NULL COMMENT '所属部门',
  `role` varchar(20) NOT NULL DEFAULT 'USER' COMMENT '用户角色: ADMIN,USER,VIEWER',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1-启用, 0-禁用',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `updated_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_oa_user_id` (`oa_user_id`),
  KEY `idx_department` (`department`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';
```

### 2. 建筑信息表 (t_building)

陶溪川工业遗产建筑基础信息。

```sql
CREATE TABLE `t_building` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '建筑ID',
  `building_code` varchar(50) NOT NULL COMMENT '建筑编码',
  `building_name` varchar(200) NOT NULL COMMENT '建筑名称',
  `building_type` varchar(50) NOT NULL COMMENT '建筑类型: 制瓷车间,烧制车间,包装车间,仓储车间,动力车间,办公楼',
  `description` text COMMENT '建筑描述',
  `address` varchar(500) DEFAULT NULL COMMENT '建筑地址',
  `build_year` int DEFAULT NULL COMMENT '建造年份',
  `area` decimal(10,2) DEFAULT NULL COMMENT '建筑面积(平方米)',
  `height` decimal(5,2) DEFAULT NULL COMMENT '建筑高度(米)',
  `structure_type` varchar(50) DEFAULT NULL COMMENT '结构类型',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1-正常, 0-停用',
  `model_file_path` varchar(500) DEFAULT NULL COMMENT '3D模型文件路径',
  `image_paths` json DEFAULT NULL COMMENT '建筑图片路径列表',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `updated_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_building_code` (`building_code`),
  KEY `idx_building_type` (`building_type`),
  KEY `idx_build_year` (`build_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='建筑信息表';
```

### 3. 检测记录表 (t_detection_record)

建筑损伤检测记录主表。

```sql
CREATE TABLE `t_detection_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '检测记录ID',
  `record_no` varchar(50) NOT NULL COMMENT '检测记录编号',
  `building_id` bigint NOT NULL COMMENT '建筑ID',
  `user_id` bigint NOT NULL COMMENT '检测用户ID',
  `detection_date` datetime NOT NULL COMMENT '检测时间',
  `weather_condition` varchar(100) DEFAULT NULL COMMENT '天气条件',
  `temperature` decimal(5,2) DEFAULT NULL COMMENT '温度(摄氏度)',
  `humidity` decimal(5,2) DEFAULT NULL COMMENT '湿度(%)',
  `image_count` int NOT NULL DEFAULT '0' COMMENT '检测图片数量',
  `total_damage_count` int NOT NULL DEFAULT '0' COMMENT '发现损伤总数',
  `detection_status` varchar(20) NOT NULL DEFAULT 'PROCESSING' COMMENT '检测状态: PROCESSING,COMPLETED,FAILED',
  `ai_model_version` varchar(50) DEFAULT NULL COMMENT '使用的AI模型版本',
  `detection_duration` int DEFAULT NULL COMMENT '检测耗时(秒)',
  `remarks` text COMMENT '备注信息',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_no` (`record_no`),
  KEY `idx_building_id` (`building_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_detection_date` (`detection_date`),
  KEY `idx_detection_status` (`detection_status`),
  CONSTRAINT `fk_detection_building` FOREIGN KEY (`building_id`) REFERENCES `t_building` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detection_user` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检测记录表';
```

### 4. 检测图片表 (t_detection_image)

检测过程中上传的图片信息。

```sql
CREATE TABLE `t_detection_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `record_id` bigint NOT NULL COMMENT '检测记录ID',
  `image_name` varchar(200) NOT NULL COMMENT '图片名称',
  `original_file_name` varchar(500) NOT NULL COMMENT '原始文件名',
  `file_path` varchar(500) NOT NULL COMMENT '文件存储路径',
  `file_size` bigint NOT NULL COMMENT '文件大小(字节)',
  `image_width` int DEFAULT NULL COMMENT '图片宽度',
  `image_height` int DEFAULT NULL COMMENT '图片高度',
  `file_format` varchar(10) DEFAULT NULL COMMENT '文件格式',
  `upload_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `analysis_status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT '分析状态: PENDING,PROCESSING,COMPLETED,FAILED',
  `analysis_time` datetime DEFAULT NULL COMMENT '分析完成时间',
  `damage_count` int NOT NULL DEFAULT '0' COMMENT '检测到的损伤数量',
  PRIMARY KEY (`id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_analysis_status` (`analysis_status`),
  CONSTRAINT `fk_image_record` FOREIGN KEY (`record_id`) REFERENCES `t_detection_record` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检测图片表';
```

### 5. 损伤信息表 (t_damage_info)

检测到的具体损伤信息。

```sql
CREATE TABLE `t_damage_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '损伤ID',
  `record_id` bigint NOT NULL COMMENT '检测记录ID',
  `image_id` bigint NOT NULL COMMENT '图片ID',
  `damage_type` varchar(50) NOT NULL COMMENT '损伤类型: 风化严重,裂缝扩展,泛碱现象,砖块脱落,表面污染,结构变形',
  `severity_level` varchar(20) NOT NULL COMMENT '严重程度: 轻度,中度,重度,严重',
  `confidence_score` decimal(5,4) NOT NULL COMMENT '置信度(0-1)',
  `bbox_x` int NOT NULL COMMENT '边界框X坐标',
  `bbox_y` int NOT NULL COMMENT '边界框Y坐标',
  `bbox_width` int NOT NULL COMMENT '边界框宽度',
  `bbox_height` int NOT NULL COMMENT '边界框高度',
  `position_description` varchar(500) DEFAULT NULL COMMENT '位置描述',
  `damage_area` decimal(10,4) DEFAULT NULL COMMENT '损伤面积(平方厘米)',
  `treatment_advice` text COMMENT '处理建议',
  `urgency_level` varchar(20) DEFAULT NULL COMMENT '紧急程度: 低,中,高,紧急',
  `repair_cost_estimate` decimal(10,2) DEFAULT NULL COMMENT '预估修复费用(元)',
  `verified` tinyint NOT NULL DEFAULT '0' COMMENT '是否已人工核实: 1-是, 0-否',
  `verified_by` bigint DEFAULT NULL COMMENT '核实人ID',
  `verified_time` datetime DEFAULT NULL COMMENT '核实时间',
  `remarks` text COMMENT '备注',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_image_id` (`image_id`),
  KEY `idx_damage_type` (`damage_type`),
  KEY `idx_severity_level` (`severity_level`),
  KEY `idx_confidence_score` (`confidence_score`),
  CONSTRAINT `fk_damage_record` FOREIGN KEY (`record_id`) REFERENCES `t_detection_record` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_damage_image` FOREIGN KEY (`image_id`) REFERENCES `t_detection_image` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_damage_verifier` FOREIGN KEY (`verified_by`) REFERENCES `t_user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='损伤信息表';
```

### 6. 评估报告表 (t_assessment_report)

生成的评估报告信息。

```sql
CREATE TABLE `t_assessment_report` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '报告ID',
  `report_no` varchar(50) NOT NULL COMMENT '报告编号',
  `record_id` bigint NOT NULL COMMENT '检测记录ID',
  `building_id` bigint NOT NULL COMMENT '建筑ID',
  `report_title` varchar(200) NOT NULL COMMENT '报告标题',
  `report_type` varchar(20) NOT NULL DEFAULT 'STANDARD' COMMENT '报告类型: STANDARD,DETAILED,SUMMARY',
  `total_damage_count` int NOT NULL DEFAULT '0' COMMENT '损伤总数',
  `severity_distribution` json DEFAULT NULL COMMENT '严重程度分布统计',
  `damage_type_distribution` json DEFAULT NULL COMMENT '损伤类型分布统计',
  `overall_assessment` text COMMENT '整体评估结论',
  `repair_recommendations` text COMMENT '修复建议',
  `estimated_cost` decimal(12,2) DEFAULT NULL COMMENT '预估总费用(元)',
  `report_file_path` varchar(500) DEFAULT NULL COMMENT '报告文件路径',
  `report_status` varchar(20) NOT NULL DEFAULT 'GENERATING' COMMENT '报告状态: GENERATING,COMPLETED,FAILED',
  `generated_by` bigint NOT NULL COMMENT '生成人ID',
  `generated_time` datetime DEFAULT NULL COMMENT '生成时间',
  `download_count` int NOT NULL DEFAULT '0' COMMENT '下载次数',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_report_no` (`report_no`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_building_id` (`building_id`),
  KEY `idx_generated_by` (`generated_by`),
  KEY `idx_report_status` (`report_status`),
  CONSTRAINT `fk_report_record` FOREIGN KEY (`record_id`) REFERENCES `t_detection_record` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_building` FOREIGN KEY (`building_id`) REFERENCES `t_building` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_generator` FOREIGN KEY (`generated_by`) REFERENCES `t_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评估报告表';
```

### 7. 系统配置表 (t_system_config)

系统配置参数。

```sql
CREATE TABLE `t_system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `config_desc` varchar(200) DEFAULT NULL COMMENT '配置描述',
  `config_type` varchar(20) NOT NULL DEFAULT 'STRING' COMMENT '配置类型: STRING,NUMBER,BOOLEAN,JSON',
  `is_encrypted` tinyint NOT NULL DEFAULT '0' COMMENT '是否加密: 1-是, 0-否',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
```

### 8. 操作日志表 (t_operation_log)

用户操作日志记录。

```sql
CREATE TABLE `t_operation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作用户名',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型',
  `operation_desc` varchar(500) DEFAULT NULL COMMENT '操作描述',
  `request_method` varchar(10) DEFAULT NULL COMMENT '请求方法',
  `request_url` varchar(500) DEFAULT NULL COMMENT '请求URL',
  `request_params` text COMMENT '请求参数',
  `response_result` text COMMENT '响应结果',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `execution_time` int DEFAULT NULL COMMENT '执行时间(毫秒)',
  `operation_status` varchar(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '操作状态: SUCCESS,FAILED',
  `error_message` text COMMENT '错误信息',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_created_time` (`created_time`),
  KEY `idx_operation_status` (`operation_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
```

## 初始化数据

### 建筑基础数据

```sql
INSERT INTO `t_building` (`building_code`, `building_name`, `building_type`, `description`, `build_year`, `area`, `height`) VALUES
('TXC-001', '1号厂房 - 原制瓷车间', '制瓷车间', '陶溪川原制瓷车间，主要用于陶瓷制作和加工', 1958, 1200.50, 15.2),
('TXC-002', '2号厂房 - 原烧制车间', '烧制车间', '陶溪川原烧制车间，配备传统龙窑和现代窑炉', 1960, 800.30, 12.8),
('TXC-003', '3号厂房 - 原包装车间', '包装车间', '陶溪川原包装车间，用于成品陶瓷包装和存储', 1962, 600.20, 10.5),
('TXC-004', '4号厂房 - 原仓储车间', '仓储车间', '陶溪川原仓储车间，存储原材料和成品', 1959, 1500.80, 18.0),
('TXC-005', '5号厂房 - 原动力车间', '动力车间', '陶溪川原动力车间，提供生产所需动力支持', 1961, 400.15, 8.5),
('TXC-006', '6号厂房 - 原办公楼', '办公楼', '陶溪川原办公楼，行政管理和办公场所', 1957, 900.45, 12.0);
```

### 系统配置数据

```sql
INSERT INTO `t_system_config` (`config_key`, `config_value`, `config_desc`, `config_type`) VALUES
('ai.model.provider', 'glm47', 'AI模型提供商', 'STRING'),
('ai.model.api.url', 'https://api.siliconflow.cn/v1/chat/completions', 'AI模型API地址', 'STRING'),
('ai.model.confidence.threshold', '0.7', 'AI识别置信度阈值', 'NUMBER'),
('file.upload.max.size', '10485760', '文件上传最大大小(字节)', 'NUMBER'),
('file.upload.allowed.types', 'jpg,jpeg,png', '允许上传的文件类型', 'STRING'),
('report.template.path', '/templates/report/', '报告模板路径', 'STRING'),
('sso.enabled', 'true', '是否启用单点登录', 'BOOLEAN'),
('system.version', '1.0.0', '系统版本', 'STRING');
```

### 默认管理员用户

```sql
INSERT INTO `t_user` (`username`, `real_name`, `email`, `oa_user_id`, `department`, `role`) VALUES
('admin', '系统管理员', 'admin@taoxichuan.com', 'OA-ADMIN', '信息技术部', 'ADMIN');
```

## 索引优化建议

### 复合索引

```sql
-- 检测记录查询优化
CREATE INDEX `idx_detection_building_user_date` ON `t_detection_record` (`building_id`, `user_id`, `detection_date`);

-- 损伤信息查询优化
CREATE INDEX `idx_damage_record_type_severity` ON `t_damage_info` (`record_id`, `damage_type`, `severity_level`);

-- 操作日志查询优化
CREATE INDEX `idx_log_user_time_status` ON `t_operation_log` (`user_id`, `created_time`, `operation_status`);
```

## 数据库维护

### 定期清理策略

1. **日志清理**: 保留最近6个月的操作日志
2. **临时文件清理**: 清理超过30天的临时上传文件
3. **报告备份**: 超过1年的报告进行归档备份

### 性能监控

1. **慢查询监控**: 监控执行时间超过1秒的查询
2. **连接池监控**: 监控数据库连接使用情况
3. **存储空间监控**: 监控表空间使用情况

## 备份策略

### 全量备份
- 每日凌晨2点进行全量备份
- 保留最近30天的全量备份文件

### 增量备份
- 每4小时进行增量备份
- 保留最近7天的增量备份文件

### 恢复测试
- 每月进行一次恢复测试
- 验证备份文件的完整性和可用性
