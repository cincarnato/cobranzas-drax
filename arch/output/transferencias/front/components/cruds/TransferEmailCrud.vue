
<script setup lang="ts">
import TransferEmailCrud from '../../cruds/TransferEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="TransferEmailCrud.instance">
    <template v-slot:item.inboundEmail="{value}">{{value?.messageId}}</template>
    <template v-slot:item.transferDate="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

