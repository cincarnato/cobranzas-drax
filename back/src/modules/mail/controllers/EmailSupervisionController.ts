import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import EmailSupervisionServiceFactory from "../factory/services/EmailSupervisionServiceFactory.js";

const LiveQuerySchema = z.object({
    includeWithoutSession: z.union([z.boolean(), z.string()]).optional(),
});

class EmailSupervisionController {
    async live(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);

        const {mailboxId} = request.params as {mailboxId: string};
        const query = LiveQuerySchema.parse(request.query || {});
        const includeWithoutSession = query.includeWithoutSession === true || query.includeWithoutSession === "true" || query.includeWithoutSession === "1";
        return reply.send(await EmailSupervisionServiceFactory.instance.live(mailboxId, includeWithoutSession));
    }

    async assignedEmails(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);

        const {mailboxId, userId} = request.params as {mailboxId: string, userId: string};
        return reply.send(await EmailSupervisionServiceFactory.instance.assignedEmails(mailboxId, userId));
    }
}

export default EmailSupervisionController;
export {EmailSupervisionController};
