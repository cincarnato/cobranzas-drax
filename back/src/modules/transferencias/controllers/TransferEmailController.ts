
import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
import type {ITransferEmail, ITransferEmailBase} from "../interfaces/ITransferEmail";
import type {FastifyReply} from "fastify";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import InboundMailTransferProcessor from "../processors/InboundMailTransferProcessor.js";
import type {IDraxFieldFilter} from "@drax/crud-share";

class TransferEmailController extends AbstractFastifyController<ITransferEmail, ITransferEmailBase, ITransferEmailBase>   {
    private inboundMailTransferProcessor: InboundMailTransferProcessor;

    constructor() {
        super(TransferEmailServiceFactory.instance, TransferEmailPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;

        this.inboundMailTransferProcessor = new InboundMailTransferProcessor();
    }

    async processInboundEmails(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);

            const body = (request.body || {}) as {
                since?: string | null;
                limit?: number | string | null;
            };

            const result = await this.inboundMailTransferProcessor.processInboundEmails({
                since: body.since,
                limit: body.limit,
            });
            return reply.status(200).send(result);
        } catch (error: any) {
            console.error(error);
            if (error?.message === "Invalid since date" || error?.message === "Invalid limit") {
                return reply.status(400).send({
                    error: "TRANSFER_EMAIL_PROCESS_INVALID_INPUT",
                    message: error.message,
                });
            }

            return reply.status(500).send({
                error: "TRANSFER_EMAIL_PROCESS_ERROR",
                message: error?.message || "Failed to process inbound transfer emails",
            });
        }
    }

    async exportExcel(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertReadPermission(request)

            const query = request.query as Record<string, any>
            const orderBy = query.orderBy
            const order = query.order
            const search = query.search
            let filters: IDraxFieldFilter[] = this.parseFilters(query.filters)

            this.applyUserAndTenantFilters(filters, request.rbac)
            filters = await this.preRead(request, filters)

            const exported = await TransferEmailServiceFactory.instance.exportExcel({
                orderBy,
                order,
                search,
                filters,
                limit: 100000,
            })

            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`)

            return reply.send(exported.buffer)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default TransferEmailController;
export {
    TransferEmailController
}
