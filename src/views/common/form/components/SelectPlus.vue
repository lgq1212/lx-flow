<script>
//高级选择器组件
import componentMinxins from '../ComponentMinxins'
import {Checkbox, CheckboxGroup, Radio, RadioGroup} from "vant";
export default {
  name: "SelectPlus",
  components: {CheckboxGroup, Checkbox, RadioGroup, Radio},
  mixins: [componentMinxins],
  props:{
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder:{
      type: String,
      default: '请选择选项'
    },
    fixed: {
      type: Boolean,
      default: true
    },
    expanding:{
      type: Boolean,
      default: false
    },
    options:{
      type: Array,
      default: () => {
        return []
      }
    },
    http: {
      type: Object,
      default: () => {
        return {
          url: null,
          method: 'GET',
          headers: [],
          contentType: 'JSON',
          params: [],
          data: null,
          preHandler: null,
          aftHandler: null
        }
      }
    }
  },
  computed:{
    __value:{
      get(){
        return this.multiple ? this.value : this.value[0]
      },
      set(val){
        if (this.multiple){
          this._value = val
        }else {
          this._value = [val]
        }
      }
    }
  },
  data(){
    return {
      loading: false,
      dataOptions: [],
      preHandlerFuc: null,
      aftHandlerFuc: null,
    }
  },
  mounted() {
    this.loadOptionsData()
  },
  methods:{
    loadOptionsData(){
      if (this.fixed){
        this.dataOptions = this.options
      }else {
        this.doRequest(this.dataOptions)
      }
    },
    doRequest(options){
      if (this.http.url && this.http.method){
        const params = {
          url: this.http.url,
          method : this.http.method.toLowerCase(),
          headers:{
            'Content-Type': this.http.contentType === 'JSON' ? 'application/json' : 'application/x-www-form-urlencoded',
            ...this.coverParams(this.http.headers || [])
          },
          params: this.coverParams(this.http.params || []),
          data: this.http.contentType === 'JSON' ? JSON.parse(this.http.data || '{}') : this.coverParams(this.http.data || [])
        }
        this.preHandler(params, this.http.preHandler)
        this.loading = true
        this.$axios.request(params).then(rsp => {
          this.loading = false
          const ops = this.aftHandler(rsp, this.http.aftHandler)
          options.push(...(ops || []))
        }).catch(err => {
          this.loading = false
          this.$message.warning('请求http数据源发生异常:' + JSON.stringify(err))
        })
      }
    },
    //数组转对象
    coverParams(args){
      const params = {}
      args.forEach(arg => {
        if (this.$isNotEmpty(arg.name)){
          params[arg.name] = params[arg.value]
        }
      })
      return params
    },
    //前置处理
    preHandler(params, script){
      if (!this.preHandlerFuc){
        this.preHandlerFuc = new Function('ctx', `${script}\n preHandler(ctx)`)
      }
      try {
        this.preHandlerFuc(params)
      } catch (e) {
        console.log(e)
      }
    },
    //后置处理
    aftHandler(rsp, script){
      if (!this.aftHandlerFuc){
        this.aftHandlerFuc = new Function('rsp', `${script}\n return aftHandler(rsp)`)
      }
      try {
        return this.aftHandlerFuc(rsp)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<template>
  <div v-loading="loading">
    <div v-if="mode === 'DESIGN'">
      <el-select class="max-fill" v-if="!expanding" v-model="__value" size="medium" disabled :placeholder="placeholder"/>
      <el-checkbox-group v-else-if="expanding && multiple" v-model="__value">
        <el-checkbox disabled class="w-row-text" v-for="(op, index) in dataOptions" :key="index" :label="op.value">{{op.name}}</el-checkbox>
      </el-checkbox-group>
      <el-radio-group v-else v-model="__value">
        <el-radio disabled class="w-row-text" v-for="(op, index) in dataOptions" :key="index" :label="op.value">{{op.name}}</el-radio>
      </el-radio-group>
    </div>
    <div v-else-if="expanding && dataOptions.length === 0" style="color:#E79467;">无选项😢，请检查设置</div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-select class="max-fill" v-if="!expanding" v-model="__value" :multiple="multiple" size="medium" clearable :placeholder="placeholder">
        <el-option v-for="(op, index) in dataOptions" :key="index" :value="op.value" :label="op.name">{{op.name}}</el-option>
      </el-select>
      <el-checkbox-group v-else-if="expanding && multiple" v-model="__value">
        <el-checkbox class="w-row-text" v-for="(op, index) in dataOptions" :key="index" :label="op.value">{{op.name}}</el-checkbox>
      </el-checkbox-group>
      <el-radio-group v-else v-model="__value">
        <el-radio class="w-row-text" v-for="(op, index) in dataOptions" :key="index" :label="op.value">{{op.name}}</el-radio>
      </el-radio-group>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <checkbox-group v-if="multiple" v-model="__value" direction="horizontal">
        <checkbox class="w-row-text" :name="op.value" shape="square" v-for="(op, index) in dataOptions" :key="index">{{op.name}}</checkbox>
      </checkbox-group>
      <radio-group v-else v-model="__value" direction="horizontal">
        <radio class="w-row-text" v-for="(op, index) in dataOptions" :key="index" :name="op.value">{{op.name}}</radio>
      </radio-group>
    </div>
    <div v-else>
      {{String((_value || []).map(val => (dataOptions.find(v => val === v.value) || {}).name))}}
    </div>
  </div>
</template>

<style scoped lang="less">
/deep/ .el-checkbox-group{
  line-height: normal;
}

.w-row-text{
  margin: 5px;
}
</style>
