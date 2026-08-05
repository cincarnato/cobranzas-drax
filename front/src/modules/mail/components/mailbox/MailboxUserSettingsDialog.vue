<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import type {IMailbox} from "@/modules/mail/interfaces/IMailbox";
import type {IMailboxUserSetting} from "@/modules/mail/interfaces/IMailboxUserSetting";
import type {ITemplateEmail} from "@/modules/mail/interfaces/ITemplateEmail";
import TemplateEmailProvider from "@/modules/mail/providers/TemplateEmailProvider";
import MailRichTextEditor from "@/modules/mail/components/MailRichTextEditor.vue";

const props = defineProps<{
  modelValue: boolean
  mailbox: IMailbox | null
  settings: IMailboxUserSetting | null
  loading?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "save", value: {signatureHtml: string; signatureText: string}): void
}>()

const {t} = useI18n()
const auth = useAuth()
const activeTab = ref("signature")
const signatureHtml = ref("")
const signatureText = ref("")
const templateEmails = ref<ITemplateEmail[]>([])
const templateEmailLoading = ref(false)
const templateEmailSaving = ref(false)
const templateEmailDeletingId = ref<string | null>(null)
const templateEmailDialog = ref(false)
const templateEmailError = ref("")
const templateEmailForm = ref({
  _id: "",
  name: "",
  content: "",
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
})
const canViewTemplateEmail = computed(() => hasTemplateEmailPermission("view"))
const canCreateTemplateEmail = computed(() => hasTemplateEmailPermission("create"))
const canUpdateTemplateEmail = computed(() => hasTemplateEmailPermission("update"))
const canDeleteTemplateEmail = computed(() => hasTemplateEmailPermission("delete"))
const templateEmailDialogTitle = computed(() => templateEmailForm.value._id ? t("mail.settings.editPreparedMessage") : t("mail.settings.newPreparedMessage"))
const canSaveTemplateEmail = computed(() => Boolean(
  props.mailbox?._id &&
  templateEmailForm.value.name.trim() &&
  templateEmailForm.value.content.trim() &&
  (templateEmailForm.value._id ? canUpdateTemplateEmail.value : canCreateTemplateEmail.value)
))

watch(
  () => [props.modelValue, props.settings?._id, props.settings?.signatureHtml],
  () => {
    if (!props.modelValue) return
    signatureHtml.value = props.settings?.signatureHtml || ""
    signatureText.value = props.settings?.signatureText || ""
  },
  {immediate: true}
)

watch(
  () => [props.modelValue, props.mailbox?._id],
  () => {
    if (!props.modelValue) return
    activeTab.value = "signature"
    templateEmailError.value = ""
    closeTemplateEmailDialog()
    if (canViewTemplateEmail.value) {
      void fetchTemplateEmails()
    } else {
      templateEmails.value = []
    }
  },
  {immediate: true}
)

function hasTemplateEmailPermission(action: "view" | "create" | "update" | "delete") {
  return auth.hasPermission(`templateemail:${action}`) || auth.hasPermission("templateemail:manage")
}

function save() {
  emit("save", {
    signatureHtml: signatureHtml.value,
    signatureText: signatureText.value,
  })
}

async function fetchTemplateEmails() {
  if (!props.mailbox?._id || !canViewTemplateEmail.value) {
    templateEmails.value = []
    return
  }
  templateEmailLoading.value = true
  templateEmailError.value = ""
  try {
    const result = await TemplateEmailProvider.instance.paginate({
      page: 1,
      limit: 200,
      orderBy: "name",
      order: "asc",
      filters: [{field: "mailbox", operator: "eq", value: props.mailbox._id}],
    })
    templateEmails.value = result.items || []
  } catch {
    templateEmails.value = []
    templateEmailError.value = t("mail.settings.preparedMessageLoadError")
  } finally {
    templateEmailLoading.value = false
  }
}

function openCreateTemplateEmail() {
  if (!props.mailbox?._id || !canCreateTemplateEmail.value) return
  templateEmailForm.value = {_id: "", name: "", content: ""}
  templateEmailError.value = ""
  templateEmailDialog.value = true
}

function openEditTemplateEmail(templateEmail: ITemplateEmail) {
  if (!canUpdateTemplateEmail.value) return
  templateEmailForm.value = {
    _id: templateEmail._id,
    name: templateEmail.name || "",
    content: templateEmail.content || "",
  }
  templateEmailError.value = ""
  templateEmailDialog.value = true
}

function closeTemplateEmailDialog() {
  templateEmailDialog.value = false
  templateEmailForm.value = {_id: "", name: "", content: ""}
}

async function saveTemplateEmail() {
  if (!props.mailbox?._id || !canSaveTemplateEmail.value) return
  templateEmailSaving.value = true
  templateEmailError.value = ""
  try {
    const payload = {
      mailbox: props.mailbox._id,
      name: templateEmailForm.value.name.trim(),
      content: templateEmailForm.value.content,
    }
    if (templateEmailForm.value._id) {
      await TemplateEmailProvider.instance.update(templateEmailForm.value._id, payload)
    } else {
      await TemplateEmailProvider.instance.create(payload)
    }
    closeTemplateEmailDialog()
    await fetchTemplateEmails()
    templateEmailError.value = ""
  } catch {
    templateEmailError.value = t("mail.settings.preparedMessageSaveError")
  } finally {
    templateEmailSaving.value = false
  }
}

async function deleteTemplateEmail(templateEmail: ITemplateEmail) {
  if (!canDeleteTemplateEmail.value || !window.confirm(t("mail.settings.deletePreparedMessageConfirm"))) return
  templateEmailDeletingId.value = templateEmail._id
  templateEmailError.value = ""
  try {
    await TemplateEmailProvider.instance.delete(templateEmail._id)
    await fetchTemplateEmails()
  } catch {
    templateEmailError.value = t("mail.settings.preparedMessageDeleteError")
  } finally {
    templateEmailDeletingId.value = null
  }
}

