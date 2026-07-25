
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import SessionEmailPermissions from "../permissions/SessionEmailPermissions.js";
import type {ISessionEmail, ISessionEmailBase} from "../interfaces/ISessionEmail";

class SessionEmailController extends AbstractFastifyController<ISessionEmail, ISessionEmailBase, ISessionEmailBase>   {

    constructor() {
        super(SessionEmailServiceFactory.instance, SessionEmailPermissions)
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

export default SessionEmailController;
export {
    SessionEmailController
}

