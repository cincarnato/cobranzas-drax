
import type {IInboundEmail, IInboundEmailBase} from './IInboundEmail'
import {IDraxCrudRepository} from "@drax/crud-share";
import type {IOutboundEmail} from "./IOutboundEmail";
import type {IEmailUserState} from "./IEmailUserState";

type FindInboundEmailsByProcessMarkOptions = {
    processMarkKey: string
    processingStatus?: string
    category?: string | null
    retryStatus?: string
    maxAttempts?: number
    since?: Date | null
    limit?: number
    orderBy?: string
    order?: 'asc' | 'desc'
}

interface IInboundEmailRepository extends IDraxCrudRepository<IInboundEmail, IInboundEmailBase, IInboundEmailBase>{
    findByProcessMarkStatus(options: FindInboundEmailsByProcessMarkOptions): Promise<IInboundEmail[]>
    findByMessageIds(messageIds: string[], mailboxValues?: string[]): Promise<IInboundEmail[]>
    managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult>
    managementCounts(options: InboundEmailManagementCountsOptions): Promise<InboundEmailManagementCounts>
    findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]>
    assignToMe(id: string, userId: string, force?: boolean): Promise<IInboundEmail | null>
    assignNextPendingAuto(mailboxValues: string[], userId: string, sessionId: string): Promise<IInboundEmail | null>
    releaseAutoAssignedBySession(sessionId: string, userId: string): Promise<number>
    reassign(id: string, userId: string | null): Promise<IInboundEmail | null>
    countAssignedToUser(mailboxValues: string[], userId: string): Promise<number>
    countAssignedByUser(mailboxValues: string[]): Promise<Record<string, number>>
    supervisionCounts(mailboxValues: string[], closedFrom: Date, closedTo: Date): Promise<InboundEmailSupervisionCounts>
    findAssignedLiteByUser(mailboxValues: string[], userId: string): Promise<InboundEmailAssignedLite[]>
    updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null>
    closeManagement(id: string, closeReason?: string | null, closedBy?: string | null): Promise<IInboundEmail | null>
    reopenAndAssignToMe(id: string, userId: string): Promise<IInboundEmail | null>

}

type InboundEmailManagementListOptions = {
    mailboxValues?: string[]
    attentionStatus?: string
    assignedTo?: string
    assignmentMode?: 'AUTO' | 'MANUAL'
    category?: string
    priorities?: string[]
    tags?: string[]
    hasAttachments?: boolean
    withoutReply?: boolean
    dateFrom?: Date
    dateTo?: Date
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    currentUserId?: string
    starredOnly?: boolean
}

type InboundEmailManagementListResult = {
    items: Array<IInboundEmail & {userState?: IEmailUserState | null}>
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
}

type InboundEmailManagementCountsOptions = {
    mailboxValues: string[]
    currentUserId: string
    isSupervisor: boolean
}

type InboundEmailManagementCounts = {
    PENDING: number
    ASSIGNED_TO_ME: number
    ASSIGNED_IN_ATTENTION: number
    ASSIGNED: number
}

type InboundEmailClassificationUpdate = {
    category?: string | null
    closeReason?: string | null
    priority?: string | null
    sentiment?: string | null
    tags?: string[]
}

type InboundEmailManagementDetail = {
    inboundEmail: IInboundEmail
    mailbox: any
    assignedUser?: any
    userState?: IEmailUserState | null
    inboundThread: IInboundEmail[]
    outboundThread: IOutboundEmail[]
}

type InboundEmailSupervisionCounts = {
    pendingEmails: number
    assignedEmails: number
    closedToday: number
}

type InboundEmailAssignedLite = {
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
    FindInboundEmailsByProcessMarkOptions,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult,
    InboundEmailManagementCountsOptions,
    InboundEmailManagementCounts,
    InboundEmailClassificationUpdate,
    InboundEmailManagementDetail,
    InboundEmailSupervisionCounts,
    InboundEmailAssignedLite
}
export {IInboundEmailRepository}
