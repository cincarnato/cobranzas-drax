import BankMovementServiceFactory from "../factory/services/BankMovementServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import BankMovementPermissions from "../permissions/BankMovementPermissions.js";
class BankMovementController extends AbstractFastifyController {
    constructor() {
        super(BankMovementServiceFactory.instance, BankMovementPermissions);
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
export default BankMovementController;
export { BankMovementController };
