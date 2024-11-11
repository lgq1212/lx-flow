<template>
  <div :class="{'node': true, 'node-error-state': showError}">
    <div :class="{'node-body': true, 'error': showError}">
      <div class="node-body-left" @click="$emit('leftMove')" v-if="level > 1">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div class="node-body-main" @click="$emit('selected')">
        <div class="node-body-main-header">
          <ellipsis class="title" hover-tip :content="config.name ? config.name : ('分支' + level)">
            <i slot="pre" class="el-icon-connection"></i>
          </ellipsis>
          <span class="option">
            <el-tooltip effect="dark" content="复制分支" placement="top">
              <i class="el-icon-copy-document" @click.stop="$emit('copy')"></i>
            </el-tooltip>
            <i class="el-icon-close" @click.stop="$emit('delNode')"></i>
          </span>
        </div>
        <div class="node-body-main-content">
          <span class="placeholder" v-if="(content || '').trim() === ''">{{ placeholder }}</span>
          <ellipsis hoverTip :row="4" :content="content" v-else/>
        </div>
      </div>
      <div class="node-body-right" @click="$emit('rightMove')" v-if="level < size">
        <i class="el-icon-arrow-right"></i>
      </div>
      <div class="node-error" v-if="showError">
        <el-tooltip effect="dark" :content="errorInfo" placement="top-start">
          <i class="el-icon-warning-outline"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="node-footer">
      <div class="btn">
        <insert-button @insertNode="type => $emit('insertNode', type)"></insert-button>
      </div>
    </div>
  </div>
</template>

<script>
import InsertButton from '@/views/common/InsertButton.vue'
import {ValueType} from '@/views/common/form/ComponentsConfigExport'
import {validateEl} from "@/api/process";
const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export default {
  name: "InclusiveNode",
  components: {InsertButton},
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    },
    //索引位置
    level: {
      type: Number,
      default: 1
    },
    //条件数
    size: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      ValueType,
      groupNames,
      placeholder: '请设置分支条件',
      errorInfo: '',
      showError: false
    }
  },
  computed: {
    content() {
      const props = this.config.props
      switch (props.mode){
        case 'SIMPLE': return this.getSimpleModeDesc(props.groups)
        case 'UEL': return `EL表达式: [${props.expression}] 判断`
        case 'JS': return `js代码判断`
        case 'HTTP': return `从 [${props.http.url}] 判断`
        default: return '无法解析的设置项😢'
      }
    }
  },
  methods: {
    getSimpleModeDesc(groups){
      if (groups.length === 0){
        return '其他条件进入此分支'
      }
      let confitions = []
      groups.forEach(group => {
        let subConditions = []
        group.conditions.forEach(subCondition => {
          let subConditionStr = ''
          switch (subCondition.valueType) {
            case ValueType.dept:
            case ValueType.user:
              subConditionStr = `${subCondition.title}属于[${String(subCondition.value.map(u => u.name)).replaceAll(',', '. ')}]之一`
              break;
            case ValueType.number:
            case ValueType.string:
              subConditionStr = this.getOrdinaryConditionContent(subCondition)
              break;
          }
          subConditions.push(subConditionStr)
        })
        //根据子条件关系构建描述
        let subConditionsStr = String(subConditions)
          .replaceAll(',', subConditions.length > 1 ?
            (group.groupType === 'AND' ? ') 且 (' : ') 或 (') :
            (group.groupType === 'AND' ? ' 且 ' : ' 或 '))
        confitions.push(subConditions.length > 1 ? `(${subConditionsStr})` : subConditionsStr)
      })
      //构建最终描述
      return String(confitions).replaceAll(',', (this.config.props.groupsType === 'AND' ? ' 且 ' : ' 或 '))
    },
    getDefault(val, df) {
      return val && val !== '' ? val : df;
    },
    getOrdinaryConditionContent(subCondition) {
      switch (subCondition.compare) {
        case 'IN':
          return `${subCondition.title}为[${String(subCondition.value).replaceAll(',', '、')}]中之一`
        case 'B':
          return `${subCondition.value[0]} < ${subCondition.title} < ${subCondition.value[1]}`
        case 'AB':
          return `${subCondition.value[0]} ≤ ${subCondition.title} < ${subCondition.value[1]}`
        case 'BA':
          return `${subCondition.value[0]} < ${subCondition.title} ≤ ${subCondition.value[1]}`
        case 'ABA':
          return `${subCondition.value[0]} ≤ ${subCondition.title} ≤ ${subCondition.value[1]}`
        case '<=':
          return `${subCondition.title} ≤ ${this.getDefault(subCondition.value[0], ' ?')}`
        case '>=':
          return `${subCondition.title} ≥ ${this.getDefault(subCondition.value[0], ' ?')}`
        default:
          return `${subCondition.title}${subCondition.compare}${this.getDefault(subCondition.value[0], ' ?')}`
      }
    },
    //校验数据配置的合法性
    validate(err) {
      const props = this.config.props
      this.showError = false
      if (props.mode === 'SIMPLE'){
        if (props.groups.length <= 0){
          this.showError = false
          this.errorInfo = '无条件，默认满足'
        }else {
          for (let i = 0; i < props.groups.length; i++) {
            if (props.groups[i].cids.length === 0){
              this.showError = true
              this.errorInfo = `请设置条件组${this.groupNames[i]}内的条件`
              err.push(`包容条件 ${this.config.name} 条件组${this.groupNames[i]}内未设置条件`)
              break
            }else {
              let conditions = props.groups[i].conditions
              for (let ci = 0; ci < conditions.length; ci++) {
                let subc = conditions[ci]
                if (subc.value.length === 0){
                  this.showError = true
                }else {
                  this.showError = false
                }
                if (this.showError){
                  this.errorInfo = `请完善条件组${this.groupNames[i]}内的${subc.title}条件`
                  err.push(`包容条件 ${this.config.name} 条件组${this.groupNames[i]}内${subc.title}条件未完善`)
                  return false
                }
              }
            }
          }
          if (!this.showError && !this.$isNotEmpty((this.config.children || {}).id)){
            //校验下方节点
            this.showError = true
            this.errorInfo = '非默认条件下方节点不允许为空'
            err.push(`包容条件 ${this.config.name} 下方分支无流程节点`)
          }
        }
      }else if (props.mode === 'UEL'){
        if (/\S+/.test(props.expression)){
          validateEl(props.expression).then(rsp => {
            this.showError = false
          }).catch(err => {
            this.showError = true
            this.errorInfo = 'EL表达式错误：' + (err.response.data.message || err.response.data)
            err.push(`条件 ${this.config.name} 内EL表达式错误: ${err.response.data.message || err.response.data}`)
          })
        }else {
          this.showError = true
          this.errorInfo = 'EL表达式不能为空'
          err.push(`条件 ${this.config.name} 内EL表达式为空`)
        }
      }else if (props.mode === 'JS'){
        try {
          new Function(props.js)
          this.showError = false
        } catch (e) {
          this.showError = true
          this.errorInfo = 'JS条件设置语法错误'
          err.push(`条件 ${this.config.name} 内JS设置语法错误`)
        }
      }else if (props.mode === 'HTTP'){
        const urlReg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
        if (!props.http.method){
          this.showError = true
          this.errorInfo = '未设置Http请求方法'
          err.push(`条件 ${this.config.name} 内HTTP请求方法未选择`)
        }else if (!urlReg.test(props.http.url)){
          this.showError = true
          this.errorInfo = '未正确设置Http请求地址'
          err.push(`条件 ${this.config.name} 内Http请求URL地址未正确设置`)
        }else {
          this.showError = false
        }
      }
      return !this.showError
    }
  }
}
</script>

