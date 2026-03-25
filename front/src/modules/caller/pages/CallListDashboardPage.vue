<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import type {ICallList} from "../interfaces/ICallList";
import CallListProvider from "../providers/CallListProvider";
import CallListDashboardFilters from "../components/dashboard/CallListDashboardFilters.vue";
import CallListDashboardCard from "../components/dashboard/CallListDashboardCard.vue";

const loading = ref(false)
const items = ref<ICallList[]>([])
const totalItems = ref(0)
const pageNumber = ref(1)
const itemsPerPage = ref(6)

const fromDate = ref<string | null>(startOfMonth())
const toDate = ref<string | null>(endOfMonth())
const groupIds = ref<string[]>([])
const userIds = ref<string[]>([])

const pageCount = computed(() => Math.max(Math.ceil(totalItems.value / itemsPerPage.value), 1))

const filters = computed<IDraxFieldFilter[]>(() => {
  const currentFilters: IDraxFieldFilter[] = [
    {
      field: 'state',
      operator: 'in',
      value: ['EN_CURSO', 'VENCIDO']
    }
  ]

  if (fromDate.value) {
    currentFilters.push({
      field: 'deadline',
      operator: 'gte',
      value: new Date(`${fromDate.value}T00:00:00`)
    })
  }

  if (toDate.value) {
    currentFilters.push({
      field: 'deadline',
      operator: 'lte',
      value: new Date(`${toDate.value}T23:59:59`)
    })
  }

  if (groupIds.value.length) {
    currentFilters.push({
      field: 'group',
      operator: 'in',
      value: groupIds.value
    })
  }

  if (userIds.value.length) {
    currentFilters.push({
      field: 'user',
      operator: 'in',
      value: userIds.value
    })
  }

  return currentFilters
})

watch(filters, () => {
  pageNumber.value = 1
  void fetchCallLists()
}, {deep: true})

watch([pageNumber, itemsPerPage], () => {
  void fetchCallLists()
})

onMounted(() => {
  void fetchCallLists()
})

async function fetchCallLists() {
  loading.value = true
  try {
    const result = await CallListProvider.instance.paginate({
      page: pageNumber.value,
      limit: itemsPerPage.value,
      orderBy: '_id',
      order: 'desc',
      filters: filters.value
    })

    items.value = result.items ?? []
    totalItems.value = result.total ?? 0
  } catch (error) {
    console.error('Error fetching call list dashboard:', error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  fromDate.value = startOfMonth()
  toDate.value = endOfMonth()
  groupIds.value = []
  userIds.value = []
}

function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function endOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
}
</script>

<template>
  <v-container fluid class="py-6">
    <div class="d-flex flex-column ga-6">
      <CallListDashboardFilters
        v-model:from="fromDate"
        v-model:to="toDate"
        v-model:groups="groupIds"
        v-model:users="userIds"
        @apply="fetchCallLists"
        @reset="resetFilters"
      />

      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <div class="text-h5">Listas activas</div>
          <div class="text-medium-emphasis">
            {{ totalItems }} listas encontradas para el período seleccionado.
          </div>
        </div>

        <v-select
          v-model="itemsPerPage"
          :items="[6, 12, 24]"
          label="Por página"
          variant="outlined"
          hide-details
          density="comfortable"
          class="page-size-select"
        />
      </div>

      <v-alert
        v-if="!loading && items.length === 0"
        type="info"
        variant="tonal"
      >
        No hay listados cargados para esos filtros.
      </v-alert>

      <v-row v-else>
        <v-col
          v-for="item in items"
          :key="item._id"
          cols="12"
          md="6"
          xl="4"
        >
          <CallListDashboardCard :call-list="item" />
        </v-col>

        <v-col
          v-if="loading"
          v-for="index in itemsPerPage"
          :key="index"
          cols="12"
          md="6"
          xl="4"
        >
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <div class="d-flex justify-center">
        <v-pagination
          v-model="pageNumber"
          :length="pageCount"
          :total-visible="7"
        />
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.page-size-select {
  max-width: 150px;
}
</style>
