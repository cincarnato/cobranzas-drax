
import type{ISessionEmailRepository} from "../interfaces/ISessionEmailRepository";
import type {ISessionEmailBase, ISessionEmail} from "../interfaces/ISessionEmail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class SessionEmailService extends AbstractService<ISessionEmail, ISessionEmailBase, ISessionEmailBase> {


    constructor(SessionEmailRepository: ISessionEmailRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(SessionEmailRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default SessionEmailService
export {SessionEmailService}
