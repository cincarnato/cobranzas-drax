import type {ISessionEmail} from "./ISessionEmail";

type EmailSupervisionOperatorStatus = "ACTIVE" | "PAUSED" | "OUT_OF_SESSION";

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
    oldestPendingReceivedAt?: Date | null
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
    firstStartedAt?: Date | null
    lastEndedAt?: Date | null
    lastActivityAt?: Date | null
}

type EmailSupervisionDaily = {
    date: string
    from: Date
    to: Date
    summary: EmailSupervisionDailySummary
    operators: EmailSupervisionDailyOperator[]
}

type EmailSupervisionMonthly = {
    month: string
    from: Date
    to: Date
    summary: EmailSupervisionDailySummary
    operators: EmailSupervisionDailyOperator[]
}

type EmailSupervisionAssignedEmail = {
    _id: string
    subject?: string
    fromName?: string
    fromEmail?: string
    receivedAt: Date
    assignedAt?: Date
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
