import WhatsappMessageServiceFactory from "../factory/services/WhatsappMessageServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import WhatsappMessagePermissions from "../permissions/WhatsappMessagePermissions.js";
class WhatsappMessageController extends AbstractFastifyController {
    constructor() {
        super(WhatsappMessageServiceFactory.instance, WhatsappMessagePermissions);
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
export { WhatsappMessageController };
