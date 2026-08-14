type SessionEmailStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED'

interface ISessionEmailBase {
    mailbox: any
    user: any
    status: SessionEmailStatus
    startedAt: Date
    pausedAt?: Date | null
    endedAt?: Date | null
    lastActivityAt?: Date | null
    maxAssignableEmails: number
    assignedCount: number
    repliedCount: number
    closedCount: number
    sessionRepliedInboundEmails?: any[]
    capacityFillLockedUntil?: Date | null
    createdAt?: Date
    updatedAt?: Date
}

interface ISessionEmail extends ISessionEmailBase {
    _id: string
}

type SessionEmailState = {
    session: ISessionEmail | null
    maxAssignableEmails: number
    currentAssignedCount: number
    assignedEmails?: any[]
}

type SessionEmailDailyStats = {
    userId: string
    sessionCount: number
    assignedCount: number
    repliedCount: number
    closedCount: number
    durationMs: number
    firstStartedAt?: Date | null
    lastEndedAt?: Date | null
    lastActivityAt?: Date | null
}

export type {
    ISessionEmail,
    ISessionEmailBase,
    SessionEmailDailyStats,
    SessionEmailState,
    SessionEmailStatus
}
