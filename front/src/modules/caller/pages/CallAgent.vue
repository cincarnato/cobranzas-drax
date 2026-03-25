<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import type {ICallList} from "../interfaces/ICallList";
import CallListProvider from "../providers/CallListProvider";
import CallAgentSummaryCard from "../components/agent/CallAgentSummaryCard.vue";
import CallAgentLogTable from "../components/agent/CallAgentLogTable.vue";

const route = useRoute()

const loadingCallList = ref(false)
const callList = ref<ICallList | null>(null)

const callListId = computed(() => {
  const routeId = route.params.callListId
  return Array.isArray(routeId) ? routeId[0] : routeId
})

watch(callListId, () => {
  void fetchCallList()
})

onMounted(() => {
  void fetchCallList()
})

async function fetchCallList() {
  if (!callListId.value) {
    callList.value = null
    return
  }

  loadingCallList.value = true
  try {
    callList.value = await CallListProvider.instance.findById(callListId.value)
  } catch (error) {
    console.error('Error fetching call list:', error)
    callList.value = null
  } finally {
    loadingCallList.value = false
  }
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-alert
      v-if="!callListId"
      type="warning"
      variant="tonal"
    >
      Falta el identificador de la lista en la ruta.
    </v-alert>

    <v-row v-else>
      <v-col cols="12" md="4" lg="3">
        <template v-if="callList">
          <CallAgentSummaryCard
            :call-list="callList"
            :loading="loadingCallList"
          />
        </template>
        <v-skeleton-loader
          v-else-if="loadingCallList"
          type="card"
        />
        <v-alert
          v-else
          type="error"
          variant="tonal"
        >
          No se pudo cargar la lista.
        </v-alert>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        <template v-if="callList">
          <CallAgentLogTable
            :call-list="callList"
            @updated="fetchCallList"
          />
        </template>
        <v-skeleton-loader
          v-else-if="loadingCallList"
          type="table"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
