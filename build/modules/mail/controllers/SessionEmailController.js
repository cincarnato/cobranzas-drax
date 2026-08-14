import { AbstractFastifyController } from "@drax/crud-back";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import SessionEmailPermissions from "../permissions/SessionEmailPermissions.js";
class SessionEmailController extends AbstractFastifyController {
    constructor() {
        super(SessionEmailServiceFactory.instance, SessionEmailPermissions);
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }
    async current(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.View);
            const { mailboxId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.current(mailboxId, this.getUserId(request)));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    async start(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.Update);
            const { mailboxId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.start(mailboxId, this.getUserId(request)));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    async pause(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.Update);
            const { sessionId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.pause(sessionId, this.getUserId(request)));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    async resume(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.Update);
            const { sessionId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.resume(sessionId, this.getUserId(request)));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    async close(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.Update);
            const { sessionId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.close(sessionId, this.getUserId(request)));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    async closeBySupervisor(request, reply) {
        try {
            request.rbac.assertAuthenticated();
            request.rbac.assertPermission(InboundEmailPermissions.Manage);
            const { sessionId } = request.params;
            return reply.send(await SessionEmailServiceFactory.instance.closeBySupervisor(sessionId));
        }
        catch (error) {
            return this.handleSessionEmailError(error, reply);
        }
    }
    getUserId(request) {
        const userId = request.rbac.userId || request.rbac.getAuthUser?.id;
        if (!userId)
            throw new Error('AUTHENTICATED_USER_REQUIRED');
        return userId;
    }
    handleSessionEmailError(error, reply) {
        const message = error?.message || 'SESSION_EMAIL_ERROR';
        if (error?.statusCode === 403 || error?.name === 'ForbiddenError')
            return reply.status(403).send({ error: 'SESSION_EMAIL_FORBIDDEN', message });
        if (error?.statusCode === 404 || error?.name === 'NotFoundError')
            return reply.status(404).send({ error: 'SESSION_EMAIL_NOT_FOUND', message });
        if (error?.statusCode === 400 || error?.name === 'BadRequestError' || message.includes('ALREADY'))
            return reply.status(409).send({ error: 'SESSION_EMAIL_CONFLICT', message });
        console.error(error);
        return reply.status(500).send({ error: 'SESSION_EMAIL_ERROR', message });
    }
}
export default SessionEmailController;
export { SessionEmailController };
