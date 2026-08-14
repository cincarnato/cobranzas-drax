import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";
import InboundEmailPermissions from "../permissions/InboundEmailPermissions.js";
import EmailSupervisionServiceFactory from "../factory/services/EmailSupervisionServiceFactory.js";

const LiveQuerySchema = z.object({
    includeWithoutSession: z.union([z.boolean(), z.string()]).optional(),
});

const DailyQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const MonthlyQuerySchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
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

    async daily(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);

        const {mailboxId} = request.params as {mailboxId: string};
        const query = DailyQuerySchema.parse(request.query || {});
        return reply.send(await EmailSupervisionServiceFactory.instance.daily(mailboxId, query.date));
    }

    async monthly(request: CustomRequest, reply: FastifyReply) {
        request.rbac.assertAuthenticated();
        request.rbac.assertPermission(InboundEmailPermissions.Manage);

        const {mailboxId} = request.params as {mailboxId: string};
        const query = MonthlyQuerySchema.parse(request.query || {});
        return reply.send(await EmailSupervisionServiceFactory.instance.monthly(mailboxId, query.month));
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
