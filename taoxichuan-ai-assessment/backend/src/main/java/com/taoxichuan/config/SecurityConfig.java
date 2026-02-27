package com.taoxichuan.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 安全配置
 * 
 * @author 赵正楠
 * @version 1.0.0
 * @since 2024-02-26
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/health/**", "/actuator/**", "/auth/admin/**", "/buildings/**", "/detection/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
