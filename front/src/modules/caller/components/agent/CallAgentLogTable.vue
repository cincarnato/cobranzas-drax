<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import type {ICallList} from "../../interfaces/ICallList";
import type {ICallLog} from "../../interfaces/ICallLog";
import CallLogProvider from "../../providers/CallLogProvider";
import CallAgentDataPreview from "./CallAgentDataPreview.vue";
import CallAgentLogDialog from "./CallAgentLogDialog.vue";

const props = defineProps<{
  callList: ICallList
}>()

const emit = defineEmits<{
  updated: []
}>()

const loading = ref(false)
const items = ref<ICallLog[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const showCompleted = ref(false)
const selectedCallLog = ref<ICallLog | null>(null)
const dialogOpen = ref(false)

const pageCount = computed(() => Math.max(Math.ceil(total.value / limit.value), 1))

const filters = computed(() => {
  const activeFilters: Array<{ field: string, operator: string, value: unknown }> = [
    {field: 'callList', operator: 'eq', value: props.callList._id}
  ]

  activeFilters.push({field: 'done', operator: 'eq', value: showCompleted.value})

  return activeFilters
})

watch(() => props.callList._id, () => {
  page.value = 1
  void fetchItems()
})

watch(showCompleted, () => {
  page.value = 1
  void fetchItems()
})

watch([page, limit], () => {
  void fetchItems()
})

onMounted(() => {
  void fetchItems()
})

function formatDate(date?: Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-AR')
}

function stateColor(state?: string) {
  switch (state) {
    case 'exitosa':
      return 'success'
    case 'promesa':
      return 'info'
    case 'fallida':
      return 'error'
    case 'intentada':
      return 'secondary'
    default:
      return 'default'
  }
}

async function fetchItems() {
  loading.value = true
  try {
    const result = await CallLogProvider.instance.paginate({
      page: page.value,
      limit: limit.value,
      orderBy: 'attempts',
      order: 'asc',
      filters: filters.value
    })

    items.value = result.items ?? []
    total.value = result.total ?? 0
  } catch (error) {
    console.error('Error fetching call logs:', error)
  } finally {
    loading.value = false
  }
}

function openDialog(item: ICallLog) {
  selectedCallLog.value = item
  dialogOpen.value = true
}

async function handleUpdated() {
  emit('updated')
  await fetchItems()
}
</script>

<template>
  <v-card>
    <v-card-item>
      <v-card-title>Gestión de llamadas</v-card-title>
      <v-card-subtitle>
        Registros de la lista con acceso directo al panel de tipificación.
      </v-card-subtitle>
      <template #append>
        <div class="d-flex align-center ga-3">
          <v-switch
            v-model="showCompleted"
            color="primary"
            hide-details
            inset
            label="Mostrar contactados"
          />

          <v-select
            v-model="limit"
            :items="[5, 10, 25, 50]"
            density="compact"
            hide-details
            label="Filas"
            style="max-width: 90px"
            variant="outlined"
          />
        </div>
      </template>
    </v-card-item>

    <v-divider/>

    <div class="table-shell">
      <v-table>
        <thead>
        <tr>
          <th>Datos</th>
          <th>Intentos</th>
          <th>Notas</th>
          <th>Tipificación</th>
          <th>Estado</th>
          <th>Promesa</th>
          <th class="text-right">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="loading">
          <td colspan="7" class="text-center py-8">
            <v-progress-circular indeterminate color="primary"/>
          </td>
        </tr>

        <tr v-else-if="!items.length">
          <td colspan="7" class="text-center py-8 text-medium-emphasis">
            No hay registros para mostrar.
          </td>
        </tr>

        <tr
          v-for="item in items"
          :key="item._id"
        >
          <td class="data-cell">
            <CallAgentDataPreview
              :data="item.data"
              mode="simple"
            />
          </td>
          <td>{{ item.attempts ?? 0 }}</td>
          <td>{{ item.notes || '-' }}</td>
          <td>{{ item.typification || '-' }}</td>
          <td>
            <v-chip
              :color="stateColor(item.state)"
              size="small"
              variant="tonal"
            >
              {{ item.state || 'pendiente' }}
            </v-chip>
          </td>
          <td>{{ formatDate(item.promiseDate) }}</td>
          <td class="text-right">
            <v-btn
              color="primary"
              size="small"
              variant="outlined"
              @click="openDialog(item)"
            >
              Llamar
            </v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>
    </div>

    <v-divider/>

    <v-card-actions class="justify-space-between px-4 py-3">
      <div class="text-caption text-medium-emphasis">
        {{ total }} registros
      </div>

      <v-pagination
        v-model="page"
        :length="pageCount"
        :total-visible="6"
      />
    </v-card-actions>

    <CallAgentLogDialog
      v-model="dialogOpen"
      :call-log="selectedCallLog"
      @updated="handleUpdated"
    />
  </v-card>
</template>

<style scoped>
.table-shell {
  overflow-x: auto;
}

.data-cell {
  min-width: 260px;
}
</style>
