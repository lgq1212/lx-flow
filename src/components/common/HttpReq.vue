<template>
  <div>
    <el-input placeholder="请输入URL地址" size="medium" v-model="_value.url" >
      <el-select @change="methodChange" v-model="_value.method" style="width: 85px;" slot="prepend" placeholder="方法">
        <el-option label="GET" value="GET"></el-option>
        <el-option label="POST" value="POST"></el-option>
        <el-option label="PUT" value="PUT"></el-option>
        <el-option label="DELETE" value="DELETE"></el-option>
      </el-select>
    </el-input>
    <el-alert v-if="showTip" :title="tip" type="success" close-text="知道了"/>
    <el-tabs v-model="active">
      <el-tab-pane label="header头" name="header">
        <el-button type="text" @click="addHeader" v-if="(_value.headers || []).length === 0">+ 添加header请求头</el-button>
        <div class="h-item" v-for="(header, index) in _value.headers" :key="'hd'+index">
          <el-input size="small" v-model="header.name" placeholder="header名" style="width: 30%;"></el-input>
          <span class="w-space">→</span>
          <el-input size="small" v-model="header.value" placeholder="header值" style="width: 50%;"></el-input>
          <div class="h-options">
            <i class="el-icon-delete" @click="_value.headers.splice(index, 1)"></i>
            <i class="el-icon-plus" @click="addHeader" v-if="index === _value.headers.length - 1"></i>
          </div>
        </div>

      </el-tab-pane>
      <el-tab-pane v-if="_value.method !== 'GET'" label="body参数" name="body">
        参数类型：
        <el-radio-group v-model="_value.contentType">
          <el-radio label="XFORM">x-www-form</el-radio>
          <el-radio label="JSON">application/json</el-radio>
        </el-radio-group>
        <div v-if="_value.contentType === 'XFORM'">
          <el-button type="text" @click="addParam" v-if="(_value.params || []).length === 0">+ 添加表单参数</el-button>
          <div class="h-item" v-for="(header, index) in _value.params" :key="'hd'+index">
            <el-input size="small" v-model="header.name" placeholder="参数key" style="width: 30%;"></el-input>
            <span class="w-space">→</span>
            <el-input size="small" v-model="header.value" placeholder="参数值" style="width: 50%;"></el-input>
            <div class="h-options">
              <i class="el-icon-delete" @click="_value.params.splice(index, 1)"></i>
              <i class="el-icon-plus" @click="addParam" v-if="index === _value.params.length - 1"></i>
            </div>
          </div>
        </div>
        <div v-else-if="_value.contentType === 'JSON'">
          <code-editor height="200px" v-model="_value.data"/>
        </div>
      </el-tab-pane>
      <el-tab-pane label="前置处理" name="pre">
        <code-editor height="200px" ref="preCode" v-model="_value.preHandler" :default-value="preDefault"/>
      </el-tab-pane>
      <el-tab-pane label="后置处理" name="aft">
        <code-editor height="200px" ref="aftCode" v-model="_value.aftHandler" :default-value="aftDefault"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

export default {
  name: "HttpReq",
  components: {
    CodeEditor: () => import('./CodeEditor.vue')
  },
  props: {
    tip:{
      type: String,
      default: '您可以在URL及参数中使用 ${变量名} 来取系统中的变量'
    },
    showTip: {
      type: Boolean,
      default: true
    },
    value:{
      type: Object,
      default: () => {
        return {
          url: '',
          method: 'GET',
          headers: [],
          contentType: 'JSON',
          params: [],
          data: '',
          preHandler: null,
          aftHandler: null
        }
      }
    }
  },
  computed:{
    _value: {
      get(){
        return this.value
      },
      set(val){
        this.$emit('input', val)
      }
    }
  },
  data() {
    return {
      active: 'body',
      preDefault: 'function preHandler(ctx){\n\t//发起请求前做一些处理\n\t\n}',
      aftDefault: 'function aftHandler(rsp){\n\t//获取到结果后做一些处理\n\t\n}',
    }
  },
  methods: {
    addHeader(){
      if (!this._value.headers){
        this.$set(this._value, 'headers', [])
      }
      this._value.headers.push({
        name: '',
        value: ''
      })
    },
    addParam(){
      if (!this._value.params){
        this.$set(this._value, 'params', [])
      }
      this._value.params.push({name: '', value: ''})
    },
    methodChange(val){
      this.active = 'header'
    },
    validate(call){
      const urlReg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
      if (!this.value.method){
        call(false, '请选择请求方法')
      }else if (!urlReg.test(this.value.url)){
        call(false, 'URL地址不合法')
      }else {
        call(true)
      }
    }
  },
  watch:{
    active(){
      if (this.active === 'pre'){
        this.$refs['preCode'].reloadCode(this.value.preHandler || this.preDefault)
      }else if(this.active === 'aft'){
        this.$refs['aftCode'].reloadCode(this.value.aftHandler || this.aftDefault)
      }
    }
  }
}
</script>
<style scoped lang="less">
.w-space{
  margin: 0 5px;
  color: @theme-desc-color;
}

.h-item{
  position: relative;
  margin-top: 5px;
  .h-options{
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    height: 100%;
    width: 55px;
    align-items: center;
    i{
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      background: #eaeaea;
      margin: 0 2px;
    }
    .el-icon-delete {
      color: @theme-danger;
    }
    .el-icon-plus{
      color: @theme-primary;
    }
  }
}
</style>
