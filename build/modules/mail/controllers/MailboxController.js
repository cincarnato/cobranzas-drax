import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import MailboxPermissions from "../permissions/MailboxPermissions.js";
class MailboxController extends AbstractFastifyController {
    constructor() {
        super(MailboxServiceFactory.instance, MailboxPermissions);
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
export default MailboxController;
export { MailboxController };
