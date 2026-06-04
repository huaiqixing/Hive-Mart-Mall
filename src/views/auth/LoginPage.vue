<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo & Title -->
      <div class="login-header">
        <router-link to="/" class="logo">{{ configStore.mallName }}</router-link>
        <p class="login-subtitle">{{ activeTab === 'register' ? '欢迎注册' : '欢迎登录' }}</p>
      </div>

      <!-- Tabs -->
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- Password Login Tab -->
        <el-tab-pane label="密码登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            size="large"
            @submit.prevent="handlePasswordLogin"
          >
            <el-form-item prop="mobile">
              <el-input
                v-model="passwordForm.mobile"
                placeholder="请输入账号"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handlePasswordLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                :loading="loginLoading"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Register Tab -->
        <el-tab-pane label="账号注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            size="large"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="account">
              <el-input
                v-model="registerForm.account"
                placeholder="请输入账号（2-20位）"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（4-16位）"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                :loading="registerLoading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useConfigStore } from '@/store/modules/config'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const configStore = useConfigStore()

const activeTab = ref('password')
const loginLoading = ref(false)
const registerLoading = ref(false)

// Password form
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  mobile: '',
  password: ''
})

const passwordRules: FormRules = {
  mobile: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度为2-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// Register form
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  account: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度为2-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 16, message: '密码长度为4-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handlePasswordLogin() {
  const form = passwordFormRef.value
  if (!form) return
  await form.validate()
  loginLoading.value = true
  try {
    await userStore.loginByPassword(passwordForm.mobile, passwordForm.password)
    ElMessage.success('登录成功')
    redirectAfterLogin()
  } catch {
    // 拦截器已弹出后端错误提示
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  const form = registerFormRef.value
  if (!form) return
  await form.validate()
  registerLoading.value = true
  try {
    await userStore.register(registerForm.account, registerForm.password)
    ElMessage.success('注册成功')
    redirectAfterLogin()
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    registerLoading.value = false
  }
}

function redirectAfterLogin() {
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - #{$mall-header-height} - 200px);
  background: $mall-bg-gray;
  padding: $mall-spacing-xl 0;
}

.login-card {
  width: 400px;
  padding: $mall-spacing-xl $mall-spacing-xl * 1.5;
  background: $mall-bg-white;
  border-radius: $mall-radius-lg;
  box-shadow: $mall-shadow-md;
}

.login-header {
  text-align: center;
  margin-bottom: $mall-spacing-lg;

  .logo {
    display: inline-block;
    font-size: $mall-font-size-xxl;
    font-weight: bold;
    color: $mall-primary;
    text-decoration: none;
    margin-bottom: $mall-spacing-sm;
  }

  .login-subtitle {
    font-size: $mall-font-size-base;
    color: $mall-text-muted;
    margin: 0;
  }
}

.login-tabs {
  :deep(.el-tabs__nav) {
    width: 100%;

    .el-tabs__item {
      width: 50%;
      text-align: center;
      font-size: $mall-font-size-lg;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: $mall-font-size-lg;
}
</style>
