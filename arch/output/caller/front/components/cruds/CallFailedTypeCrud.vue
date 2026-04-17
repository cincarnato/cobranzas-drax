
<script setup lang="ts">
import CallFailedTypeCrud from '../../cruds/CallFailedTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CallFailedTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

