<script setup>
import FormProcessDesigner from "@/views/wflow/admin/FormProcessDesigner.vue";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

</script>

<template>
  <div class="app">
    <el-config-provider :locale="zhCn">
      <form-process-designer></form-process-designer>
    </el-config-provider>
  </div>
</template>

<style scoped>

</style>
