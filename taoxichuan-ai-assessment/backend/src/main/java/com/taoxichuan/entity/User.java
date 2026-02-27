package com.taoxichuan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户信息实体类
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_user")
public class User {
    
    /**
     * 用户ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户名
     */
    @TableField("username")
    private String username;
    
    /**
     * 真实姓名
     */
    @TableField("real_name")
    private String realName;
    
    /**
     * 邮箱
     */
    @TableField("email")
    private String email;
    
    /**
     * 手机号
     */
    @TableField("phone")
    private String phone;
    
    /**
     * OA系统用户ID
     */
    @TableField("oa_user_id")
    private String oaUserId;
    
    /**
     * 所属部门
     */
    @TableField("department")
    private String department;
    
    /**
     * 用户角色: ADMIN,USER,VIEWER
     */
    @TableField("role")
    private String role;
    
    /**
     * 状态: 1-启用, 0-禁用
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 最后登录时间
     */
    @TableField("last_login_time")
    private LocalDateTime lastLoginTime;
    
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
}
