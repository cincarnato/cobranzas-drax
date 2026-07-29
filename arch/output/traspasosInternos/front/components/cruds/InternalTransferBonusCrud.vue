
<script setup lang="ts">
import InternalTransferBonusCrud from '../../cruds/InternalTransferBonusCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="InternalTransferBonusCrud.instance">
    <template v-slot:item.bankDataAttachment="{value}"><v-img :src="value?.url" max-height="30px" class="my-1" /></template>
    <template v-slot:item.createdBy="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>

