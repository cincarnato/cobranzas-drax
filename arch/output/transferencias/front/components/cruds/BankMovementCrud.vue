
<script setup lang="ts">
import BankMovementCrud from '../../cruds/BankMovementCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="BankMovementCrud.instance">
    <template v-slot:item.fecha="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.pagadorDetectadoId="{value}">{{value?.nombre}}</template>
    <template v-slot:item.afiliadoId="{value}">{{value?.nombre}}</template>
  </crud>
</template>

<style scoped>

</style>

