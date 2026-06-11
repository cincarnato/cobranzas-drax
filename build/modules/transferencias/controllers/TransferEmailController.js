import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
import InboundMailTransferProcessor from "../processors/InboundMailTransferProcessor.js";
class TransferEmailController extends AbstractFastifyController {
    constructor() {
        super(TransferEmailServiceFactory.instance, TransferEmailPermissions);
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
        this.inboundMailTransferProcessor = InboundMailTransferProcessor.instance;
    }
    async processInboundEmails(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);
            const body = (request.body || {});
            const result = await this.inboundMailTransferProcessor.processInboundEmails({
                since: body.since,
                limit: body.limit,
            });
            return reply.status(200).send(result);
        }
        catch (error) {
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
    async reprocess(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);
            const { id } = request.params;
            const result = await this.inboundMailTransferProcessor.reprocessTransferEmail(id);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error?.message === "Transfer email not found") {
                return reply.status(404).send({
                    error: "TRANSFER_EMAIL_NOT_FOUND",
                    message: error.message,
                });
            }
            return this.handleError(error, reply);
        }
    }
    async exportExcel(request, reply) {
        try {
            this.assertReadPermission(request);
            const query = request.query;
            const orderBy = query.orderBy;
            const order = query.order;
            const search = query.search;
            let filters = this.parseFilters(query.filters);
            this.applyUserAndTenantFilters(filters, request.rbac);
            filters = await this.preRead(request, filters);
            const exported = await TransferEmailServiceFactory.instance.exportExcel({
                orderBy,
                order,
                search,
                filters,
                limit: 100000,
            });
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`);
            return reply.send(exported.buffer);
        }
        catch (e) {
            this.handleError(e, reply);
        }
    }
}
export default TransferEmailController;
export { TransferEmailController };
