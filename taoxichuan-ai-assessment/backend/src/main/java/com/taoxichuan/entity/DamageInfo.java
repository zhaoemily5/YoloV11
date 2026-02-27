package com.taoxichuan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 损伤信息实体类
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_damage_info")
public class DamageInfo {
    
    /**
     * 损伤ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 检测记录ID
     */
    @TableField("record_id")
    private Long recordId;
    
    /**
     * 图片ID
     */
    @TableField("image_id")
    private Long imageId;
    
    /**
     * 损伤类型: 风化严重,裂缝扩展,泛碱现象,砖块脱落,表面污染,结构变形
     */
    @TableField("damage_type")
    private String damageType;
    
    /**
     * 严重程度: 轻度,中度,重度,严重
     */
    @TableField("severity_level")
    private String severityLevel;
    
    /**
     * 置信度(0-1)
     */
    @TableField("confidence_score")
    private BigDecimal confidenceScore;
    
    /**
     * 边界框X坐标
     */
    @TableField("bbox_x")
    private Integer bboxX;
    
    /**
     * 边界框Y坐标
     */
    @TableField("bbox_y")
    private Integer bboxY;
    
    /**
     * 边界框宽度
     */
    @TableField("bbox_width")
    private Integer bboxWidth;
    
    /**
     * 边界框高度
     */
    @TableField("bbox_height")
    private Integer bboxHeight;
    
    /**
     * 位置描述
     */
    @TableField("position_description")
    private String positionDescription;
    
    /**
     * 损伤面积(平方厘米)
     */
    @TableField("damage_area")
    private BigDecimal damageArea;
    
    /**
     * 处理建议
     */
    @TableField("treatment_advice")
    private String treatmentAdvice;
    
    /**
     * 紧急程度: 低,中,高,紧急
     */
    @TableField("urgency_level")
    private String urgencyLevel;
    
    /**
     * 预估修复费用(元)
     */
    @TableField("repair_cost_estimate")
    private BigDecimal repairCostEstimate;
    
    /**
     * 是否已人工核实: 1-是, 0-否
     */
    @TableField("verified")
    private Integer verified;
    
    /**
     * 核实人ID
     */
    @TableField("verified_by")
    private Long verifiedBy;
    
    /**
     * 核实时间
     */
    @TableField("verified_time")
    private LocalDateTime verifiedTime;
    
    /**
     * 备注
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
     * 关联的检测记录 (非数据库字段)
     */
    @TableField(exist = false)
    private DetectionRecord detectionRecord;
    
    /**
     * 关联的核实用户 (非数据库字段)
     */
    @TableField(exist = false)
    private User verifier;
    
    /**
     * 获取边界框数组 [x, y, width, height]
     */
    @TableField(exist = false)
    private int[] bboxArray;
    
    /**
     * 获取边界框数组
     */
    public int[] getBboxArray() {
        return new int[]{bboxX, bboxY, bboxWidth, bboxHeight};
    }
    
    /**
     * 设置边界框数组
     */
    public void setBboxArray(int[] bbox) {
        if (bbox != null && bbox.length == 4) {
            this.bboxX = bbox[0];
            this.bboxY = bbox[1];
            this.bboxWidth = bbox[2];
            this.bboxHeight = bbox[3];
        }
    }
}
