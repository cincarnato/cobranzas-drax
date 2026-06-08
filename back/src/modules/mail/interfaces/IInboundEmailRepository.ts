
import type {IInboundEmail, IInboundEmailBase} from './IInboundEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

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

}

export type {FindInboundEmailsByProcessMarkOptions}
export {IInboundEmailRepository}
