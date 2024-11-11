<script setup>
import FormComponentMixin from "../FormComponentMixin.js";

const props = defineProps({
  ...FormComponentMixin.props
})
</script>

<template>
  <el-input type="number" :max="config.props.max" :min="config.props.min"
            :placeholder="config.props.placeholder"></el-input>
</template>

<style scoped>

</style>
