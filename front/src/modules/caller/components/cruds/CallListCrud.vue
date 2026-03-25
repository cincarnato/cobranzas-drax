
<script setup lang="ts">
import CallListCrud from '../../cruds/CallListCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CallListCrud.instance">
    <template v-slot:item.group="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
    <template v-slot:item.file="{value}">
      <v-btn size="small" variant="text" icon="mdi-file" :href="value.url" target="_blank"></v-btn>
    </template>
    <template v-slot:item.deadline="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.headers="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>

    <template v-slot:item.actions="{item} : {item: any}">
      <v-btn size="small" variant="text" :href="'/call/agent/'+item?._id" icon="mdi-face-agent"></v-btn>
    </template>

  </crud>
</template>

<style scoped>

</style>

