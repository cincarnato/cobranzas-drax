
<script setup lang="ts">
import SessionEmailCrud from '../../cruds/SessionEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="SessionEmailCrud.instance">
    <template v-slot:item.mailbox="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
    <template v-slot:item.startedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.pausedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.endedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.lastActivityAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.capacityFillLockedUntil="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

