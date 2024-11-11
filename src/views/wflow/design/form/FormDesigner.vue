<script setup lang="ts">
import { ref } from 'vue';
const buildRef = ref();
const emits = defineEmits(['reJson', 'saveDesign']);
const globalDsv = {
  testApiHost: 'http://www.test1.com/api',
  tableJson:
    '[{"relationField":"","relationTable":"","table":"act_ge_bytearray","tableName":"","tableField":"","typeId":"1","fields":[{"columnName":"ID_","field":"ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":1,"allowNull":0,"autoIncrement":0,"identity":0},{"columnName":"REV_","field":"REV_","fieldName":"","dataType":"int","dataLength":"默认","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"NAME_","field":"NAME_","fieldName":"","dataType":"varchar","dataLength":"255","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"DEPLOYMENT_ID_","field":"DEPLOYMENT_ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"BYTES_","field":"BYTES_","fieldName":"","dataType":"longblob","dataLength":"默认","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"GENERATED_","field":"GENERATED_","fieldName":"","dataType":"tinyint","dataLength":"默认","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"f_flow_id","field":"f_flow_id","fieldName":"流程id","dataType":"varchar","dataLength":"50","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"f_flow_task_id","field":"f_flow_task_id","fieldName":"流程任务主键","dataType":"varchar","dataLength":"50","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0}]},{"relationField":"ID_","relationTable":"act_ge_bytearray","table":"act_hi_attachment","tableName":"","tableField":"ID_","typeId":"0","fields":[{"columnName":"ID_","field":"ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":1,"allowNull":0,"autoIncrement":0,"identity":0},{"columnName":"REV_","field":"REV_","fieldName":"","dataType":"int","dataLength":"默认","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"USER_ID_","field":"USER_ID_","fieldName":"","dataType":"varchar","dataLength":"255","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"NAME_","field":"NAME_","fieldName":"","dataType":"varchar","dataLength":"255","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"DESCRIPTION_","field":"DESCRIPTION_","fieldName":"","dataType":"varchar","dataLength":"4000","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"TYPE_","field":"TYPE_","fieldName":"","dataType":"varchar","dataLength":"255","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"TASK_ID_","field":"TASK_ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"PROC_INST_ID_","field":"PROC_INST_ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"URL_","field":"URL_","fieldName":"","dataType":"varchar","dataLength":"4000","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"CONTENT_ID_","field":"CONTENT_ID_","fieldName":"","dataType":"varchar","dataLength":"64","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0},{"columnName":"TIME_","field":"TIME_","fieldName":"","dataType":"datetime","dataLength":"默认","primaryKey":0,"allowNull":1,"autoIncrement":0,"identity":0}]}]',
};
//获取表单json
const getJson = () => {
  const formJson = JSON.stringify(buildRef.value.getFormJson());
  const fieldJson = JSON.stringify(buildRef.value.getFieldWidgets());
  let data = {
    formJson,
    fieldJson,
  };
  emits('saveDesign', data);
};
</script>

<template>
  <!-- 代码构建 -->
  <div>
    <v-form-designer
      ref="buildRef"
      class="build"
      :designer-config="{
        importJsonButton: true,
        exportJsonButton: true,
        exportCodeButton: true,
        generateSFCButton: true,
        formTemplates: true,
      }"
      :global-dsv="globalDsv"
    >
    </v-form-designer>
  </div>
</template>

<style lang="scss">
.build {
  margin: 0 !important;
  overflow-y: auto !important;

  & .right-toolbar-con {
    text-align: right !important;
  }
}
</style>