<style lang="less" scoped>


.node-error-state {
  .node-body {
    box-shadow: 0px 0px 5px 0px #F56C6C !important;
  }
}

.node {
  padding: 30px 55px 0;
  width: 220px;

  .node-body {
    cursor: pointer;
    min-height: 80px;
    max-height: 120px;
    position: relative;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0px 0px 5px 0px #d8d8d8;

    &:hover {
      .node-body-left, .node-body-right {
        i {
          display: block !important;
        }
      }

      .node-body-main {
        .level {
          display: none !important;
        }

        .option {
          display: inline-block !important;
        }
      }

      box-shadow: 0px 0px 3px 0px @theme-primary;
    }

    .node-body-left, .node-body-right {
      display: flex;
      align-items: center;
      position: absolute;
      height: 100%;

      i {
        display: none;
      }

      &:hover {
        background-color: #ececec;
      }
    }

    .node-body-left {
      left: 0;
    }

    .node-body-right {
      right: 0;
      top: 0;
    }

    .node-body-main {
      //position: absolute;
      width: 188px;
      margin-left: 17px;
      display: inline-block;

      .node-body-main-header {
        padding: 10px 0px 5px;
        font-size: xx-small;
        position: relative;

        .title {
          color: #345DA2;
          display: inline-block;
          height: 14px;
          width: 125px;
        }

        .level {
          position: absolute;
          right: 15px;
          color: #888888;
        }

        .option {
          position: absolute;
          right: 0;
          display: none;
          font-size: medium;

          i {
            color: #888888;
            padding: 0 3px;
          }
        }
      }

      .node-body-main-content {
        padding: 6px;
        color: #656363;
        font-size: 14px;

        i {
          position: absolute;
          top: 55%;
          right: 10px;
          font-size: medium;
        }

        .placeholder {
          color: #8c8c8c;
        }
      }
    }

    .node-error {
      position: absolute;
      right: -40px;
      top: 20px;
      font-size: 25px;
      color: #F56C6C;
    }
  }

  .node-footer {
    position: relative;

    .btn {
      width: 100%;
      display: flex;
      height: 70px;
      padding: 20px 0 32px;
      justify-content: center;
    }

    /deep/ .el-button {
      height: 32px;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      margin: auto;
      width: 2px;
      height: 100%;
      background-color: #CACACA;
    }
  }
}
</style>
