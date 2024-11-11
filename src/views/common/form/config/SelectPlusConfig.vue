<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="选项模式">
      <el-radio-group v-model="value.fixed">
        <el-radio :label="true">固定选项</el-radio>
        <el-radio :label="false">远程加载</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="选项设置" class="options" v-if="value.fixed">
      <div slot="label">
        <span>选项设置（鼠标拖拽排序）</span>
        <el-button icon="el-icon-plus" type="text" size="mini"
                   @click="value.options.push({name: '', value: ''})">新增选项
        </el-button>
      </div>
      <draggable :list="value.options" group="option" handler=".el-icon-rank" :options="{animation: 300, sort: true}">
        <div v-for="(op, index) in value.options" :key="index" class="option-item">
          <el-input v-model="op.value" style="width: 100px;" size="small" placeholder="选项value值" clearable/>
          ~
          <el-input size="small" v-model="op.name" placeholder="选项名称" style="width: 130px;"/>
          <i class="el-icon-delete del-btn" @click="value.options.splice(index, 1)"></i>
        </div>
      </draggable>

    </el-form-item>

    <el-form-item label="配置数据源" v-else>
      <el-button icon="el-icon-link" size="small" @click="visible = true">编辑http数据源</el-button>
    </el-form-item>
    <el-form-item label="选项展开">
      <el-switch v-model="value.expanding"></el-switch>
    </el-form-item>
    <el-form-item label="多选模式" @change="modeChange">
      <el-switch v-model="value.multiple"></el-switch>
    </el-form-item>
    <w-dialog title="配置http数据源请求" width="600px" v-model="visible" @opened="loadHttp" @ok="httpOk">
      <http-req ref="http" :show-tip="false" v-model="tempHttp"/>
    </w-dialog>
  </div>
</template>

<script>
import HttpReq from "@/components/common/HttpReq.vue";
import draggable from "vuedraggable";
import {ValueType} from "../ComponentsConfigExport";

export default {
  name: "ScoreConfig",
  components: {draggable, HttpReq},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      visible: false,
      tempHttp: {
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
  },
  methods: {
    loadHttp(){
      this.tempHttp = this.$deepCopy(this.value.http)
    },
    httpOk(){
      this.$refs.http.validate((valid, err) => {
        if (valid){
          this.value.http = this.$deepCopy(this.tempHttp)
          this.visible = false
        }else {
          this.$message.warning(err)
        }
      })
    },
    modeChange(val){
      this.$store.state.selectFormItem.valueType = val ? ValueType.array:ValueType.string
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .options {
  .el-form-item__label {
    display: block;
    width: 100% !important;
    text-align: left;
  }

  .el-button{
    float: right;
  }

  .el-form-item__content{
    margin-left: 0 !important;
    margin-top: 40px;
  }

  .option-item{
    margin: 2px 0;
  }

  .del-btn{
    cursor: pointer;
    margin-left: 5px;
    padding: 5px;
    border-radius: 50%;
    &:hover{
      background: #DDDFE5;
    }
  }
}

</style>
