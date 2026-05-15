
<script setup lang="ts">
import BonusCrud from '../../cruds/BonusCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="BonusCrud.instance">
    <template v-slot:item.createdAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.createdBy="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>
