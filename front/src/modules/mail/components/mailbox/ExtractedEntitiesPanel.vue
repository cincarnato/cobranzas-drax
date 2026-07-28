<script setup lang="ts">
defineProps<{
  entities?: Array<{label: string, value?: string, source?: string, confidence?: number}>
  tags?: string[]
}>()
</script>

<template>
  <div v-if="entities?.length || tags?.length">
    <div class="text-subtitle-2 mb-2">Variables Extraídas IA</div>
    <v-list density="compact" class="pa-0">
      <v-list-item
        v-for="(entity, index) in entities || []"
        :key="`${entity.label}-${index}`"
        :title="entity.label"
        :subtitle="entity.value || '-'"
      >
        <template #append>
          <span class="text-caption text-medium-emphasis">
            {{ entity.confidence ? `${Math.round(entity.confidence * 100)}%` : entity.source || '' }}
          </span>
        </template>
      </v-list-item>
    </v-list>
    <div v-if="tags?.length" class="mt-3">
      <div class="text-body-2 font-weight-medium mb-2">Etiquetas</div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip v-for="tag in tags" :key="tag" size="small" variant="tonal">
          {{ tag }}
        </v-chip>
      </div>
    </div>
  </div>
</template>
