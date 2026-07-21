<script setup lang="ts">
defineProps<{attachments?: Array<{filename?: string, url?: string, size?: number, mimetype?: string}>}>()

function sizeLabel(size?: number) {
  if (!size) return ""
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${Math.ceil(size / 1024)} KB`
}
</script>

<template>
  <div v-if="attachments?.length" class="d-flex flex-wrap ga-2 mt-3">
    <v-chip
      v-for="(attachment, index) in attachments"
      :key="`${attachment.filename}-${index}`"
      prepend-icon="mdi-paperclip"
      size="small"
      variant="tonal"
      :href="attachment.url"
      target="_blank"
    >
      {{ attachment.filename || 'Adjunto' }} {{ sizeLabel(attachment.size) }}
    </v-chip>
  </div>
</template>
