<script setup>
import FormComponentMixin from "../FormComponentMixin.js";

const props = defineProps({
  ...FormComponentMixin.props,

})
</script>

<template>
  <el-input show-word-limit :rows="3" type="textarea"
            :maxlength="config.props.max || 255"
            :placeholder="config.props.placeholder"/>
</template>

<style scoped>

</style>
