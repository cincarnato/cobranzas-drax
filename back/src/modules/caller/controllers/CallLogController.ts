
import CallLogServiceFactory from "../factory/services/CallLogServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallLogPermissions from "../permissions/CallLogPermissions.js";
import type {ICallLog, ICallLogBase} from "../interfaces/ICallLog";
import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import type {CallLogService} from "../services/CallLogService.js";

class CallLogController extends AbstractFastifyController<ICallLog, ICallLogBase, ICallLogBase>   {

    constructor() {
        super(CallLogServiceFactory.instance, CallLogPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    get callLogService(): CallLogService {
        return this.service as CallLogService
    }

    async registerAttempt(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated()

            const id = request?.params?.id
            if (!id) {
                reply.statusCode = 400
                return reply.send({error: 'BAD REQUEST'})
            }

            const item = await this.callLogService.registerAttempt(id, request.body as ICallLogBase)
            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default CallLogController;
export {
    CallLogController
}
