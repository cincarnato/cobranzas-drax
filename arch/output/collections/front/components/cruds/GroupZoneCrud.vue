
<script setup lang="ts">
import GroupZoneCrud from '../../cruds/GroupZoneCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="GroupZoneCrud.instance">
    <template v-slot:item.users="{value}">{{ value.map(v => v.username).join(",") }}</template>
  </crud>
</template>

<style scoped>

</style>

