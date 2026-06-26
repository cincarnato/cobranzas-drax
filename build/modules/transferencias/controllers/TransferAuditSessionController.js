import TransferAuditSessionServiceFactory from "../factory/services/TransferAuditSessionServiceFactory.js";
import TransferEmailPermissions from "../permissions/TransferEmailPermissions.js";
class TransferAuditSessionController {
    constructor() {
        this.service = TransferAuditSessionServiceFactory.instance;
    }
    async active(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            return await this.service.getActive(this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async create(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const body = (request.body || {});
            return await this.service.start(this.getUserId(request), this.resolveBatchSize(body.batchSize));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async assignments(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const body = (request.body || {});
            const { sessionId } = request.params;
            return await this.service.assignMore(sessionId, this.getUserId(request), this.resolveBatchSize(body.batchSize));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async heartbeat(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const { sessionId } = request.params;
            return await this.service.heartbeat(sessionId, this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async pause(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const { sessionId } = request.params;
            return await this.service.pause(sessionId, this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async resume(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const { sessionId } = request.params;
            return await this.service.resume(sessionId, this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async complete(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const { sessionId } = request.params;
            return await this.service.complete(sessionId, this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    async items(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(TransferEmailPermissions.Update);
            const { sessionId } = request.params;
            return await this.service.getItems(sessionId, this.getUserId(request));
        }
        catch (error) {
            return this.handleError(error, reply);
        }
    }
    getUserId(request) {
        const userId = request.rbac.userId;
        if (!userId)
            throw new Error('AUTHENTICATED_USER_REQUIRED');
        return userId;
    }
    resolveBatchSize(batchSize) {
        const parsed = Number(batchSize || 5);
        if (!Number.isFinite(parsed) || parsed < 1)
            return 5;
        return Math.min(parsed, 20);
    }
    handleError(error, reply) {
        const message = error?.message || 'TRANSFER_AUDIT_SESSION_ERROR';
        if (message.includes('FORBIDDEN')) {
            return reply.status(403).send({ error: message });
        }
        if (message.includes('CONFLICT') || message.includes('ACTIVE') || message.includes('EXPIRED') || message.includes('NOT_ACTIVE')) {
            return reply.status(409).send({ error: message });
        }
        if (message.includes('NOT_FOUND')) {
            return reply.status(404).send({ error: message });
        }
        console.error(error);
        return reply.status(500).send({ error: message });
    }
}
export default TransferAuditSessionController;
export { TransferAuditSessionController };
