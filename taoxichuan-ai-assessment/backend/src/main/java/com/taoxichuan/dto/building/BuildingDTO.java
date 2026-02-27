package com.taoxichuan.dto.building;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 建筑DTO
 */
@Data
@Schema(description = "建筑信息")
public class BuildingDTO {
    
    @Schema(description = "建筑ID")
    private Long id;
    
    @Schema(description = "建筑编号")
    private String buildingCode;
    
    @Schema(description = "建筑名称")
    private String buildingName;
    
    @Schema(description = "建筑类型")
    private String buildingType;
    
    @Schema(description = "建筑地址")
    private String address;
    
    @Schema(description = "建造年份")
    private Integer buildYear;
    
    @Schema(description = "建筑面积(m²)")
    private Double area;
    
    @Schema(description = "结构类型")
    private String structureType;
    
    @Schema(description = "状态: 0-未检测, 1-检测中, 2-已完成")
    private Integer status;
    
    @Schema(description = "模型文件路径")
    private String modelFilePath;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdTime;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedTime;
}
