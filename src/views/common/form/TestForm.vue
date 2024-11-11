<script>
//用来进行测试外部表单组件的vue表单，不需要的话可以删除
import OuterFormMixin from './OuterFormMixin'
export default {
  name: "TestForm",
  mixins: [OuterFormMixin],
  data(){
    return {
      userForm: {
        name: '',
        age: '',
        sex: false
      },
      disabled: false,
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ],
      }
    }
  },
  mounted() {
    this.formInit(this.userForm, 'ruleForm')
  }
}
</script>

<template>
  <el-form style="background: white" :model="userForm" :rules="rules" ref="ruleForm">
    <el-form-item label="姓名" prop="name">
      <el-input :disabled="_disabled" size="small" v-model="userForm.name" placeholder="请输入姓名"></el-input>
    </el-form-item>
    <el-form-item label="年龄" prop="age">
      <el-input :disabled="_disabled" type="number" v-model="userForm.age" size="small" placeholder="请输入年龄"></el-input>
    </el-form-item>
    <el-form-item label="性别" prop="sex">
      <el-radio-group :disabled="_disabled" v-model="userForm.sex">
        <el-radio :label="true">男</el-radio>
        <el-radio :label="false">女</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="less">

</style>
