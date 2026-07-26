
import type{IOutboundEmailRepository} from "../interfaces/IOutboundEmailRepository";
import type {IOutboundEmailBase, IOutboundEmail} from "../interfaces/IOutboundEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class OutboundEmailService extends AbstractService<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> {


    constructor(OutboundEmailRepository: IOutboundEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(OutboundEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default OutboundEmailService
export {OutboundEmailService}
