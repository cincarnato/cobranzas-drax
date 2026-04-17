
<script setup lang="ts">
import PadronCrud from '../../cruds/PadronCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="PadronCrud.instance">
    <template v-slot:item.periodo1="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.periodo2="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.periodo3="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.periodo4="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.baja_fecha="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

