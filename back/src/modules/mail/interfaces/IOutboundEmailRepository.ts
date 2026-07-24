
import type {IOutboundEmail, IOutboundEmailBase} from './IOutboundEmail'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IOutboundEmailRepository extends IDraxCrudRepository<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase>{
    findByInboundEmailIds(inboundEmailIds: string[]): Promise<IOutboundEmail[]>
    findByMessageIds(messageIds: string[]): Promise<IOutboundEmail[]>

}

export {IOutboundEmailRepository}
