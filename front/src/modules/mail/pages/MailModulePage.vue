<script setup lang="ts">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useAuth} from "@drax/identity-vue";
import {useRouter} from "vue-router";

type MailModuleCard = {
  titleKey: string
  descriptionKey: string
  icon: string
  color: string
  routeName: string
  permission?: string
  featured?: boolean
}

const {t} = useI18n()
const auth = useAuth()
const router = useRouter()

const cards: MailModuleCard[] = [
  {
    titleKey: "mail.module.cards.management.title",
    descriptionKey: "mail.module.cards.management.description",
    icon: "mdi-inbox-multiple-outline",
    color: "primary",
    routeName: "EmailManagementPage",
    permission: "inboundemail:view",
    featured: true,
  },
  {
    titleKey: "mail.module.cards.supervision.title",
    descriptionKey: "mail.module.cards.supervision.description",
    icon: "mdi-monitor-dashboard",
    color: "teal",
    routeName: "EmailSupervisionPage",
    permission: "inboundemail:manage",
    featured: true,
  },
  {
    titleKey: "mail.module.cards.mailboxes.title",
    descriptionKey: "mail.module.cards.mailboxes.description",
    icon: "mdi-card-account-mail",
    color: "indigo",
    routeName: "MailboxCrudPage",
    permission: "mailbox:manage",
  },
  {
    titleKey: "mail.module.cards.dashboard.title",
    descriptionKey: "mail.module.cards.dashboard.description",
    icon: "mdi-view-dashboard-variant-outline",
    color: "purple",
    routeName: "InboundEmailDashboardPage",
    permission: "inboundemail:view",
  },
  {
    titleKey: "mail.module.cards.inbound.title",
    descriptionKey: "mail.module.cards.inbound.description",
    icon: "mdi-email-arrow-left-outline",
    color: "blue",
    routeName: "InboundEmailCrudPage",
    permission: "inboundemail:manage",
  },
  {
    titleKey: "mail.module.cards.outbound.title",
    descriptionKey: "mail.module.cards.outbound.description",
    icon: "mdi-email-arrow-right-outline",
    color: "deep-orange",
    routeName: "OutboundEmailCrudPage",
    permission: "outboundemail:manage",
  },

  {
    titleKey: "mail.module.cards.sync.title",
    descriptionKey: "mail.module.cards.sync.description",
    icon: "mdi-sync",
    color: "cyan",
    routeName: "InboundEmailSyncPage",
    permission: "mailbox:manage",
  },
  {
    titleKey: "mail.module.cards.guide.title",
    descriptionKey: "mail.module.cards.guide.description",
    icon: "mdi-book-open-page-variant-outline",
    color: "green",
    routeName: "MailModuleGuidePage",
    permission: "inboundemail:view",
  },
]

const visibleCards = computed(() => cards.filter((card) => !card.permission || auth.hasPermission(card.permission)))

const benefits = computed(() => [
  {
    label: t("mail.module.benefits.sharedInbox"),
    icon: "mdi-account-multiple-check-outline",
  },
  {
    label: t("mail.module.benefits.traceability"),
    icon: "mdi-timeline-check-outline",
  },
  {
    label: t("mail.module.benefits.metrics"),
    icon: "mdi-chart-box-outline",
  },
  {
    label: t("mail.module.benefits.ai"),
    icon: "mdi-brain",
  },
])

function openCard(card: MailModuleCard) {
  void router.push({name: card.routeName})
}
</script>

