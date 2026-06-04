<template>
  <div class="password-page">
    <h3 class="section-title">修改密码</h3>

    <div class="password-content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        class="password-form"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码（4-16位）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updatePassword } from '@/api/member/user'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 4, max: 16, message: '密码长度为4-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleSubmit() {
  const formEl = formRef.value
  if (!formEl) return
  await formEl.validate()
  submitting.value = true
  try {
    await updatePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    await ElMessageBox.alert('密码修改成功，请重新登录', '提示', {
      confirmButtonText: '确定',
      type: 'success'
    })
    await userStore.logout()
    router.push('/login')
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.password-page {
  //
}

.section-title {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0 0 $mall-spacing-lg;
  padding-bottom: $mall-spacing-md;
  border-bottom: 1px solid $mall-border-color;
}

.password-content {
  max-width: 500px;
}

.password-form {
  .el-form-item {
    margin-bottom: $mall-spacing-lg;
  }
}
</style>
