
import MailboxUserSettingServiceFactory from "../factory/services/MailboxUserSettingServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import MailboxUserSettingPermissions from "../permissions/MailboxUserSettingPermissions.js";
import type {IMailboxUserSetting, IMailboxUserSettingBase} from "../interfaces/IMailboxUserSetting";

const SaveMailboxUserSettingSchema = z.object({
    signatureHtml: z.string().optional(),
    signatureText: z.string().optional(),
    autoAdvanceOnClose: z.boolean().optional(),
});

class MailboxUserSettingController extends AbstractFastifyController<IMailboxUserSetting, IMailboxUserSettingBase, IMailboxUserSettingBase>   {

    constructor() {
        super(MailboxUserSettingServiceFactory.instance, MailboxUserSettingPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async current(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.View)
            const {mailboxId} = request.params as {mailboxId: string}
            return reply.send(await MailboxUserSettingServiceFactory.instance.current(mailboxId, this.getUserId(request)))
        } catch (error) {
            return this.handleMailboxUserSettingError(error, reply)
        }
    }

    async saveCurrent(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertAuthenticated()
            request.rbac.assertPermission(InboundEmailPermissions.Update)
            const {mailboxId} = request.params as {mailboxId: string}
            const body = SaveMailboxUserSettingSchema.parse(request.body || {})
            return reply.send(await MailboxUserSettingServiceFactory.instance.saveCurrent(mailboxId, this.getUserId(request), {
                signatureHtml: body?.signatureHtml || "",
                signatureText: body?.signatureText || "",
                autoAdvanceOnClose: Boolean(body?.autoAdvanceOnClose),
            }))
        } catch (error) {
            return this.handleMailboxUserSettingError(error, reply)
        }
    }

    private getUserId(request: CustomRequest) {
        const userId = request.rbac.userId || request.rbac.getAuthUser?.id
        if (!userId) throw new Error('AUTHENTICATED_USER_REQUIRED')
        return userId
    }

    private handleMailboxUserSettingError(error: any, reply: FastifyReply) {
        const message = error?.message || 'MAILBOX_USER_SETTING_ERROR'
        if (error?.statusCode === 403 || error?.name === 'ForbiddenError') return reply.status(403).send({error: 'MAILBOX_USER_SETTING_FORBIDDEN', message})
        if (error?.statusCode === 404 || error?.name === 'NotFoundError') return reply.status(404).send({error: 'MAILBOX_USER_SETTING_NOT_FOUND', message})
        if (error?.name === 'ZodError') return reply.status(400).send({error: 'MAILBOX_USER_SETTING_VALIDATION_ERROR', message, details: error.issues})
        console.error(error)
        return reply.status(500).send({error: 'MAILBOX_USER_SETTING_ERROR', message})
    }

}

export default MailboxUserSettingController;
export {
    MailboxUserSettingController
}