function contentPreview(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="980" persistent>
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-cog-outline" />
        {{ t('mail.settings.title') }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="mailbox"
          variant="tonal"
          color="primary"
          density="compact"
          class="mb-4"
        >
          {{ mailbox.name }} - {{ mailbox.email }}
        </v-alert>

        <v-row no-gutters class="settings-layout">
          <v-col cols="12" md="3" class="settings-tabs border-e">
            <v-tabs
              v-model="activeTab"
              direction="vertical"
              color="primary"
              class="align-start"
            >
              <v-tab value="signature" prepend-icon="mdi-draw">
                {{ t('mail.settings.signature') }}
              </v-tab>
              <v-tab value="preparedMessages" prepend-icon="mdi-email-edit-outline">
                {{ t('mail.settings.preparedMessages') }}
              </v-tab>
            </v-tabs>
          </v-col>

          <v-col cols="12" md="9" class="settings-content">
            <v-window v-model="activeTab">
              <v-window-item value="signature">
                <div class="settings-pane">
                  <v-skeleton-loader v-if="loading" type="paragraph, actions" />

                  <div v-else>
                    <div class="text-subtitle-2 mb-1">
                      {{ t('mail.settings.signature') }}
                    </div>
                    <MailRichTextEditor
                      v-model="signatureHtml"
                      :label="t('mail.settings.signature')"
                      :min-height="180"
                      @update:text="signatureText = $event"
                    />
                  </div>
                </div>
              </v-window-item>

              <v-window-item value="preparedMessages">
                <div class="settings-pane">
                  <div class="d-flex align-center justify-space-between ga-3 mb-3">
                    <div class="text-subtitle-2">
                      {{ t('mail.settings.preparedMessages') }}
                    </div>
                    <v-btn
                      v-if="canCreateTemplateEmail"
                      color="primary"
                      variant="tonal"
                      prepend-icon="mdi-plus"
                      :disabled="!mailbox"
                      @click="openCreateTemplateEmail"
                    >
                      {{ t('mail.settings.newPreparedMessage') }}
                    </v-btn>
                  </div>

                  <v-alert
                    v-if="!canViewTemplateEmail"
                    type="warning"
                    variant="tonal"
                    density="compact"
                  >
                    {{ t('mail.settings.noPreparedMessagePermission') }}
                  </v-alert>

                  <v-alert
                    v-else-if="templateEmailError"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                  >
                    {{ templateEmailError }}
                  </v-alert>

                  <v-skeleton-loader v-if="templateEmailLoading" type="list-item-three-line@3" />

                  <v-list v-else-if="canViewTemplateEmail && templateEmails.length" class="pa-0" density="comfortable">
                    <v-list-item
                      v-for="templateEmail in templateEmails"
                      :key="templateEmail._id"
                      class="border-b px-0"
                    >
                      <v-list-item-title class="font-weight-medium">
                        {{ templateEmail.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="template-preview">
                        {{ contentPreview(templateEmail.content) }}
                      </v-list-item-subtitle>
                      <template #append>
                        <div class="d-flex ga-1">
                          <v-btn
                            v-if="canUpdateTemplateEmail"
                            icon="mdi-pencil-outline"
                            variant="text"
                            density="comfortable"
                            :aria-label="t('mail.settings.editPreparedMessage')"
                            @click="openEditTemplateEmail(templateEmail)"
                          />
                          <v-btn
                            v-if="canDeleteTemplateEmail"
                            icon="mdi-delete-outline"
                            variant="text"
                            color="error"
                            density="comfortable"
                            :loading="templateEmailDeletingId === templateEmail._id"
                            :aria-label="t('mail.settings.deletePreparedMessage')"
                            @click="deleteTemplateEmail(templateEmail)"
                          />
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>

                  <v-empty-state
                    v-else-if="canViewTemplateEmail"
                    icon="mdi-email-edit-outline"
                    :text="t('mail.settings.noPreparedMessages')"
                  />
                </div>
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="isOpen = false">
          {{ t('mail.settings.close') }}
        </v-btn>
        <v-btn
          v-if="activeTab === 'signature'"
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="loading || !mailbox"
          @click="save"
        >
          {{ t('mail.settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="templateEmailDialog" max-width="760">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="mdi-email-edit-outline" />
          {{ templateEmailDialogTitle }}
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-alert
            v-if="templateEmailError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ templateEmailError }}
          </v-alert>

          <v-text-field
            v-model="templateEmailForm.name"
            :label="t('mail.settings.name')"
            :rules="[(value: string) => !!value?.trim() || 'validation.required']"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <MailRichTextEditor
            v-model="templateEmailForm.content"
            :label="t('mail.settings.content')"
            :min-height="220"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="templateEmailSaving" @click="closeTemplateEmailDialog">
            {{ t('mail.settings.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="templateEmailSaving"
            :disabled="!canSaveTemplateEmail"
            @click="saveTemplateEmail"
          >
            {{ t('mail.settings.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<style scoped>
.settings-layout {
  min-height: 340px;
}

.settings-tabs {
  min-width: 190px;
}

.settings-content {
  min-width: 0;
}

.settings-pane {
  padding: 12px 0 0 32px;
}

.template-preview {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 959px) {
  .settings-tabs {
    border-inline-end: 0 !important;
    border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    margin-bottom: 16px;
  }

  .settings-content {
    padding: 0;
  }

  .settings-pane {
    padding: 8px 0 0;
  }
}
</style>
