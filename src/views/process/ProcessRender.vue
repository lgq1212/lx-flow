<script>
import ProcessNodeRender from "./ProcessNodeRender";
import { forEachNode } from '@/utils/ProcessUtil'
import processApi from '@/api/process'
import OrgPicker from "@/components/common/OrgPicker";
import { ValueType } from "../common/form/ComponentsConfigExport";
import { checkElementsExistInArray } from "../common/form/components/compare/CompareOptions";

export default {
  name: "ProcessRender",
  components: { OrgPicker, ProcessNodeRender },
  props: {
    forms: {
      type: Array,
      default: () => {
        return []
      }
    },
    pcMode: {
      type: Boolean,
      default: true
    },
    processDefId: String,
    process: {
      type: Object,
      default: () => {
        return {}
      }
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    deptId: {
      type: String,
      default: null
    },
  },
  computed: {
    loginUser () {
      return this.$store.state.loginUser
    },
    _value: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  data () {
    return {
      selectUserNodes: new Set(),
      loading: false,
      selectedNode: {},
      reverse: false,
      userCatch: {},
      oldFormData: {},
      processTasks: [],
      conditionFormItem: new Set(),
      branchNodeMap: new Map(),
      loadingReqs: []
    }
  },
  mounted () {
    this.oldFormData = this.$deepCopy(this.formData)
    this.loadProcessRender()
  },
  render () {
    const getNode = (tasks, processNodes) => {
      (tasks || []).forEach(task => {
        if (Array.isArray(task.options)) {
          //递归提取维度
          processNodes.push(
            <el-timeline-item icon={task.icon} size="large" class="task">
              <el-radio-group size="mini" v-model={task.active} >
                {
                  task.options.map(option => {
                    return <el-radio-button label={option.id} class={option.skip ? 'is-false' : ''} key={option.id}>{option.title}</el-radio-button>
                  })
                }
              </el-radio-group>
              <span class="branch-tip" domPropsInnerHTML={task.desc}></span>
            </el-timeline-item>
          )
          getNode(task.branchs[task.active], processNodes)
        } else {
          processNodes.push(
            <el-timeline-item icon={task.icon} size="large" class="task">
              <ProcessNodeRender ref={task.id} task={task} desc={task.desc} onAddUser={this.addUser} onDelUser={this.delUser} />
            </el-timeline-item>
          )
        }
      })
    }
    const processNodes = []
    console.log(this.processTasks)
    getNode(this.processTasks, processNodes)
    return <div v-loading={this.loading}>
      <el-timeline reverse={false}>
        {processNodes}
      </el-timeline>
      <OrgPicker
        pcMode={this.pcMode}
        type={this.selectedNode.type || 'user'}
        multiple={this.selectedNode.multiple || false}
        ref="orgPicker"
        selected={this.selectedNode.users || []}
        onOk={this.selected} />
    </div>
  },
  methods: {
    async loadProcessRender () {
      this.loading = true
      this.processTasks.length = 0
      this.selectUserNodes.clear()
      this.loadingReqs.length = 0
      //TODO 从这里可以使用去抖动函数 this.$debounce
      console.log(this.process)
      console.log(this.processTasks)
      this.loadProcess(this.process, this.processTasks)
      this.processTasks.push({
        title: '结束',
        name: 'END',
        icon: 'el-icon-success',
        enableEdit: false
      })
      if (this.loadingReqs.length > 0) {
        Promise.all(this.loadingReqs).then(() => {
          this.loading = false
          this.$emit('render-ok')
        }).catch(() => this.loading = false)
      } else {
        this.$emit('render-ok')
        this.loading = false
      }
    },
    loadProcess (processNode, processTasks, bnode, bid) {
      forEachNode(processNode, node => {
        if (bnode) { //如果是分支内子节点
          this.branchNodeMap.set(node.id, { node: bnode, id: bid })
        }
        switch (node.type) {
          case 'ROOT':
            processTasks.push({
              id: node.id,
              title: node.name,
              name: '发起人',
              icon: 'el-icon-user-solid',
              enableEdit: false,
              users: [this.loginUser]
            });
            break;
          case 'APPROVAL':
            processTasks.push(this.getApprovalNode(node))
            break;
          case 'TASK':
            processTasks.push(this.getApprovalNode(node, false))
            break;
          case 'CC':
            processTasks.push(this.getCcNode(node))
            break;
          case 'CONDITIONS': //条件节点选一项
            processTasks.push(this.getConditionNode(node, bnode, bid))
            this.loadProcess(node.children, processTasks)
            return true
          case 'INCLUSIVES': //包容分支会执行所有符合条件的分支
            processTasks.push(this.getInclusiveNode(node, bnode, bid))
            this.loadProcess(node.children, processTasks)
            return true
          case 'CONCURRENTS'://并行分支无条件执行所有分支
            processTasks.push(this.getConcurrentNode(node, bnode, bid))
            this.loadProcess(node.children, processTasks)
            return true
        }
      })
    },
    getApprovalNode (node, isApproval = true) {
      let result = {
        id: node.id,
        title: node.name,
        name: isApproval ? '审批人' : '办理人',
        icon: isApproval ? 'el-icon-s-check' : 'el-icon-s-claim',
        enableEdit: false,
        multiple: false,
        mode: node.props.mode,
        users: [],
        desc: ''
      }
      let loadCatch = true
      switch (node.props.assignedType) {
        case 'ASSIGN_USER':
          result.users = this.$deepCopy(node.props.assignedUser)
          result.desc = isApproval ? '指定审批人' : '指定办理人'
          break
        case 'ASSIGN_LEADER':
          this.loadingReqs.push(
            processApi.getLeaderByDepts((node.props.assignedDept || []).map(d => d.id)).then(res => {
              result.users = res.data
            }))
          result.desc = '指定部门的领导'
          break
        case 'SELF':
          result.users = [this.loginUser]
          result.desc = `发起人自己${isApproval ? '审批' : '办理'}`
          break
        case 'SELF_SELECT':
          result.enableEdit = true
          this.selectUserNodes.add(node.id)
          result.multiple = node.props.selfSelect.multiple || false
          result.desc = isApproval ? '自选审批人' : '自选办理人'
          break
        case 'LEADER_TOP':
          result.desc = `连续多级主管${isApproval ? '审批' : '办理'}`
          const leaderTop = node.props.leaderTop
          this.loadingReqs.push(
            processApi.getUserLeaders(
              'TOP' === leaderTop.endCondition ? 0 : leaderTop.endLevel,
              this.deptId, leaderTop.skipEmpty).then(res => {
                result.users = res.data
              }))
          break
        case 'LEADER':
          result.desc = node.props.leader.level === 1 ?
            `直接主管${isApproval ? '审批' : '办理'}`
            : `第${node.props.leader.level}级主管${isApproval ? '审批' : '办理'}`
          this.loadingReqs.push(
            processApi.getUserLeader(
              node.props.leader.level,
              this.deptId,
              node.props.leader.skipEmpty).then(res => {
                result.users = res.data ? [res.data] : []
              }))
          break
        case 'ROLE':
          result.desc = `由角色[${(node.props.role || []).map(r => r.name)}]${isApproval ? '审批' : '办理'}`
          this.loadingReqs.push(
            processApi.getUsersByRoles((node.props.role || []).map(r => r.id)).then(res => {
              result.users = res.data
            }))
          break
        case 'FORM_USER':
          loadCatch = false
          result.desc = `由表单字段内人员${isApproval ? '审批' : '办理'}`
          this.conditionFormItem.add(node.props.formUser)
          result.users = this.formData[node.props.formUser] || []
          break
        case 'FORM_DEPT':
          loadCatch = false
          result.desc = `由表单部门内主管${isApproval ? '审批' : '办理'}`
          this.conditionFormItem.add(node.props.formDept)
          this.loadingReqs.push(
            processApi.getLeaderByDepts((this.formData[node.props.formDept] || []).map(d => d.id)).then(res => {
              result.users = res.data
            }))
          result.desc = '指定部门的领导'
          break
        case 'REFUSE':
          result.desc = `流程此处将被自动驳回`
          break
      }
      if (this.userCatch[node.id] && this.userCatch[node.id].length > 0) {
        result.users = this.userCatch[node.id]
      }
      if (loadCatch) {
        this.userCatch[node.id] = result.users
      }
      return result
    },
    getCcNode (node) {
      let result = {
        id: node.id,
        title: node.name,
        icon: 'el-icon-s-promotion',
        name: '抄送人',
        enableEdit: node.props.shouldAdd,
        type: 'org',
        multiple: true,
        desc: node.props.shouldAdd ? '可添加抄送人' : '',
        users: this.$deepCopy(node.props.assignedUser)
      }
      if (this.userCatch[node.id] && this.userCatch[node.id].length > 0) {
        result.users = this.userCatch[node.id]
      }
      this.userCatch[node.id] = result.users
      return result
    },
    getInclusiveNode (node) {
      let branchTasks = {
        id: node.id,
        title: node.name,
        name: '包容分支',
        icon: 'el-icon-connection',
        enableEdit: false,
        active: node.branchs[0].id, //激活得分支
        options: [], //分支选项，渲染单选框
        desc: '满足条件的分支均会执行',
        branchs: {} //分支数据，不包含分支节点，key=分支子节点id，value = [后续节点]
      }
      const req = processApi.getTrueConditions({
        processDfId: this.processDefId,
        conditionNodeId: node.id,
        multiple: true,
        context: { ...this.formData, deptId: this.deptId }
      }).then(rsp => {
        //拿到满足的条件
        const cds = new Set(rsp.data || [])
        for (let i = 0; i < node.branchs.length; i++) {
          const cdNode = node.branchs[i]
          this.$set(cdNode, 'skip', !cds.has(cdNode.id))
          if (!cdNode.skip) {
            branchTasks.active = cdNode.id
          }
        }
        node.branchs.forEach(nd => {
          branchTasks.options.push({
            id: nd.id,
            title: nd.name,
            skip: nd.skip
          })
          this.$set(branchTasks.branchs, nd.id, [])
          this.loadProcess(nd.children, branchTasks.branchs[nd.id])
        })
      }).catch(err => {
        branchTasks.desc = `<span style="color:#CE5266;">条件解析异常，渲染失败😢<span>`
        this.$err(err, "解析条件失败:")
      })
      this.loadingReqs.push(req)
      return branchTasks
    },
    getConditionNode (node, pbnode, pbid) {
      let branchTasks = {
        id: node.id,
        title: node.name,
        name: '条件分支',
        icon: 'el-icon-share',
        enableEdit: false,
        active: node.branchs[0].id, //激活得分支
        options: [], //分支选项，渲染单选框
        desc: '只执行第一个满足条件的分支',
        branchs: {} //分支数据，不包含分支节点，key=分支子节点id，value = [后续节点]
      }
      const req = processApi.getTrueConditions({
        processDfId: this.processDefId,
        conditionNodeId: node.id,
        multiple: false,
        context: { ...this.formData, deptId: this.deptId }
      }).then(rsp => {
        //拿到满足的条件
        const cds = new Set(rsp.data || [])
        for (let i = 0; i < node.branchs.length; i++) {
          const cdNode = node.branchs[i]
          this.$set(cdNode, 'skip', !cds.has(cdNode.id))
          if (!cdNode.skip) {
            branchTasks.active = cdNode.id
          }
        }
        node.branchs.forEach(nd => {
          branchTasks.options.push({
            id: nd.id,
            title: nd.name,
            skip: nd.skip
          })
          this.$set(branchTasks.branchs, nd.id, [])
          //设置下子级分支的父级分支节点
          this.branchNodeMap.set(nd.id, { node: pbnode, id: pbid })
          this.loadProcess(nd.children, branchTasks.branchs[nd.id], branchTasks, nd.id)
        })
      }).catch(err => {
        branchTasks.desc = `<span style="color:#CE5266;">条件解析异常，渲染失败😢<span>`
        this.$err(err, "解析条件失败:")
      })
      this.loadingReqs.push(req)
      return branchTasks
    },
    getConcurrentNode (node) {
      let concurrentTasks = {
        id: node.id,
        title: node.name,
        name: '并行分支',
        icon: 'el-icon-s-operation',
        enableEdit: false,
        active: node.branchs[0].id, //激活得分支
        options: [], //分支选项，渲染单选框
        desc: '所有分支都将同时执行',
        branchs: {} //分支数据，不包含分支节点，key=分支子节点id，value = [后续节点]
      }
      node.branchs.forEach(nd => {
        concurrentTasks.options.push({
          id: nd.id,
          title: nd.name,
          skip: false
        })
        this.$set(concurrentTasks.branchs, nd.id, [])
        this.loadProcess(nd.children, concurrentTasks.branchs[nd.id])
      })
      return concurrentTasks
    },
    selected (users) {
      this._value[this.selectedNode.id] = []
      users.forEach(u => {
        if (this.selectedNode.users.findIndex(v => v.id === u.id) === -1) {
          this.$set(u, 'enableEdit', true)
          this.selectedNode.users.push(u)
          this._value[this.selectedNode.id].push(u)
        }
      })
    },
    delUser (nodeId, i) {
      this._value[nodeId].splice(i, 1)
    },
    addUser (node) {
      this.selectedNode = node
      this.$refs.orgPicker.show()
    },
    getApprovalMode (mode) {
      switch (mode) {
        case 'AND':
          return '会签';
        case 'NEXT':
          return '按顺序会签'
        case 'OR':
          return '或签'
        default:
          return '?'
      }
    },
    async formChangeHandler (newVal, oldVal) {
      let isChanged = false
      for (const key of this.conditionFormItem) {
        if (this.formValDiff(newVal[key], oldVal[key])) {
          isChanged = true
          break
        }
      }
      if (isChanged) {
        console.log('执行流程重渲染')
        this.loadProcessRender()
      }
      this.oldFormData = this.$deepCopy(this.formData)
    },
    formValDiff (newVal, oldVal) {
      if (typeof (newVal) === 'object') {
        return JSON.stringify(newVal) !== JSON.stringify(oldVal)
      } else {
        return newVal !== oldVal
      }
    },
    //执行校验流程步骤设置
    validate (call) {
      //遍历自选审批人节点
      let isOk = true
      for (let nodeId of this.selectUserNodes) {
        if ((this._value[nodeId] || []).length === 0) {
          //没设置审批人员
          isOk = false
          //遍历所有的分支，从底部向上搜索进行自动切换分支渲染路线
          let brNode = this.branchNodeMap.get(nodeId)
          while (brNode && brNode.id) {
            brNode.node.active = brNode.id
            brNode = this.branchNodeMap.get(brNode.id)
          }
          this.$nextTick(() => {
            if (this.$refs[nodeId]) {
              this.$refs[nodeId].errorShark()
            }
          })
          break
        }
      }
      if (call) {
        call(isOk)
      }
    }
  },
  watch: {
    formData: {
      deep: true,
      handler (val) {
        this.loadProcessRender()
        //this.formChangeHandler(val, this.oldFormData)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.task {
  height: 50px;
}

.branch-tip {
  color: @theme-desc-color;
}

/deep/ .el-timeline-item {
  .el-timeline-item__icon {
    color: #babcc1;
    font-size: 16px;
  }

  .el-timeline-item__node {
    padding: 2px;
    background-color: #f3f2f2;
  }

  .el-timeline-item__tail {
    height: 120%;
    left: 6px;
  }

  .el-timeline-item__content {
    position: relative;

    .process-node-render {
      & > div {
        position: absolute;
        display: inline-block;
      }

      & > div:last-child {
        right: 0;
        top: -10px;
      }
    }

    .is-false {
      span {
        text-decoration: line-through;
        color: #9a9a9a;
      }
    }

    .el-radio-group {
      display: flex;
      overflow: auto;
    }
  }
}

.add-user {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  i {
    padding: 10px;
    font-size: 1.1rem;
    border-radius: 50%;
    border: 1px dashed #8c8c8c;
    cursor: pointer;

    &:hover {
      color: @theme-primary;
      border: 1px dashed @theme-primary;
    }
  }
}
</style>
