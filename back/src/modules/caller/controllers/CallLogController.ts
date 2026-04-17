
import CallLogServiceFactory from "../factory/services/CallLogServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CallLogPermissions from "../permissions/CallLogPermissions.js";
import type {ICallLog, ICallLogBase} from "../interfaces/ICallLog";
import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import type {CallLogService} from "../services/CallLogService.js";
import {BadRequestError, LimitError} from "@drax/common-back";
import type {IDraxFieldFilter} from "@drax/crud-share";

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

    async exportExcel(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const query = request.query as Record<string, unknown>
            const callListId = typeof query.callListId === 'string' ? query.callListId : ''

            if (!callListId) {
                throw new BadRequestError('callListId is required')
            }

            const exported = await this.callLogService.exportExcel(callListId)

            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`)

            return reply.send(exported.buffer)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async paginateByDataSearch(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated()

            if (request.query.limit > this.maximumLimit) {
                throw new LimitError(this.maximumLimit, request.query.limit)
            }

            const page = request.query.page ? request.query.page : 1
            const limit = request.query.limit ? request.query.limit : 10
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search ?? ''
            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac)

            return await this.callLogService.paginateByDataSearch({page, limit, orderBy, order, search, filters})
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default CallLogController;
export {
    CallLogController
}
