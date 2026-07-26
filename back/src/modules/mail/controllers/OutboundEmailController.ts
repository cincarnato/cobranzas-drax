
import OutboundEmailServiceFactory from "../factory/services/OutboundEmailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import OutboundEmailPermissions from "../permissions/OutboundEmailPermissions.js";
import type {IOutboundEmail, IOutboundEmailBase} from "../interfaces/IOutboundEmail";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {BadRequestError, ForbiddenError, NotFoundError} from "@drax/common-back";
import MailboxServiceFactory from "../factory/services/MailboxServiceFactory.js";

class OutboundEmailController extends AbstractFastifyController<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase>   {

    constructor() {
        super(OutboundEmailServiceFactory.instance, OutboundEmailPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async standalone(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(OutboundEmailPermissions.View);
        const query = request.query as Record<string, any>;
        const mailboxId = String(query.mailboxId || "");
        if (!mailboxId) {
            throw new BadRequestError("mailboxId is required");
        }
        const mailbox = await MailboxServiceFactory.instance.findById(mailboxId);
        if (!mailbox) throw new NotFoundError("mailbox not found");
        const operatorIds = (mailbox.operators || [])
            .map((operator: any) => typeof operator === "object" ? operator?._id?.toString() || operator?.id?.toString() : operator?.toString())
            .filter(Boolean);
        if (!operatorIds.length || !request.rbac.userId || !operatorIds.includes(request.rbac.userId)) {
            throw new ForbiddenError();
        }

        return reply.send(await OutboundEmailServiceFactory.instance.standalonePaginate({
            mailboxId,
            page: Number(query.page || 1),
            pageSize: Number(query.pageSize || 25),
        }));
    }

}

export default OutboundEmailController;
export {
    OutboundEmailController
}
