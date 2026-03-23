<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>📚 书单 / 🎬 影单管理工具</h2>
          <p class="subtitle">请先登录</p>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="60px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="tips">
        默认账号：admin<br>
        默认密码：123456
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api, { setToken } from '../api'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const res = await api.login(form.username, form.password)
      if (res.code === 200) {
        setToken(res.data.token)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      }
    } catch (error) {
      // Error already handled in interceptor
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.subtitle {
  margin: 5px 0 0;
  color: #999;
  font-size: 14px;
}

.tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 1.8;
}

:deep(.el-card) {
  border-radius: 12px;
}
</style>