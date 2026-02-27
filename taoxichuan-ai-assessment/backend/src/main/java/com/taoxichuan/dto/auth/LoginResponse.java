package com.taoxichuan.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 登录响应DTO
 */
@Data
@Schema(description = "登录响应")
public class LoginResponse {
    
    @Schema(description = "用户ID")
    private Long userId;
    
    @Schema(description = "用户名")
    private String username;
    
    @Schema(description = "真实姓名")
    private String realName;
    
    @Schema(description = "邮箱")
    private String email;
    
    @Schema(description = "手机号")
    private String phone;
    
    @Schema(description = "部门")
    private String department;
    
    @Schema(description = "角色")
    private String role;
    
    @Schema(description = "访问令牌")
    private String token;
    
    @Schema(description = "刷新令牌")
    private String refreshToken;
    
    @Schema(description = "令牌过期时间(秒)")
    private Integer expiresIn;
    
    @Schema(description = "令牌类型")
    private String tokenType;
}
