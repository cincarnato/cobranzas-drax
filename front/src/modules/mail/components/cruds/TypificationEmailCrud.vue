
<script setup lang="ts">
import TypificationEmailCrud from '../../cruds/TypificationEmailCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TypificationEmailCrud.instance">

  </crud>
</template>

<style scoped>

</style>