<template>
  <v-container fluid class="mail-module-page pa-4 pa-md-6">
    <v-row class="align-stretch mb-4" dense>
      <v-col cols="12" lg="7">
        <div class="intro-panel h-100 pa-5 pa-md-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon icon="mdi-email-outline" size="28" />
            </v-avatar>
            <div>
              <div class="text-overline text-primary font-weight-bold">{{ t("mail.module.eyebrow") }}</div>
              <h1 class="text-h4 text-md-h3 font-weight-bold">{{ t("mail.module.title") }}</h1>
            </div>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ t("mail.module.intro") }}
          </p>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ t("mail.module.problem") }}
          </p>
        </div>
      </v-col>
      <v-col cols="12" lg="5">
        <div class="benefits-panel h-100 pa-5">
          <div class="text-subtitle-1 font-weight-bold mb-3">{{ t("mail.module.benefitsTitle") }}</div>
          <v-list bg-color="transparent" density="comfortable" class="pa-0">
            <v-list-item
              v-for="benefit in benefits"
              :key="benefit.label"
              class="px-0"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="36">
                  <v-icon :icon="benefit.icon" size="20" />
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium benefit-text">
                {{ benefit.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3">
      <div>
        <h2 class="text-h5 font-weight-bold">{{ t("mail.module.sectionsTitle") }}</h2>
        <div class="text-body-2 text-medium-emphasis">{{ t("mail.module.sectionsSubtitle") }}</div>
      </div>
    </div>

    <v-row dense>
      <v-col
        v-for="card in visibleCards"
        :key="card.routeName"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          variant="flat"
          border
          class="module-card h-100"
          :class="[`module-card--${card.color}`, {'module-card--featured': card.featured}]"
          role="link"
          tabindex="0"
          :aria-label="`${t('mail.module.openSection')}: ${t(card.titleKey)}`"
          @click="openCard(card)"
          @keydown.enter.prevent="openCard(card)"
          @keydown.space.prevent="openCard(card)"
        >
          <v-card-text class="d-flex flex-column h-100">
            <div class="d-flex align-start ga-3 mb-3">
              <v-avatar :color="card.color" variant="tonal" size="44">
                <v-icon :icon="card.icon" size="24" />
              </v-avatar>
              <div class="min-w-0 flex-grow-1">
                <div class="text-subtitle-1 font-weight-bold card-title">{{ t(card.titleKey) }}</div>
              </div>
              <v-chip
                v-if="card.featured"
                color="primary"
                variant="tonal"
                size="x-small"
                class="featured-chip"
              >
                {{ t("mail.module.featured") }}
              </v-chip>
            </div>
            <p class="text-body-2 text-medium-emphasis flex-grow-1 mb-4 card-description">
              {{ t(card.descriptionKey) }}
            </p>
            <div>
              <v-btn
                class="module-card-action"
                color="primary"
                variant="tonal"
                append-icon="mdi-arrow-right"
                @click.stop="openCard(card)"
              >
                {{ t("mail.module.openSection") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!visibleCards.length"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      {{ t("mail.module.noSections") }}
    </v-alert>
  </v-container>
</template>

<style scoped>
.mail-module-page {
  min-height: 100%;
  position: relative;
  z-index: 1;
  background: rgba(var(--v-theme-background), 0.72);
}

.intro-panel,
.benefits-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}

.benefits-panel {
  background: rgb(var(--v-theme-surface-variant));
}

.module-card {
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 1px 2px rgba(var(--v-theme-on-surface), 0.06);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.module-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: rgb(var(--card-accent));
}

.module-card:hover,
.module-card:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(var(--card-accent), 0.52);
  box-shadow: 0 8px 18px rgba(var(--v-theme-on-surface), 0.12);
}

.module-card:focus-visible {
  outline: 2px solid rgba(var(--card-accent), 0.72);
  outline-offset: 3px;
}

.module-card:hover .module-card-action :deep(.v-btn__append),
.module-card:focus-visible .module-card-action :deep(.v-btn__append) {
  transform: translateX(4px);
}

.module-card--featured {
  border-color: rgba(var(--card-accent), 0.30);
}

.module-card-action :deep(.v-btn__append) {
  transition: transform 180ms ease;
}

.module-card--primary {
  --card-accent: var(--v-theme-primary);
}

.module-card--teal {
  --card-accent: 0, 150, 136;
}

.module-card--indigo {
  --card-accent: 63, 81, 181;
}

.module-card--blue {
  --card-accent: 33, 150, 243;
}

.module-card--deep-orange {
  --card-accent: 255, 87, 34;
}

.module-card--purple {
  --card-accent: 156, 39, 176;
}

.module-card--cyan {
  --card-accent: 0, 188, 212;
}

.module-card--green {
  --card-accent: 76, 175, 80;
}

.module-card :deep(.v-card-text) {
  min-height: 220px;
  padding-top: 20px;
}

.featured-chip {
  flex: 0 0 auto;
}

.card-title,
.card-description,
.benefit-text {
  overflow-wrap: anywhere;
}
</style>
