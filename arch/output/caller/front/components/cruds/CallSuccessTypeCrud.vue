
<script setup lang="ts">
import CallSuccessTypeCrud from '../../cruds/CallSuccessTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CallSuccessTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

