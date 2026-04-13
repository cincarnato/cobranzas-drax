
import type{IMailboxRepository} from "../interfaces/IMailboxRepository";
import type {IMailboxBase, IMailbox} from "../interfaces/IMailbox";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class MailboxService extends AbstractService<IMailbox, IMailboxBase, IMailboxBase> {


    constructor(MailboxRepository: IMailboxRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(MailboxRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default MailboxService
export {MailboxService}
