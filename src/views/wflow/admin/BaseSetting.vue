<script setup>

import {computed, ref} from "vue";

const props = defineProps({
  modelValue: Object
})
const form = ref()

defineExpose({validate})

const _value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const groupList = ref([{id: 222, name: '测试'}])

function validate() {
  return new Promise((resolve, reject) => {
    form.value.validate().then(() => resolve()).catch(err => {
      reject(Object.keys(err).map(v => err[v][0].message))
    })
  })
}

const rules = {
  name: [
    { required: true, message: '请设置流程表单名称', trigger: 'blur' },
    { min: 2, max: 20, message: '流程表单名称长度在2~20', trigger: 'blur' }
  ],
  groupId: [
    { required: true, message: '请设置流程表单分组', trigger: 'blur' }
  ]
}

const iconList = [
  'bi:people-fill',
  'gridicons:multiple-users',
  'icon-park-solid:appointment',
  'icon-park-solid:people',
  'fluent:people-add-24-filled',
  'material-symbols:person-cancel-rounded',
  'ph:coffee-fill',
  'ph:sneaker-move-fill',
  'solar:money-bag-bold',
  'healthicons:money-bag',
  'solar:wallet-money-bold',
  'f7:money-yen-circle-fill',
  'entypo:aircraft',
  'entypo:aircraft-take-off',
  'mingcute:bus-2-fill',
  'mingcute:car-fill',
  'mingcute:train-fill',
  'fluent:handshake-20-filled',
  'icon-park-solid:buy',
  'mingcute:hand-card-fill',
  'icon-park-solid:time',
  'mdi:gift',
  'bxs:map',
  'ph:fingerprint-fill',
  'mdi:customer-service',
  'icon-park-solid:general-branch',
  'bx:bxs-purchase-tag',
  'mdi:notebook-edit',
  'simple-icons:opsgenie',
  'streamline:business-user-curriculum-solid',
  'fa6-solid:business-time',
  'mdi:google-my-business',
  'mdi:qqchat',
  'mdi:wechat',
  'bxs:message-square-detail',
  'mingcute:send-plane-fill',
  'tabler:mail-filled',
  'material-symbols:folder-open',
  'icon-park-solid:computer',
  'material-symbols:laptop-mac-outline',
  'fluent:phone-vibrate-20-filled',
  'fluent:form-28-filled',
  'file-icons:omnigraffle',
  'material-symbols:assignment-turned-in',
  'mingcute:card-refund-fill',
  'mingcute:wechat-miniprogram-fill',
  'whh:phonebookalt',
  'ri:database-2-fill',
  'ph:bank-fill',
  'material-symbols:school',
  'iconamoon:smiling-face-fill',
  'solar:sad-circle-bold',
  'ri:hearts-fill',
  'mdi:qrcode-scan',
  'fluent:calendar-cancel-16-filled',
  'ion:videocam',
  'material-symbols:play-circle',
  'jam:unsplash',
  'ph:film-reel-fill',
  'icon-park-solid:noodles',
  'dashicons:food',
  'fluent:food-cake-16-filled',
  'mdi:food',
  'material-symbols:delete',
  'material-symbols:edit-document',
  'material-symbols:chart-data',
  'ph:chart-pie-slice-fill'
]

</script>

<template>
  <el-main class="w-designer-base">
    <el-form ref="form" :rules="rules" :model="_value" label-position="top">
      <el-form-item prop="icon" label="设置图标">
        <iconify :icon="_value.icon.name" class="w-process-icon"
                 :style="{'background': _value.icon.bgc, color: _value.icon.color}"/>
        <div style="margin: 0 40px">
          <el-text>选择背景色：</el-text>
          <el-color-picker v-model="_value.icon.bgc"/>
        </div>
        <div style="display: flex; align-items: center">
          <el-text>选择图标：</el-text>
          <el-popover placement="bottom-start" width="402" trigger="click">
            <div class="w-icons">
              <iconify class="w-icons-ico" @click.native="_value.icon.name = ico" :icon="ico" v-for="ico in iconList" :key="ico"></iconify>
              <div style="width: 31px; height: 0;" v-for="i in 12"></div>
            </div>
            <template #reference>
              <iconify class="w-p-icon" style="padding: 0" slot="reference" :icon="_value.icon.name"></iconify>
            </template>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item prop="name" required label="流程名称">
        <el-input v-model="_value.name" placeholder="请设置流程名"/>
      </el-form-item>
      <el-form-item prop="groupId" required label="流程分组">
        <el-select style="width: calc(100% - 140px); padding-right: 20px;" v-model="_value.groupId" placeholder="请选择流程分组">
          <el-option :value="group.id" :label="group.name" v-for="group in groupList"></el-option>
        </el-select>
        <el-button style="width: 120px; float: right" type="primary" icon="plus">新建分组</el-button>
      </el-form-item>
      <el-form-item label="备注说明">
        <el-input v-model="_value.remark" show-word-limit maxlength="128" :rows="3" type="textarea" placeholder="流程备注说明信息"></el-input>
      </el-form-item>
    </el-form>
  </el-main>
</template>

<style lang="less" scoped>
.w-designer-base {
  margin: 0 auto;
  border-radius: 5px;
  background-color: white;
  width: 650px;
  min-height: calc(100vh - 100px);
}

.w-p-icon {
  font-size: 20px;
  cursor: pointer;
  color: var(--el-color-info);
}

.w-icons {
  overflow: auto;
  max-height: 400px;
  padding: 2px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .w-icons-ico {
    width: 25px;
    height: 25px;
    padding: 3px;
    cursor: pointer;
    border-radius: 2px;

    &:hover {
      box-shadow: 0 0 3px 0 #9b9595;
    }
  }
}

</style>
