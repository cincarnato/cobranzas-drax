<script setup lang="ts">
import {computed} from "vue";
import {useI18n} from "vue-i18n";

type GuideItem = {
  titleKey: string
  textKey: string
}

type GuideSection = {
  id: string
  icon: string
  color: string
  titleKey: string
  descriptionKey: string
  items: GuideItem[]
}

const {t} = useI18n()

const sections: GuideSection[] = [
  {
    id: "concepts",
    icon: "mdi-lightbulb-on-outline",
    color: "primary",
    titleKey: "mail.moduleGuide.sections.concepts.title",
    descriptionKey: "mail.moduleGuide.sections.concepts.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.concepts.items.mailbox.title", textKey: "mail.moduleGuide.sections.concepts.items.mailbox.text"},
      {titleKey: "mail.moduleGuide.sections.concepts.items.inbound.title", textKey: "mail.moduleGuide.sections.concepts.items.inbound.text"},
      {titleKey: "mail.moduleGuide.sections.concepts.items.operator.title", textKey: "mail.moduleGuide.sections.concepts.items.operator.text"},
      {titleKey: "mail.moduleGuide.sections.concepts.items.session.title", textKey: "mail.moduleGuide.sections.concepts.items.session.text"},
    ],
  },
  {
    id: "configuration",
    icon: "mdi-card-account-mail",
    color: "indigo",
    titleKey: "mail.moduleGuide.sections.configuration.title",
    descriptionKey: "mail.moduleGuide.sections.configuration.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.configuration.items.general.title", textKey: "mail.moduleGuide.sections.configuration.items.general.text"},
      {titleKey: "mail.moduleGuide.sections.configuration.items.connection.title", textKey: "mail.moduleGuide.sections.configuration.items.connection.text"},
      {titleKey: "mail.moduleGuide.sections.configuration.items.management.title", textKey: "mail.moduleGuide.sections.configuration.items.management.text"},
      {titleKey: "mail.moduleGuide.sections.configuration.items.processing.title", textKey: "mail.moduleGuide.sections.configuration.items.processing.text"},
      {titleKey: "mail.moduleGuide.sections.configuration.items.ai.title", textKey: "mail.moduleGuide.sections.configuration.items.ai.text"},
    ],
  },
  {
    id: "daily-work",
    icon: "mdi-inbox-multiple-outline",
    color: "blue",
    titleKey: "mail.moduleGuide.sections.dailyWork.title",
    descriptionKey: "mail.moduleGuide.sections.dailyWork.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.dailyWork.items.selectMailbox.title", textKey: "mail.moduleGuide.sections.dailyWork.items.selectMailbox.text"},
      {titleKey: "mail.moduleGuide.sections.dailyWork.items.startSession.title", textKey: "mail.moduleGuide.sections.dailyWork.items.startSession.text"},
      {titleKey: "mail.moduleGuide.sections.dailyWork.items.views.title", textKey: "mail.moduleGuide.sections.dailyWork.items.views.text"},
      {titleKey: "mail.moduleGuide.sections.dailyWork.items.filters.title", textKey: "mail.moduleGuide.sections.dailyWork.items.filters.text"},
    ],
  },
  {
    id: "case-management",
    icon: "mdi-email-check-outline",
    color: "teal",
    titleKey: "mail.moduleGuide.sections.caseManagement.title",
    descriptionKey: "mail.moduleGuide.sections.caseManagement.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.caseManagement.items.detail.title", textKey: "mail.moduleGuide.sections.caseManagement.items.detail.text"},
      {titleKey: "mail.moduleGuide.sections.caseManagement.items.assign.title", textKey: "mail.moduleGuide.sections.caseManagement.items.assign.text"},
      {titleKey: "mail.moduleGuide.sections.caseManagement.items.reply.title", textKey: "mail.moduleGuide.sections.caseManagement.items.reply.text"},
      {titleKey: "mail.moduleGuide.sections.caseManagement.items.classify.title", textKey: "mail.moduleGuide.sections.caseManagement.items.classify.text"},
      {titleKey: "mail.moduleGuide.sections.caseManagement.items.close.title", textKey: "mail.moduleGuide.sections.caseManagement.items.close.text"},
    ],
  },
  {
    id: "supervision",
    icon: "mdi-monitor-dashboard",
    color: "purple",
    titleKey: "mail.moduleGuide.sections.supervision.title",
    descriptionKey: "mail.moduleGuide.sections.supervision.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.supervision.items.summary.title", textKey: "mail.moduleGuide.sections.supervision.items.summary.text"},
      {titleKey: "mail.moduleGuide.sections.supervision.items.operators.title", textKey: "mail.moduleGuide.sections.supervision.items.operators.text"},
      {titleKey: "mail.moduleGuide.sections.supervision.items.detail.title", textKey: "mail.moduleGuide.sections.supervision.items.detail.text"},
    ],
  },
  {
    id: "recommended-flow",
    icon: "mdi-format-list-checks",
    color: "green",
    titleKey: "mail.moduleGuide.sections.recommendedFlow.title",
    descriptionKey: "mail.moduleGuide.sections.recommendedFlow.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.recommendedFlow.items.configure.title", textKey: "mail.moduleGuide.sections.recommendedFlow.items.configure.text"},
      {titleKey: "mail.moduleGuide.sections.recommendedFlow.items.process.title", textKey: "mail.moduleGuide.sections.recommendedFlow.items.process.text"},
      {titleKey: "mail.moduleGuide.sections.recommendedFlow.items.operate.title", textKey: "mail.moduleGuide.sections.recommendedFlow.items.operate.text"},
      {titleKey: "mail.moduleGuide.sections.recommendedFlow.items.monitor.title", textKey: "mail.moduleGuide.sections.recommendedFlow.items.monitor.text"},
    ],
  },
  {
    id: "best-practices",
    icon: "mdi-check-decagram-outline",
    color: "deep-orange",
    titleKey: "mail.moduleGuide.sections.bestPractices.title",
    descriptionKey: "mail.moduleGuide.sections.bestPractices.description",
    items: [
      {titleKey: "mail.moduleGuide.sections.bestPractices.items.startSession.title", textKey: "mail.moduleGuide.sections.bestPractices.items.startSession.text"},
      {titleKey: "mail.moduleGuide.sections.bestPractices.items.assign.title", textKey: "mail.moduleGuide.sections.bestPractices.items.assign.text"},
      {titleKey: "mail.moduleGuide.sections.bestPractices.items.close.title", textKey: "mail.moduleGuide.sections.bestPractices.items.close.text"},
      {titleKey: "mail.moduleGuide.sections.bestPractices.items.supervise.title", textKey: "mail.moduleGuide.sections.bestPractices.items.supervise.text"},
    ],
  },
]

