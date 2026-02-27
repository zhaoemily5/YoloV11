package com.taoxichuan.controller;

import com.taoxichuan.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 健康检查控制器
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@RestController
@RequestMapping("/health")
@Tag(name = "健康检查", description = "系统健康状态检查")
public class HealthController {
    
    @GetMapping
    @Operation(summary = "健康检查", description = "检查系统运行状态")
    public Result<String> health() {
        return Result.success("系统运行正常", "陶溪川工业遗产AI智能损伤诊断评估系统");
    }
}
