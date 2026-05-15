
import WhatsappMessageServiceFactory from "../factory/services/WhatsappMessageServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import WhatsappMessagePermissions from "../permissions/WhatsappMessagePermissions.js";
import type {IWhatsappMessage, IWhatsappMessageBase} from "../interfaces/IWhatsappMessage";

class WhatsappMessageController extends AbstractFastifyController<IWhatsappMessage, IWhatsappMessageBase, IWhatsappMessageBase>   {

    constructor() {
        super(WhatsappMessageServiceFactory.instance, WhatsappMessagePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default WhatsappMessageController;
export {
    WhatsappMessageController
}
