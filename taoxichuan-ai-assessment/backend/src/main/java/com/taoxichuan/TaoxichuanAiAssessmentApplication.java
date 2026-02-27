package com.taoxichuan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 陶溪川工业遗产AI智能损伤诊断评估系统
 * 主启动类
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class TaoxichuanAiAssessmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaoxichuanAiAssessmentApplication.class, args);
        System.out.println("=================================");
        System.out.println("陶溪川工业遗产AI智能损伤诊断评估系统启动成功!");
        System.out.println("API文档地址: http://localhost:8080/api/doc.html");
        System.out.println("=================================");
    }
}
