
<script setup lang="ts">
import CallListCrud from '../../cruds/CallListCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CallListCrud.instance">
    <template v-slot:item.group="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
    <template v-slot:item.file="{value}"><v-img :src="value?.url" max-height="30px" class="my-1" /></template>
    <template v-slot:item.deadline="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.headers="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
  </crud>
</template>

<style scoped>

</style>

