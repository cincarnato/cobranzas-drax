
<script setup lang="ts">
import WhatsappMessageCrud from '../../cruds/WhatsappMessageCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="WhatsappMessageCrud.instance">
    <template v-slot:item.sentAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>

