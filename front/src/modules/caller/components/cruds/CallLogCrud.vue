
<script setup lang="ts">
import CallLogCrud from '../../cruds/CallLogCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CallLogCrud.instance">
    <template v-slot:item.callList="{value}">{{value?.name}}</template>
    <template v-slot:item.promiseDate="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

