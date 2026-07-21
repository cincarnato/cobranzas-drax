
import type{ITypificationEmailRepository} from "../interfaces/ITypificationEmailRepository";
import type {ITypificationEmailBase, ITypificationEmail} from "../interfaces/ITypificationEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TypificationEmailService extends AbstractService<ITypificationEmail, ITypificationEmailBase, ITypificationEmailBase> {


    constructor(TypificationEmailRepository: ITypificationEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TypificationEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TypificationEmailService
export {TypificationEmailService}
