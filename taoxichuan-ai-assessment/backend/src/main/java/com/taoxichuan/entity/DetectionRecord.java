package com.taoxichuan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检测记录实体类
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_detection_record")
public class DetectionRecord {
    
    /**
     * 检测记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 检测记录编号
     */
    @TableField("record_no")
    private String recordNo;
    
    /**
     * 建筑ID
     */
    @TableField("building_id")
    private Long buildingId;
    
    /**
     * 检测用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 检测时间
     */
    @TableField("detection_date")
    private LocalDateTime detectionDate;
    
    /**
     * 天气条件
     */
    @TableField("weather_condition")
    private String weatherCondition;
    
    /**
     * 温度(摄氏度)
     */
    @TableField("temperature")
    private BigDecimal temperature;
    
    /**
     * 湿度(%)
     */
    @TableField("humidity")
    private BigDecimal humidity;
    
    /**
     * 检测图片数量
     */
    @TableField("image_count")
    private Integer imageCount;
    
    /**
     * 发现损伤总数
     */
    @TableField("total_damage_count")
    private Integer totalDamageCount;
    
    /**
     * 检测状态: PROCESSING,COMPLETED,FAILED
     */
    @TableField("detection_status")
    private String detectionStatus;
    
    /**
     * 使用的AI模型版本
     */
    @TableField("ai_model_version")
    private String aiModelVersion;
    
    /**
     * 检测耗时(秒)
     */
    @TableField("detection_duration")
    private Integer detectionDuration;
    
    /**
     * 备注信息
     */
    @TableField("remarks")
    private String remarks;
    
    /**
     * 创建时间
     */
    @TableField(value = "created_time", fill = FieldFill.INSERT)
    private LocalDateTime createdTime;
    
    /**
     * 更新时间
     */
    @TableField(value = "updated_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedTime;
    
    /**
     * 逻辑删除标识
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
    
    /**
     * 关联的建筑信息 (非数据库字段)
     */
    @TableField(exist = false)
    private Building building;
    
    /**
     * 关联的用户信息 (非数据库字段)
     */
    @TableField(exist = false)
    private User user;
}
