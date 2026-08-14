import type {FastifyReply} from "fastify";
import {AbstractFastifyController} from "@drax/crud-back";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import SessionEmailServiceFactory from "../factory/services/SessionEmailServiceFactory.js";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import SessionEmailPermissions from "../permissions/SessionEmailPermissions.js";
import type {ISessionEmail, ISessionEmailBase} from "../interfaces/ISessionEmail";

class SessionEmailController extends AbstractFastifyController<ISessionEmail, ISessionEmailBase, ISessionEmailBase> {
    constructor() {
        super(SessionEmailServiceFactory.instance, SessionEmailPermissions)
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    async current(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.View)
            const {mailboxId} = request.params as {mailboxId: string}
            return reply.send(await SessionEmailServiceFactory.instance.current(mailboxId, this.getUserId(request)))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    async start(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Update)
            const {mailboxId} = request.params as {mailboxId: string}
            return reply.send(await SessionEmailServiceFactory.instance.start(mailboxId, this.getUserId(request)))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    async pause(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Update)
            const {sessionId} = request.params as {sessionId: string}
            return reply.send(await SessionEmailServiceFactory.instance.pause(sessionId, this.getUserId(request)))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    async resume(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Update)
            const {sessionId} = request.params as {sessionId: string}
            return reply.send(await SessionEmailServiceFactory.instance.resume(sessionId, this.getUserId(request)))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    async close(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Update)
            const {sessionId} = request.params as {sessionId: string}
            return reply.send(await SessionEmailServiceFactory.instance.close(sessionId, this.getUserId(request)))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    async closeBySupervisor(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Manage)
            const {sessionId} = request.params as {sessionId: string}
            return reply.send(await SessionEmailServiceFactory.instance.closeBySupervisor(sessionId))
        } catch (error) {
            return this.handleSessionEmailError(error, reply)
        }
    }

    private getUserId(request: CustomRequest) {
        const userId = request.rbac.userId || request.rbac.getAuthUser?.id
        if (!userId) throw new Error('AUTHENTICATED_USER_REQUIRED')
        return userId
    }

    private handleSessionEmailError(error: any, reply: FastifyReply) {
        const message = error?.message || 'SESSION_EMAIL_ERROR'
        if (error?.statusCode === 403 || error?.name === 'ForbiddenError') return reply.status(403).send({error: 'SESSION_EMAIL_FORBIDDEN', message})
        if (error?.statusCode === 404 || error?.name === 'NotFoundError') return reply.status(404).send({error: 'SESSION_EMAIL_NOT_FOUND', message})
        if (error?.statusCode === 400 || error?.name === 'BadRequestError' || message.includes('ALREADY')) return reply.status(409).send({error: 'SESSION_EMAIL_CONFLICT', message})
        console.error(error)
        return reply.status(500).send({error: 'SESSION_EMAIL_ERROR', message})
    }
}

export default SessionEmailController
export {SessionEmailController}
