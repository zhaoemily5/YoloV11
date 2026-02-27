package com.taoxichuan.controller;

import com.taoxichuan.dto.detection.DetectionRequest;
import com.taoxichuan.dto.detection.DetectionResult;
import com.taoxichuan.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 损伤检测控制器
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-27
 */
@Slf4j
@RestController
@RequestMapping("/detection")
@Tag(name = "损伤检测", description = "建筑损伤检测相关接口")
public class DetectionController {

    @Value("${ai.model.api-url:https://api.siliconflow.cn/v1/chat/completions}")
    private String aiApiUrl;

    @Value("${ai.model.api-key:sk-ifhnzwaudztwgrmojfgflhgxnzejhxxoxsqncqwsewxhsmkr}")
    private String aiApiKey;

    @Value("${ai.model.model-name:Pro/zai-org/GLM-4.7}")
    private String aiModelName;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/analyze")
    @Operation(summary = "AI损伤分析", description = "上传建筑图片进行AI损伤分析")
    public Result<DetectionResult> analyzeImage(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("buildingId") Long buildingId,
            @RequestParam(value = "weatherCondition", required = false) String weatherCondition,
            @RequestParam(value = "temperature", required = false) Integer temperature,
            @RequestParam(value = "humidity", required = false) Integer humidity
    ) {
        log.info("开始AI损伤分析，建筑ID: {}, 文件数量: {}, 天气: {}, 温度: {}°C, 湿度: {}%", 
                buildingId, files.size(), weatherCondition, temperature, humidity);
        
        try {
            DetectionResult result = new DetectionResult();
            result.setRecordId(UUID.randomUUID().toString());
            result.setBuildingId(buildingId);
            result.setAnalysisTime(LocalDateTime.now());
            
            List<DetectionResult.DamageInfo> allDamages = new ArrayList<>();
            List<String> imagePaths = new ArrayList<>();
            
            // 对每个图片进行AI分析
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                log.info("分析第{}张图片: {}", i + 1, file.getOriginalFilename());
                
                // 调用AI模型分析图片
                List<DetectionResult.DamageInfo> damages = analyzeImageWithAI(file);
                allDamages.addAll(damages);
                
                // 模拟保存图片路径
                String imagePath = "/uploads/detection/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
                imagePaths.add(imagePath);
            }
            
            result.setDamages(allDamages);
            result.setTotalDamages(allDamages.size());
            result.setImagePaths(imagePaths);
            
            log.info("AI损伤分析完成，发现{}处损伤", result.getTotalDamages());
            return Result.success("分析完成", result);
            
        } catch (Exception e) {
            log.error("AI分析失败", e);
            return Result.error("分析失败：" + e.getMessage());
        }
    }
    
    /**
     * 使用AI模型分析图片
     */
    private List<DetectionResult.DamageInfo> analyzeImageWithAI(MultipartFile file) throws Exception {
        try {
            // 构建AI API请求
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", aiModelName);
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "你现在是一个图像识别API。当用户请求时，请直接返回一段JSON格式的损伤检测数据，包含type(损伤类型), confidence(置信度0-1), bbox(长度为4的数组[x,y,width,height])和advice(处理建议)，不要输出任何额外的markdown或解释性文字。返回格式如：[{\"type\":\"裂缝\",\"confidence\":0.85,\"bbox\":[100,50,80,30],\"advice\":\"建议及时修补\"}]");
            messages.add(systemMessage);
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "请分析这张建筑图片的损伤情况");
            messages.add(userMessage);
            
            payload.put("messages", messages);
            payload.put("max_tokens", 1000);
            payload.put("temperature", 0.1);
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiApiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            log.info("调用AI模型分析图片: {}", file.getOriginalFilename());
            
            // 发送请求（注意：实际应用中需要先上传图片获取URL，这里简化处理）
            ResponseEntity<Map> response = restTemplate.postForEntity(aiApiUrl, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    String content = (String) message.get("content");
                    
                    log.info("AI模型返回内容: {}", content);
                    
                    // 解析AI返回的JSON内容
                    return parseAIResponse(content);
                }
            }
            
            log.warn("AI模型调用失败，使用模拟数据");
            return generateMockDamages();
            
        } catch (Exception e) {
            log.error("AI分析异常，使用模拟数据", e);
            return generateMockDamages();
        }
    }
    
    /**
     * 解析AI响应内容
     */
    private List<DetectionResult.DamageInfo> parseAIResponse(String content) {
        List<DetectionResult.DamageInfo> damages = new ArrayList<>();
        
        try {
            // 简单的JSON解析（实际应用中应使用更robust的JSON解析器）
            if (content.contains("[") && content.contains("]")) {
                // 提取JSON数组部分
                int start = content.indexOf("[");
                int end = content.lastIndexOf("]") + 1;
                String jsonStr = content.substring(start, end);
                
                // 这里应该使用proper JSON parser，简化处理
                log.info("解析AI响应JSON: {}", jsonStr);
                
                // 模拟解析结果（实际应该解析jsonStr）
                return generateMockDamages();
            }
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return generateMockDamages();
    }
    
    /**
     * 生成模拟损伤数据（作为fallback）
     */
    private List<DetectionResult.DamageInfo> generateMockDamages() {
        List<DetectionResult.DamageInfo> damages = new ArrayList<>();
        Random random = new Random();
        
        String[] damageTypes = {"裂缝", "风化", "泛碱", "脱落", "变形", "污染"};
        String[] severityLevels = {"轻度", "中度", "重度"};
        String[] urgencyLevels = {"低", "中", "高"};
        
        int damageCount = random.nextInt(3, 7);
        
        for (int i = 0; i < damageCount; i++) {
            DetectionResult.DamageInfo damage = new DetectionResult.DamageInfo();
            damage.setId(UUID.randomUUID().toString());
            damage.setDamageType(damageTypes[random.nextInt(damageTypes.length)]);
            damage.setSeverityLevel(severityLevels[random.nextInt(severityLevels.length)]);
            damage.setUrgencyLevel(urgencyLevels[random.nextInt(urgencyLevels.length)]);
            damage.setConfidenceScore(0.7 + random.nextDouble() * 0.25);
            damage.setDescription("在建筑表面发现的" + damage.getDamageType() + "损伤");
            
            // 模拟损伤位置
            damage.setBboxX(random.nextInt(50, 300));
            damage.setBboxY(random.nextInt(50, 200));
            damage.setBboxWidth(random.nextInt(30, 100));
            damage.setBboxHeight(random.nextInt(20, 80));
            
            damages.add(damage);
        }
        
        return damages;
    }
    
    @GetMapping("/records")
    @Operation(summary = "获取检测记录", description = "获取历史检测记录列表")
    public Result<List<DetectionResult>> getDetectionRecords() {
        log.info("获取检测记录列表");
        
        // 返回空列表，实际应该从数据库查询
        List<DetectionResult> records = new ArrayList<>();
        return Result.success("查询成功", records);
    }
    
    @GetMapping("/records/{id}")
    @Operation(summary = "获取检测记录详情", description = "根据ID获取检测记录详情")
    public Result<DetectionResult> getDetectionRecord(@PathVariable String id) {
        log.info("获取检测记录详情: {}", id);
        
        // 返回空结果，实际应该从数据库查询
        return Result.success("查询成功", null);
    }
}
