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
    receivedAt: Date
    assignedAt?: Date
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
