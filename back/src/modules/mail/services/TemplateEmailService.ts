
import type{ITemplateEmailRepository} from "../interfaces/ITemplateEmailRepository";
import type {ITemplateEmailBase, ITemplateEmail} from "../interfaces/ITemplateEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TemplateEmailService extends AbstractService<ITemplateEmail, ITemplateEmailBase, ITemplateEmailBase> {


    constructor(TemplateEmailRepository: ITemplateEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TemplateEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TemplateEmailService
export {TemplateEmailService}
