<template>
  <div class="address-list-page">
    <div class="section-header">
      <h3 class="section-title">收货地址</h3>
      <el-button type="primary" @click="openDialog()">新增收货地址</el-button>
    </div>

    <!-- Address List -->
    <div class="address-list" v-if="addressList.length > 0">
      <div v-for="addr in addressList" :key="addr.id" class="address-card">
        <div class="address-main">
          <div class="address-top">
            <span class="name">{{ addr.name }}</span>
            <span class="mobile">{{ addr.mobile }}</span>
            <el-tag v-if="addr.defaultStatus" size="small" type="danger">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ addr.areaName }} {{ addr.detailAddress }}
          </div>
        </div>
        <div class="address-actions">
          <el-button link type="primary" @click="openDialog(addr)">编辑</el-button>
          <el-button link type="primary" v-if="!addr.defaultStatus" @click="handleSetDefault(addr)">
            设为默认
          </el-button>
          <el-button link type="danger" @click="handleDelete(addr.id!)">删除</el-button>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无收货地址" />

    <!-- Address Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑收货地址' : '新增收货地址'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="所在地区" prop="areaId">
          <el-cascader
            v-model="form.areaId"
            placeholder="请选择省/市/区"
            :options="areaOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="form.detailAddress" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.defaultStatus">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getAddressList,
  createAddress,
  updateAddress,
  deleteAddress
} from '@/api/member/address'
import type { Address } from '@/types'

const addressList = ref<Address[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const editingId = ref<number>()
const areaOptions = ref<any[]>([])

const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  mobile: '',
  areaId: 0,
  detailAddress: '',
  defaultStatus: false
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  areaId: [{ required: true, message: '请选择地区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

async function loadList() {
  try {
    addressList.value = await getAddressList()
  } catch {
    addressList.value = []
  }
}

function resetForm() {
  form.name = ''
  form.mobile = ''
  form.areaId = 0
  form.detailAddress = ''
  form.defaultStatus = false
  formRef.value?.resetFields()
}

function openDialog(addr?: Address) {
  resetForm()
  if (addr) {
    isEdit.value = true
    editingId.value = addr.id
    form.name = addr.name
    form.mobile = addr.mobile
    form.areaId = addr.areaId
    form.detailAddress = addr.detailAddress
    form.defaultStatus = !!addr.defaultStatus
  } else {
    isEdit.value = false
    editingId.value = undefined
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const formEl = formRef.value
  if (!formEl) return
  await formEl.validate()
  saving.value = true
  try {
    const data: Address = {
      name: form.name,
      mobile: form.mobile,
      areaId: form.areaId,
      detailAddress: form.detailAddress,
      defaultStatus: form.defaultStatus
    }
    if (isEdit.value && editingId.value) {
      data.id = editingId.value
      await updateAddress(data)
      ElMessage.success('地址修改成功')
    } else {
      await createAddress(data)
      ElMessage.success('地址添加成功')
    }
    dialogVisible.value = false
    await loadList()
  } catch (e: any) {
    // 拦截器已弹出后端错误提示
  } finally {
    saving.value = false
  }
}

async function handleSetDefault(addr: Address) {
  try {
    await updateAddress({
      ...addr,
      defaultStatus: true
    })
    ElMessage.success('已设为默认地址')
    await loadList()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteAddress(id)
    ElMessage.success('地址已删除')
    await loadList()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped lang="scss">
.address-list-page {
  //
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $mall-spacing-lg;
}

.section-title {
  font-size: $mall-font-size-lg;
  color: $mall-text-primary;
  font-weight: 600;
  margin: 0;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: $mall-spacing-md;
}

.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mall-spacing-lg;
  border: 1px solid $mall-border-color;
  border-radius: $mall-radius-md;
  transition: border-color 0.2s;

  &:hover {
    border-color: $mall-primary-light;
  }
}

.address-main {
  flex: 1;
  min-width: 0;
}

.address-top {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;
  margin-bottom: $mall-spacing-sm;

  .name {
    font-size: $mall-font-size-base;
    color: $mall-text-primary;
    font-weight: 600;
  }

  .mobile {
    font-size: $mall-font-size-sm;
    color: $mall-text-secondary;
  }
}

.address-detail {
  font-size: $mall-font-size-sm;
  color: $mall-text-secondary;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  align-items: center;
  gap: $mall-spacing-sm;
  flex-shrink: 0;
}
</style>
