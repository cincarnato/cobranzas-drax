import PadronServiceFactory from "../factory/services/PadronServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import PadronPermissions from "../permissions/PadronPermissions.js";
class PadronController extends AbstractFastifyController {
    constructor() {
        super(PadronServiceFactory.instance, PadronPermissions);
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
export default PadronController;
export { PadronController };
