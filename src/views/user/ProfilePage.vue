<template>
  <div class="profile-page">
    <h3 class="section-title">个人资料</h3>

    <div class="profile-content">
      <!-- Avatar -->
      <div class="avatar-section">
        <el-avatar :size="80" :src="form.avatar" />
        <el-upload
          :show-file-list="false"
          :http-request="handleAvatarUpload"
          accept="image/*"
        >
          <el-button size="small" type="primary" plain>更换头像</el-button>
        </el-upload>
      </div>

      <!-- Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="profile-form"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
            <el-radio :value="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="(date: Date) => date > new Date()"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="账号">
          <el-input :model-value="form.mobile" disabled />
        </el-form-item>

        <el-form-item label="余额">
          <div class="balance-display">
            <span class="balance-value">{{ walletLoading ? '--' : (wallet ? fenToYuan(wallet.balance) : '0.00') }}</span>
            <span class="balance-unit">元</span>
          </div>
        </el-form-item>

        <el-form-item label="积分">
          <div class="balance-display">
            <span class="balance-value">{{ userStore.userInfo?.point || 0 }}</span>
            <span class="balance-unit">积分</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { updateUserInfo } from '@/api/member/user'
import { uploadFile } from '@/api/infra/file'
import { getWallet } from '@/api/pay/wallet'
import type { Wallet } from '@/types'
import { fenToYuan } from '@/utils/price'

const userStore = useUserStore()

// 钱包余额
const wallet = ref<Wallet | null>(null)
const walletLoading = ref(false)

const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  avatar: '',
  nickname: '',
  gender: 0,
  birthday: '',
  mobile: ''
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 20, message: '昵称最多20个字符', trigger: 'blur' }
  ]
}

async function handleAvatarUpload(options: UploadRequestOptions) {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    const res = await uploadFile(formData)
    form.avatar = res.url
    ElMessage.success('头像上传成功')
  } catch {
    ElMessage.error('头像上传失败')
  }
}

async function handleSave() {
  const formEl = formRef.value
  if (!formEl) return
  await formEl.validate()
  saving.value = true
  try {
    await updateUserInfo({
      avatar: form.avatar,
      nickname: form.nickname,
      gender: form.gender,
      birthday: form.birthday
    })
    ElMessage.success('保存成功')
    await userStore.getUserInfo()
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    saving.value = false
  }
}

// 获取钱包余额
const fetchWallet = async () => {
  if (!userStore.isLogin) return
  walletLoading.value = true
  try {
    wallet.value = await getWallet()
  } catch (e) {
    console.error('获取钱包余额失败', e)
  } finally {
    walletLoading.value = false
  }
}

function initForm() {
  const user = userStore.userInfo
  if (user) {
    form.avatar = user.avatar || ''
    form.nickname = user.nickname || ''
    form.gender = user.gender || 0
    form.birthday = user.birthday || ''
    form.mobile = user.mobile || ''
  }
}

onMounted(async () => {
  initForm()
  await fetchWallet()
})
</script>

<style scoped lang="scss">
.profile-page {
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

.profile-content {
  max-width: 500px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: $mall-spacing-lg;
  margin-bottom: $mall-spacing-xl;
}

.profile-form {
  .el-form-item {
    margin-bottom: $mall-spacing-lg;
  }

  .balance-display {
    display: flex;
    align-items: baseline;
    gap: $mall-spacing-xs;

    .balance-value {
      font-size: $mall-font-size-xl;
      color: $mall-primary;
      font-weight: 600;
    }

    .balance-unit {
      font-size: $mall-font-size-sm;
      color: $mall-text-secondary;
    }
  }
}
</style>
