
<script setup lang="ts">
import InboundEmailCrud from '../../cruds/InboundEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="InboundEmailCrud.instance">
    <template v-slot:item.receivedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.toEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.ccEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.processedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.lastErrorAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

