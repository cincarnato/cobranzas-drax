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
  EmailSupervisionLive,
  EmailSupervisionOperator,
  EmailSupervisionOperatorStatus,
  EmailSupervisionSummary,
  EmailSupervisionUser,
}
