
interface ISessionEmailBase {
    mailbox: any
    user: any
    status: string
    startedAt: Date
    pausedAt?: Date
    endedAt?: Date
    lastActivityAt?: Date
    maxAssignableEmails: number
    assignedCount: number
    repliedCount: number
    closedCount: number
    capacityFillLockedUntil?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface ISessionEmail {
    _id: string
    mailbox: any
    user: any
    status: string
    startedAt: Date
    pausedAt?: Date
    endedAt?: Date
    lastActivityAt?: Date
    maxAssignableEmails: number
    assignedCount: number
    repliedCount: number
    closedCount: number
    capacityFillLockedUntil?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
ISessionEmailBase, 
ISessionEmail
}
