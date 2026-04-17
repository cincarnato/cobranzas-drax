
<script setup lang="ts">
import AffiliateCrud from '../../cruds/AffiliateCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AffiliateCrud.instance">
    <template v-slot:item.titular="{value}">{{value?.apellidoNombre}}</template>
  </crud>
</template>

<style scoped>

</style>

