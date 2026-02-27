package com.taoxichuan.common.result;

/**
 * 响应状态码枚举
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
public enum ResultCode {
    
    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),
    
    /**
     * 创建成功
     */
    CREATED(201, "创建成功"),
    
    /**
     * 客户端错误
     */
    BAD_REQUEST(400, "请求参数错误"),
    
    /**
     * 未授权
     */
    UNAUTHORIZED(401, "未授权"),
    
    /**
     * 禁止访问
     */
    FORBIDDEN(403, "禁止访问"),
    
    /**
     * 资源不存在
     */
    NOT_FOUND(404, "资源不存在"),
    
    /**
     * 方法不允许
     */
    METHOD_NOT_ALLOWED(405, "方法不允许"),
    
    /**
     * 请求超时
     */
    REQUEST_TIMEOUT(408, "请求超时"),
    
    /**
     * 冲突
     */
    CONFLICT(409, "资源冲突"),
    
    /**
     * 请求实体过大
     */
    PAYLOAD_TOO_LARGE(413, "请求实体过大"),
    
    /**
     * 服务器内部错误
     */
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    
    /**
     * 服务不可用
     */
    SERVICE_UNAVAILABLE(503, "服务不可用"),
    
    /**
     * 通用错误
     */
    ERROR(500, "操作失败"),
    
    // ==================== 业务错误码 ====================
    
    /**
     * 用户名或密码错误
     */
    USER_PASSWORD_ERROR(1001, "用户名或密码错误"),
    
    /**
     * Token已过期
     */
    TOKEN_EXPIRED(1002, "Token已过期"),
    
    /**
     * Token无效
     */
    TOKEN_INVALID(1003, "Token无效"),
    
    /**
     * 权限不足
     */
    PERMISSION_DENIED(1004, "权限不足"),
    
    /**
     * 用户不存在
     */
    USER_NOT_FOUND(1005, "用户不存在"),
    
    /**
     * 用户已存在
     */
    USER_ALREADY_EXISTS(1006, "用户已存在"),
    
    /**
     * 建筑信息不存在
     */
    BUILDING_NOT_FOUND(2001, "建筑信息不存在"),
    
    /**
     * 建筑编码已存在
     */
    BUILDING_CODE_EXISTS(2002, "建筑编码已存在"),
    
    /**
     * 检测记录不存在
     */
    DETECTION_RECORD_NOT_FOUND(3001, "检测记录不存在"),
    
    /**
     * 图片格式不支持
     */
    IMAGE_FORMAT_NOT_SUPPORTED(3002, "图片格式不支持"),
    
    /**
     * 图片大小超限
     */
    IMAGE_SIZE_EXCEEDED(3003, "图片大小超限"),
    
    /**
     * AI分析失败
     */
    AI_ANALYSIS_FAILED(3004, "AI分析失败"),
    
    /**
     * 检测正在进行中
     */
    DETECTION_IN_PROGRESS(3005, "检测正在进行中"),
    
    /**
     * 报告不存在
     */
    REPORT_NOT_FOUND(4001, "报告不存在"),
    
    /**
     * 报告生成失败
     */
    REPORT_GENERATION_FAILED(4002, "报告生成失败"),
    
    /**
     * 文件不存在
     */
    FILE_NOT_FOUND(5001, "文件不存在"),
    
    /**
     * 文件上传失败
     */
    FILE_UPLOAD_FAILED(5002, "文件上传失败"),
    
    /**
     * 文件类型不支持
     */
    FILE_TYPE_NOT_SUPPORTED(5003, "文件类型不支持"),
    
    /**
     * 存储空间不足
     */
    STORAGE_SPACE_INSUFFICIENT(5004, "存储空间不足"),
    
    /**
     * 系统内部错误
     */
    SYSTEM_INTERNAL_ERROR(9001, "系统内部错误"),
    
    /**
     * 数据库连接失败
     */
    DATABASE_CONNECTION_FAILED(9002, "数据库连接失败"),
    
    /**
     * 缓存服务异常
     */
    CACHE_SERVICE_ERROR(9003, "缓存服务异常"),
    
    /**
     * 外部服务调用失败
     */
    EXTERNAL_SERVICE_ERROR(9004, "外部服务调用失败"),
    
    /**
     * 网络连接异常
     */
    NETWORK_CONNECTION_ERROR(9005, "网络连接异常");
    
    private final Integer code;
    private final String message;
    
    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
}
