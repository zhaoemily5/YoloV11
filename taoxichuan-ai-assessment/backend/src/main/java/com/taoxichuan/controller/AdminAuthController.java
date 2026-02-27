package com.taoxichuan.controller;

import com.taoxichuan.common.result.Result;
import com.taoxichuan.dto.auth.AdminLoginRequest;
import com.taoxichuan.dto.auth.LoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.UUID;

/**
 * 管理员认证控制器
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "管理员认证", description = "管理员登录相关接口")
@Slf4j
public class AdminAuthController {

    // 权限开关 - 可以通过配置文件或环境变量控制
    private static final boolean ADMIN_LOGIN_ENABLED = true;
    
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "123";

    @PostMapping("/admin/login")
    @Operation(summary = "管理员登录", description = "使用用户名密码登录系统")
    public Result<LoginResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        log.info("管理员登录请求: username={}", request.getUsername());
        
        // 检查权限开关
        if (!ADMIN_LOGIN_ENABLED) {
            return Result.error(403, "管理员登录功能已关闭");
        }
        
        // 验证用户名密码
        if (!ADMIN_USERNAME.equals(request.getUsername()) || 
            !ADMIN_PASSWORD.equals(request.getPassword())) {
            log.warn("登录失败: 用户名或密码错误, username={}", request.getUsername());
            return Result.error(401, "用户名或密码错误");
        }
        
        // 生成登录响应
        LoginResponse response = new LoginResponse();
        response.setUserId(1L);
        response.setUsername("admin");
        response.setRealName("系统管理员");
        response.setEmail("admin@taoxichuan.com");
        response.setPhone("13800138000");
        response.setDepartment("系统管理部");
        response.setRole("ADMIN");
        response.setToken(UUID.randomUUID().toString());
        response.setRefreshToken(UUID.randomUUID().toString());
        response.setExpiresIn(7200);
        response.setTokenType("Bearer");
        
        log.info("管理员登录成功: username={}", request.getUsername());
        return Result.success("登录成功", response);
    }

    @GetMapping("/admin/status")
    @Operation(summary = "管理员登录状态", description = "检查管理员登录功能是否启用")
    public Result<Boolean> getAdminLoginStatus() {
        return Result.success("查询成功", ADMIN_LOGIN_ENABLED);
    }
}
