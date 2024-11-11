<script setup>
import nodeType, {NodeComponents} from "./ProcessNodes.js";
import {ElMessage} from "element-plus";
import {ref} from "vue";

const props = defineProps({
  readonly: { //流程图只读模式
    default: false
  },
  modelValue: {
    required: true,
    type: Object,
    default: () => {
      return []
    }
  }
})

defineEmits(['select'])
defineExpose({validate})

const node = ref()

/**
 * 删除某个元素
 * @param branch 要删除的元素所在支路
 * @param i 删除的元素在该支路内索引位置
 */
function deleteNode(branch, i) {
  branch.splice(i, 1)
}

/**
 * 插入节点
 * @param branch 该节点要插入的支路（节点数组）
 * @param i 插入哪个元素后面的索引，实际插入位置为i+1
 * @param type 要插入的节点类型
 */
function insertNode(branch, i, type) {
  if (nodeType[type]) {
    branch.splice(i + 1, 0, nodeType[type].create(type))
  } else {
    ElMessage.warning('请在ProcessNodes.js内配置该节点')
  }
}

function validate() {
  return new Promise((resolve, reject) => {
    const errs = []
    if (Array.isArray(node.value)) {
      node.value.forEach(ref => {
        if (ref.validate) {
          ref.validate(errs)
        }
      })
    } else if (node.value && node.value.validate){
      node.value.validate(errs)
    }
    if (errs.length === 0) {
      resolve()
    } else {
      reject(errs)
    }
  })
}

</script>

<template>
  <div class="w-process">
    <template v-for="(node, i) in modelValue || []" :key="node.id + node.type">
      <component :readonly="readonly" v-model="modelValue[i]" :branch="modelValue" :index="i"
                 @select="nd => $emit('select', nd)" ref="node"
                 :is="NodeComponents[node.type]" @delete="deleteNode" @insertNode="insertNode"/>
    </template>
    <div class="w-process-end">流程结束</div>
  </div>
</template>

<style lang="less" scoped>
.w-process {
  display: flex;
  flex-direction: column;
  align-items: center;

  .w-process-node {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .w-process-end {
    padding: 10px;
    border-radius: 5px;
    background: @node-line-color;
  }
}
</style>
