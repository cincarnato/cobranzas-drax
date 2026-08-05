
<script setup lang="ts">
import TemplateEmailCrud from '../../cruds/TemplateEmailCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TemplateEmailCrud.instance">
    <template v-slot:item.mailbox="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>
