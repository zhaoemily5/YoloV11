package com.taoxichuan.dto.detection;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 检测结果DTO
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-27
 */
@Data
@Accessors(chain = true)
public class DetectionResult {
    
    /**
     * 检测记录ID
     */
    private String recordId;
    
    /**
     * 建筑ID
     */
    private Long buildingId;
    
    /**
     * 分析时间
     */
    private LocalDateTime analysisTime;
    
    /**
     * 总损伤数量
     */
    private Integer totalDamages;
    
    /**
     * 损伤详情列表
     */
    private List<DamageInfo> damages;
    
    /**
     * 分析的图片路径列表
     */
    private List<String> imagePaths;
    
    /**
     * 损伤信息
     */
    @Data
    @Accessors(chain = true)
    public static class DamageInfo {
        
        /**
         * 损伤ID
         */
        private String id;
        
        /**
         * 损伤类型
         */
        private String damageType;
        
        /**
         * 严重程度
         */
        private String severityLevel;
        
        /**
         * 紧急程度
         */
        private String urgencyLevel;
        
        /**
         * 置信度（0-1）
         */
        private Double confidenceScore;
        
        /**
         * 描述
         */
        private String description;
        
        /**
         * 边界框X坐标
         */
        private Integer bboxX;
        
        /**
         * 边界框Y坐标
         */
        private Integer bboxY;
        
        /**
         * 边界框宽度
         */
        private Integer bboxWidth;
        
        /**
         * 边界框高度
         */
        private Integer bboxHeight;
        
        /**
         * 边界框数组（用于前端显示）
         */
        public Integer[] getBboxArray() {
            return new Integer[]{bboxX, bboxY, bboxWidth, bboxHeight};
        }
    }
}
