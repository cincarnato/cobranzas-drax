
import type{IInboundEmailRepository} from "../interfaces/IInboundEmailRepository";
import type {IInboundEmailBase, IInboundEmail} from "../interfaces/IInboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class InboundEmailService extends AbstractService<IInboundEmail, IInboundEmailBase, IInboundEmailBase> {


    constructor(InboundEmailRepository: IInboundEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InboundEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default InboundEmailService
export {InboundEmailService}
