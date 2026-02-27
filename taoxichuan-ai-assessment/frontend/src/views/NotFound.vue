<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="$router.push('/')">
          返回首页
        </el-button>
        <el-button @click="$router.go(-1)">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面组件
</script>

<style lang="scss" scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  text-align: center;
  color: white;
  
  .error-code {
    font-size: 120px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }
  
  .error-message {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .error-description {
    font-size: 18px;
    margin-bottom: 40px;
    opacity: 0.9;
  }
  
  .error-actions {
    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
