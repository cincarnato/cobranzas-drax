
import type{IWhatsappMessageRepository} from "../interfaces/IWhatsappMessageRepository";
import type {IWhatsappMessageBase, IWhatsappMessage} from "../interfaces/IWhatsappMessage";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class WhatsappMessageService extends AbstractService<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase> {


    constructor(WhatsappMessageRepository: IWhatsappMessageRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(WhatsappMessageRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default WhatsappMessageService
export {WhatsappMessageService}
