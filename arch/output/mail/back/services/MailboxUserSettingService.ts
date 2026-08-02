
import type{IMailboxUserSettingRepository} from "../interfaces/IMailboxUserSettingRepository";
import type {IMailboxUserSettingBase, IMailboxUserSetting} from "../interfaces/IMailboxUserSetting";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class MailboxUserSettingService extends AbstractService<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase> {


    constructor(MailboxUserSettingRepository: IMailboxUserSettingRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(MailboxUserSettingRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default MailboxUserSettingService
export {MailboxUserSettingService}
