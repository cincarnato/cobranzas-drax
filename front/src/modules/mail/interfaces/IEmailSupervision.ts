import type {ISessionEmail} from "@/modules/mail/interfaces/ISessionEmail";

type EmailSupervisionOperatorStatus = "ACTIVE" | "PAUSED" | "OUT_OF_SESSION"

type EmailSupervisionUser = {
  id: string
  name?: string
  email?: string
}

type EmailSupervisionSummary = {
  activeOperators: number
  pausedOperators: number
  pendingEmails: number
  assignedEmails: number
  closedToday: number
  oldestPendingReceivedAt?: Date | string | null
}

type EmailSupervisionOperator = {
  user: EmailSupervisionUser
  status: EmailSupervisionOperatorStatus
  sessionEmail: ISessionEmail | null
  currentAssignedCount: number
}

type EmailSupervisionLive = {
  summary: EmailSupervisionSummary
  operators: EmailSupervisionOperator[]
}

type EmailSupervisionDailySummary = {
  sessionCount: number
  operatorCount: number
  assignedCount: number
  repliedCount: number
  closedCount: number
  durationMs: number
}

type EmailSupervisionDailyOperator = {
  user: EmailSupervisionUser
  sessionCount: number
  assignedCount: number
  repliedCount: number
  closedCount: number
  durationMs: number
  firstStartedAt?: Date | string | null
  lastEndedAt?: Date | string | null
  lastActivityAt?: Date | string | null
}

type EmailSupervisionDaily = {
  date: string
  from: Date | string
  to: Date | string
  summary: EmailSupervisionDailySummary
  operators: EmailSupervisionDailyOperator[]
}

type EmailSupervisionMonthly = {
  month: string
  from: Date | string
  to: Date | string
  summary: EmailSupervisionDailySummary
  operators: EmailSupervisionDailyOperator[]
}

type EmailSupervisionAssignedEmail = {
  _id: string
  subject?: string
  fromName?: string
  fromEmail?: string
  receivedAt: Date | string
  assignedAt?: Date | string
  category?: string
  priority?: string
  attentionStatus?: string
}

export type {
  EmailSupervisionAssignedEmail,
  EmailSupervisionDaily,
  EmailSupervisionDailyOperator,
  EmailSupervisionDailySummary,
  EmailSupervisionMonthly,
  EmailSupervisionLive,
  EmailSupervisionOperator,
  EmailSupervisionOperatorStatus,
  EmailSupervisionSummary,
  EmailSupervisionUser,
}
