<script setup lang="ts">
import {computed} from "vue";
import {useRouter} from "vue-router";
import type {ICallList} from "../../interfaces/ICallList";
import CallAgentSummaryCard from "../agent/CallAgentSummaryCard.vue";

const props = defineProps<{
  callList: ICallList
}>()

const router = useRouter()

const stateTone = computed(() => {
  switch (props.callList.state) {
    case 'EN_CURSO':
      return 'primary'
    case 'VENCIDO':
      return 'warning'
    case 'FINALIZADO':
      return 'success'
    default:
      return 'default'
  }
})

function openAgent() {
  router.push({name: 'CallLogAgent', params: {callListId: props.callList._id}})
}
</script>

<template>
  <div class="dashboard-card d-flex flex-column ga-3">
    <div class="d-flex align-center justify-space-between">
      <v-chip
        :color="stateTone"
        size="small"
        variant="tonal"
      >
        {{ callList.state || 'SIN_ESTADO' }}
      </v-chip>

      <v-btn
        color="primary"
        variant="flat"
        size="small"
        @click="openAgent"
      >
        Abrir gestión
      </v-btn>
    </div>

    <CallAgentSummaryCard :call-list="callList" />
  </div>
</template>

<style scoped>
.dashboard-card {
  height: 100%;
}
</style>
