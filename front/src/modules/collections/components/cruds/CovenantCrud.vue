
<script setup lang="ts">
import CovenantCrud from '../../cruds/CovenantCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CovenantCrud.instance">
    <template v-slot:item.date="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.group="{value}">{{value?.name}}</template>
    <template v-slot:item.createdBy="{value}">{{value?.name}}</template>
    <template v-slot:item.updatedBy="{value}">{{value?.name}}</template>
    <template v-slot:item.refuseBy="{value}">{{value?.name}}</template>
    <template v-slot:item.hora="{item}: {item: any}">
      {{item?.since}} - {{item?.until}}
    </template>
  </crud>
</template>

<style scoped>

</style>

