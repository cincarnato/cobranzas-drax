
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
    managementPaginate(options: InboundEmailManagementListOptions): Promise<InboundEmailManagementListResult>
    findThread(inboundEmail: IInboundEmail): Promise<IInboundEmail[]>
    assignToMe(id: string, userId: string, force?: boolean): Promise<IInboundEmail | null>
    reassign(id: string, userId: string | null): Promise<IInboundEmail | null>
    countAssignedToUser(mailboxValues: string[], userId: string): Promise<number>
    updateClassification(id: string, data: InboundEmailClassificationUpdate): Promise<IInboundEmail | null>
    closeManagement(id: string, closeReason?: string | null): Promise<IInboundEmail | null>

}

type InboundEmailManagementListOptions = {
    mailboxValues?: string[]
    attentionStatus?: string
    assignedTo?: string
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

export type {
    FindInboundEmailsByProcessMarkOptions,
    InboundEmailManagementListOptions,
    InboundEmailManagementListResult,
    InboundEmailClassificationUpdate,
    InboundEmailManagementDetail
}
export {IInboundEmailRepository}