const indexItems = computed(() => sections.map((section) => ({
  id: section.id,
  icon: section.icon,
  title: t(section.titleKey),
})))
</script>

<template>
  <v-container fluid class="mail-guide-page pa-4 pa-md-6">
    <div class="guide-header mb-4 pa-5 pa-md-6">
      <div class="d-flex align-center ga-3 mb-3">
        <v-avatar color="primary" variant="tonal" size="48">
          <v-icon icon="mdi-book-open-page-variant-outline" size="28" />
        </v-avatar>
        <div>
          <div class="text-overline text-primary font-weight-bold">{{ t("mail.moduleGuide.eyebrow") }}</div>
          <h1 class="text-h4 text-md-h3 font-weight-bold">{{ t("mail.moduleGuide.title") }}</h1>
        </div>
      </div>
      <p class="text-body-1 text-medium-emphasis mb-0">
        {{ t("mail.moduleGuide.intro") }}
      </p>
    </div>

    <v-row align="start" dense>
      <v-col cols="12" md="3">
        <div class="guide-index pa-3">
          <div class="text-subtitle-2 font-weight-bold mb-2">{{ t("mail.moduleGuide.indexTitle") }}</div>
          <v-list density="compact" nav bg-color="transparent">
            <v-list-item
              v-for="item in indexItems"
              :key="item.id"
              :href="`#${item.id}`"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="lg"
            />
          </v-list>
        </div>
      </v-col>

      <v-col cols="12" md="9">
        <div class="d-flex flex-column ga-4">
          <section
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="guide-section pa-4 pa-md-5"
          >
            <div class="d-flex align-start ga-3 mb-4">
              <v-avatar :color="section.color" variant="tonal" size="44">
                <v-icon :icon="section.icon" size="24" />
              </v-avatar>
              <div class="min-w-0">
                <h2 class="text-h5 font-weight-bold section-title">{{ t(section.titleKey) }}</h2>
                <p class="text-body-2 text-medium-emphasis mb-0 section-description">
                  {{ t(section.descriptionKey) }}
                </p>
              </div>
            </div>

            <v-row dense>
              <v-col
                v-for="item in section.items"
                :key="item.titleKey"
                cols="12"
                sm="6"
              >
                <div class="guide-topic pa-3 h-100">
                  <div class="text-subtitle-2 font-weight-bold mb-1 topic-title">
                    {{ t(item.titleKey) }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0 topic-text">
                    {{ t(item.textKey) }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </section>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.mail-guide-page {
  min-height: 100%;
  scroll-behavior: smooth;
}

.guide-header,
.guide-index,
.guide-section {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}

.guide-index {
  position: sticky;
  top: 80px;
}

.guide-section {
  scroll-margin-top: 80px;
}

.guide-topic {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.section-title,
.section-description,
.topic-title,
.topic-text {
  overflow-wrap: anywhere;
}

@media (max-width: 960px) {
  .guide-index {
    position: static;
  }
}
</style>
