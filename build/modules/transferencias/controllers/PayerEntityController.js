import PayerEntityServiceFactory from "../factory/services/PayerEntityServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import PayerEntityPermissions from "../permissions/PayerEntityPermissions.js";
class PayerEntityController extends AbstractFastifyController {
    constructor() {
        super(PayerEntityServiceFactory.instance, PayerEntityPermissions);
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
export default PayerEntityController;
export { PayerEntityController };
