import TransferEmailServiceFactory from "../factory/services/TransferEmailServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
import InboundMailTransferProcessor from "../processors/InboundMailTransferProcessor.js";
import { BadRequestError, NotFoundError } from "@drax/common-back";
import TransferAuditSessionServiceFactory from "../factory/services/TransferAuditSessionServiceFactory.js";
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
    }
    async audit(request, reply) {
        this.assertUpdatePermission(request);
        if (!request.params.id) {
            reply.statusCode = 400;
            reply.send({ error: 'BAD REQUEST' });
        }
        const id = request.params.id;
        const payload = (request.body || {});
        const userId = request.rbac.userId;
        if (!userId) {
            throw new BadRequestError('authenticated user id is required');
        }
        const auditPayload = {
            amount: payload.amount,
            affiliates: payload.affiliates,
            humanStatus: payload.humanStatus,
            transferDate: payload.transferDate,
            originName: payload.originName,
            destinationName: payload.destinationName,
        };
        let item;
        try {
            item = await TransferEmailServiceFactory.instance.auditTransferEmail(id, auditPayload, userId, payload.auditSessionId, payload.closeInboundEmail === true);
        }
        catch (error) {
            if (error?.message === 'TRANSFER_EMAIL_ASSIGNMENT_CONFLICT') {
                return reply.status(409).send({
                    error: 'TRANSFER_EMAIL_ASSIGNMENT_CONFLICT',
                    message: 'La asignación de este registro venció o pertenece a otro operador.'
                });
            }
            throw error;
        }
        if (!item) {
            throw new NotFoundError();
        }
        if (payload.auditSessionId) {
            await TransferAuditSessionServiceFactory.instance.getSessionState(payload.auditSessionId);
        }
        return item;
    }
    async processInboundEmails(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);
            const body = (request.body || {});
            const result = await this.getInboundMailTransferProcessor().processInboundEmails({
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
    async processInboundEmail(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Create);
            const body = (request.body || {});
            if (!body.inboundEmailId) {
                return reply.status(400).send({
                    error: "TRANSFER_EMAIL_INBOUND_EMAIL_REQUIRED",
                    message: "inboundEmailId is required",
                });
            }
            const result = await this.getInboundMailTransferProcessor().processInboundEmail(body.inboundEmailId);
            return reply.status(200).send(result);
        }
        catch (error) {
            if (error?.message === "Inbound email not found") {
                return reply.status(404).send({
                    error: "INBOUND_EMAIL_NOT_FOUND",
                    message: error.message,
                });
            }
            return this.handleError(error, reply);
        }
    }
    async reprocess(request, reply) {
        try {
            request?.rbac.assertAuthenticated();
            request?.rbac.assertPermission(TransferEmailPermissions.Manage);
            const { id } = request.params;
            const result = await this.getInboundMailTransferProcessor().reprocessTransferEmail(id);
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
    getInboundMailTransferProcessor() {
        if (!this.inboundMailTransferProcessor) {
            this.inboundMailTransferProcessor = InboundMailTransferProcessor.instance;
        }
        return this.inboundMailTransferProcessor;
    }
}
export default TransferEmailController;
export { TransferEmailController };
