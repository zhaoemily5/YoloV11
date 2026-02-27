package com.taoxichuan.dto.detection;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 检测请求DTO
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-27
 */
@Data
@Accessors(chain = true)
public class DetectionRequest {
    
    /**
     * 建筑ID
     */
    private Long buildingId;
    
    /**
     * 天气条件
     */
    private String weatherCondition;
    
    /**
     * 温度（摄氏度）
     */
    private Integer temperature;
    
    /**
     * 湿度（百分比）
     */
    private Integer humidity;
    
    /**
     * 上传的文件列表
     */
    private List<String> fileNames;
}
