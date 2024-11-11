<template>
  <el-main style="" ref="design">
    <div class="scale">
      <el-tooltip effect="dark" content="当流程变化时，做一些事情" placement="top">
        <el-button size="small" type="primary" @click="openProcListener" icon="el-icon-service" circle></el-button>
      </el-tooltip>
      <el-button icon="el-icon-plus" size="small" @click="scale += 10" :disabled="scale >= 150" circle></el-button>
      <span>{{ scale }}%</span>
      <el-button icon="el-icon-minus" size="small" @click="scale -= 10" :disabled="scale <= 40" circle></el-button>
    </div>
    <div class="design" :style="'transform: scale('+ scale / 100 +');'">
      <process-tree ref="process-tree" @selectedNode="nodeSelected"/>
    </div>
    <el-drawer title="" :visible.sync="showProcListConfig"
               :modal-append-to-body="false" size="500px"
               direction="rtl" :modal="false" destroy-on-close>
      <div slot="title"><i class="el-icon-service"></i> 流程监听配置 </div>
      <div class="node-config-content">
        <el-form label-width="130px" label-position="top">
          <el-form-item>
            <div slot="label">
              <span class="w-f-title">当流程启动成功时</span>
              <el-button type="text" size="small" @click="addSetup('start')"> + 添加动作</el-button>
            </div>
            <div class="action-item" v-for="(setup, i) in processListener.start || []" :key="'start' + i">
              <action-config v-model="processListener.start[i]"/>
              <i class="el-icon-delete" @click="processListener.start.splice(i, 1)"></i>
            </div>
          </el-form-item>
          <el-form-item>
            <div slot="label">
              <span class="w-f-title">当流程审批通过时</span>
              <el-button type="text" size="small" @click="addSetup('pass')"> + 添加动作</el-button>
            </div>
            <div class="action-item" v-for="(setup, i) in processListener.pass || []" :key="'pass' + i">
              <action-config v-model="processListener.pass[i]"/>
              <i class="el-icon-delete" @click="processListener.pass.splice(i, 1)"></i>
            </div>
          </el-form-item>
          <el-form-item>
            <div slot="label">
              <span class="w-f-title">当流程被驳回时</span>
              <el-button type="text" size="small" @click="addSetup('refuse')"> + 添加动作</el-button>
            </div>
            <div class="action-item" v-for="(setup, i) in processListener.refuse || []" :key="'refuse' + i">
              <action-config v-model="processListener.refuse[i]"/>
              <i class="el-icon-delete" @click="processListener.refuse.splice(i, 1)"></i>
            </div>
          </el-form-item>
          <el-form-item>
            <div slot="label">
              <span class="w-f-title">当流程被撤销时</span>
              <el-button type="text" size="small" @click="addSetup('cancel')"> + 添加动作</el-button>
            </div>
            <div class="action-item" v-for="(setup, i) in processListener.cancel || []" :key="'cancel' + i">
              <action-config v-model="processListener.cancel[i]"/>
              <i class="el-icon-delete" @click="processListener.cancel.splice(i, 1)"></i>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <el-drawer :title="selectedNode.name" :visible.sync="showConfig"
               :modal-append-to-body="false" :size="drawerSize"
               direction="rtl" :modal="false" destroy-on-close>
      <div slot="title">
        <el-input v-model="selectedNode.name" size="medium" v-show="showInput"
                  style="width: 300px" @blur="showInput = false"></el-input>
        <el-link v-show="!showInput" @click="showInput = true" style="font-size: medium">
          <i class="el-icon-edit" style="margin-right: 10px"></i>
          {{selectedNode.name}}
        </el-link>
      </div>
      <div class="node-config-content">
        <node-config/>
      </div>
    </el-drawer>
  </el-main>
</template>

<script>
import ProcessTree from './process/ProcessTree.vue'
import NodeConfig from '../../common/process/config/NodeConfig'
import ActionConfig from "./action/ActionConfig.vue";

export default {
  name: "ProcessDesign",
  components: {ActionConfig, ProcessTree, NodeConfig},
  data() {
    return {
      scale: 100,
      selected: {},
      showInput: false,
      showConfig: false,
      showProcListConfig: false,
      processDom: null
    }
  },
  computed:{
    selectedNode(){
      return this.$store.state.selectedNode
    },
    processListener(){
      const processConfig = this.$store.state.design.processConfig
      if (!processConfig.listener){
        this.$set(processConfig, 'listener', {
          start: [],
          pass: [],
          refuse: [],
          cancel: []
        })
      }
      return processConfig.listener
    },
    drawerSize(){
      if (this.selectedNode.type){
        switch (this.selectedNode.type){
          case 'INCLUSIVE':
          case 'CONDITION': return '600px'
          default: return '500px'
        }
      }
    }
  },
  mounted() {
    this.initDragPageMove()
  },
  methods: {
    addSetup(type){
      if (!this.processListener[type]){
        this.$set(this.processListener, type, [])
      }
      this.processListener[type].push({
        actionType: "NONE",
        java: '',
        js: '',
        http: {
          url: '',
          method: 'GET',
          headers: [],
          contentType: 'JSON',
          params: [],
          data: '',
          preHandler: null,
          aftHandler: null
        }
      })
    },
    openProcListener() {
      this.showProcListConfig = true
    },
    validate(){
      return this.$refs["process-tree"].validateProcess()
    },
    nodeSelected(node){
      console.log('配置节点', node)
      this.showConfig = true
    },
    initDragPageMove(){
      let isDragging = false
      let startX, startY, scrollLeft, scrollTop
      this.processDom = this.$refs.design.$el
      this.processDom.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollLeft = this.processDom.scrollLeft;
        scrollTop = document.documentElement.scrollTop;
        //this.processDom.style.cursor = 'grabbing'
        //e.preventDefault();// 防止默认选中文本行为
      });
      this.processDom.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        // 更新滚动位置
        this.processDom.scrollLeft = scrollLeft - deltaX;
        document.documentElement.scrollTop = scrollTop - deltaY;
      });
      this.processDom.addEventListener('mouseup', () => {
        isDragging = false;
        this.processDom.style.cursor = 'default'
      });
    },
  }
}
</script>

<style lang="less" scoped>
.design {
  margin-top: 100px;
  display: flex;
  transform-origin: 50% 0px 0px;
}

.w-f-title{
  margin-right: 10px;
}

.scale {
  z-index: 999;
  position: fixed;
  top: 80px;
  right: 40px;

  span {
    margin: 0 10px;
    font-size: 15px;
    color: #7a7a7a;
    width: 50px;
  }
}

.node-config-content{
  padding: 0 20px 20px;
}

/deep/ .el-drawer__body{
  overflow-y: auto;
}

.action-item{
  position: relative;
  background: #F5F6F6;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 10px;
  &>i {
    top: -8px;
    right: -8px;
    background: #F5F6F6;
    position: absolute;
    color: @theme-danger;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
  }
}
</style>
