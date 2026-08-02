
import MailboxUserSettingServiceFactory from "../factory/services/MailboxUserSettingServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import MailboxUserSettingPermissions from "../permissions/MailboxUserSettingPermissions.js";
import type {IMailboxUserSetting, IMailboxUserSettingBase} from "../interfaces/IMailboxUserSetting";

class MailboxUserSettingController extends AbstractFastifyController<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase>   {

    constructor() {
        super(MailboxUserSettingServiceFactory.instance, MailboxUserSettingPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default MailboxUserSettingController;
export {
    MailboxUserSettingController
}

