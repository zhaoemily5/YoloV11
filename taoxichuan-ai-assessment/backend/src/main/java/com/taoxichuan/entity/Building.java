package com.taoxichuan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 建筑信息实体类
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_building")
public class Building {
    
    /**
     * 建筑ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 建筑编码
     */
    @TableField("building_code")
    private String buildingCode;
    
    /**
     * 建筑名称
     */
    @TableField("building_name")
    private String buildingName;
    
    /**
     * 建筑类型: 制瓷车间,烧制车间,包装车间,仓储车间,动力车间,办公楼
     */
    @TableField("building_type")
    private String buildingType;
    
    /**
     * 建筑描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 建筑地址
     */
    @TableField("address")
    private String address;
    
    /**
     * 建造年份
     */
    @TableField("build_year")
    private Integer buildYear;
    
    /**
     * 建筑面积(平方米)
     */
    @TableField("area")
    private BigDecimal area;
    
    /**
     * 建筑高度(米)
     */
    @TableField("height")
    private BigDecimal height;
    
    /**
     * 结构类型
     */
    @TableField("structure_type")
    private String structureType;
    
    /**
     * 状态: 1-正常, 0-停用
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 3D模型文件路径
     */
    @TableField("model_file_path")
    private String modelFilePath;
    
    /**
     * 建筑图片路径列表 (JSON格式存储)
     */
    @TableField("image_paths")
    private String imagePaths;
    
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
     * 创建人
     */
    @TableField("created_by")
    private String createdBy;
    
    /**
     * 更新人
     */
    @TableField("updated_by")
    private String updatedBy;
    
    /**
     * 逻辑删除标识
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
    
    /**
     * 获取建筑图片路径列表
     */
    @TableField(exist = false)
    private List<String> imagePathList;
}
