<script setup lang="ts">
import {computed, markRaw, ref, watch} from "vue";
import type {Component} from "vue";
import embeddedRouter from "@/modules/mail/embedded/EmbeddedRouter";

const emit = defineEmits<{
  (e: "closed"): void
}>()

const opened = computed({
  get: () => embeddedRouter.state.opened,
  set: (value: boolean) => {
    if (!value) embeddedRouter.close()
  },
})

const resolvedComponent = ref<Component | null>(null)
const loading = ref(false)
const errorMessage = ref("")

watch(() => embeddedRouter.state.opened, (value, previous) => {
  if (previous && !value) emit("closed")
})

watch(
  () => embeddedRouter.state.instanceKey,
  async () => {
    const route = embeddedRouter.state.route
    resolvedComponent.value = null
    errorMessage.value = ""

    if (!embeddedRouter.state.opened || !route) return

    loading.value = true
    const currentKey = embeddedRouter.state.instanceKey

    try {
      const componentModule = await route.component()
      if (currentKey !== embeddedRouter.state.instanceKey) return
      resolvedComponent.value = markRaw("default" in componentModule ? componentModule.default : componentModule)
    } catch (error) {
      console.error("Error loading embedded route component:", error)
      if (currentKey === embeddedRouter.state.instanceKey) {
        errorMessage.value = "No se pudo cargar esta funcionalidad."
      }
    } finally {
      if (currentKey === embeddedRouter.state.instanceKey) loading.value = false
    }
  },
  {immediate: true}
)

function close() {
  embeddedRouter.close()
}
</script>

<template>
  <v-dialog
    v-model="opened"
    fullscreen
    scrollable
  >
    <v-card class="embedded-router-dialog">
      <v-toolbar density="compact" color="surface">
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>

      <v-card-text class="pa-0 embedded-router-dialog__content">
        <div v-if="loading" class="pa-6">
          <v-skeleton-loader type="article, actions" />
        </div>
        <v-alert
          v-else-if="errorMessage"
          type="error"
          variant="tonal"
          class="ma-6"
        >
          {{ errorMessage }}
        </v-alert>
        <component
          :is="resolvedComponent"
          v-else-if="resolvedComponent"
          :key="embeddedRouter.state.instanceKey"
          v-bind="embeddedRouter.state.componentProps"
          @close="close"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.embedded-router-dialog {
  height: 100vh;
}
.embedded-router-dialog__content {
  height: calc(100vh - 48px);
  overflow: auto;
}
</style>
