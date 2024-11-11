<template>
  <div>
    <el-form-item label="表单形式">
      <el-radio-group v-model="value.isCodeForm">
        <el-radio :label="true">Vue表单</el-radio>
        <el-radio :label="false">Url表单</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="表单路径">
      <el-input size="small"
                :placeholder="value.isCodeForm ? '表单Vue组件路径 @/views..':'表单URL地址'"
                v-model="value.path"></el-input>
      <span v-if="value.isCodeForm">路径为 @/views + 输入路径</span>
      <span v-else>输入表单url访问路径</span>
    </el-form-item>
    <el-form-item label="显示高度" v-if="!value.isCodeForm">
      <el-input size="small" placeholder="例如：600px / 80%" v-model="value.height"></el-input>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "AmountInputConfig",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
        return {}
      }
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
