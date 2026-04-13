
<script setup lang="ts">
import PayerEntityCrud from '../../cruds/PayerEntityCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="PayerEntityCrud.instance">
    <template v-slot:item.ultimaVezDetectado="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

